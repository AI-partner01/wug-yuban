# Wug · 来华留学生双语语伴

浙江外国语学院校园智能语伴首版。面向**来华留学生**：他们用母语之外的小语种（英语、日语、韩语、德语、意大利语、西班牙语、法语等）输入，**Wug 始终用「外语 + 中文」双语回复**，既练语言也帮他们适应中国校园与生活。

当前实现了网页流式聊天、聊天记录本地保存、可切换的大模型 API 适配层，以及双语固定回复兜底。

## 启动

要求 Node.js 20+。

```bash
cp .env.example .env
npm start
```

打开 <http://127.0.0.1:3000>。

也可以直接双击 `public/index.html` 预览界面；此时自动进入离线演示模式，使用浏览器内置双语固定回复。需要真实模型对话时请按上面的方式启动服务。

默认 `AI_PROVIDER=auto`：若已配置 `DEEPSEEK_API_KEY` 则调用大模型，失败或缺失时自动切换为双语固定回复。

## 双语对话机制

- 用户输入为小语种（可夹杂中文），Wug 回复**先外语、后中文**，两段对应同一意思。
- 系统提示词（`server/providers/prompt.js`）要求模型：检测学生消息语言，用该语言自然表达，并附中文对应表达或说明；每次只温和纠正 1–2 处，结合中国校园/城市生活实用场景。
- 前端界面文案、快捷话题、每日一句、离线演示回复均为双语，与模型输出保持一致。

## 对话引擎切换

### 大模型 API（当前方案，DeepSeek 占位，可替换）

```dotenv
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash
```

服务端通过 OpenAI 兼容的 Chat Completions 接口调用，使用 SSE token 流实时转发到网页。后续接入其它大模型 API 时，只需在 `server/providers/deepseek.js` 调整请求字段或在 `.env` 切换 `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL`，前端无需改动。

> 历史方案中的 Codex CLI 本地客户端已移除（本机不再安装）。如需新模型，请走大模型 API。

### 固定双语回复（纯演示）

```dotenv
AI_PROVIDER=fixed
```

未配置 API 时，服务端按所选语言返回「外语 + 中文」双语固定回复，保证界面始终可演示。

## 验证

```bash
npm test
```

健康检查：<http://127.0.0.1:3000/api/health>

## 当前首版范围

- 可发送消息并显示完整聊天记录
- 流式气泡更新、生成光标、自动滚动与中断提示
- 浏览器本地保存最近 40 条消息
- 多语言切换（含意大利语）、双语快捷话题、练习语言与难度选择
- 大模型 API 适配层（DeepSeek 占位，可替换为任意大模型）
- 按语言分组的双语固定回复兜底
- 基于 Wug 原型图整理的透明语伴 Logo
- 浙外中英文校名、简称 ZISU 和校训展示

语音输入、登录、服务端会话存储及真实校园数据接入不在本阶段范围内。
