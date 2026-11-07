/**
 * Host half of the code-editor bundle.
 *
 * Everything here runs behind the Connection's owner-only exact Fetch routes:
 * the browser can list, read, search, and save inside the live Session's
 * working directory, and every path is confined to that workspace with the
 * composed filesystem capability.
 */

import { Buffer } from 'node:buffer';

export const inject = ['agents', 'connection', 'fs', 'sandboxPolicy'];

const ROUTE_LIST = '/api/code-editor/list';
const ROUTE_READ = '/api/code-editor/read';
const ROUTE_SEARCH = '/api/code-editor/search';
const ROUTE_WRITE = '/api/code-editor/write';

const MAX_LIST_ENTRIES = 2000;
const MAX_READ_BYTES = 2 * 1024 * 1024;
const MAX_READ_LINES = 5000;
const MAX_WRITE_BYTES = 2 * 1024 * 1024;
const MAX_SEARCH_BYTES = 384 * 1024;
const MAX_SEARCH_FILES = 20000;
const MAX_SEARCH_RESULTS = 200;
const SEARCH_DEADLINE_MS = 10000;

/** Directories that are noise for a project-wide search unless explicitly included. */
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.hg',
  '.svn',
  '.next',
  '.nuxt',
  '.cache',
  '.parcel-cache',
  '.turbo',
  'node_modules',
  'bower_components',
  'vendor',
  'dist',
  'build',
  'out',
  'coverage',
  'target',
  '__pycache__',
  '.venv',
  'venv',
  '.tox',
]);

/** Extensions that are never decoded as source text during a content search. */
const BINARY_EXTENSIONS = new Set([
  '7z', 'avi', 'bmp', 'class', 'db', 'dll', 'dylib', 'exe', 'flac', 'gif',
  'gz', 'ico', 'jar', 'jpeg', 'jpg', 'lockb', 'map', 'mkv', 'mov', 'mp3',
  'mp4', 'ogg', 'otf', 'pdf', 'png', 'so', 'sqlite', 'tar', 'ttf', 'wav',
  'wasm', 'webm', 'webp', 'woff', 'woff2', 'xz', 'zip',
]);

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}

function requestJson(request, maxBytes) {
  const declared = request.headers.get('content-length');
  if (declared !== null && Number(declared) > maxBytes) {
    fail(413, 'too-large', 'The request body is too large.');
  }
  return request.text().then((raw) => {
    if (Buffer.byteLength(raw, 'utf8') > maxBytes) {
      fail(413, 'too-large', 'The request body is too large.');
    }
    let value;
    try {
      value = JSON.parse(raw);
    } catch {
      fail(400, 'bad-request', 'The request body must be valid JSON.');
    }
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      fail(400, 'bad-request', 'The request body must be a JSON object.');
    }
    return value;
  });
}

function mapFsError(error) {
  if (error?.code === 'FS_STALE_VERSION') {
    fail(409, 'stale', 'The file changed while it was open.');
  }
  if (error?.code === 'FS_SANDBOX_DENIED' || error?.code === 'FS_PERMISSION_DENIED') {
    fail(403, 'permission', 'The current permission mode does not allow this operation.');
  }
  if (error?.code === 'FS_NOT_TEXT') {
    fail(415, 'not-text', 'This file is not UTF-8 text.');
  }
  if (error?.code === 'FS_TOO_LARGE') {
    fail(413, 'too-large', 'The file is too large to open here.');
  }
  if (error?.code === 'FS_NOT_FOUND') {
    fail(404, 'not-found', 'The file no longer exists.');
  }
  throw error;
}

export function apply(ctx) {
  const respond = (handler) => async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error && Number.isInteger(error.status) && typeof error.code === 'string') {
        return json(error.status, {
          ok: false,
          error: { code: error.code, message: error.message },
        });
      }
      ctx.logger?.error?.(error);
      return json(500, {
        ok: false,
        error: {
          code: 'internal',
          message: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  const resolveScope = async (sessionId, signal) => {
    if (typeof sessionId !== 'string' || sessionId.length === 0) {
      fail(400, 'bad-request', 'A Session id is required.');
    }
    const agent = ctx.agents.get(sessionId);
    if (agent === undefined) {
      fail(409, 'session-not-live', 'This Session is not live. Reopen it and try again.');
    }
    const policy = {
      ...ctx.sandboxPolicy.resolve({ session: agent.session }),
      sessionId: agent.session.id,
    };
    const root = agent.session.header.cwd ?? policy.workspaceRoot;
    if (typeof root !== 'string' || root.length === 0) {
      fail(409, 'no-workspace', 'This Session has no working directory.');
    }
    const rootTarget = await ctx.fs.resolve(root, { signal });
    return { root, rootTarget, policy };
  };

  const confine = async (scope, targetPath, signal) => {
    if (typeof targetPath !== 'string' || targetPath.length === 0) {
      fail(400, 'bad-request', 'A path is required.');
    }
    const target = await ctx.fs.resolve(targetPath, {
      cwd: scope.root,
      signal,
    });
    if (!ctx.fs.contains(scope.rootTarget, target)) {
      fail(403, 'outside-workspace', 'The path is outside this project.');
    }
    return target;
  };

  const list = async (request) => {
    const body = await requestJson(request, 64 * 1024);
    const scope = await resolveScope(body.sessionId, request.signal);
    const target = await confine(scope, body.path, request.signal);
    const info = await ctx.fs.stat(target, request.signal);
    if (info === undefined) fail(404, 'not-found', 'The directory no longer exists.');
    if (info.type !== 'directory') fail(400, 'not-directory', 'The path is not a directory.');

    const entries = await ctx.fs.listDir(target, request.signal);
    const visible = entries.slice(0, MAX_LIST_ENTRIES).map((entry) => ({
      name: entry.name,
      type: entry.type,
      ...(entry.size === undefined ? {} : { size: entry.size }),
    }));
    return json(200, {
      ok: true,
      entries: visible,
      truncated: entries.length > visible.length,
    });
  };

  const read = async (request) => {
    const body = await requestJson(request, 64 * 1024);
    const scope = await resolveScope(body.sessionId, request.signal);
    const target = await confine(scope, body.path, request.signal);
    const info = await ctx.fs.stat(target, request.signal);
    if (info === undefined) fail(404, 'not-found', 'The file no longer exists.');
    if (info.type !== 'file') fail(400, 'not-regular-file', 'The path is not a regular file.');
    if (info.size !== undefined && info.size > MAX_READ_BYTES) {
      fail(413, 'too-large', `This file is larger than ${Math.round(MAX_READ_BYTES / 1024 / 1024)} MB.`);
    }

    let text;
    try {
      text = await ctx.fs.readText(target, request.signal);
    } catch (error) {
      mapFsError(error);
    }
    if (text.includes('\0')) fail(415, 'not-text', 'This file is not UTF-8 text.');
    if (Buffer.byteLength(text, 'utf8') > MAX_READ_BYTES) {
      fail(413, 'too-large', `This file is larger than ${Math.round(MAX_READ_BYTES / 1024 / 1024)} MB.`);
    }

    const allLines = text.split('\n');
    const truncated = allLines.length > MAX_READ_LINES;
    const page = truncated ? allLines.slice(0, MAX_READ_LINES).join('\n') : text;
    return json(200, {
      ok: true,
      text: page,
      version: info.version,
      bytes: info.size ?? Buffer.byteLength(text, 'utf8'),
      lines: truncated ? MAX_READ_LINES : allLines.length,
      eof: !truncated,
    });
  };

  const search = async (request) => {
    const body = await requestJson(request, 64 * 1024);
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (query.length === 0) fail(400, 'bad-request', 'A search query is required.');
    if (query.length > 200) fail(400, 'bad-request', 'The search query is too long.');
    const kind = body.kind === 'file' ? 'file' : 'content';
    const includeIgnored = body.includeIgnored === true;
    const scope = await resolveScope(body.sessionId, request.signal);

    const needle = query.toLowerCase();
    const deadline = Date.now() + SEARCH_DEADLINE_MS;
    const results = [];
    const visited = new Set();
    const stack = [{ target: scope.rootTarget, rel: '' }];
    let scanned = 0;
    let truncated = false;

    while (stack.length > 0) {
      if (Date.now() > deadline) {
        truncated = true;
        break;
      }
      const directory = stack.pop();
      if (visited.has(directory.target.targetKey)) continue;
      visited.add(directory.target.targetKey);

      let entries;
      try {
        entries = await ctx.fs.listDir(directory.target, request.signal);
      } catch (error) {
        if (request.signal.aborted) throw error;
        continue;
      }
      entries.sort((left, right) => left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      }));

      const childDirectories = [];
      for (const entry of entries) {
        if (results.length >= MAX_SEARCH_RESULTS) {
          truncated = true;
          break;
        }
        if (!ctx.fs.contains(scope.rootTarget, entry.target)) continue;
        const rel = directory.rel.length === 0
          ? entry.name
          : `${directory.rel}/${entry.name}`;

        if (entry.type === 'directory') {
          if (!includeIgnored && SKIPPED_DIRECTORIES.has(entry.name.toLowerCase())) continue;
          childDirectories.push({ target: entry.target, rel });
          continue;
        }
        if (entry.type !== 'file') continue;

        scanned += 1;
        if (scanned > MAX_SEARCH_FILES) {
          truncated = true;
          break;
        }

        if (kind === 'file') {
          if (rel.toLowerCase().includes(needle)) {
            results.push({
              path: rel,
              name: entry.name,
              kind: 'file',
            });
          }
          continue;
        }

        const extension = entry.name.includes('.')
          ? entry.name.slice(entry.name.lastIndexOf('.') + 1).toLowerCase()
          : '';
        if (BINARY_EXTENSIONS.has(extension)) continue;
        if (entry.size !== undefined && entry.size > MAX_SEARCH_BYTES) continue;

        let text;
        try {
          text = await ctx.fs.readText(entry.target, request.signal);
        } catch (error) {
          if (request.signal.aborted) throw error;
          continue;
        }
        if (text.includes('\0')) continue;
        if (Buffer.byteLength(text, 'utf8') > MAX_SEARCH_BYTES) continue;

        const lines = text.split('\n');
        for (let index = 0; index < lines.length; index += 1) {
          const line = lines[index].replace(/\r$/u, '');
          const at = line.toLowerCase().indexOf(needle);
          if (at < 0) continue;
          const snippet = makeSnippet(line, at, query.length);
          results.push({
            path: rel,
            name: entry.name,
            kind: 'content',
            line: index + 1,
            text: snippet.text,
            matchStart: snippet.matchStart,
            matchLength: query.length,
          });
          if (results.length >= MAX_SEARCH_RESULTS) {
            truncated = true;
            break;
          }
        }
      }

      for (let index = childDirectories.length - 1; index >= 0; index -= 1) {
        stack.push(childDirectories[index]);
      }
      if (truncated) break;
    }

    return json(200, {
      ok: true,
      results,
      scanned,
      truncated,
    });
  };

  const write = async (request) => {
    const body = await requestJson(request, MAX_WRITE_BYTES * 3 + 64 * 1024);
    const content = body.content;
    if (typeof content !== 'string') {
      fail(400, 'bad-request', 'File content is required.');
    }
    if (Buffer.byteLength(content, 'utf8') > MAX_WRITE_BYTES) {
      fail(413, 'too-large', `Saving is limited to ${Math.round(MAX_WRITE_BYTES / 1024 / 1024)} MB at a time.`);
    }
    if (content.includes('\0')) {
      fail(415, 'not-text', 'Binary content cannot be saved from the code editor.');
    }
    const expectedVersion = body.expectedVersion;
    if (expectedVersion !== undefined && expectedVersion !== null
      && (typeof expectedVersion !== 'string' || expectedVersion.length === 0)) {
      fail(400, 'bad-request', 'The expected file version is invalid.');
    }

    const scope = await resolveScope(body.sessionId, request.signal);
    if (scope.policy.mode === 'read-only') {
      fail(403, 'read-only', 'The current permission mode is read-only.');
    }
    const target = await confine(scope, body.path, request.signal);
    const info = await ctx.fs.stat(target, request.signal);
    if (info === undefined) fail(404, 'not-found', 'The file no longer exists.');
    if (info.type !== 'file') fail(400, 'not-regular-file', 'The path is not a regular file.');
    if (typeof expectedVersion === 'string' && info.version !== expectedVersion) {
      fail(409, 'stale', 'The file changed on disk after it was opened.');
    }

    let outcome;
    try {
      outcome = await ctx.fs.writeText(
        target,
        content,
        { kind: 'replaceIfVersion', version: info.version },
        request.signal,
        scope.policy,
      );
    } catch (error) {
      mapFsError(error);
    }

    return json(200, {
      ok: true,
      version: outcome.version,
      bytes: Buffer.byteLength(content, 'utf8'),
    });
  };

  const routes = [
    [ROUTE_LIST, list],
    [ROUTE_READ, read],
    [ROUTE_SEARCH, search],
    [ROUTE_WRITE, write],
  ];

  for (const [route, handler] of routes) {
    ctx.effect(() => ctx.connection.fetch.register({
      path: route,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: respond(handler),
    }), `code-editor: ${route}`);
  }
}

function makeSnippet(line, matchAt, matchLength) {
  const start = Math.max(0, matchAt - 100);
  const end = Math.min(line.length, matchAt + matchLength + 140);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < line.length ? '…' : '';
  return {
    text: prefix + line.slice(start, end) + suffix,
    matchStart: matchAt - start + prefix.length,
  };
}
