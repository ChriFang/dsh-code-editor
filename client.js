window.__ModuleLoader__.load({
  id: '@local/dsh-code-editor',
  factory(require) {
    const React = require('react')
    const h = React.createElement;

    // The Host's shared UI package exposes its Shiki highlighter. Requiring it
    // here does not add a package dependency: this is a platform module that
    // the shell has already loaded. Older Hosts without the export keep the
    // plain-text behaviour through the guards below.
    let primitives = null;
    try {
      primitives = require('@deepseek-ai/dsh-client-ui-primitives');
    } catch {
      primitives = null;
    }
    const useCodeHighlighter = typeof primitives?.useCodeHighlighter === 'function'
      ? primitives.useCodeHighlighter
      : null;
    const languageForPath = typeof primitives?.languageForPath === 'function'
      ? primitives.languageForPath
      : () => undefined;
    const useHighlight = useCodeHighlighter ?? (() => undefined);

    const NS = 'codeEditor';
    const API = {
      list: '/api/code-editor/list',
      read: '/api/code-editor/read',
      search: '/api/code-editor/search',
      write: '/api/code-editor/write',
    };

    const EN = {
      button: 'Code editor',
      title: 'Code editor',
      close: 'Close',
      backToChat: 'Back to chat',
      refreshTree: 'Refresh file tree',
      files: 'Files',
      search: 'Search',
      fileMode: 'File name',
      contentMode: 'Content',
      searchPlaceholder: 'Search project files and code…',
      searchHint: 'Press Enter to search',
      searching: 'Searching…',
      searchIdle: 'Search file names or text under this project.',
      searchEmpty: 'No matches.',
      searchError: 'Search failed.',
      searchResults: '{count} results',
      searchScanned: 'Scanned {count} files',
      searchTruncated: 'Result limit reached',
      searchIncludeIgnored: 'Include dependency and build folders',
      searchMode: 'Search mode',
      clear: 'Clear',
      noWorkspace: 'This Session has no working directory.',
      treeLoading: 'Loading…',
      treeError: 'Could not read this folder.',
      retry: 'Retry',
      emptyTitle: 'No file open',
      emptyText: 'Choose a file from the tree or search the project. Select code, then insert it into the message draft.',
      emptyHint: 'Tip: Ctrl+S saves the current file.',
      editorLabel: 'File content',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      unsaved: 'Unsaved',
      reload: 'Reload',
      insert: 'Insert selection',
      insertHint: 'Insert the selected code into the message draft as a quote',
      selectFirst: 'Select some code first.',
      inputBusy: 'The composer is busy right now.',
      inserted: 'Inserted into the message draft.',
      insertFailed: 'The composer did not accept the insertion.',
      discardConfirm: 'Discard unsaved changes in this file?',
      staleError: 'The file changed on disk. Reload it before saving again.',
      saveFailed: 'Could not save the file.',
      readOnly: 'Read only',
      partial: 'Large file: preview limited to 5000 lines',
      binaryFile: 'This is a binary or non-UTF-8 file. It cannot be edited here.',
      loadingFile: 'Opening file…',
      unsupported: 'Unsupported entry',
      file: 'File',
      folder: 'Folder',
      projectRoot: 'Project root',
      lines: '{count} lines',
      copied: 'Copied selected text.',
      copyFailed: 'Could not copy.',
      copy: 'Copy selection',
      searchShort: 'Search',
      notLive: 'The Session is no longer live. Reopen it.',
      hostUnavailable: 'The code-editor Host API is unavailable.',
      openFailed: 'Could not open the file.',
      noSelection: 'No selection',
      position: 'Ln {line}, Col {col}',
      chars: '{count} selected',
      saveShort: 'Ctrl+S',
    };

    const ZH = {
      button: '代码编辑器',
      title: '代码编辑器',
      close: '关闭',
      backToChat: '返回对话',
      refreshTree: '刷新文件树',
      files: '文件',
      search: '搜索',
      fileMode: '文件名',
      contentMode: '内容',
      searchPlaceholder: '搜索工程文件或代码…',
      searchHint: '按回车搜索',
      searching: '搜索中…',
      searchIdle: '在这里搜索工程内的文件名或文本。',
      searchEmpty: '没有匹配结果。',
      searchError: '搜索失败。',
      searchResults: '{count} 条结果',
      searchScanned: '已扫描 {count} 个文件',
      searchTruncated: '已达到结果上限',
      searchIncludeIgnored: '包含依赖和构建目录',
      searchMode: '搜索方式',
      clear: '清除',
      noWorkspace: '当前会话没有工作目录。',
      treeLoading: '加载中…',
      treeError: '无法读取这个目录。',
      retry: '重试',
      emptyTitle: '未打开文件',
      emptyText: '从文件树或搜索结果打开文件，选中代码后即可插入消息输入框。',
      emptyHint: '提示：Ctrl+S 保存当前文件。',
      editorLabel: '文件内容',
      save: '保存',
      saving: '保存中…',
      saved: '已保存',
      unsaved: '未保存',
      reload: '重新加载',
      insert: '插入选中',
      insertHint: '把选中的代码作为引用插入消息输入框',
      selectFirst: '请先选中要插入的代码。',
      inputBusy: '输入框当前不可编辑。',
      inserted: '已插入消息输入框。',
      insertFailed: '输入框没有接受这次插入。',
      discardConfirm: '放弃这个文件里未保存的修改吗？',
      staleError: '文件已在磁盘上发生变化，请重新加载后再保存。',
      saveFailed: '保存文件失败。',
      readOnly: '只读',
      partial: '文件较大，仅预览前 5000 行',
      binaryFile: '这是二进制或非 UTF-8 文件，无法在这里编辑。',
      loadingFile: '正在打开文件…',
      unsupported: '不支持的项目',
      file: '文件',
      folder: '文件夹',
      projectRoot: '工程根目录',
      lines: '{count} 行',
      copied: '已复制选中文本。',
      copyFailed: '复制失败。',
      copy: '复制选中',
      searchShort: '搜索',
      notLive: '会话已不在运行，请重新打开会话。',
      hostUnavailable: '代码编辑器的 Host API 不可用。',
      openFailed: '无法打开文件。',
      noSelection: '没有选中内容',
      position: '第 {line} 行，第 {col} 列',
      chars: '已选中 {count} 个字符',
      saveShort: 'Ctrl+S',
    };

    const CSS = `
.dsh-ce-panel{position:relative;display:flex;flex-direction:column;height:clamp(280px,52vh,560px);min-height:220px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:13px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
.dsh-ce-panel.dsh-ce-view{box-sizing:border-box;width:100%;height:100%;min-height:0;border:0;border-radius:0;padding-bottom:calc(var(--dsh-composer-height,152px) + 16px)}
.dsh-ce-panel *{box-sizing:border-box}
.dsh-ce-header{display:flex;align-items:center;gap:8px;height:40px;flex:0 0 40px;padding:0 10px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dsh-ce-header-title{display:flex;align-items:center;gap:6px;font-weight:600;font-size:12px;white-space:nowrap;color:var(--dsw-alias-label-primary)}
.dsh-ce-header-path{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px;text-align:left;flex:1}
.dsh-ce-header-actions{display:flex;align-items:center;gap:2px;flex:0 0 auto}
.dsh-ce-icon-button{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:15px/1 system-ui,sans-serif;cursor:pointer}
.dsh-ce-icon-button:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-ce-icon-button:disabled{opacity:.4;cursor:default}
.dsh-ce-icon-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsh-ce-body{display:flex;flex:1;min-height:0}
.dsh-ce-sidebar{display:flex;flex-direction:column;width:270px;min-width:210px;flex:0 0 270px;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-height:0}
.dsh-ce-tabs{display:flex;flex:0 0 34px;height:34px;border-bottom:1px solid var(--dsw-alias-border-l1);padding:0 6px;gap:2px}
.dsh-ce-tab{display:inline-flex;align-items:center;justify-content:center;flex:1;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:500 12px/1 system-ui,sans-serif;cursor:pointer;padding:0 6px}
.dsh-ce-tab:hover{color:var(--dsw-alias-label-primary)}
.dsh-ce-tab.is-active{border-bottom-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}
.dsh-ce-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-ce-sidebar-content{display:flex;flex-direction:column;flex:1;min-height:0}
.dsh-ce-tree{flex:1;min-height:0;overflow:auto;padding:5px 6px 10px}
.dsh-ce-tree-root{display:flex;align-items:center;gap:6px;padding:5px 7px 6px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;position:sticky;top:0;background:var(--dsw-alias-bg-layer-2);z-index:1}
.dsh-ce-tree-root-name{overflow:hidden;text-overflow:ellipsis}
.dsh-ce-tree-row{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-primary);font:12px/1.3 system-ui,sans-serif;text-align:left;cursor:pointer;padding:2px 6px 2px 0;overflow:hidden}
.dsh-ce-tree-row:hover{background:var(--dsw-alias-bg-layer-1)}
.dsh-ce-tree-row.is-active{background:var(--dsw-alias-bg-layer-1);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary)}
.dsh-ce-tree-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-ce-tree-row:disabled{color:var(--dsw-alias-state-idle-primary);cursor:default}
.dsh-ce-caret{display:inline-flex;align-items:center;justify-content:center;width:10px;min-width:10px;color:var(--dsw-alias-label-secondary);font-size:10px}
.dsh-ce-tree-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-ce-folder-icon{flex:0 0 auto;color:var(--dsw-alias-brand-primary)}
.dsh-ce-file-icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:16px;flex:0 0 auto;border:1px solid var(--dsw-alias-border-l1);border-radius:4px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:600 8px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.dsh-ce-tree-loading,.dsh-ce-tree-empty{display:flex;align-items:center;gap:6px;padding:8px 10px;color:var(--dsw-alias-label-secondary);font-size:11px}
.dsh-ce-tree-error{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:8px 10px;color:var(--dsw-alias-state-error-primary);font-size:11px}
.dsh-ce-tree-error button{border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:transparent;color:inherit;font:11px/1 system-ui,sans-serif;padding:3px 7px;cursor:pointer}
.dsh-ce-tree-truncated{padding:5px 9px;color:var(--dsw-alias-state-warn-primary);font-size:10px}
.dsh-ce-search{display:flex;flex-direction:column;flex:1;min-height:0}
.dsh-ce-search-form{display:flex;gap:5px;padding:8px 8px 5px}
.dsh-ce-search-input{flex:1;min-width:0;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:12px/1 system-ui,sans-serif;padding:0 8px;outline:none}
.dsh-ce-search-input:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-ce-search-input::placeholder{color:var(--dsw-alias-label-secondary)}
.dsh-ce-search-submit{height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:11px/1 system-ui,sans-serif;padding:0 9px;cursor:pointer;white-space:nowrap}
.dsh-ce-search-submit:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-ce-search-submit:disabled{opacity:.5;cursor:default}
.dsh-ce-segment{display:flex;margin:0 8px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;overflow:hidden}
.dsh-ce-segment button{flex:1;height:25px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:11px/1 system-ui,sans-serif;cursor:pointer}
.dsh-ce-segment button:hover{color:var(--dsw-alias-label-primary)}
.dsh-ce-segment button.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:inset 0 -2px 0 var(--dsw-alias-brand-primary)}
.dsh-ce-check{display:flex;align-items:center;gap:6px;padding:0 10px 6px;color:var(--dsw-alias-label-secondary);font-size:10.5px;cursor:pointer;user-select:none}
.dsh-ce-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}
.dsh-ce-search-status{padding:0 10px 6px;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:1.5}
.dsh-ce-search-status.is-error{color:var(--dsw-alias-state-error-primary)}
.dsh-ce-results{flex:1;min-height:0;overflow:auto;padding:0 6px 8px}
.dsh-ce-result{display:flex;flex-direction:column;gap:2px;width:100%;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;padding:5px 7px;overflow:hidden}
.dsh-ce-result:hover{background:var(--dsw-alias-bg-layer-1)}
.dsh-ce-result:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-ce-result-path{display:flex;gap:4px;min-width:0;font-size:11px;white-space:nowrap;overflow:hidden}
.dsh-ce-result-dir{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary)}
.dsh-ce-result-base{flex:0 0 auto;font-weight:600}
.dsh-ce-result-line{display:flex;gap:6px;min-width:0;font:10.5px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden}
.dsh-ce-result-ln{flex:0 0 auto;min-width:22px;text-align:right;color:var(--dsw-alias-state-idle-primary)}
.dsh-ce-result-text{min-width:0;overflow:hidden;text-overflow:ellipsis}
.dsh-ce-mark{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-bg-base);border-radius:2px;padding:0 1px}
.dsh-ce-editor-pane{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;background:var(--dsw-alias-bg-base)}
.dsh-ce-editor-toolbar{display:flex;align-items:center;gap:6px;height:38px;flex:0 0 38px;padding:0 8px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.dsh-ce-breadcrumb{display:flex;align-items:center;gap:4px;min-width:0;flex:1;overflow:hidden;white-space:nowrap;font-size:11px}
.dsh-ce-breadcrumb-dir{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary)}
.dsh-ce-breadcrumb-name{flex:0 0 auto;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsh-ce-editor-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}
.dsh-ce-dirty{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;margin-right:1px}
.dsh-ce-dirty.is-dirty{color:var(--dsw-alias-state-warn-primary)}
.dsh-ce-btn{height:25px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:11px/1 system-ui,sans-serif;padding:0 8px;cursor:pointer;white-space:nowrap}
.dsh-ce-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-ce-btn:disabled{opacity:.45;cursor:default}
.dsh-ce-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsh-ce-btn-primary{border-color:transparent;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-weight:600}
.dsh-ce-btn-primary:hover{filter:brightness(1.06)}
.dsh-ce-banner{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-state-error-primary);font-size:11px;flex:0 0 auto}
.dsh-ce-banner span{flex:1;min-width:0}
.dsh-ce-banner button{flex:0 0 auto}
.dsh-ce-editor-scroll{display:flex;flex:1;min-height:0;overflow:hidden}
.dsh-ce-code{display:flex;flex:1;min-width:0;min-height:0;background:var(--dsw-alias-bg-base);--dsh-ce-code-font:12px/20px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--dsh-ce-code-tab-size:2}
.dsh-ce-gutter{flex:0 0 54px;width:54px;padding:10px 8px 10px 0;overflow:hidden;border-right:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-idle-primary);font:var(--dsh-ce-code-font);text-align:right;user-select:none}
.dsh-ce-gutter-line{height:20px;white-space:pre}
.dsh-ce-editor{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden}
.dsh-ce-highlight{position:absolute;inset:0;margin:0;padding:10px 14px 10px 10px;border:0;background:transparent;color:var(--shiki-foreground,var(--dsw-alias-label-primary));font:var(--dsh-ce-code-font);white-space:pre;word-break:normal;overflow-wrap:normal;overflow:hidden;pointer-events:none;tab-size:var(--dsh-ce-code-tab-size);font-variant-ligatures:none}
.dsh-ce-highlight-content{will-change:transform}
.dsh-ce-line{height:20px;line-height:20px;white-space:pre}
.dsh-ce-textarea{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:10px 14px 10px 10px;border:0;outline:0;resize:none;background:transparent;color:transparent;caret-color:var(--dsw-alias-brand-primary);font:var(--dsh-ce-code-font);white-space:pre;word-break:normal;overflow-wrap:normal;overflow:auto;tab-size:var(--dsh-ce-code-tab-size);font-variant-ligatures:none}
.dsh-ce-textarea::selection{background:rgba(59,130,246,.28);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent);color:transparent}
.dsh-ce-textarea[readonly]{color:transparent}
.dsh-ce-editor.is-composing .dsh-ce-highlight{visibility:hidden}
.dsh-ce-editor.is-composing .dsh-ce-textarea{color:var(--dsw-alias-label-primary)}
.dsh-ce-editor.is-readonly .dsh-ce-highlight{opacity:.9}
.dsh-ce-statusbar{display:flex;align-items:center;gap:10px;height:26px;flex:0 0 26px;padding:0 10px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:10.5px;white-space:nowrap;overflow:hidden}
.dsh-ce-status-right{margin-left:auto;overflow:hidden;text-overflow:ellipsis}
.dsh-ce-badge{border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:0 4px;font-size:9.5px;line-height:15px;color:var(--dsw-alias-label-secondary)}
.dsh-ce-badge.is-warn{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.dsh-ce-empty{display:flex;flex:1;min-height:0;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;text-align:center;color:var(--dsw-alias-label-secondary)}
.dsh-ce-empty-icon{color:var(--dsw-alias-state-idle-primary)}
.dsh-ce-empty-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}
.dsh-ce-empty-text{max-width:380px;font-size:12px;line-height:1.55}
.dsh-ce-empty-hint{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.dsh-ce-toast{position:absolute;top:48px;right:10px;z-index:3;max-width:min(340px,80%);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:11px;line-height:1.4;padding:6px 9px}
.dsh-ce-spinner{display:inline-block;width:12px;height:12px;flex:0 0 auto;border:2px solid var(--dsw-alias-border-l1);border-top-color:var(--dsw-alias-brand-primary);border-radius:50%;animation:dsh-ce-spin .8s linear infinite}
@keyframes dsh-ce-spin{to{transform:rotate(360deg)}}
@media (max-width:760px){
  .dsh-ce-panel{height:clamp(260px,60vh,520px)}
  .dsh-ce-body{flex-direction:column}
  .dsh-ce-sidebar{width:100%;flex:0 0 42%;min-width:0;min-height:140px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1)}
  .dsh-ce-editor-pane{min-height:0}
}
@media (prefers-reduced-motion:reduce){.dsh-ce-spinner{animation:none}}
`;

    function createDraftCache() {
      const drafts = new Map();
      return {
        get(sessionId) {
          return drafts.get(sessionId) ?? null;
        },
        set(sessionId, doc) {
          if (doc !== null && doc !== undefined && doc.status === 'ready') drafts.set(sessionId, doc);
          else drafts.delete(sessionId);
        },
        clear(sessionId) {
          drafts.delete(sessionId);
        },
      };
    }

    function CodeIcon({ size = 16 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'm8 8-4 4 4 4' }),
        h('path', { d: 'm16 8 4 4-4 4' }),
        h('path', { d: 'm13 5-2 14' }),
      );
    }

    function FileTabIcon({ size = 15 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M6 3h7l5 5v13H6Z' }),
        h('path', { d: 'M13 3v5h5' }),
        h('path', { d: 'M9 13h6M9 17h4' }),
      );
    }

    function SearchTabIcon({ size = 15 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('circle', { cx: 10.5, cy: 10.5, r: 6.25 }),
        h('path', { d: 'm15.25 15.25 4.5 4.5' }),
      );
    }

    function FolderIcon({ open = false }) {      return h('svg', {
        width: 14,
        height: 14,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: 'dsh-ce-folder-icon',
        'aria-hidden': true,
      },
        open
          ? h('path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' })
          : h('path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2' }),
        h('path', { d: 'M3 9h18' }),
      );
    }

    function Spinner() {
      return h('span', { className: 'dsh-ce-spinner', 'aria-hidden': true });
    }

    function FileBadge({ name }) {
      const dot = name.lastIndexOf('.');
      const extension = dot > 0 ? name.slice(dot + 1).toUpperCase() : '';
      return h('span', { className: 'dsh-ce-file-icon', 'aria-hidden': true },
        extension.length > 0 ? extension.slice(0, 3) : '·',
      );
    }

    async function callHost(url, body, signal) {
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
          signal,
        });
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        const wrapped = new Error('The code-editor Host API is unavailable.');
        wrapped.code = 'host-unavailable';
        wrapped.cause = error;
        throw wrapped;
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok || data?.ok !== true) {
        const error = new Error(data?.error?.message ?? `HTTP ${response.status}`);
        error.code = data?.error?.code;
        error.status = response.status;
        throw error;
      }
      return data;
    }

    function normalizePath(value) {
      return String(value).replace(/\\/gu, '/');
    }

    function joinPath(root, relative) {
      const normalizedRoot = String(root);
      const separator = normalizedRoot.includes('\\') ? '\\' : '/';
      const trimmedRoot = normalizedRoot.replace(/[\\/]+$/u, '');
      const tail = String(relative)
        .replace(/^[\\/]+/u, '')
        .split(/[\\/]/u)
        .join(separator);
      return trimmedRoot.length === 0 ? `${separator}${tail}` : `${trimmedRoot}${separator}${tail}`;
    }

    function relativePath(root, absolute) {
      const normalizedRoot = normalizePath(root).replace(/\/+$/u, '');
      const normalizedAbsolute = normalizePath(absolute);
      if (normalizedRoot.toLowerCase() === normalizedAbsolute.toLowerCase()) return '';
      const prefix = `${normalizedRoot.toLowerCase()}/`;
      if (normalizedAbsolute.toLowerCase().startsWith(prefix)) {
        return normalizedAbsolute.slice(normalizedRoot.length + 1);
      }
      return normalizedAbsolute;
    }

    function baseName(value) {
      const parts = normalizePath(value).split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : normalizePath(value);
    }

    function dirName(value) {
      const parts = normalizePath(value).split('/');
      parts.pop();
      return parts.join('/');
    }

    function compareEntries(left, right) {
      if (left.type === 'directory' && right.type !== 'directory') return -1;
      if (left.type !== 'directory' && right.type === 'directory') return 1;
      return left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    }

    function caretAt(text, start, end) {
      const before = text.slice(0, start);
      const lastBreak = before.lastIndexOf('\n');
      return {
        line: before.split('\n').length,
        col: start - lastBreak,
        selected: Math.max(0, end - start),
      };
    }

    /**
     * Shiki drops the final empty token line, while a textarea still shows it.
     * Pad or trim to the exact line count so the highlight layer and the
     * textarea keep the same vertical geometry.
     */
    function alignTokenLines(tokens, text) {
      const count = text.split('\n').length;
      const lines = tokens.slice(0, count);
      while (lines.length < count) lines.push([]);
      return lines;
    }

    function truncatePath(value, max) {
      const text = String(value);
      if (text.length <= max) return text;
      return `…${text.slice(text.length - max + 1)}`;
    }

    function ShortEmpty({ title, text, icon = true }) {
      return h('div', { className: 'dsh-ce-empty' },
        icon ? h('div', { className: 'dsh-ce-empty-icon' }, h(CodeIcon, { size: 38 })) : null,
        h('div', { className: 'dsh-ce-empty-title' }, title),
        text ? h('div', { className: 'dsh-ce-empty-text' }, text) : null,
      );
    }

    function EditorWorkspace(props) {
      const { cache, sessionId, inputActions, useSessions, useInput, openView, t } = props;
      const cwdValue = useSessions(
        (snapshot) => snapshot.byId[sessionId]?.cwd,
        Object.is,
      );
      const cwd = typeof cwdValue === 'string' && cwdValue.length > 0 ? cwdValue : undefined;
      const phase = useInput((snapshot) => snapshot?.phase ?? 'plain', Object.is) ?? 'plain';

      const [tab, setTab] = React.useState('files');
      const [levels, setLevelsState] = React.useState({});
      const [expanded, setExpandedState] = React.useState(new Set());
      const [doc, setDoc] = React.useState(() => cache.get(sessionId));
      const [caret, setCaret] = React.useState({ line: 1, col: 1, selected: 0 });
      const [notice, setNotice] = React.useState(null);
      const [saving, setSaving] = React.useState(false);
      const [saveError, setSaveError] = React.useState(null);
      const [composing, setComposing] = React.useState(false);
      const [searchMode, setSearchMode] = React.useState('content');
      const [query, setQuery] = React.useState('');
      const [includeIgnored, setIncludeIgnored] = React.useState(false);
      const [searchState, setSearchState] = React.useState({
        status: 'idle',
        results: [],
        error: '',
        scanned: 0,
        truncated: false,
      });

      const levelsRef = React.useRef({});
      const expandedRef = React.useRef(new Set());
      const inflightRef = React.useRef(new Map());
      const epochRef = React.useRef(0);
      const previousCwdRef = React.useRef(undefined);
      const docRef = React.useRef(doc);
      const readAbortRef = React.useRef(null);
      const searchAbortRef = React.useRef(null);
      const noticeTimerRef = React.useRef(null);
      const openSeqRef = React.useRef(0);
      const textareaRef = React.useRef(null);
      const gutterRef = React.useRef(null);
      const highlightContentRef = React.useRef(null);
      const treeRef = React.useRef(null);
      const searchInputRef = React.useRef(null);
      const rowRefs = React.useRef(new Map());
      const scrolledPathRef = React.useRef(null);

      const setLevels = (next) => {
        levelsRef.current = next;
        setLevelsState(next);
      };

      const setExpanded = (next) => {
        expandedRef.current = next;
        setExpandedState(next);
      };

      function showNotice(text) {
        setNotice(text);
        if (noticeTimerRef.current !== null) clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = setTimeout(() => {
          setNotice(null);
          noticeTimerRef.current = null;
        }, 2600);
      }

      function updateCaret() {
        const element = textareaRef.current;
        if (element === null || doc === null || doc.status !== 'ready') return;
        const start = element.selectionStart ?? 0;
        const end = element.selectionEnd ?? start;
        setCaret(caretAt(doc.text, start, end));
      }

      async function loadDir(directory, options = {}) {
        if (cwd === undefined) return;
        const force = options.force === true;
        const epoch = options.epoch ?? epochRef.current;
        const existing = inflightRef.current.get(directory);
        if (existing !== undefined) {
          if (!force) return existing.promise;
          existing.controller.abort();
        }

        const controller = new AbortController();
        const previous = levelsRef.current[directory];
        const promise = (async () => {
          setLevels({
            ...levelsRef.current,
            [directory]: {
              status: 'loading',
              entries: previous?.entries ?? [],
              truncated: previous?.truncated === true,
            },
          });
          try {
            const data = await callHost(API.list, { sessionId, path: directory }, controller.signal);
            if (epoch !== epochRef.current) return;
            const entries = [...data.entries].sort(compareEntries);
            setLevels({
              ...levelsRef.current,
              [directory]: {
                status: 'ready',
                entries,
                truncated: data.truncated === true,
              },
            });
          } catch (error) {
            if (controller.signal.aborted || epoch !== epochRef.current) return;
            setLevels({
              ...levelsRef.current,
              [directory]: {
                status: 'error',
                entries: previous?.entries ?? [],
                error,
              },
            });
          } finally {
            const current = inflightRef.current.get(directory);
            if (current !== undefined && current.controller === controller) {
              inflightRef.current.delete(directory);
            }
          }
        })();

        inflightRef.current.set(directory, { controller, promise });
        return promise;
      }

      function refreshTree() {
        if (cwd === undefined) return;
        const epoch = epochRef.current;
        for (const directory of expandedRef.current) {
          void loadDir(directory, { force: true, epoch });
        }
        if (!expandedRef.current.has(cwd)) {
          const next = new Set(expandedRef.current);
          next.add(cwd);
          setExpanded(next);
          void loadDir(cwd, { force: true, epoch });
        }
      }

      function toggleDir(directory) {
        const next = new Set(expandedRef.current);
        if (next.has(directory)) {
          next.delete(directory);
          setExpanded(next);
          return;
        }
        next.add(directory);
        setExpanded(next);
        void loadDir(directory);
      }

      function confirmDiscard() {
        if (doc === null || doc.status !== 'ready' || doc.text === doc.original) return true;
        if (typeof window.confirm !== 'function') return true;
        return window.confirm(t('discardConfirm'));
      }

      async function openFile(absolutePath, relative, line = 1, options = {}) {
        if (options.skipConfirm !== true && !confirmDiscard()) return;
        if (readAbortRef.current !== null) readAbortRef.current.abort();
        const controller = new AbortController();
        readAbortRef.current = controller;
        const epoch = epochRef.current;
        const sequence = openSeqRef.current + 1;
        openSeqRef.current = sequence;
        setNotice(null);
        setSaveError(null);
        setDoc({
          status: 'loading',
          path: absolutePath,
          rel: relative,
          line,
          openSeq: sequence,
        });

        try {
          const data = await callHost(API.read, { sessionId, path: absolutePath }, controller.signal);
          if (controller.signal.aborted || epoch !== epochRef.current) return;
          const raw = data.text;
          const eol = raw.includes('\r\n') ? '\r\n' : '\n';
          const text = raw.replace(/\r\n/gu, '\n');
          setDoc({
            status: 'ready',
            path: absolutePath,
            rel: relative,
            text,
            original: text,
            version: data.version,
            bytes: data.bytes,
            lines: data.lines,
            eof: data.eof,
            readOnly: data.eof !== true,
            line,
            eol,
            openSeq: sequence,
          });
          setCaret({ line: 1, col: 1, selected: 0 });
        } catch (error) {
          if (controller.signal.aborted || epoch !== epochRef.current) return;
          if (error.code === 'not-text') {
            setDoc({
              status: 'binary',
              path: absolutePath,
              rel: relative,
              line,
              openSeq: sequence,
            });
          } else {
            setDoc({
              status: 'error',
              path: absolutePath,
              rel: relative,
              line,
              error,
              openSeq: sequence,
            });
          }
        }
      }

      function reloadFile() {
        if (doc === null) return;
        if (!confirmDiscard()) return;
        void openFile(doc.path, doc.rel, 1, { skipConfirm: true });
      }

      async function revealPath(absolutePath) {
        if (cwd === undefined) return;
        const relative = relativePath(cwd, absolutePath);
        const parts = relative.split('/').filter(Boolean);
        if (parts.length <= 1) return;
        let current = cwd;
        const next = new Set(expandedRef.current);
        for (let index = 0; index < parts.length - 1; index += 1) {
          current = joinPath(current, parts[index]);
          next.add(current);
          if (levelsRef.current[current] === undefined) {
            await loadDir(current);
          }
        }
        setExpanded(next);
      }

      function openSearchResult(result) {
        if (cwd === undefined) return;
        const absolute = joinPath(cwd, result.path);
        void revealPath(absolute);
        void openFile(absolute, result.path, result.line ?? 1);
      }

      function handleInsert() {
        const element = textareaRef.current;
        if (element === null || doc === null || doc.status !== 'ready') return;
        const start = element.selectionStart ?? 0;
        const end = element.selectionEnd ?? start;
        const selected = doc.text.slice(start, end);
        if (selected.trim().length === 0) {
          showNotice(t('selectFirst'));
          return;
        }
        if (phase !== 'plain') {
          showNotice(t('inputBusy'));
          return;
        }
        let accepted = false;
        try {
          accepted = inputActions.insertQuote(selected);
        } catch {
          accepted = false;
        }
        if (!accepted) {
          showNotice(t('insertFailed'));
          return;
        }
        showNotice(t('inserted'));
        if (typeof inputActions.focus === 'function') inputActions.focus();
      }

      async function saveFile() {
        if (doc === null || doc.status !== 'ready' || doc.readOnly || saving) return;
        if (doc.text === doc.original) return;
        const snapshot = doc;
        setSaving(true);
        setSaveError(null);
        const content = snapshot.eol === '\r\n'
          ? snapshot.text.replace(/\n/gu, '\r\n')
          : snapshot.text;
        try {
          const data = await callHost(API.write, {
            sessionId,
            path: snapshot.path,
            content,
            expectedVersion: snapshot.version,
          });
          setDoc((previous) => {
            if (previous === null || previous.status !== 'ready' || previous.path !== snapshot.path) {
              return previous;
            }
            return {
              ...previous,
              version: data.version,
              original: snapshot.text,
              savedAt: Date.now(),
            };
          });
        } catch (error) {
          setSaveError(error.code === 'stale' ? t('staleError') : (error.message || t('saveFailed')));
        } finally {
          setSaving(false);
        }
      }

      function onTextChange(event) {
        if (doc === null || doc.status !== 'ready' || doc.readOnly) return;
        const text = event.target.value.replace(/\r\n/gu, '\n');
        setDoc((previous) => previous !== null && previous.status === 'ready'
          ? { ...previous, text }
          : previous);
        setSaveError(null);
        setCaret(caretAt(text, event.target.selectionStart ?? 0, event.target.selectionEnd ?? 0));
      }

      function onKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          void saveFile();
          return;
        }
        if (event.key !== 'Tab' || event.shiftKey || doc === null || doc.status !== 'ready' || doc.readOnly) {
          return;
        }
        event.preventDefault();
        const element = event.currentTarget;
        const start = element.selectionStart ?? 0;
        const end = element.selectionEnd ?? start;
        const next = `${doc.text.slice(0, start)}  ${doc.text.slice(end)}`;
        setDoc((previous) => previous !== null && previous.status === 'ready'
          ? { ...previous, text: next }
          : previous);
        const position = start + 2;
        setCaret(caretAt(next, position, position));
        requestAnimationFrame(() => {
          element.selectionStart = position;
          element.selectionEnd = position;
        });
      }

      function syncEditorScroll(element) {
        if (element === null) return;
        if (gutterRef.current !== null) {
          gutterRef.current.scrollTop = element.scrollTop;
        }
        if (highlightContentRef.current !== null) {
          highlightContentRef.current.style.transform =
            `translate3d(${-element.scrollLeft}px, ${-element.scrollTop}px, 0)`;
        }
      }

      function syncScroll(event) {
        syncEditorScroll(event.currentTarget);
      }

      function runSearch(event) {
        if (event !== undefined) event.preventDefault();
        const needle = query.trim();
        if (needle.length === 0) {
          setSearchState({
            status: 'idle', results: [], error: '', scanned: 0, truncated: false,
          });
          return;
        }
        if (cwd === undefined) {
          setSearchState({
            status: 'error', results: [], error: t('noWorkspace'), scanned: 0, truncated: false,
          });
          return;
        }
        if (searchAbortRef.current !== null) searchAbortRef.current.abort();
        const controller = new AbortController();
        searchAbortRef.current = controller;
        setSearchState({
          status: 'loading', results: [], error: '', scanned: 0, truncated: false,
        });
        callHost(API.search, {
          sessionId,
          query: needle,
          kind: searchMode,
          includeIgnored,
        }, controller.signal).then((data) => {
          if (controller.signal.aborted) return;
          setSearchState({
            status: 'done',
            results: data.results ?? [],
            error: '',
            scanned: data.scanned ?? 0,
            truncated: data.truncated === true,
          });
        }).catch((error) => {
          if (controller.signal.aborted || error?.name === 'AbortError') return;
          setSearchState({
            status: 'error',
            results: [],
            error: error.message || t('searchError'),
            scanned: 0,
            truncated: false,
          });
        });
      }

      function clearSearch() {
        if (searchAbortRef.current !== null) searchAbortRef.current.abort();
        setQuery('');
        setSearchState({
          status: 'idle', results: [], error: '', scanned: 0, truncated: false,
        });
      }

      function switchSearchMode(mode) {
        if (mode === searchMode) return;
        if (searchAbortRef.current !== null) searchAbortRef.current.abort();
        setSearchMode(mode);
        setSearchState({
          status: 'idle', results: [], error: '', scanned: 0, truncated: false,
        });
      }

      React.useEffect(() => {
        epochRef.current += 1;
        const epoch = epochRef.current;
        const previousCwd = previousCwdRef.current;
        previousCwdRef.current = cwd;
        const workspaceChanged = previousCwd !== undefined && previousCwd !== cwd;
        for (const entry of inflightRef.current.values()) entry.controller.abort();
        inflightRef.current.clear();
        levelsRef.current = {};
        setLevelsState({});
        const nextExpanded = cwd === undefined ? new Set() : new Set([cwd]);
        expandedRef.current = nextExpanded;
        setExpandedState(nextExpanded);
        setNotice(null);
        setSaveError(null);
        if (workspaceChanged) {
          docRef.current = null;
          setDoc(null);
          cache.clear(sessionId);
          setCaret({ line: 1, col: 1, selected: 0 });
        }
        if (readAbortRef.current !== null) readAbortRef.current.abort();
        if (searchAbortRef.current !== null) searchAbortRef.current.abort();
        if (cwd !== undefined) void loadDir(cwd, { epoch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [cwd, sessionId]);

      React.useEffect(() => {
        docRef.current = doc;
      }, [doc]);

      React.useEffect(() => () => {
        cache.set(sessionId, docRef.current);
        for (const entry of inflightRef.current.values()) entry.controller.abort();
        if (readAbortRef.current !== null) readAbortRef.current.abort();
        if (searchAbortRef.current !== null) searchAbortRef.current.abort();
        if (noticeTimerRef.current !== null) clearTimeout(noticeTimerRef.current);
      }, [cache, sessionId]);

      const dirty = doc !== null && doc.status === 'ready' && doc.text !== doc.original;

      const plainLines = React.useMemo(
        () => (doc !== null && doc.status === 'ready' ? doc.text.split('\n') : []),
        [doc?.status, doc?.text],
      );
      const lang = doc !== null && doc.status === 'ready'
        ? languageForPath(doc.rel ?? doc.path)
        : undefined;
      const highlight = useHighlight(lang);
      // Tokenizing an editable 5000-line file on every keystroke would stall
      // typing. Show plain text while editing such a file, then colour it once
      // the user pauses. Read-only files never type, so they highlight at once.
      const deferHighlight = doc !== null && doc.status === 'ready'
        && doc.readOnly !== true
        && plainLines.length > 1500;
      const [largeText, setLargeText] = React.useState('');

      React.useEffect(() => {
        if (!deferHighlight) return undefined;
        const timer = setTimeout(() => setLargeText(doc.text), 180);
        return () => clearTimeout(timer);
      }, [deferHighlight, doc?.status, doc?.text]);

      const highlightSource = deferHighlight
        ? largeText
        : (doc !== null && doc.status === 'ready' ? doc.text : '');
      const tokens = React.useMemo(() => {
        if (doc === null || doc.status !== 'ready' || lang === undefined || typeof highlight !== 'function') {
          return null;
        }
        if (highlightSource !== doc.text) return null;
        const raw = highlight(highlightSource);
        return raw === undefined || raw === null ? null : alignTokenLines(raw, highlightSource);
      }, [doc?.status, doc?.text, lang, highlightSource, highlight]);
      const displayLines = tokens ?? plainLines;

      React.useEffect(() => {
        if (tab !== 'search') return;
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }, [tab]);

      React.useEffect(() => {
        if (doc === null) return;
        if (scrolledPathRef.current === doc.path) return;
        const row = rowRefs.current.get(doc.path);
        if (row !== undefined) {
          row.scrollIntoView({ block: 'nearest' });
          scrolledPathRef.current = doc.path;
        }
      }, [doc?.path, expanded, levels]);

      React.useEffect(() => {
        if (doc === null || doc.status !== 'ready' || textareaRef.current === null) return;
        const element = textareaRef.current;
        const lines = doc.text.split('\n');
        const target = Math.max(1, Math.min(doc.line ?? 1, lines.length));
        let start = 0;
        for (let index = 0; index < target - 1; index += 1) start += lines[index].length + 1;
        const end = start + (lines[target - 1]?.length ?? 0);
        element.scrollTop = Math.max(0, (target - 1) * 20 - 120);
        element.setSelectionRange(start, end);
        syncEditorScroll(element);
        setCaret(caretAt(doc.text, start, end));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [doc?.status, doc?.openSeq]);

      React.useLayoutEffect(() => {
        syncEditorScroll(textareaRef.current);
      });

      const lineCount = plainLines.length;
      const gutterLines = React.useMemo(
        () => Array.from({ length: lineCount }, (_, index) => index + 1),
        [lineCount],
      );

      const canInsert = caret.selected > 0 && phase === 'plain';
      const relative = doc !== null && doc.rel !== undefined
        ? doc.rel
        : (doc !== null && cwd !== undefined ? relativePath(cwd, doc.path) : '');

      function renderTreeLevel(directory, depth) {
        const level = levels[directory];
        if (level === undefined) return null;
        if (level.status === 'loading' && level.entries.length === 0) {
          return [h('div', {
            key: `${directory}:loading`,
            className: 'dsh-ce-tree-loading',
            style: { paddingLeft: `${10 + depth * 14}px` },
          }, h(Spinner), t('treeLoading'))];
        }
        if (level.status === 'error' && level.entries.length === 0) {
          return [h('div', {
            key: `${directory}:error`,
            className: 'dsh-ce-tree-error',
            style: { paddingLeft: `${10 + depth * 14}px` },
          },
            h('span', null, t('treeError')),
            h('button', {
              type: 'button',
              onClick: () => void loadDir(directory, { force: true }),
            }, t('retry')))];
        }

        const rows = [];
        for (const entry of level.entries) {
          const absolute = joinPath(directory, entry.name);
          const fileRelative = relativePath(cwd ?? '', absolute);
          const isDirectory = entry.type === 'directory';
          const other = entry.type === 'other';
          const open = isDirectory && expanded.has(absolute);
          const active = doc !== null && doc.path === absolute;
          rows.push(h('button', {
            key: `${absolute}:${entry.type}`,
            type: 'button',
            className: `dsh-ce-tree-row${active ? ' is-active' : ''}`,
            style: { paddingLeft: `${8 + depth * 14}px` },
            title: other ? t('unsupported') : fileRelative,
            disabled: other,
            'aria-current': active ? 'true' : undefined,
            'aria-expanded': isDirectory ? open : undefined,
            ref: (element) => {
              if (element === null) rowRefs.current.delete(absolute);
              else rowRefs.current.set(absolute, element);
            },
            onClick: () => {
              if (isDirectory) toggleDir(absolute);
              else if (!other) void openFile(absolute, fileRelative, 1);
            },
          },
            h('span', { className: 'dsh-ce-caret' }, isDirectory ? (open ? '▾' : '▸') : ''),
            isDirectory ? h(FolderIcon, { open }) : h(FileBadge, { name: entry.name }),
            h('span', { className: 'dsh-ce-tree-name' }, entry.name),
          ));
          if (isDirectory && open) rows.push(...(renderTreeLevel(absolute, depth + 1) ?? []));
        }

        if (level.truncated) {
          rows.push(h('div', {
            key: `${directory}:truncated`,
            className: 'dsh-ce-tree-truncated',
            style: { paddingLeft: `${10 + depth * 14}px` },
          }, t('searchTruncated')));
        }
        return rows;
      }

      function renderTree() {
        if (cwd === undefined) {
          return h('div', { className: 'dsh-ce-tree-empty' }, t('noWorkspace'));
        }
        const rootLevel = levels[cwd];
        return h('div', { className: 'dsh-ce-tree', ref: treeRef },
          h('div', { className: 'dsh-ce-tree-root', title: cwd },
            h(FolderIcon, { open: true }),
            h('span', { className: 'dsh-ce-tree-root-name' }, baseName(cwd)),
            rootLevel?.status === 'loading' ? h(Spinner) : null,
          ),
          rootLevel?.status === 'error' && (rootLevel.entries?.length ?? 0) === 0
            ? h('div', { className: 'dsh-ce-tree-error' },
              h('span', null, t('treeError')),
              h('button', {
                type: 'button',
                onClick: () => void loadDir(cwd, { force: true }),
              }, t('retry')))
            : renderTreeLevel(cwd, 0),
        );
      }

      function renderSearchStatus() {
        if (searchState.status === 'loading') {
          return h('div', { className: 'dsh-ce-search-status' }, h(Spinner), ' ', t('searching'));
        }
        if (searchState.status === 'error') {
          return h('div', { className: 'dsh-ce-search-status is-error' }, searchState.error);
        }
        if (searchState.status === 'done') {
          return h('div', { className: 'dsh-ce-search-status' },
            t('searchResults', { count: searchState.results.length }),
            ' · ',
            t('searchScanned', { count: searchState.scanned }),
            searchState.truncated ? ` · ${t('searchTruncated')}` : '',
          );
        }
        return h('div', { className: 'dsh-ce-search-status' }, t('searchIdle'));
      }

      function renderSearchResults() {
        if (searchState.status === 'loading') {
          return h(ShortEmpty, { title: t('searching'), text: null, icon: false });
        }
        if (searchState.status === 'error') {
          return h(ShortEmpty, { title: t('searchError'), text: searchState.error, icon: false });
        }
        if (searchState.status === 'idle') {
          return h(ShortEmpty, { title: t('search'), text: t('searchIdle'), icon: false });
        }
        if (searchState.results.length === 0) {
          return h(ShortEmpty, { title: t('searchEmpty'), text: null, icon: false });
        }
        return h('div', { className: 'dsh-ce-results' },
          searchState.results.map((result, index) => {
            const directory = dirName(result.path);
            const file = baseName(result.path);
            const content = result.kind === 'content';
            const matchStart = Math.max(0, Math.min(result.matchStart ?? 0, result.text?.length ?? 0));
            const matchEnd = Math.min(result.text?.length ?? 0, matchStart + (result.matchLength ?? 0));
            return h('button', {
              key: `${result.path}:${result.kind}:${result.line ?? 0}:${index}`,
              type: 'button',
              className: 'dsh-ce-result',
              title: result.path,
              onClick: () => openSearchResult(result),
            },
              h('div', { className: 'dsh-ce-result-path' },
                directory.length > 0 ? h('span', { className: 'dsh-ce-result-dir' }, directory) : null,
                h('span', { className: 'dsh-ce-result-base' }, file),
              ),
              content ? h('div', { className: 'dsh-ce-result-line' },
                h('span', { className: 'dsh-ce-result-ln' }, result.line),
                h('span', { className: 'dsh-ce-result-text' },
                  (result.text ?? '').slice(0, matchStart),
                  h('mark', { className: 'dsh-ce-mark' }, (result.text ?? '').slice(matchStart, matchEnd)),
                  (result.text ?? '').slice(matchEnd),
                ),
              ) : null,
            );
          }),
        );
      }

      function renderSearch() {
        return h('div', { className: 'dsh-ce-search' },
          h('div', { className: 'dsh-ce-segment', role: 'group', 'aria-label': t('searchMode') },
            h('button', {
              type: 'button',
              className: searchMode === 'file' ? 'is-active' : '',
              'aria-pressed': searchMode === 'file',
              onClick: () => switchSearchMode('file'),
            }, t('fileMode')),
            h('button', {
              type: 'button',
              className: searchMode === 'content' ? 'is-active' : '',
              'aria-pressed': searchMode === 'content',
              onClick: () => switchSearchMode('content'),
            }, t('contentMode')),
          ),
          h('form', { className: 'dsh-ce-search-form', onSubmit: runSearch },
            h('input', {
              ref: searchInputRef,
              type: 'search',
              className: 'dsh-ce-search-input',
              value: query,
              placeholder: t('searchPlaceholder'),
              'aria-label': t('searchPlaceholder'),
              onChange: (event) => setQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Escape') clearSearch();
              },
            }),
            h('button', {
              type: 'submit',
              className: 'dsh-ce-search-submit',
              disabled: query.trim().length === 0 || searchState.status === 'loading',
            }, t('search')),
          ),
          h('label', { className: 'dsh-ce-check' },
            h('input', {
              type: 'checkbox',
              checked: includeIgnored,
              onChange: (event) => setIncludeIgnored(event.target.checked),
            }),
            t('searchIncludeIgnored'),
          ),
          renderSearchStatus(),
          renderSearchResults(),
        );
      }

      function renderSidebar() {
        return h('div', { className: 'dsh-ce-sidebar' },
          h('div', { className: 'dsh-ce-tabs', role: 'tablist' },
            h('button', {
              type: 'button',
              role: 'tab',
              'aria-selected': tab === 'files',
              'aria-label': t('files'),
              title: t('files'),
              className: `dsh-ce-tab${tab === 'files' ? ' is-active' : ''}`,
              onClick: () => setTab('files'),
            }, h(FileTabIcon)),
            h('button', {
              type: 'button',
              role: 'tab',
              'aria-selected': tab === 'search',
              'aria-label': t('search'),
              title: t('search'),
              className: `dsh-ce-tab${tab === 'search' ? ' is-active' : ''}`,
              onClick: () => setTab('search'),
            }, h(SearchTabIcon)),
          ),
          h('div', { className: 'dsh-ce-sidebar-content' },
            tab === 'files' ? renderTree() : renderSearch(),
          ),
        );
      }

      function renderEmpty(title, text) {
        return h(ShortEmpty, { title, text });
      }

      function renderEditor() {
        if (doc === null) {
          return renderEmpty(t('emptyTitle'), t('emptyText'));
        }
        if (doc.status === 'loading') {
          return h('div', { className: 'dsh-ce-empty' },
            h(Spinner),
            h('div', { className: 'dsh-ce-empty-title' }, t('loadingFile')),
          );
        }
        if (doc.status === 'binary') {
          return h('div', { className: 'dsh-ce-empty' },
            h('div', { className: 'dsh-ce-empty-title' }, t('binaryFile')),
            h('button', {
              type: 'button',
              className: 'dsh-ce-btn',
              onClick: reloadFile,
            }, t('reload')),
          );
        }
        if (doc.status === 'error') {
          return h('div', { className: 'dsh-ce-empty' },
            h('div', { className: 'dsh-ce-empty-title' }, t('openFailed')),
            h('div', { className: 'dsh-ce-empty-text' }, doc.error?.message ?? t('hostUnavailable')),
            h('button', {
              type: 'button',
              className: 'dsh-ce-btn',
              onClick: reloadFile,
            }, t('reload')),
          );
        }

        return h(React.Fragment, null,
          saveError !== null ? h('div', { className: 'dsh-ce-banner' },
            h('span', null, saveError),
            h('button', {
              type: 'button',
              className: 'dsh-ce-btn',
              onClick: reloadFile,
            }, t('reload')),
          ) : null,
          h('div', { className: 'dsh-ce-editor-scroll' },
            h('div', { className: 'dsh-ce-code' },
              h('div', { className: 'dsh-ce-gutter', ref: gutterRef, 'aria-hidden': true },
                gutterLines.map((line) => h('div', { key: line, className: 'dsh-ce-gutter-line' }, line)),
              ),
              h('div', {
                className: 'dsh-ce-editor'
                  + (composing ? ' is-composing' : '')
                  + (doc.readOnly ? ' is-readonly' : ''),
              },
                h('pre', { className: 'dsh-ce-highlight', 'aria-hidden': true },
                  h('div', { className: 'dsh-ce-highlight-content', ref: highlightContentRef },
                    displayLines.map((line, index) => h('div', {
                      className: 'dsh-ce-line',
                      key: index,
                    },
                      Array.isArray(line)
                        ? line.map((token, tokenIndex) => h('span', {
                            key: tokenIndex,
                            style: token.style,
                          }, token.text))
                        : line,
                    )),
                  ),
                ),
                h('textarea', {
                  ref: textareaRef,
                  className: 'dsh-ce-textarea',
                  value: doc.text,
                  readOnly: doc.readOnly,
                  spellCheck: false,
                  autoCapitalize: 'off',
                  autoCorrect: 'off',
                  wrap: 'off',
                  'aria-label': t('editorLabel'),
                  onChange: onTextChange,
                  onKeyDown,
                  onSelect: updateCaret,
                  onKeyUp: updateCaret,
                  onClick: updateCaret,
                  onScroll: syncScroll,
                  onCompositionStart: () => setComposing(true),
                  onCompositionEnd: () => setComposing(false),
                }),
              ),
            ),
          ),
        );
      }

      function renderToolbar() {
        const showDoc = doc !== null && doc.status === 'ready';
        return h('div', { className: 'dsh-ce-editor-toolbar' },
          h('div', {
            className: 'dsh-ce-breadcrumb',
            title: doc?.path ?? '',
          },
            showDoc && relative.length > 0
              ? h('span', { className: 'dsh-ce-breadcrumb-dir' }, dirName(relative))
              : null,
            h('span', { className: 'dsh-ce-breadcrumb-name' },
              showDoc && relative.length > 0 ? baseName(relative) : t('title')),
          ),
          h('div', { className: 'dsh-ce-editor-actions' },
            showDoc ? h('span', { className: `dsh-ce-dirty${dirty ? ' is-dirty' : ''}` },
              dirty ? t('unsaved') : t('saved')) : null,
            showDoc ? h('button', {
              type: 'button',
              className: 'dsh-ce-btn',
              onClick: reloadFile,
              title: t('reload'),
            }, t('reload')) : null,
            showDoc ? h('button', {
              type: 'button',
              className: 'dsh-ce-btn dsh-ce-btn-primary',
              onClick: () => void saveFile(),
              disabled: !dirty || saving || doc.readOnly,
              title: `${t('save')} (${t('saveShort')})`,
            }, saving ? t('saving') : t('save')) : null,
            showDoc ? h('button', {
              type: 'button',
              className: 'dsh-ce-btn',
              onClick: handleInsert,
              onMouseDown: (event) => event.preventDefault(),
              disabled: !canInsert,
              title: t('insertHint'),
            }, t('insert')) : null,
          ),
        );
      }

      function renderStatusBar() {
        const showDoc = doc !== null && doc.status === 'ready';
        return h('div', { className: 'dsh-ce-statusbar' },
          showDoc ? h('span', null, t('position', { line: caret.line, col: caret.col })) : h('span', null, t('noSelection')),
          showDoc && caret.selected > 0 ? h('span', null, t('chars', { count: caret.selected })) : null,
          showDoc ? h('span', null, 'UTF-8') : null,
          showDoc && doc.readOnly ? h('span', { className: 'dsh-ce-badge is-warn' }, t('readOnly')) : null,
          showDoc && doc.readOnly ? h('span', { className: 'dsh-ce-badge is-warn' }, t('partial')) : null,
          h('span', { className: 'dsh-ce-status-right' },
            !showDoc ? '' : saving ? t('saving') : dirty ? t('unsaved') : t('saved')),
        );
      }

      function panelHeader() {
        return h('div', { className: 'dsh-ce-header' },
          h('div', { className: 'dsh-ce-header-title' },
            h(CodeIcon, { size: 15 }),
            h('span', null, t('title')),
          ),
          h('div', { className: 'dsh-ce-header-path', title: cwd ?? '' },
            cwd !== undefined ? truncatePath(cwd, 90) : t('noWorkspace')),
          h('div', { className: 'dsh-ce-header-actions' },
            h('button', {
              type: 'button',
              className: 'dsh-ce-icon-button',
              title: t('refreshTree'),
              'aria-label': t('refreshTree'),
              onClick: refreshTree,
              disabled: cwd === undefined,
            }, '↻'),
            h('button', {
              type: 'button',
              className: 'dsh-ce-icon-button',
              title: t('backToChat'),
              'aria-label': t('backToChat'),
              onClick: () => {
                if (typeof openView === 'function') openView('chat', '');
              },
            }, '↩'),
          ),
        );
      }

      return h('div', {
        className: 'dsh-ce-panel dsh-ce-view',
        role: 'region',
        'aria-label': t('title'),
        'data-conversation-composer-overlay': '',
      },
        panelHeader(),
        h('div', { className: 'dsh-ce-body' },
          renderSidebar(),
          h('div', { className: 'dsh-ce-editor-pane' },
            renderToolbar(),
            renderEditor(),
            renderStatusBar(),
          ),
        ),
        notice !== null ? h('div', { className: 'dsh-ce-toast', role: 'status' }, notice) : null,
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'code-editor: locale');
        const t = ctx.locale.bind(NS);
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = '@local/dsh-code-editor';
          tag.dataset.pluginCss = '@local/dsh-code-editor/code-editor.css';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => tag.remove();
        }, 'code-editor: styles');

        const cache = createDraftCache();

        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'code-editor',
          order: 20,
          locale: NS,
          label: () => '</>',
          inject: () => ({ cache }),
        }, EditorWorkspace));
      },
    };
  },
});
