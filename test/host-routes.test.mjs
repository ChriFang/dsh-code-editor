import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { apply } from '../index.js';

const workspace = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-code-editor-test-'));
const cleanup = async () => {
  await fsp.rm(workspace, { recursive: true, force: true });
};

const target = (absolute) => ({ targetKey: path.resolve(absolute), displayPath: path.resolve(absolute) });
const versionOf = async (absolute) => String((await fsp.stat(absolute)).mtimeMs);
const fs = {
  async resolve(value, options = {}) {
    assert.equal(typeof value, 'string');
    const absolute = path.isAbsolute(value) ? value : path.resolve(options.cwd ?? workspace, value);
    return target(absolute);
  },
  processPath(value) {
    return value.displayPath;
  },
  contains(parent, child) {
    const relative = path.relative(parent.targetKey, child.targetKey);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  },
  async stat(value) {
    try {
      const info = await fsp.stat(value.targetKey);
      return {
        version: String(info.mtimeMs),
        type: info.isFile() ? 'file' : info.isDirectory() ? 'directory' : 'other',
        size: info.size,
      };
    } catch (error) {
      if (error.code === 'ENOENT') return undefined;
      throw error;
    }
  },
  async listDir(value) {
    const entries = await fsp.readdir(value.targetKey, { withFileTypes: true });
    return entries.map((entry) => {
      const absolute = path.join(value.targetKey, entry.name);
      return {
        name: entry.name,
        type: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
        target: target(absolute),
      };
    });
  },
  async readText(value) {
    const bytes = await fsp.readFile(value.targetKey);
    if (bytes.includes(0)) {
      const error = new Error('not text');
      error.code = 'FS_NOT_TEXT';
      throw error;
    }
    return bytes.toString('utf8');
  },
  async writeText(value, content) {
    await fsp.writeFile(value.targetKey, content, 'utf8');
    return { operation: 'update', version: await versionOf(value.targetKey), after: content };
  },
};

const routes = new Map();
let mode = 'workspace-write';
const ctx = {
  logger: { error() {} },
  effect(callback) {
    return callback();
  },
  get(name) {
    return this[name];
  },
  agents: {
    get(sessionId) {
      if (sessionId !== 'session-1') return undefined;
      return { session: { id: sessionId, header: { cwd: workspace } } };
    },
  },
  sandboxPolicy: {
    resolve() {
      return { mode, workspaceRoot: workspace };
    },
  },
  fs,
  connection: {
    fetch: {
      register(route) {
        assert.ok(!routes.has(route.path), `duplicate route ${route.path}`);
        routes.set(route.path, route.fetch);
        return async () => {};
      },
    },
  },
};

apply(ctx);
assert.equal(routes.size, 4);

async function call(route, body) {
  const response = await routes.get(route)(new Request(`http://dsh.local${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));
  return { status: response.status, body: await response.json() };
}

try {
  await fsp.mkdir(path.join(workspace, 'src'), { recursive: true });
  await fsp.mkdir(path.join(workspace, 'node_modules'), { recursive: true });
  await fsp.writeFile(path.join(workspace, 'src', 'app.ts'), "export const greeting = 'hello world';\n", 'utf8');
  await fsp.writeFile(path.join(workspace, 'README.md'), 'alpha\nbeta keyword\ngamma\n', 'utf8');
  await fsp.writeFile(path.join(workspace, 'node_modules', 'dep.js'), 'keyword in dependency\n', 'utf8');
  await fsp.writeFile(path.join(workspace, 'bin.dat'), Buffer.from([0, 1, 2, 3]));

  const listed = await call('/api/code-editor/list', { sessionId: 'session-1', path: workspace });
  assert.equal(listed.status, 200, JSON.stringify(listed.body));
  assert.ok(listed.body.entries.some((entry) => entry.name === 'src' && entry.type === 'directory'));

  const read = await call('/api/code-editor/read', { sessionId: 'session-1', path: 'src/app.ts' });
  assert.equal(read.status, 200, JSON.stringify(read.body));
  assert.match(read.body.text, /hello world/u);
  assert.equal(read.body.eof, true);

  const names = await call('/api/code-editor/search', {
    sessionId: 'session-1', query: 'app', kind: 'file', includeIgnored: false,
  });
  assert.equal(names.status, 200, JSON.stringify(names.body));
  assert.ok(names.body.results.some((result) => result.path === 'src/app.ts'), JSON.stringify(names.body));

  const content = await call('/api/code-editor/search', {
    sessionId: 'session-1', query: 'keyword', kind: 'content', includeIgnored: false,
  });
  assert.equal(content.status, 200, JSON.stringify(content.body));
  assert.ok(content.body.results.some((result) => result.path === 'README.md' && result.line === 2), JSON.stringify(content.body));
  assert.ok(!content.body.results.some((result) => result.path.startsWith('node_modules/')), JSON.stringify(content.body));

  const contentWithDeps = await call('/api/code-editor/search', {
    sessionId: 'session-1', query: 'keyword', kind: 'content', includeIgnored: true,
  });
  assert.ok(contentWithDeps.body.results.some((result) => result.path.startsWith('node_modules/')), JSON.stringify(contentWithDeps.body));

  const saved = await call('/api/code-editor/write', {
    sessionId: 'session-1',
    path: 'src/app.ts',
    content: "export const greeting = 'saved';\n",
    expectedVersion: read.body.version,
  });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assert.match(await fsp.readFile(path.join(workspace, 'src', 'app.ts'), 'utf8'), /saved/u);

  const stale = await call('/api/code-editor/write', {
    sessionId: 'session-1',
    path: 'src/app.ts',
    content: 'stale\n',
    expectedVersion: 'not-the-current-version',
  });
  assert.equal(stale.status, 409, JSON.stringify(stale.body));
  assert.equal(stale.body.error.code, 'stale');

  const outside = await call('/api/code-editor/read', { sessionId: 'session-1', path: '../outside.txt' });
  assert.equal(outside.status, 403, JSON.stringify(outside.body));

  const binary = await call('/api/code-editor/read', { sessionId: 'session-1', path: 'bin.dat' });
  assert.equal(binary.status, 415, JSON.stringify(binary.body));

  const noSession = await call('/api/code-editor/read', { sessionId: 'missing', path: 'README.md' });
  assert.equal(noSession.status, 409, JSON.stringify(noSession.body));

  mode = 'read-only';
  const readOnly = await call('/api/code-editor/write', {
    sessionId: 'session-1', path: 'README.md', content: 'x\n', expectedVersion: read.body.version,
  });
  assert.equal(readOnly.status, 403, JSON.stringify(readOnly.body));

  console.log('host route smoke test passed');
} finally {
  await cleanup();
}
