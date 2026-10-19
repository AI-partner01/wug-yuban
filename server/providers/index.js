import { callDeepSeek, callDeepSeekStream } from "./deepseek.js";
import { createFixedReply } from "./fixed.js";

const supportedProviders = new Set(["auto", "deepseek", "fixed"]);

function selectedProvider() {
  const configured = (process.env.AI_PROVIDER || "auto").toLowerCase();
  return supportedProviders.has(configured) ? configured : "auto";
}

// auto 策略：优先使用已配置的大模型 API，失败时回退固定回复。
function resolveAutoProvider() {
  return process.env.DEEPSEEK_API_KEY ? "deepseek" : "fixed";
}

function activeProvider() {
  const configured = selectedProvider();
  if (configured !== "auto") return configured;
  return resolveAutoProvider();
}

export function getProviderStatus() {
  const provider = activeProvider();
  return {
    ok: true,
    active: provider,
    label:
      provider === "deepseek"
        ? "大模型 API（DeepSeek）"
        : provider === "fixed"
          ? "固定回复（演示）"
          : "大模型 API（固定回复兜底）",
    available: {
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      fixed: true,
    },
  };
}

export async function createLanguagePartnerReply(context) {
  const provider = activeProvider();

  if (provider === "fixed") {
    return { reply: createFixedReply(context), provider: "fixed", fallback: false };
  }

  try {
    return { reply: await callDeepSeek(context), provider: "deepseek", fallback: false };
  } catch (error) {
    const warning = error instanceof Error ? error.message : "模型服务暂不可用";
    console.warn(`[provider fallback] ${warning}`);
    return {
      reply: createFixedReply(context),
      provider: "fixed",
      fallback: true,
      warning,
    };
  }
}

export function splitReplyIntoChunks(reply, targetSize = 5) {
  const characters = Array.from(reply);
  const chunks = [];
  let current = "";

  for (const character of characters) {
    current += character;
    const naturalBreak = /[\s，。！？、,.!?;；:：]/u.test(character);
    if (current.length >= targetSize && naturalBreak) {
      chunks.push(current);
      current = "";
    } else if (current.length >= targetSize * 2) {
      const endsInsideLatinWord = /[\p{Letter}\p{Number}]$/u.test(current);
      if (!endsInsideLatinWord || current.length >= targetSize * 6) {
        chunks.push(current);
        current = "";
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function* streamBufferedReply(reply) {
  for (const delta of splitReplyIntoChunks(reply)) {
    yield delta;
    await new Promise((resolve) => setTimeout(resolve, 28));
  }
}

export async function* streamLanguagePartnerReply(context, { signal } = {}) {
  const provider = activeProvider();
  let emittedText = false;

  try {
    if (provider === "fixed") {
      yield { type: "meta", provider: "fixed", fallback: false };
      for await (const delta of streamBufferedReply(createFixedReply(context))) {
        emittedText = true;
        yield { type: "delta", delta };
      }
      yield { type: "done", provider: "fixed", fallback: false };
      return;
    }

    yield { type: "meta", provider: "deepseek", fallback: false };
    for await (const delta of callDeepSeekStream(context, { signal })) {
      emittedText = true;
      yield { type: "delta", delta };
    }
    yield { type: "done", provider: "deepseek", fallback: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    const warning = error instanceof Error ? error.message : "模型服务暂不可用";
    console.warn(`[provider fallback] ${warning}`);
    yield {
      type: "meta",
      provider: "fixed",
      fallback: true,
      warning,
      reset: emittedText,
    };
    for await (const delta of streamBufferedReply(createFixedReply(context))) {
      yield { type: "delta", delta };
    }
    yield { type: "done", provider: "fixed", fallback: true, warning };
  }
}
