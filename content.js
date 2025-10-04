(function () {
	'use strict';

	const CommonUtil = {
	  onPageLoad: function(callback) {
	    if (document.readyState === "complete") {
	      callback();
	    } else {
	      window.addEventListener("DOMContentLoaded", callback, { once: true });
	      window.addEventListener("load", callback, { once: true });
	    }
	  },
	  addStyle: function(style) {
	    const styleElement = document.createElement('style');
	    styleElement.textContent = style;
	    document.head.appendChild(styleElement);
	  },
	  createElement: function(tag, options = {}) {
	    const element = document.createElement(tag);
	    if (options.text) {
	      element.textContent = options.text;
	    }
	    if (options.html) {
	      element.innerHTML = options.html;
	    }
	    if (options.style) {
	      Object.assign(element.style, options.style);
	    }
	    if (options.className) {
	      element.className = options.className;
	    }
	    if (options.attributes) {
	      for (let [key, value] of Object.entries(options.attributes)) {
	        element.setAttribute(key, value);
	      }
	    }
	    if (options.childrens) {
	      options.childrens.forEach((child) => {
	        element.appendChild(child);
	      });
	    }
	    return element;
	  },
	  openInTab: function(url, options = { "active": true, "insert": true, "setParent": true }) {
	    window.open(url, options.active ? '_blank' : '_self');
	  },
	  waitForElementByInterval: function(selector, target = document.body, allowEmpty = true, delay = 10, maxDelay = 10 * 1e3) {
	    return new Promise((resolve, reject) => {
	      let totalDelay = 0;
	      let element = target.querySelector(selector);
	      let result = allowEmpty ? !!element : !!element && !!element.innerHTML;
	      if (result) {
	        resolve(element);
	      }
	      const elementInterval = setInterval(() => {
	        if (totalDelay >= maxDelay) {
	          clearInterval(elementInterval);
	          resolve(null);
	        }
	        element = target.querySelector(selector);
	        result = allowEmpty ? !!element : !!element && !!element.innerHTML;
	        if (result) {
	          clearInterval(elementInterval);
	          resolve(element);
	        } else {
	          totalDelay += delay;
	        }
	      }, delay);
	    });
	  }
	};

	const HtmlToMarkdown = {
	  to: function(html, platform) {
	    const parser = new DOMParser();
	    const doc = parser.parseFromString(html, "text/html");
	    const isChatGPT = platform === "chatGPT", isGemini = platform === "gemini", isGrok = platform === "grok";
	    if (!isGemini) {
	      doc.querySelectorAll("span.katex-html").forEach((element) => element.remove());
	    }
	    doc.querySelectorAll("mrow").forEach((mrow) => mrow.remove());
	    doc.querySelectorAll('annotation[encoding="application/x-tex"]').forEach((element) => {
	      if (element.closest(".katex-display")) {
	        const latex = element.textContent;
	        const trimmedLatex = latex.trim();
	        element.replaceWith(`
$$
${trimmedLatex}
$$
`);
	      } else {
	        const latex = element.textContent;
	        const trimmedLatex = latex.trim();
	        element.replaceWith(`$${trimmedLatex}$`);
	      }
	    });
	    doc.querySelectorAll("strong, b").forEach((bold) => {
	      const markdownBold = `**${bold.textContent}**`;
	      bold.parentNode.replaceChild(document.createTextNode(markdownBold), bold);
	    });
	    doc.querySelectorAll("em, i").forEach((italic) => {
	      const markdownItalic = `*${italic.textContent}*`;
	      italic.parentNode.replaceChild(document.createTextNode(markdownItalic), italic);
	    });
	    doc.querySelectorAll("p code").forEach((code) => {
	      const markdownCode = `\`${code.textContent}\``;
	      code.parentNode.replaceChild(document.createTextNode(markdownCode), code);
	    });
	    doc.querySelectorAll("a").forEach((link) => {
	      const markdownLink = `[${link.textContent}](${link.href})`;
	      link.parentNode.replaceChild(document.createTextNode(markdownLink), link);
	    });
	    doc.querySelectorAll("img").forEach((img) => {
	      const markdownImage = `![${img.alt}](${img.src})`;
	      img.parentNode.replaceChild(document.createTextNode(markdownImage), img);
	    });
	    if (isChatGPT) {
	      doc.querySelectorAll("pre").forEach((pre) => {
	        const codeType = pre.querySelector("div > div:first-child")?.textContent || "";
	        const markdownCode = pre.querySelector("div > div:nth-child(3) > code")?.textContent || pre.textContent;
	        pre.innerHTML = `
\`\`\`${codeType}
${markdownCode}
\`\`\``;
	      });
	    } else if (isGrok) {
	      doc.querySelectorAll("div.not-prose").forEach((div) => {
	        const codeType = div.querySelector("div > div > span")?.textContent || "";
	        const markdownCode = div.querySelector("div > div:nth-child(3) > code")?.textContent || div.textContent;
	        div.innerHTML = `
\`\`\`${codeType}
${markdownCode}
\`\`\``;
	      });
	    } else if (isGemini) {
	      doc.querySelectorAll("code-block").forEach((div) => {
	        const codeType = div.querySelector("div > div > span")?.textContent || "";
	        const markdownCode = div.querySelector("div > div:nth-child(2) > div > pre")?.textContent || div.textContent;
	        div.innerHTML = `
\`\`\`${codeType}
${markdownCode}
\`\`\``;
	      });
	    }
	    doc.querySelectorAll("ul").forEach((ul) => {
	      let markdown2 = "";
	      ul.querySelectorAll(":scope > li").forEach((li) => {
	        markdown2 += `- ${li.textContent.trim()}
`;
	      });
	      ul.parentNode.replaceChild(document.createTextNode("\n" + markdown2.trim()), ul);
	    });
	    doc.querySelectorAll("ol").forEach((ol) => {
	      let markdown2 = "";
	      ol.querySelectorAll(":scope > li").forEach((li, index) => {
	        markdown2 += `${index + 1}. ${li.textContent.trim()}
`;
	      });
	      ol.parentNode.replaceChild(document.createTextNode("\n" + markdown2.trim()), ol);
	    });
	    for (let i = 1; i <= 6; i++) {
	      doc.querySelectorAll(`h${i}`).forEach((header) => {
	        const markdownHeader = `
${"#".repeat(i)} ${header.textContent}
`;
	        header.parentNode.replaceChild(document.createTextNode(markdownHeader), header);
	      });
	    }
	    doc.querySelectorAll("p").forEach((p) => {
	      const markdownParagraph = "\n" + p.textContent + "\n";
	      p.parentNode.replaceChild(document.createTextNode(markdownParagraph), p);
	    });
	    doc.querySelectorAll("table").forEach((table) => {
	      let markdown2 = "";
	      table.querySelectorAll("thead tr").forEach((tr) => {
	        tr.querySelectorAll("th").forEach((th) => {
	          markdown2 += `| ${th.textContent} `;
	        });
	        markdown2 += "|\n";
	        tr.querySelectorAll("th").forEach(() => {
	          markdown2 += "| ---- ";
	        });
	        markdown2 += "|\n";
	      });
	      table.querySelectorAll("tbody tr").forEach((tr) => {
	        tr.querySelectorAll("td").forEach((td) => {
	          markdown2 += `| ${td.textContent} `;
	        });
	        markdown2 += "|\n";
	      });
	      table.parentNode.replaceChild(document.createTextNode("\n" + markdown2.trim() + "\n"), table);
	    });
	    let markdown = doc.body.innerHTML.replace(/<[^>]*>/g, "");
	    markdown = markdown.replaceAll(/- &gt;/g, "- $\\gt$");
	    markdown = markdown.replaceAll(/>/g, ">");
	    markdown = markdown.replaceAll(/</g, "<");
	    markdown = markdown.replaceAll(/≥/g, ">=");
	    markdown = markdown.replaceAll(/≤/g, "<=");
	    markdown = markdown.replaceAll(/≠/g, "\\neq");
	    return markdown.trim();
	  }
	};

	const Download = {
	  start: function(data, filename, type) {
	    var file = new Blob([data], { type });
	    if (window.navigator.msSaveOrOpenBlob) {
	      window.navigator.msSaveOrOpenBlob(file, filename);
	    } else {
	      var a = document.createElement("a"), url = URL.createObjectURL(file);
	      a.href = url;
	      a.download = filename;
	      document.body.appendChild(a);
	      a.click();
	      setTimeout(function() {
	        document.body.removeChild(a);
	        window.URL.revokeObjectURL(url);
	      }, 0);
	    }
	  }
	};

	const Chat = {
	  sanitizeFilename: function(input, replacement = "_") {
	    const illegalRe = /[\/\\\?\%\*\:\|"<>\.]/g;
	    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
	    const reservedRe = /^\.+$/;
	    const windowsReservedRe = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
	    if (!input || typeof input !== "string") {
	      return "untitled";
	    }
	    let name = input.replace(illegalRe, replacement).replace(controlRe, replacement).replace(/\s+/g, " ").trim();
	    if (reservedRe.test(name))
	      name = "file";
	    if (windowsReservedRe.test(name))
	      name = `file_${name}`;
	    return name || "untitled";
	  },
	  getConversationElements: function() {
	    const currentUrl = window.location.href;
	    const result = [];
	    let platform = "";
	    let title = "";

	    if (currentUrl.includes("openai.com") || currentUrl.includes("chatgpt.com")) {
	      platform = "chatGPT";
	      // 尝试多种方式获取 ChatGPT 对话标题
	      title = this.getChatGPTTitle() || "";
	      result.push(...document.querySelectorAll("div[data-message-id]"));
	    } else if (currentUrl.includes("grok.com")) {
	      platform = "grok";
	      // 尝试多种方式获取 Grok 对话标题
	      title = this.getGrokTitle() || "";
	      result.push(...document.querySelectorAll("div.message-bubble"));
	    } else if (currentUrl.includes("gemini.google.com")) {
	      platform = "gemini";
	      // 尝试多种方式获取 Gemini 对话标题
	      title = this.getGeminiTitle() || "";
	      const userQueries = document.querySelectorAll("user-query-content");
	      const modelResponses = document.querySelectorAll("model-response");
	      for (let i = 0; i < userQueries.length; i++) {
	        if (i < modelResponses.length) {
	          result.push(userQueries[i]);
	          result.push(modelResponses[i]);
	        } else {
	          result.push(userQueries[i]);
	        }
	      }
	    }

	    return { "result": result, "platform": platform, "title": title };
	  },

	  getChatGPTTitle: function() {
	    // 多种方式尝试获取 ChatGPT 对话标题
	    const selectors = [
	      "#history a[data-active]", // 原选择器
	      "nav a[aria-current='page']", // 当前页面链接
	      ".sidebar-nav a.active", // 侧边栏活动链接
	      "h1", // 页面标题
	      "head title", // 页面标题标签
	      "[data-testid='conversation-title']", // 可能的标题元素
	      ".conversation-title", // 通用标题类
	      "h2", // 可能的二级标题
	      "h3" // 可能的三级标题
	    ];

	    for (const selector of selectors) {
	      const element = document.querySelector(selector);
	      if (element) {
	        const text = element.textContent || element.innerText;
	        if (text && text.trim() && !text.toLowerCase().includes('chatgpt') && !text.toLowerCase().includes('new chat')) {
	          return text.trim();
	        }
	      }
	    }

	    // 如果都没找到，返回页面标题
	    return document.title || "";
	  },

	  getGrokTitle: function() {
	    // 多种方式尝试获取 Grok 对话标题
	    const selectors = [
	      ".conversation-title",
	      "h1",
	      ".sidebar-item.active",
	      "head title",
	      "[data-testid='conversation-title']",
	      "h2",
	      "h3"
	    ];

	    for (const selector of selectors) {
	      const element = document.querySelector(selector);
	      if (element) {
	        const text = element.textContent || element.innerText;
	        if (text && text.trim() && !text.toLowerCase().includes('grok')) {
	          return text.trim();
	        }
	      }
	    }

	    return document.title || "";
	  },

	  getGeminiTitle: function() {
	    // 多种方式尝试获取 Gemini 对话标题
	    const selectors = [
	      "conversations-list div.selected",
	      ".conversation-item.active",
	      "h1",
	      ".sidebar-conversation.active",
	      "head title",
	      "[data-testid='conversation-title']",
	      "h2",
	      "h3"
	    ];

	    for (const selector of selectors) {
	      const element = document.querySelector(selector);
	      if (element) {
	        const text = element.textContent || element.innerText;
	        if (text && text.trim() && !text.toLowerCase().includes('gemini')) {
	          return text.trim();
	        }
	      }
	    }

	    return document.title || "";
	  },
	  exportChatAsMarkdown: function() {
	    let markdownContent = "";
	    const { result, platform, title } = this.getConversationElements();
	    const filename = (this.sanitizeFilename(title) || "chat_export") + ".md";
	    for (let i = 0; i < result.length; i += 2) {
	      if (!result[i] || !result[i + 1])
	        break;
	      let userText = (result[i].textContent || "").trim();
	      let answerHtml = (result[i + 1].innerHTML || "").trim();
	      userText = HtmlToMarkdown.to(userText, platform);
	      answerHtml = HtmlToMarkdown.to(answerHtml, platform);
	      markdownContent += `
# Q:
${userText}
# A:
${answerHtml}`;
	    }
	    markdownContent = markdownContent.replace(/&amp;/g, "&");
	    if (markdownContent) {
	      Download.start(markdownContent, filename, "text/markdown");
	    }
	  }
	};

	var css_248z = ".chat-gpt-document-block{align-items:center;border:1px solid #e5e5e5;border-radius:35px;cursor:pointer;display:flex;font-size:15px;justify-content:center;left:50%;padding:5px 15px;position:fixed;top:9px;transform:translateX(-50%);z-index:99999999999!important}.chat-gpt-document-icon-sm{margin-right:5px}.chat-gpt-document-btn-content{align-items:center;display:flex}";

	const Export = {
	  addStyle: function() {
	    CommonUtil.addStyle(css_248z);
	  },
	  createSvgIcon: function() {
	    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	    svg.setAttribute("class", "chat-gpt-document-icon-sm chat-gpt-document-btn-content");
	    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	    svg.setAttribute("fill", "none");
	    svg.setAttribute("viewBox", "0 0 24 24");
	    svg.setAttribute("width", "16");
	    svg.setAttribute("height", "16");
	    svg.setAttribute("stroke-width", "1.5");
	    svg.setAttribute("stroke", "currentColor");
	    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	    path.setAttribute("stroke-linecap", "round");
	    path.setAttribute("stroke-linejoin", "round");
	    path.setAttribute("d", "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z");
	    svg.appendChild(path);
	    document.body.appendChild(svg);
	    return svg;
	  },
	  generateHtml: function() {
	    const outerDiv = CommonUtil.createElement("div", {
	      className: "chat-gpt-document-block",
	      childrens: [
	        this.createSvgIcon(),
	        CommonUtil.createElement("div", {
	          className: "chat-gpt-document-btn-content",
	          text: "Save As Markdown"
	        })
	      ]
	    });
	    (document.body || document.documentElement).appendChild(outerDiv);
	    outerDiv.addEventListener("click", function() {
	      Chat.exportChatAsMarkdown();
	    });
	  },
	  start: function() {
	    this.addStyle();
	    this.generateHtml();
	  }
	};

	(() => {
	  if (typeof trustedTypes !== "undefined" && trustedTypes.defaultPolicy === null) {
	    let s = (s2) => s2;
	    trustedTypes.createPolicy("default", { createHTML: s, createScriptURL: s, createScript: s });
	  }
	})();

	Export.start();

}());
