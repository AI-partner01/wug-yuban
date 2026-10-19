const storageKey = "zisu-yuban-chat-v3";
const settingsKey = "zisu-yuban-settings-v2";
const statsKey = "zisu-yuban-stats-v1";
const isFileMode = window.location.protocol === "file:";

const elements = {
  form: document.querySelector("#chatForm"),
  input: document.querySelector("#messageInput"),
  messages: document.querySelector("#messages"),
  clear: document.querySelector("#clearChat"),
  quickPrompts: document.querySelector("#quickPrompts"),
  language: document.querySelector("#languageSelect"),
  level: document.querySelector("#levelSelect"),
  connection: document.querySelector("#connectionLabel"),
  count: document.querySelector("#messageCount"),
  progress: document.querySelector("#trackProgress"),
  modeNote: document.querySelector("#modeNote"),
  usePhrase: document.querySelector("#usePhrase"),
  phrase: document.querySelector("#dailyPhrase"),
};

// 每门语言的快捷话题、输入提示与每日一句均为「外语 + 中文」双语，
// 与 Wug 的双语回复保持一致，方便来华留学生直接套用。
const languageContent = {
  英语: {
    prompts: [
      "How was your first week in China? / 你在中国第一周过得怎么样？",
      "Let’s practice ordering food. / 我们来练练点餐吧。",
      "Can you help me ask for directions? / 能教我怎么问路吗？",
    ],
    placeholder: "用英语说点什么，Wug 会加上中文一起回复…",
    phrase: "I’m still learning, but I’d like to try. / 我还在学，但我想试试看。",
  },
  日语: {
    prompts: [
      "中国に来てから一週間、どうでしたか？/ 你在中国第一周过得怎么样？",
      "注文の練習をしましょう。/ 我们来练练点餐吧。",
      "道を聞く言葉を教えてください。/ 能教我怎么问路吗？",
    ],
    placeholder: "日本語で話してみましょう、Wug が中国語も添えます…",
    phrase: "まだ勉強中ですが、話してみたいです。/ 我还在学，但我想试试看。",
  },
  韩语: {
    prompts: [
      "중국에 온 지 일주일, 어땠어요?/ 你在中国第一周过得怎么样？",
      "주문 연습을 해볼까요?/ 我们来练练点餐吧。",
      "길 묻는 말을 가르쳐 줄래요?/ 能教我怎么问路吗？",
    ],
    placeholder: "한국어로 말해 보세요, Wug가 중국어도 함께 알려줄게요…",
    phrase: "아직 배우고 있지만 한번 해 보고 싶어요./ 我还在学，但我想试试看。",
  },
  德语: {
    prompts: [
      "Wie war deine erste Woche in China?/ 你在中国第一周过得怎么样？",
      "Üben wir mal das Bestellen./ 我们来练练点餐吧。",
      "Kannst du mir sagen, wie man nach dem Weg fragt?/ 能教我怎么问路吗？",
    ],
    placeholder: "Auf Deutsch schreiben – Wug antwortet auf Chinesisch mit…",
    phrase: "Ich lerne noch, aber ich möchte es versuchen./ 我还在学，但我想试试看。",
  },
  意大利语: {
    prompts: [
      "Com’è stata la tua prima settimana in Cina?/ 你在中国第一周过得怎么样？",
      "Esercitiamoci a ordinare da mangiare./ 我们来练练点餐吧。",
      "Puoi insegnarmi a chiedere informazioni?/ 能教我怎么问路吗？",
    ],
    placeholder: "Scrivi in italiano – Wug risponderà anche in cinese…",
    phrase: "Sto ancora imparando, ma vorrei provare./ 我还在学，但我想试试看。",
  },
  西班牙语: {
    prompts: [
      "¿Cómo fue tu primera semana en China?/ 你在中国第一周过得怎么样？",
      "Practiquemos cómo pedir comida./ 我们来练练点餐吧。",
      "¿Puedes enseñarme a preguntar por el camino?/ 能教我怎么问路吗？",
    ],
    placeholder: "Escribe en español, Wug también responderá en chino…",
    phrase: "Todavía estoy aprendiendo, pero quiero intentarlo./ 我还在学，但我想试试看。",
  },
  法语: {
    prompts: [
      "Comment s’est passée ta première semaine en Chine ?/ 你在中国第一周过得怎么样？",
      "Entraînons-nous à commander à manger./ 我们来练练点餐吧。",
      "Peux-tu m’apprendre à demander mon chemin ?/ 能教我怎么问路吗？",
    ],
    placeholder: "Écris en français, Wug répondra aussi en chinois…",
    phrase: "J’apprends encore, mais j’aimerais essayer./ 我还在学，但我想试试看。",
  },
};

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I’m Wug 👋 你好，我是 Wug。\n无论你来自哪里，都可以用你的语言开口，我会用「外语 + 中文」陪你练习、帮你适应中国校园。\nWhere are you from? / 你来自哪里？",
  createdAt: Date.now(),
};

const storedChat = loadJson(storageKey, null);
const validStoredMessages = Array.isArray(storedChat)
  ? storedChat.filter(
    (message) =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim(),
  )
  : [];
let chat = (validStoredMessages.length ? validStoredMessages : [welcomeMessage]).map((message) => ({
  role: message.role,
  content: (
    message.role === "assistant"
      ? message.content.replaceAll("卡皮巴拉", "Wug").replaceAll("我是Wug", "我是 Wug")
      : message.content
  ).slice(0, 4000),
  createdAt: Number.isFinite(Number(message.createdAt)) ? Number(message.createdAt) : Date.now(),
  provider: typeof message.provider === "string" ? message.provider : undefined,
  fallback: Boolean(message.fallback),
  id: createMessageId(),
  streaming: false,
}));
const storedSettings = loadJson(settingsKey, {});
const allowedLevels = new Set([...elements.level.options].map((option) => option.value));
let settings = {
  language: Object.hasOwn(languageContent, storedSettings?.language) ? storedSettings.language : "英语",
  level: allowedLevels.has(storedSettings?.level) ? storedSettings.level : "日常交流",
};
const today = localDateKey();
const historyCountToday = chat.filter(
  (message) => message.role === "user" && localDateKey(message.createdAt) === today,
).length;
const storedStats = loadJson(statsKey, null);
let stats = storedStats?.date === today
  ? { date: today, count: Math.max(Number(storedStats.count) || 0, historyCountToday) }
  : { date: today, count: historyCountToday };
let isSending = false;

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localDateKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

function messageMarkup(message) {
  const isUser = message.role === "user";
  const modeNote = message.fallback
    ? '<span class="fallback-note" title="模型调用失败，本条由基础回复生成">基础回复</span>'
    : message.provider === "demo"
      ? '<span class="fallback-note">离线演示</span>'
      : "";
  const waitingMarkup = '<span class="stream-wait" aria-label="Wug 正在思考"><i></i><i></i><i></i></span>';
  return `
    <div class="message-row ${isUser ? "user" : "assistant"}${message.streaming ? " streaming" : ""}" data-message-id="${message.id}">
      ${isUser ? "" : '<div class="message-avatar"><img src="./assets/wug-logo.png" alt="" /></div>'}
      <div class="message-content">
        <div class="message-bubble">${message.streaming && !message.content ? waitingMarkup : escapeHtml(message.content)}</div>
        <div class="message-meta">${formatTime(message.createdAt || Date.now())}${isUser ? "" : modeNote}</div>
      </div>
    </div>`;
}

function renderMessages() {
  elements.messages.innerHTML = chat.map(messageMarkup).join("");
  elements.count.textContent = stats.count;
  elements.progress.style.width = `${Math.min(stats.count / 5, 1) * 100}%`;
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function renderLanguageContent() {
  const content = languageContent[settings.language] || languageContent.英语;
  elements.quickPrompts.innerHTML = content.prompts
    .map((prompt) => `<button type="button">${escapeHtml(prompt)}</button>`)
    .join("");
  elements.input.placeholder = content.placeholder;
  elements.phrase.textContent = `“${content.phrase}”`;
}

function updateMessageElement(message) {
  const row = elements.messages.querySelector(`[data-message-id="${message.id}"]`);
  if (!row) return;
  const distanceFromBottom = elements.messages.scrollHeight - elements.messages.scrollTop - elements.messages.clientHeight;
  const bubble = row.querySelector(".message-bubble");
  const meta = row.querySelector(".message-meta");
  row.classList.toggle("streaming", Boolean(message.streaming));
  if (message.content) {
    bubble.textContent = message.content;
  } else if (message.streaming) {
    bubble.innerHTML = '<span class="stream-wait" aria-label="Wug 正在思考"><i></i><i></i><i></i></span>';
  }
  const modeNote = message.fallback
    ? '<span class="fallback-note" title="模型调用失败，本条由基础回复生成">基础回复</span>'
    : message.provider === "demo"
      ? '<span class="fallback-note">离线演示</span>'
      : "";
  meta.innerHTML = `${formatTime(message.createdAt || Date.now())}${modeNote}`;
  if (distanceFromBottom < 120) elements.messages.scrollTop = elements.messages.scrollHeight;
}

function saveChat() {
  const completedMessages = chat.filter((message) => message.content?.trim());
  saveJson(storageKey, completedMessages.slice(-40));
}

function saveStats() {
  saveJson(statsKey, stats);
}

function incrementStats() {
  const currentDate = localDateKey();
  if (stats.date !== currentDate) stats = { date: currentDate, count: 0 };
  stats.count += 1;
  saveStats();
}

function friendlyErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/failed to fetch|networkerror|load failed/i.test(message)) return "网络连接失败";
  return message || "服务暂时不可用";
}

function updateSettings() {
  settings = { language: elements.language.value, level: elements.level.value };
  saveJson(settingsKey, settings);
  renderLanguageContent();
}

function autoResize() {
  elements.input.style.height = "auto";
  elements.input.style.height = `${Math.min(elements.input.scrollHeight, 110)}px`;
}

// 离线演示模式：与服务端 fixed 兜底同一套逻辑——命中预设问答给对应双语回复，其余统一默认回复。
function localDemoReply(message) {
  const lang = settings.language;
  const text = message.toLowerCase();
  const presetReplies = {
    英语: {
      presets: [
        { re: /^(hi|hello|hey|你好|嗨|哈喽)/i, reply: "Hi! I'm Wug 👋 / 你好，我是 Wug。Nice to meet you! / 很高兴认识你！Where are you from? / 你来自哪里？" },
        { re: /first week|一周/i, reply: "Glad you're here! / 很高兴你来了！A useful line: “Everything is new to me.” / 你可以说：“一切对我来说都很新鲜。” What surprised you most this week? / 这周什么最让你惊讶？" },
        { re: /order|点餐|点菜/i, reply: "Sure, let's order in a restaurant! / 好，我们来餐厅点餐！Say: “I'd like this one, please.” / 你可以说：“我要这个，谢谢。” What would you like to order? / 你想点什么？" },
        { re: /direction|way to/i, reply: "Remember this line: “Excuse me, how do I get to the metro station?” / 记住这句：“请问，地铁站怎么走？” Now try asking me the way! / 现在试着问我路吧！" },
        { re: /weather|天气/i, reply: "演示模式查不了实时天气。/ I can't check live weather in demo mode. You can ask a friend: “What's the weather like today?” / 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Sorry, I'm in demo mode and only answer preset practice topics. 试试下面的快捷话题，或输入“你好”开始吧！/ Try a quick topic below, or just say hi!",
    },
    日语: {
      presets: [
        { re: /^(hi|hello|こんにちは|你好|嗨)/i, reply: "こんにちは、Wug です 👋 / 你好，我是 Wug。はじめまして！/ 初次见面！どこの国から来ましたか？/ 你来自哪里？" },
        { re: /一週間|一周/i, reply: "ようこそ！/ 欢迎！「すべてが新鮮です」と言えます。/ 你可以说：“一切都很新鲜。”今週いちばん驚いたことは何ですか？/ 这周最让你惊讶的是什么？" },
        { re: /注文|メニュー|食べ/i, reply: "いいですね、レストランで練習しましょう！/ 好，我们来餐厅练练！「これをください」と言えます。/ 你可以说：“我要这个。”何を注文しますか？/ 你想点什么？" },
        { re: /道を聞|行き方|駅/i, reply: "「すみません、駅はどう行きますか？」と覚えましょう。/ 记住这句：“请问，车站怎么走？”では、私に道を聞いてみて！/ 现在试着问我路吧！" },
        { re: /weather|天气|天気|気温/i, reply: "デモモードではリアルタイムの天気は分かりません。/ 演示模式查不了实时天气。友達に「今日の天気はどうですか？」と聞いてみましょう。/ 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ すみません、デモモードなので用意された話題しか答えられません。下のクイックトピックを試してみてね！",
    },
    韩语: {
      presets: [
        { re: /^(hi|hello|안녕|你好|嗨)/i, reply: "안녕하세요, Wug예요 👋 / 你好，我是 Wug。만나서 반가워요！/ 很高兴认识你！어느 나라에서 왔어요?/ 你来自哪里？" },
        { re: /일주일|一周/i, reply: "환영해요！/ 欢迎！“모든 게 새로워요”라고 말할 수 있어요。/ 你可以说：“一切都很新鲜。”이번 주에 가장 놀라운 건 뭐였어요?/ 这周最让你惊讶的是什么？" },
        { re: /주문|음식|메뉴/i, reply: "좋아요, 식당에서 연습해요！/ 好，我们来餐厅练练！“이거 주세요”라고 하면 돼요。/ 你可以说：“我要这个。”뭐 주문할 거예요?/ 你想点什么？" },
        { re: /길|어떻게 가|역/i, reply: "“저기요, 지하철역 어떻게 가요?”를 기억하세요。/ 记住这句：“请问，地铁站怎么走？”이제 저한테 길을 물어봐요！/ 现在试着问我路吧！" },
        { re: /weather|天气|날씨|기온/i, reply: "데모 모드에서는 실시간 날씨를 확인할 수 없어요。/ 演示模式查不了实时天气。친구에게 “오늘 날씨 어때요?”라고 물어보세요。/ 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ 죄송해요, 데모 모드라서 준비된 주제만 대답할 수 있어요。아래의 빠른 주제를 시도해 보세요！",
    },
    德语: {
      presets: [
        { re: /^(hi|hello|hallo|你好|嗨)/i, reply: "Hallo, ich bin Wug 👋 / 你好，我是 Wug。Schön, dich kennenzulernen! / 很高兴认识你！Woher kommst du? / 你来自哪里？" },
        { re: /erste woche|一周/i, reply: "Willkommen! / 欢迎！Du kannst sagen: „Alles ist neu für mich.“ / 你可以说：“一切对我来说都很新鲜。”Was hat dich diese Woche am meisten überrascht? / 这周什么最让你惊讶？" },
        { re: /bestell|essen|点餐/i, reply: "Gern, wir bestellen im Restaurant! / 好，我们来餐厅点餐！Sag: „Das hier, bitte.“ / 你可以说：“我要这个，谢谢。”Was möchtest du bestellen? / 你想点什么？" },
        { re: /weg|wie komme|bahnhof|station/i, reply: "Merke dir: „Entschuldigung, wie komme ich zur Metrostation?“ / 记住这句：“请问，地铁站怎么走？”Jetzt frag mich mal den Weg! / 现在试着问我路吧！" },
        { re: /weather|天气|wetter/i, reply: "Im Demo-Modus kann ich kein Live-Wetter abrufen. / 演示模式查不了实时天气。Frag einen Freund: „Wie ist das Wetter heute?“ / 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Entschuldigung, ich bin im Demo-Modus und beantworte nur vorbereitete Themen. Probier die Schnellthemen unten!",
    },
    意大利语: {
      presets: [
        { re: /^(hi|hello|ciao|你好|嗨)/i, reply: "Ciao, sono Wug 👋 / 你好，我是 Wug。Piacere di conoscerti! / 很高兴认识你！Di dove sei? / 你来自哪里？" },
        { re: /prima settimana|一周/i, reply: "Benvenuto! / 欢迎！Puoi dire: „Tutto è nuovo per me.“ / 你可以说：“一切对我来说都很新鲜。”Cos'è che ti ha sorpreso di più questa settimana? / 这周什么最让你惊讶？" },
        { re: /ordin|menù|mangiare|点餐/i, reply: "Volentieri, ordiniamo al ristorante! / 好，我们来餐厅点餐！Di': „Vorrei questo, per favore.“ / 你可以说：“我要这个，谢谢。”Cosa vorresti ordinare? / 你想点什么？" },
        { re: /informazioni|strada|stazione|come arrivo/i, reply: "Ricorda: „Mi scusi, come arrivo alla stazione della metro?“ / 记住这句：“请问，地铁站怎么走？”Ora prova a chiedermi la strada! / 现在试着问我路吧！" },
        { re: /weather|天气|meteo/i, reply: "In modalità demo non vedo il meteo in tempo reale. / 演示模式查不了实时天气。Chiedi a un amico: „Com'è il tempo oggi?“ / 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Scusa, sono in modalità demo e rispondo solo agli argomenti preparati. Prova i suggerimenti qui sotto!",
    },
    西班牙语: {
      presets: [
        { re: /^(hi|hello|hola|你好|嗨)/i, reply: "¡Hola, soy Wug! 👋 / 你好，我是 Wug。¡Encantado de conocerte! / 很高兴认识你！¿De dónde eres? / 你来自哪里？" },
        { re: /primera semana|一周/i, reply: "¡Bienvenido! / 欢迎！Puedes decir: „Todo es nuevo para mí.“ / 你可以说：“一切对我来说都很新鲜。”¿Qué te sorprendió más esta semana? / 这周什么最让你惊讶？" },
        { re: /pedir|comida|ordenar|点餐/i, reply: "¡Claro, pidamos en un restaurante! / 好，我们来餐厅点餐！Di: „Quiero esto, por favor.“ / 你可以说：“我要这个，谢谢。”¿Qué vas a pedir? / 你想点什么？" },
        { re: /camino|estación|cómo llego|preguntar/i, reply: "Recuerda: „Disculpe, ¿cómo llego a la estación de metro?“ / 记住这句：“请问，地铁站怎么走？”¡Ahora pregúntame el camino! / 现在试着问我路吧！" },
        { re: /weather|天气|clima/i, reply: "En modo demo no puedo ver el clima en tiempo real. / 演示模式查不了实时天气。Pregunta a un amigo: „¿Qué tiempo hace hoy?“ / 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Perdón, estoy en modo demo y solo respondo a los temas preparados. ¡Prueba los temas rápidos de abajo!",
    },
    法语: {
      presets: [
        { re: /^(hi|hello|bonjour|salut|你好|嗨)/i, reply: "Bonjour, je suis Wug 👋 / 你好，我是 Wug。Enchanté de te rencontrer ! / 很高兴认识你！Tu viens d'où ? / 你来自哪里？" },
        { re: /première semaine|一周/i, reply: "Bienvenue ! / 欢迎！Tu peux dire : „Tout est nouveau pour moi.“ / 你可以说：“一切对我来说都很新鲜。”Qu'est-ce qui t'a le plus surpris cette semaine ? / 这周什么最让你惊讶？" },
        { re: /command|plat|manger|点餐/i, reply: "Avec plaisir, commandons au restaurant ! / 好，我们来餐厅点餐！Dis : „Je voudrais ceci, s'il vous plaît.“ / 你可以说：“我要这个，谢谢。”Que veux-tu commander ? / 你想点什么？" },
        { re: /chemin|station|métro|comment aller/i, reply: "Retiens : „Excusez-moi, comment aller à la station de métro ?“ / 记住这句：“请问，地铁站怎么走？”Maintenant, demande-moi ton chemin ! / 现在试着问我路吧！" },
        { re: /weather|天气|temps|météo/i, reply: "En mode démo je ne vois pas la météo en direct. / 演示模式查不了实时天气。Demande à un ami : „Quel temps fait-il aujourd'hui ?“ / 你可以问朋友：“今天天气怎么样？”" },
      ],
      default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Désolé, je suis en mode démo et je ne réponds qu'aux sujets préparés. Essaie les sujets rapides ci-dessous !",
    },
  };
  const { presets, default: defaultReply } = presetReplies[lang] || presetReplies.英语;
  const hit = presets.find(({ re }) => re.test(message) || re.test(text));
  return hit ? hit.reply : defaultReply;
}

async function requestReply(onEvent) {
  if (isFileMode) {
    const latestUserMessage = [...chat].reverse().find((message) => message.role === "user")?.content || "";
    const reply = localDemoReply(latestUserMessage);
    onEvent({ type: "meta", provider: "demo", fallback: false });
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    for (let index = 0; index < reply.length; index += 8) {
      onEvent({ type: "delta", delta: reply.slice(index, index + 8) });
      await new Promise((resolve) => window.setTimeout(resolve, 22));
    }
    return { reply, provider: "demo", fallback: false };
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: chat.map(({ role, content }) => ({ role, content })),
      language: settings.language,
      level: settings.level,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "发送失败");
  }

  if (!response.headers.get("content-type")?.includes("application/x-ndjson")) {
    const payload = await response.json();
    onEvent({ type: "meta", provider: payload.provider, fallback: payload.fallback });
    onEvent({ type: "delta", delta: payload.reply });
    return payload;
  }

  if (!response.body) throw new Error("浏览器无法读取流式响应");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const result = { reply: "", provider: "", fallback: false };
  let buffer = "";

  const processLine = (line) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === "error") throw new Error(event.error || "流式响应中断");
    if (event.type === "meta") {
      result.provider = event.provider || result.provider;
      result.fallback = Boolean(event.fallback);
      result.warning = event.warning;
      if (event.reset) result.reply = "";
    } else if (event.type === "delta") {
      result.reply += event.delta || "";
    } else if (event.type === "done") {
      result.provider = event.provider || result.provider;
      result.fallback = Boolean(event.fallback);
      result.warning = event.warning || result.warning;
    }
    onEvent(event);
  };

  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = done ? "" : lines.pop() || "";
    lines.forEach(processLine);
    if (done) break;
  }

  if (buffer.trim()) processLine(buffer);
  if (!result.reply) throw new Error("模型没有返回有效内容");
  return result;
}

async function sendMessage(text) {
  const content = text.trim();
  if (!content || isSending) return;

  isSending = true;
  const submitButton = elements.form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  chat.push({ id: createMessageId(), role: "user", content, createdAt: Date.now() });
  incrementStats();
  const assistantMessage = {
    id: createMessageId(),
    role: "assistant",
    content: "",
    streaming: true,
    createdAt: Date.now(),
  };
  chat.push(assistantMessage);
  saveChat();
  renderMessages();
  elements.input.value = "";
  autoResize();
  elements.messages.setAttribute("aria-busy", "true");

  try {
    const result = await requestReply((event) => {
      if (event.type === "meta") {
        assistantMessage.provider = event.provider;
        assistantMessage.fallback = Boolean(event.fallback);
        if (event.reset) assistantMessage.content = "";
      } else if (event.type === "delta") {
        assistantMessage.content += event.delta || "";
      }
      updateMessageElement(assistantMessage);
    });
    if (!assistantMessage.content) assistantMessage.content = result.reply;
    assistantMessage.provider = result.provider;
    assistantMessage.fallback = Boolean(result.fallback);
  } catch (error) {
    assistantMessage.content = assistantMessage.content
      ? `${assistantMessage.content}\n\n（连接中断，你可以重新发送一次。）`
      : `刚才连接中断了：${friendlyErrorMessage(error)}。你可以再发一次试试。`;
  } finally {
    assistantMessage.streaming = false;
    elements.messages.setAttribute("aria-busy", "false");
    isSending = false;
    submitButton.disabled = false;
    saveChat();
    updateMessageElement(assistantMessage);
    elements.input.focus();
  }
}

async function loadStatus() {
  if (isFileMode) {
    elements.connection.textContent = "离线演示模式";
    elements.modeNote.classList.add("demo");
    elements.modeNote.innerHTML = "<span></span><p><strong>离线演示</strong><br />启动服务后自动启用双语智能对话</p>";
    return;
  }
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("offline");
    elements.connection.textContent = "智能语伴在线";
  } catch {
    elements.connection.textContent = "连接暂不可用";
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(elements.input.value);
});

elements.input.addEventListener("input", autoResize);
elements.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    elements.form.requestSubmit();
  }
});

elements.quickPrompts.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) sendMessage(button.textContent);
});

elements.clear.addEventListener("click", () => {
  if (!window.confirm("确定清空当前浏览器里的聊天记录吗？")) return;
  chat = [{ ...welcomeMessage, id: createMessageId(), createdAt: Date.now() }];
  saveChat();
  renderMessages();
});

elements.usePhrase.addEventListener("click", () => {
  const content = languageContent[settings.language] || languageContent.英语;
  elements.input.value = content.phrase;
  autoResize();
  elements.input.focus();
});

[elements.language, elements.level].forEach((select) => select.addEventListener("change", updateSettings));

elements.language.value = settings.language;
elements.level.value = settings.level;
updateSettings();
saveStats();
saveChat();
renderMessages();
loadStatus();
