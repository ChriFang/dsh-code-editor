# 代码编辑器插件

给 DeepSeek Harness Web GUI 增加一个会话内代码编辑器：

- **浏览工程**：从当前会话的工作目录出发，按目录懒加载文件树，显示点文件。
- **搜索**：按文件名或文件内容搜索整个工程；默认跳过 `node_modules`、`.git`、`dist`、`build` 等目录，可勾选包含。
- **编辑与保存**：读取 UTF-8 文本，支持行号、选择、`Ctrl+S` 保存；保存带版本校验，外部修改后不会静默覆盖。
- **语法高亮**：按文件扩展名复用宿主内置的 Shiki 高亮器，关键字、字符串、注释、数字等使用主题 token 颜色，明暗主题自动切换；未知后缀和纯文本文件保持无色。
- **插入会话**：在编辑器里选中文本，点「插入选中」即可把选中内容作为引用插入消息输入框。
- **只读保护**：超过 5000 行或 2 MB 的文件、二进制/非 UTF-8 文件只读展示；只读权限模式下保存会被拒绝。

## 使用

打开任意会话后，顶部标题下方的 View tab 行会出现 `</>` tab，位于「对话」和「轨迹」之后。点击它进入代码编辑器：

1. 在「文件」页展开目录、打开文件；
2. 或切到「搜索」页，按文件名/内容搜索，点击结果跳转到对应行；
3. 在编辑器中选中文本，点「插入选中」；
4. 修改后按 `Ctrl+S` 或点「保存」。
5. 点「返回对话」或直接点「对话」tab 回到消息区；未保存草稿会在本次页面会话内保留。

## 实现

- `index.js`（Host）：注册四个经 Connection 鉴权的 `/api/code-editor/*` 路由：
  - `list`：列目录；
  - `read`：读取文本文件；
  - `search`：文件名/内容搜索；
  - `write`：带版本校验的保存。
  所有路径都在当前会话工作目录内，并通过 `ctx.fs` 与 `ctx.sandboxPolicy` 执行。
- `client.js`（Client）：通过 `conversation.view` 注册 `</>` View（order 20，排在 `chat` 和 `trajectory` 之后），读取 `inputActions` 把选中文本插入会话输入框；View 根节点声明 `data-conversation-composer-overlay`，让编辑器占满主区域并在底部为输入框留出空间。
- 编辑器是「透明 textarea + 绝对定位高亮层」：textarea 仍是唯一输入控件，`@deepseek-ai/dsh-client-ui-primitives` 的 `useCodeHighlighter(lang)` 提供逐行 token，`languageForPath(path)` 负责扩展名到 grammar id 的映射。高亮层用 transform 跟随 textarea 滚动；中文输入法组合输入期间临时隐藏高亮层，避免组合文字透明看不见。
- 样式使用宿主主题变量（`--dsw-alias-*`）和 Shiki 主题变量（`--shiki-token-*`），不导入 Harness Client 包。

## 限制

- 编辑窗口按行读取，超过 5000 行的文件只读预览。
- 超过 1500 行的可编辑文件在输入时先显示纯文本，停止输入约 180 ms 后恢复高亮；只读的大文件打开时直接高亮一次。
- 单次读取/保存上限 2 MB；搜索单文件上限 384 KB，结果上限 200 条，超过 10 秒会以已扫描结果返回。
- 文件树按目录懒加载，单层最多显示 2000 项。
- 保存要求会话仍在运行；会话关闭后无法从本插件写回。

## 测试

```bash
node test/host-routes.test.mjs
node test/client-render.test.mjs
```

`host-routes` 用临时目录和假的 Host Context 覆盖列目录、读取、文件名/内容搜索、保存、版本冲突、越界路径、二进制文件和只读模式。`client-render` 用假的 React 和假的 Shiki hook 静态渲染编辑器，覆盖高亮层/纯文本回退、未知后缀、grammar 未加载、末尾空行、大文件延迟高亮和只读大文件。
