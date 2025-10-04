# Export ChatGPT/Gemini/Grok conversations as Markdown - Chrome 扩展

这是一个 Chrome 扩展 用于导出 ChatGPT、Gemini 和 Grok 网站的聊天记录为 Markdown 格式。

## 功能特点

- 支持导出 ChatGPT (chatgpt.com) 聊天记录
- 支持导出 Grok (grok.com) 聊天记录
- 支持导出 Gemini (gemini.google.com) 聊天记录
- 将聊天内容转换为标准 Markdown 格式，可在 Typora 等编辑器中完美打开
- 支持数学公式、代码块、链接、图片等格式转换
- 智能获取对话标题作为文件名，支持多种备选方案
- 在页面顶部显示导出按钮，一键保存为 Markdown 文件

## 安装步骤

1. 下载或克隆此仓库到本地
2. 打开 Chrome 浏览器，进入扩展管理页面：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择此项目的根目录文件夹

## 使用方法

1. 访问支持的网站：
   - https://chatgpt.com
   - https://grok.com
   - https://gemini.google.com

2. 进行一些对话后，页面顶部会显示一个"Save As Markdown"按钮

3. 点击按钮，聊天记录将自动导出为 Markdown 文件并下载到本地

## 技术细节

- 基于 Manifest V3 构建
- 使用 Content Script 注入到指定页面
- 自动识别当前聊天平台并应用相应的解析逻辑
- 智能标题获取：尝试多种选择器获取对话标题，回退到页面标题
- 文件名会自动清理非法字符，确保下载成功

## 注意事项

- 扩展只在指定的域名下运行，不会影响其他网站
- 导出的 Markdown 文件包含完整的对话历史
- 数学公式使用 LaTeX 格式呈现
- 代码块会保留语言类型标识
- 如果无法获取对话标题，将使用默认名称 "chat_export.md"

## 故障排除

### 文件名显示为 "untitled.md" 而不是对话名

如果导出的文件名是 "untitled.md" 而不是实际的对话标题，这可能是因为：

1. **DOM 结构变化**：网站可能更新了界面，选择器无法找到标题元素
2. **异步加载问题**：页面内容可能还没有完全加载完成

**解决方案**：
- 最新版本已改进标题获取逻辑，使用多种选择器尝试获取对话标题
- 如果仍然无法获取，将使用页面标题作为备选方案
- 确保在对话加载完成后点击导出按钮

### 其他错误

如果遇到 "Cannot read properties of undefined (reading 'replace')" 错误，这是因为某些情况下无法获取对话标题。最新版本已修复此问题，确保始终生成有效的文件名。

### 调试标题获取

如果你想调试标题获取功能，可以：

1. 在浏览器控制台中加载 `test-title-extraction.js` 脚本
2. 运行 `testTitleExtraction()` 函数查看调试信息
3. 这将显示当前页面使用的选择器和获取的标题

或者可以直接在扩展的 content script 中添加调试日志来查看标题获取过程。
