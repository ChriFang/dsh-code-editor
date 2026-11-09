# 插件市场索引

`site/` 是给 DSH **Discover** 用的公开市场索引，不随 npm 包发布（`package.json` 的 `files` 不包含它）。

当前索引地址（部署后）：

```text
https://chrifang.github.io/dsh-code-editor-market/index.json
```

## 发布

1. 先把插件发布到 npm：

   ```powershell
   npm publish
   ```

2. 用 npm 的实际发布时间更新 `site/index.json` 里的 `publishTimestamp`（Unix 秒）：

   ```powershell
   npm view dsh-code-editor time.1.0.6
   ```

   `site/index.json` 里当前的值是准备索引时的时间戳，正式发布后应替换。

3. 把 `site/` 的内容放到静态主机。推荐两种方式：

   - 新建 `ChriFang/dsh-code-editor-market` 仓库，根目录放 `index.json` 和 `icons/`，开启 GitHub Pages；
   - 或把 `site/` 内容放到插件仓库的 `gh-pages` 分支。

4. 确认索引满足 DSH 的读取条件：

   - HTTPS；
   - 返回 2xx，不经过重定向；
   - UTF-8 JSON；
   - `icons/` 与 `index.json` 同目录（相对图标按索引 URL 解析）。

5. 在 DSH 中启用 **Custom plugin market**，然后：

   ```text
   Plugins -> Discover -> Add index source
   ```

   填入上面的索引 URL，搜索 `dsh-code-editor` 并安装。

## 校验索引

官方参考生成器会顺带校验格式（需要 DSH 源码 checkout）：

```sh
pnpm --filter @deepseek-ai/dsh-plugin-market-generator start \
  --input plugins.txt \
  --output site/index.json \
  --title "ChriFang DSH plugins"
```

其中 `plugins.txt` 只有一行：

```text
dsh-code-editor
```

也可以直接把索引添加到 DSH 的 Discover；格式错误会在 **Manage index sources…** 中显示具体 JSON 路径。

## 更新版本

发布新版本后：

1. 在 `versions` 数组最前面加一条新版本（`version`、`publishTimestamp`、`source`、`engines`）；
2. 保留旧版本，便于用户安装指定版本；
3. 重新部署 `site/`。

`version` 必须是精确 SemVer；`publishTimestamp` 是 Unix 秒；`engines.dsh` 要与 `package.json` 的 `engines.dsh` 一致。
