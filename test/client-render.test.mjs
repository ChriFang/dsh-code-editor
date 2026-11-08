import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const CLIENT = new URL('../client.js', import.meta.url);

/**
 * Load the browser bundle with a fake module loader and return its factory.
 * The factory only closes over the `require` argument, so it can be called
 * repeatedly with different primitive fakes below.
 */
function loadFactory() {
  let factory = null;
  const window = {
    __ModuleLoader__: {
      load(registration) {
        factory = registration.factory;
      },
    },
  };
  vm.runInNewContext(fs.readFileSync(CLIENT, 'utf8'), {
    window,
    console,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (callback) => callback(),
  });
  assert.equal(typeof factory, 'function', 'client.js must register a factory');
  return factory;
}

const Fragment = Symbol('Fragment');

function createReact() {
  let hookIndex = 0;
  return {
    Fragment,
    resetHooks() {
      hookIndex = 0;
    },
    createElement(type, props, ...children) {
      const next = { ...(props ?? {}) };
      if (children.length === 1) next.children = children[0];
      else if (children.length > 1) next.children = children;
      return { type, props: next };
    },
    useState(initial) {
      hookIndex += 1;
      return [typeof initial === 'function' ? initial() : initial, () => {}];
    },
    useRef(initial) {
      hookIndex += 1;
      return { current: initial };
    },
    useMemo(fn) {
      hookIndex += 1;
      return fn();
    },
    useCallback(fn) {
      hookIndex += 1;
      return fn;
    },
    useEffect() {
      hookIndex += 1;
    },
    useLayoutEffect() {
      hookIndex += 1;
    },
    useSyncExternalStore(_subscribe, getSnapshot) {
      hookIndex += 1;
      return getSnapshot();
    },
  };
}

function walk(node, out) {
  if (node === null || node === undefined || node === false || node === true) return;
  if (typeof node === 'string' || typeof node === 'number') {
    out.text.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) walk(child, out);
    return;
  }
  if (typeof node !== 'object') return;
  const { type, props } = node;
  if (type === Fragment) {
    walk(props?.children, out);
    return;
  }
  if (typeof type === 'function') {
    walk(type(props ?? {}), out);
    return;
  }
  if (typeof type === 'string') {
    out.tags.push({ tag: type, className: props?.className, props: props ?? {} });
    if (type === 'textarea') out.textareas.push(props ?? {});
    walk(props?.children, out);
  }
}

const factory = loadFactory();
const React = createReact();

function render(doc, primitives) {
  const fakeRequire = (id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') {
      if (primitives === null) throw new Error('primitives unavailable');
      return primitives;
    }
    throw new Error(`unexpected require: ${id}`);
  };

  const exports = factory(fakeRequire);
  let captured = null;
  exports.apply({
    locale: { register() {}, bind: () => (key) => key },
    effect() {
      return () => {};
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(_options, component) {
        captured = component;
        return () => {};
      },
    },
  });
  assert.equal(typeof captured, 'function', 'the conversation view must be registered');

  React.resetHooks();
  const out = { tags: [], text: [], textareas: [] };
  walk(React.createElement(captured, {
    cache: { get: () => doc },
    sessionId: 'session',
    inputActions: {},
    useSessions: () => undefined,
    useInput: () => 'plain',
    openView() {},
    t: (key) => key,
  }), out);
  return out;
}

function tokenPrimitives(options = {}) {
  const language = Object.prototype.hasOwnProperty.call(options, 'language')
    ? options.language
    : 'javascript';
  const tokens = options.tokens ?? true;
  return {
    languageForPath: () => language,
    useCodeHighlighter: () => (code) => {
      if (!tokens) return undefined;
      return code.split('\n').map((line) => (line.length === 0
        ? []
        : [{ text: line, style: { color: 'var(--shiki-token-keyword)' } }]));
    },
  };
}

function docFor(text, overrides = {}) {
  return {
    status: 'ready',
    path: '/tmp/a.js',
    rel: 'a.js',
    text,
    original: text,
    version: 'v1',
    bytes: text.length,
    lines: text.split('\n').length,
    eof: true,
    readOnly: false,
    line: 1,
    eol: '\n',
    openSeq: 1,
    ...overrides,
  };
}

const lineDivs = (out) => out.tags.filter((entry) => entry.tag === 'div'
  && String(entry.className).includes('dsh-ce-line'));
const colourSpans = (out) => out.tags.filter((entry) => entry.tag === 'span'
  && entry.props.style?.color !== undefined);

const baseText = 'const a = 1\nconsole.log(a)';

// 1. Highlighted render.
{
  const doc = docFor(baseText);
  const out = render(doc, tokenPrimitives());
  assert.ok(out.tags.some((entry) => entry.tag === 'pre'
    && String(entry.className).includes('dsh-ce-highlight')));
  assert.equal(out.textareas.length, 1);
  assert.match(String(out.textareas[0].className), /dsh-ce-textarea/);
  assert.equal(out.textareas[0].value, baseText);
  assert.equal(lineDivs(out).length, 2);
  assert.equal(colourSpans(out).length, 2);
  assert.ok(out.text.join('').includes('console.log(a)'));
}

// 2. Missing primitives must degrade to plain text, not throw.
{
  const doc = docFor(baseText);
  const out = render(doc, null);
  assert.equal(out.textareas.length, 1);
  assert.equal(lineDivs(out).length, 2);
  assert.equal(colourSpans(out).length, 0);
}

// 3. Unknown suffix must render plain text.
{
  const doc = docFor(baseText, { rel: 'a.unknown' });
  const out = render(doc, tokenPrimitives({ language: undefined }));
  assert.equal(lineDivs(out).length, 2);
  assert.equal(colourSpans(out).length, 0);
}

// 4. Grammar still loading must render plain text.
{
  const doc = docFor(baseText);
  const out = render(doc, tokenPrimitives({ tokens: false }));
  assert.ok(out.text.join('').includes('const a = 1'));
  assert.equal(colourSpans(out).length, 0);
}

// 5. A trailing newline keeps the textarea's final empty line.
{
  const doc = docFor('const a = 1\n');
  const out = render(doc, tokenPrimitives());
  assert.equal(lineDivs(out).length, 2);
}

// 6. A large editable file starts plain while typing.
{
  const text = Array.from({ length: 1600 }, (_, index) => `const v${index} = ${index}`).join('\n');
  const doc = docFor(text);
  const out = render(doc, tokenPrimitives());
  assert.equal(lineDivs(out).length, 1600);
  assert.equal(colourSpans(out).length, 0);
}

// 7. A large read-only file highlights immediately.
{
  const text = Array.from({ length: 1600 }, (_, index) => `const v${index} = ${index}`).join('\n');
  const doc = docFor(text, { readOnly: true });
  const out = render(doc, tokenPrimitives());
  assert.ok(colourSpans(out).length > 0);
}

console.log('client render smoke test passed');
