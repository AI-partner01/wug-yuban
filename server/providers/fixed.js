// 预设问答 + 统一默认回复（演示兜底）。
// 未接入大模型时：命中预设问题（快捷话题、打招呼、天气等）给对应双语回复，
// 其余任何输入统一走 default 默认回复，避免"已读乱答"。
const presetReplies = {
  英语: {
    presets: [
      {
        re: /^(hi|hello|hey|hiya|你好|嗨|哈喽)/i,
        reply: "Hi! I'm Wug 👋 / 你好，我是 Wug。Nice to meet you! / 很高兴认识你！Where are you from? / 你来自哪里？",
      },
      {
        re: /first week|一周/i,
        reply: "Glad you're here! / 很高兴你来了！A useful line: “Everything is new to me.” / 你可以说：“一切对我来说都很新鲜。” What surprised you most this week? / 这周什么最让你惊讶？",
      },
      {
        re: /order|点餐|点菜/i,
        reply: "Sure, let's order in a restaurant! / 好，我们来餐厅点餐！Say: “I'd like this one, please.” / 你可以说：“我要这个，谢谢。” What would you like to order? / 你想点什么？",
      },
      {
        re: /direction|way to/i,
        reply: "Remember this line: “Excuse me, how do I get to the metro station?” / 记住这句：“请问，地铁站怎么走？” Now try asking me the way! / 现在试着问我路吧！",
      },
      {
        re: /weather|天气/i,
        reply: "演示模式查不了实时天气。/ I can't check live weather in demo mode. You can ask a friend: “What's the weather like today?” / 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Sorry, I'm in demo mode and only answer preset practice topics. 试试下面的快捷话题，或输入“你好”开始吧！/ Try a quick topic below, or just say hi!",
  },
  日语: {
    presets: [
      {
        re: /^(hi|hello|hey|こんにちは|こんばんは|おはよう|你好|嗨|哈喽)/i,
        reply: "こんにちは、Wug です 👋 / 你好，我是 Wug。はじめまして！/ 初次见面！どこの国から来ましたか？/ 你来自哪里？",
      },
      {
        re: /一週間|一周/i,
        reply: "ようこそ！/ 欢迎！「すべてが新鮮です」と言えます。/ 你可以说：“一切都很新鲜。”今週いちばん驚いたことは何ですか？/ 这周最让你惊讶的是什么？",
      },
      {
        re: /注文|メニュー|食べ/i,
        reply: "いいですね、レストランで練習しましょう！/ 好，我们来餐厅练练！「これをください」と言えます。/ 你可以说：“我要这个。”何を注文しますか？/ 你想点什么？",
      },
      {
        re: /道を聞|行き方|駅/i,
        reply: "「すみません、駅はどう行きますか？」と覚えましょう。/ 记住这句：“请问，车站怎么走？”では、私に道を聞いてみて！/ 现在试着问我路吧！",
      },
      {
        re: /weather|天气|天気|気温/i,
        reply: "デモモードではリアルタイムの天気は分かりません。/ 演示模式查不了实时天气。友達に「今日の天気はどうですか？」と聞いてみましょう。/ 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ すみません、デモモードなので用意された話題しか答えられません。下のクイックトピックを試してみてね！",
  },
  韩语: {
    presets: [
      {
        re: /^(hi|hello|hey|안녕|你好|嗨|哈喽)/i,
        reply: "안녕하세요, Wug예요 👋 / 你好，我是 Wug。만나서 반가워요！/ 很高兴认识你！어느 나라에서 왔어요?/ 你来自哪里？",
      },
      {
        re: /일주일|一周/i,
        reply: "환영해요！/ 欢迎！“모든 게 새로워요”라고 말할 수 있어요。/ 你可以说：“一切都很新鲜。”이번 주에 가장 놀라운 건 뭐였어요?/ 这周最让你惊讶的是什么？",
      },
      {
        re: /주문|음식|메뉴/i,
        reply: "좋아요, 식당에서 연습해요！/ 好，我们来餐厅练练！“이거 주세요”라고 하면 돼요。/ 你可以说：“我要这个。”뭐 주문할 거예요?/ 你想点什么？",
      },
      {
        re: /길|어떻게 가|역/i,
        reply: "“저기요, 지하철역 어떻게 가요?”를 기억하세요。/ 记住这句：“请问，地铁站怎么走？”이제 저한테 길을 물어봐요！/ 现在试着问我路吧！",
      },
      {
        re: /weather|天气|날씨|기온/i,
        reply: "데모 모드에서는 실시간 날씨를 확인할 수 없어요。/ 演示模式查不了实时天气。친구에게 “오늘 날씨 어때요?”라고 물어보세요。/ 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ 죄송해요, 데모 모드라서 준비된 주제만 대답할 수 있어요。아래의 빠른 주제를 시도해 보세요！",
  },
  德语: {
    presets: [
      {
        re: /^(hi|hello|hey|hallo|guten tag|你好|嗨|哈喽)/i,
        reply: "Hallo, ich bin Wug 👋 / 你好，我是 Wug。Schön, dich kennenzulernen! / 很高兴认识你！Woher kommst du? / 你来自哪里？",
      },
      {
        re: /erste woche|一周/i,
        reply: "Willkommen! / 欢迎！Du kannst sagen: „Alles ist neu für mich.“ / 你可以说：“一切对我来说都很新鲜。”Was hat dich diese Woche am meisten überrascht? / 这周什么最让你惊讶？",
      },
      {
        re: /bestell|essen|speise|点餐/i,
        reply: "Gern, wir bestellen im Restaurant! / 好，我们来餐厅点餐！Sag: „Das hier, bitte.“ / 你可以说：“我要这个，谢谢。”Was möchtest du bestellen? / 你想点什么？",
      },
      {
        re: /weg|wie komme|bahnhof|station/i,
        reply: "Merke dir: „Entschuldigung, wie komme ich zur Metrostation?“ / 记住这句：“请问，地铁站怎么走？”Jetzt frag mich mal den Weg! / 现在试着问我路吧！",
      },
      {
        re: /weather|天气|wetter/i,
        reply: "Im Demo-Modus kann ich kein Live-Wetter abrufen. / 演示模式查不了实时天气。Frag einen Freund: „Wie ist das Wetter heute?“ / 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Entschuldigung, ich bin im Demo-Modus und beantworte nur vorbereitete Themen. Probier die Schnellthemen unten!",
  },
  意大利语: {
    presets: [
      {
        re: /^(hi|hello|hey|ciao|buongiorno|你好|嗨|哈喽)/i,
        reply: "Ciao, sono Wug 👋 / 你好，我是 Wug。Piacere di conoscerti! / 很高兴认识你！Di dove sei? / 你来自哪里？",
      },
      {
        re: /prima settimana|一周/i,
        reply: "Benvenuto! / 欢迎！Puoi dire: „Tutto è nuovo per me.“ / 你可以说：“一切对我来说都很新鲜。”Cos'è che ti ha sorpreso di più questa settimana? / 这周什么最让你惊讶？",
      },
      {
        re: /ordin|menù|mangiare|点餐/i,
        reply: "Volentieri, ordiniamo al ristorante! / 好，我们来餐厅点餐！Di': „Vorrei questo, per favore.“ / 你可以说：“我要这个，谢谢。”Cosa vorresti ordinare? / 你想点什么？",
      },
      {
        re: /informazioni|strada|stazione|come arrivo/i,
        reply: "Ricorda: „Mi scusi, come arrivo alla stazione della metro?“ / 记住这句：“请问，地铁站怎么走？”Ora prova a chiedermi la strada! / 现在试着问我路吧！",
      },
      {
        re: /weather|天气|meteo/i,
        reply: "In modalità demo non vedo il meteo in tempo reale. / 演示模式查不了实时天气。Chiedi a un amico: „Com'è il tempo oggi?“ / 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Scusa, sono in modalità demo e rispondo solo agli argomenti preparati. Prova i suggerimenti qui sotto!",
  },
  西班牙语: {
    presets: [
      {
        re: /^(hi|hello|hey|hola|buenos días|你好|嗨|哈喽)/i,
        reply: "¡Hola, soy Wug! 👋 / 你好，我是 Wug。¡Encantado de conocerte! / 很高兴认识你！¿De dónde eres? / 你来自哪里？",
      },
      {
        re: /primera semana|一周/i,
        reply: "¡Bienvenido! / 欢迎！Puedes decir: „Todo es nuevo para mí.“ / 你可以说：“一切对我来说都很新鲜。”¿Qué te sorprendió más esta semana? / 这周什么最让你惊讶？",
      },
      {
        re: /pedir|comida|ordenar|menú|点餐/i,
        reply: "¡Claro, pidamos en un restaurante! / 好，我们来餐厅点餐！Di: „Quiero esto, por favor.“ / 你可以说：“我要这个，谢谢。”¿Qué vas a pedir? / 你想点什么？",
      },
      {
        re: /camino|estación|cómo llego|preguntar/i,
        reply: "Recuerda: „Disculpe, ¿cómo llego a la estación de metro?“ / 记住这句：“请问，地铁站怎么走？”¡Ahora pregúntame el camino! / 现在试着问我路吧！",
      },
      {
        re: /weather|天气|clima/i,
        reply: "En modo demo no puedo ver el clima en tiempo real. / 演示模式查不了实时天气。Pregunta a un amigo: „¿Qué tiempo hace hoy?“ / 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Perdón, estoy en modo demo y solo respondo a los temas preparados. ¡Prueba los temas rápidos de abajo!",
  },
  法语: {
    presets: [
      {
        re: /^(hi|hello|hey|bonjour|salut|你好|嗨|哈喽)/i,
        reply: "Bonjour, je suis Wug 👋 / 你好，我是 Wug。Enchanté de te rencontrer ! / 很高兴认识你！Tu viens d'où ? / 你来自哪里？",
      },
      {
        re: /première semaine|一周/i,
        reply: "Bienvenue ! / 欢迎！Tu peux dire : „Tout est nouveau pour moi.“ / 你可以说：“一切对我来说都很新鲜。”Qu'est-ce qui t'a le plus surpris cette semaine ? / 这周什么最让你惊讶？",
      },
      {
        re: /command|plat|manger|点餐/i,
        reply: "Avec plaisir, commandons au restaurant ! / 好，我们来餐厅点餐！Dis : „Je voudrais ceci, s'il vous plaît.“ / 你可以说：“我要这个，谢谢。”Que veux-tu commander ? / 你想点什么？",
      },
      {
        re: /chemin|station|métro|comment aller/i,
        reply: "Retiens : „Excusez-moi, comment aller à la station de métro ?“ / 记住这句：“请问，地铁站怎么走？”Maintenant, demande-moi ton chemin ! / 现在试着问我路吧！",
      },
      {
        re: /weather|天气|temps|météo/i,
        reply: "En mode démo je ne vois pas la météo en direct. / 演示模式查不了实时天气。Demande à un ami : „Quel temps fait-il aujourd'hui ?“ / 你可以问朋友：“今天天气怎么样？”",
      },
    ],
    default: "抱歉，我现在是演示模式，只会回答预设的练习话题。/ Désolé, je suis en mode démo et je ne réponds qu'aux sujets préparés. Essaie les sujets rapides ci-dessous !",
  },
};

export function createFixedReply({ messages, language }) {
  const message = messages.at(-1)?.content?.trim() || "";
  const { presets, default: defaultReply } = presetReplies[language] || presetReplies.英语;
  const hit = presets.find(({ re }) => re.test(message));
  return hit ? hit.reply : defaultReply;
}
