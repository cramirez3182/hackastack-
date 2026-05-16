/**
 * Tencent TRTC AI Conversation server
 * Run: node index.js
 * Requires: npm install express tencentcloud-sdk-nodejs-trtc dotenv
 */
require('dotenv').config()
const express = require('express')
const tencentcloud = require('tencentcloud-sdk-nodejs-trtc')
const TLSSigAPIv2 = require('tls-sig-api-v2')

const TrtcClient = tencentcloud.trtc.v20190722.Client

const SDK_APP_ID = parseInt(process.env.TRTC_SDK_APP_ID || '0', 10)
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || ''
const sigApi = new TLSSigAPIv2.Api(SDK_APP_ID, SECRET_KEY)

function genUserSig(userId) {
  return sigApi.genSig(userId, 86400 * 7) // 7-day sig
}

const client = new TrtcClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: process.env.TENCENT_REGION || 'ap-singapore',
  profile: { httpProfile: { endpoint: 'trtc.tencentcloudapi.com' } },
})

// Build chat config from env — API keys never leave this server
function buildChatConfig() {
  return {
    SdkAppId: parseInt(process.env.TRTC_SDK_APP_ID || '0', 10),
    AgentConfig: {
      UserId: process.env.TRTC_ROBOT_USER_ID || 'scu-robot',
      UserSig: genUserSig(process.env.TRTC_ROBOT_USER_ID || 'scu-robot'),
      TargetUserId: process.env.TRTC_USER_ID || '',
      WelcomeMessage: process.env.TRTC_WELCOME_MESSAGE ||
        'Hi! I\'m your SCU Course Optimizer advisor. Ask me anything about professors — who\'s the easiest, who teaches a specific course, or who students love most.',
      InterruptMode: 0,
      InterruptSpeechDuration: 300,
    },
    STTConfig: {
      Language: 'en',
      VadSilenceTime: 800,
      CustomParam: JSON.stringify({
        STTType: 'deepgram',
        Model: 'nova-2',
        ApiKey: process.env.DEEPGRAM_API_KEY || '',
      }),
    },
    LLMConfig: JSON.stringify({
      LLMType: 'openai',
      APIUrl: process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
      APIKey: process.env.LLM_API_KEY || '',
      History: 10,
      Timeout: 10,
      Model: process.env.LLM_MODEL || null,
      Streaming: true,
    }),
    TTSConfig: JSON.stringify({
      TTSType: 'elevenlabs',
      Model: process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5',
      APIKey: process.env.ELEVENLABS_API_KEY || '',
      VoiceId: process.env.ELEVENLABS_VOICE_ID || '',
    }),
  }
}

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') { res.sendStatus(204); return }
  next()
})

// Returns only the client-side config needed to join the TRTC room
app.get('/trtc-client-config', (req, res) => {
  const userId = process.env.TRTC_USER_ID || 'scu-user'
  const robotId = process.env.TRTC_ROBOT_USER_ID || 'scu-robot'
  res.json({
    sdkAppId: SDK_APP_ID,
    userId,
    userSig: genUserSig(userId),
    robotId,
  })
})

app.post('/start-conversation', (req, res) => {
  const { RoomId } = req.body
  if (!RoomId) { res.status(400).json({ error: 'RoomId required' }); return }
  const chatConfig = buildChatConfig()
  client.StartAIConversation({ ...chatConfig, RoomId: String(RoomId) }).then(
    data => res.json(data),
    err => res.status(500).json({ error: err.message })
  )
})

app.post('/stop-conversation', (req, res) => {
  const { TaskId } = req.body
  if (!TaskId) { res.status(400).json({ error: 'TaskId required' }); return }
  client.StopAIConversation({ TaskId }).then(
    data => res.json(data),
    err => res.status(500).json({ error: err.message })
  )
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`TRTC server → http://localhost:${PORT}`))
