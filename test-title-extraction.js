// 测试标题提取功能的脚本
// 可以手动运行来测试不同平台的标题获取

// 模拟 Chat 对象的方法
const Chat = {
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

  getConversationElements: function() {
    const currentUrl = window.location.href;
    const result = [];
    let platform = "";
    let title = "";

    if (currentUrl.includes("openai.com") || currentUrl.includes("chatgpt.com")) {
      platform = "chatGPT";
      title = this.getChatGPTTitle() || "";
      result.push(...document.querySelectorAll("div[data-message-id]"));
    } else if (currentUrl.includes("grok.com")) {
      platform = "grok";
      title = this.getGrokTitle() || "";
      result.push(...document.querySelectorAll("div.message-bubble"));
    } else if (currentUrl.includes("gemini.google.com")) {
      platform = "gemini";
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
  }
};

// 测试函数
function testTitleExtraction() {
  console.log("当前URL:", window.location.href);
  const { platform, title } = Chat.getConversationElements();
  console.log("检测到平台:", platform);
  console.log("获取的标题:", title);
  console.log("页面标题:", document.title);

  // 测试各个平台的标题获取
  if (platform === "chatGPT") {
    console.log("ChatGPT 标题:", Chat.getChatGPTTitle());
  } else if (platform === "grok") {
    console.log("Grok 标题:", Chat.getGrokTitle());
  } else if (platform === "gemini") {
    console.log("Gemini 标题:", Chat.getGeminiTitle());
  }
}

// 在控制台运行测试：testTitleExtraction()
console.log("标题提取测试脚本已加载，请在控制台运行 testTitleExtraction() 来测试");
