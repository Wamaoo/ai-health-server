require('dotenv').config()
const express = require('express')
const history = require('connect-history-api-fallback')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const PORT = process.env.PORT || 8088
const DATA_FILE = path.join(__dirname, 'data.json')

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// multer 配置：文件保存到 uploads 目录
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `article_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`)
  }
})
const upload = multer({ storage })

// ==================== 模拟数据 ====================
let articles = [
  {
    id: 1,
    title: '如何应对日常焦虑？5个实用技巧',
    content: '<p>焦虑是每个人都可能经历的情绪反应。以下5个技巧可以帮助你缓解焦虑：</p><h2>1. 深呼吸练习</h2><p>当你感到焦虑时，尝试做5次深呼吸，吸气4秒，呼气6秒。</p><h2>2. 正念冥想</h2><p>每天花10分钟进行正念练习，专注于当下的感受。</p><h2>3. 规律运动</h2><p>运动可以释放内啡肽，帮助改善情绪。</p><h2>4. 写情绪日记</h2><p>把你的担忧写下来，有助于理清思路。</p><h2>5. 寻求支持</h2><p>不要独自承受，和朋友或专业人士聊聊。</p>',
    coverImage: null,
    categoryId: 1,
    categoryName: '情绪管理',
    summary: '焦虑是现代人的常见问题，本文分享5个实用的应对技巧，帮助你在焦虑时刻找到平静。',
    tags: '焦虑,情绪管理,减压',
    authorName: '心理AI助手',
    readCount: 1234,
    status: 1,
    createdAt: '2026-05-20 10:00:00',
    updatedAt: '2026-05-20 10:00:00'
  },
  {
    id: 2,
    title: '改善睡眠质量的7个科学方法',
    content: '<p>良好的睡眠对心理健康至关重要。以下科学方法可以帮助你改善睡眠：</p><h2>1. 固定作息时间</h2><p>每天在同一时间睡觉和起床，包括周末。</p><h2>2. 睡前1小时远离屏幕</h2><p>蓝光会抑制褪黑素分泌，影响睡眠。</p><h2>3. 创造舒适的睡眠环境</h2><p>保持卧室黑暗、安静、凉爽。</p><h2>4. 避免睡前咖啡因和酒精</h2><p>咖啡因和酒精会干扰睡眠质量。</p><h2>5. 睡前放松仪式</h2><p>可以尝试阅读、听轻音乐或泡个热水澡。</p><h2>6. 白天适度运动</h2><p>运动有助于晚上更好地入睡。</p><h2>7. 不要强迫自己入睡</h2><p>如果20分钟睡不着，起来做些轻松的事情。</p>',
    coverImage: null,
    categoryId: 2,
    categoryName: '睡眠健康',
    summary: '睡眠质量直接影响心理健康，本文整理了7个科学验证的改善睡眠方法。',
    tags: '睡眠,健康生活,减压',
    authorName: '心理AI助手',
    readCount: 892,
    status: 1,
    createdAt: '2026-05-18 14:30:00',
    updatedAt: '2026-05-18 14:30:00'
  },
  {
    id: 3,
    title: '正念冥想入门指南',
    content: '<p>正念冥想是一种训练注意力的方法，已被科学证明对心理健康有益。</p><h2>什么是正念？</h2><p>正念是指有意识地、不加评判地关注当下。</p><h2>基础冥想练习</h2><p>找一个安静的地方坐下，专注于呼吸的感觉。当注意力分散时，轻轻带回呼吸上。</p><h2>日常正念练习</h2><p>吃饭时专注于食物的味道和口感，走路时感受脚步接触地面。</p>',
    coverImage: null,
    categoryId: 1,
    categoryName: '情绪管理',
    summary: '正念冥想是一种有效的减压方法，本文带你了解正念的基本概念和入门练习。',
    tags: '正念,冥想,减压',
    authorName: '心理AI助手',
    readCount: 2100,
    status: 1,
    createdAt: '2026-05-15 09:00:00',
    updatedAt: '2026-05-15 09:00:00'
  }
]

let sessions = []
let messagesDB = {}
let emotionDiaries = []
let users = []

// 从 data.json 恢复持久化数据
try {
  const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  sessions = saved.sessions || []
  messagesDB = saved.messagesDB || {}
  emotionDiaries = saved.emotionDiaries || []
  users = saved.users || []
  articles = saved.articles || articles
} catch { /* data.json 不存在或格式错误，使用默认数据 */ }

// 首次启动或 data.json 无 users 时，用硬编码默认用户
if (users.length === 0) {
  users = [
    { id: 1, username: 'user1', email: 'user1@example.com', nickname: '测试用户', phone: '13800138000', password: '123456', gender: 0, userType: 1 },
    { id: 2, username: 'admin', email: 'admin@example.com', nickname: '管理员', phone: '13800138001', password: '123456', gender: 0, userType: 2 },
    { id: 3, username: 'user2', email: 'user2@example.com', nickname: '测试用户2', phone: '13800138002', password: '123456', gender: 0, userType: 1 },
    { id: 4, username: 'user3', email: 'user3@example.com', nickname: '测试用户3', phone: '13800138003', password: '123456', gender: 0, userType: 1 }
  ]
}

const categories = [
  { id: 1, categoryName: '情绪管理' },
  { id: 2, categoryName: '睡眠健康' },
  { id: 3, categoryName: '人际关系' },
  { id: 4, categoryName: '自我成长' }
]

// ==================== 辅助函数 ====================
const success = (data) => ({ code: 200, msg: 'success', data })
const error = (msg) => ({ code: -1, msg, data: null })
const genId = () => Date.now() + Math.random().toString(36).substring(2, 8)
const now = () => new Date().toISOString().replace('T', ' ').substring(0, 19)

// ==================== 持久化 ====================
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ sessions, messagesDB, emotionDiaries, users, articles }, null, 2), 'utf-8')
}

// ==================== 认证中间件 ====================
// 从请求头 token 解析用户身份，挂到 req.user 上
const authMiddleware = (req, res, next) => {
  const token = req.headers['token']
  if (!token) {
    return res.status(401).json({ code: -1, msg: '未登录', data: null })
  }
  const parts = token.split('-')
  const userId = parseInt(parts[2])
  req.user = users.find(u => u.id === userId) || null
  if (!req.user) {
    return res.status(401).json({ code: -1, msg: 'token无效，请重新登录', data: null })
  }
  next()
}

// 管理员权限中间件（需在 authMiddleware 之后使用）
const adminMiddleware = (req, res, next) => {
  if (req.user?.userType !== 2) {
    return res.status(403).json({ code: -1, msg: '无权限，仅管理员可操作', data: null })
  }
  next()
}
const isAdmin = (req) => req.user?.userType === 2

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ==================== API 路由 ====================

// ---- 用户 ----
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    const token = `mock-token-${user.id}-${Date.now()}`
    return res.json(success({ token, userInfo: { ...user, password: undefined } }))
  }
  res.status(401).json(error('用户名或密码错误'))
})

app.post('/api/user/add', (req, res) => {
  const data = req.body
  if (users.find(u => u.username === data.username)) return res.json(error('用户名已存在'))
  if (users.find(u => u.email === data.email)) return res.json(error('邮箱已注册'))
  const newUser = { id: users.length + 1, ...data, userType: 1 }
  delete newUser.confirmPassword
  users.push(newUser)
  saveData()
  res.json(success({ id: newUser.id }))
})

app.post('/api/user/logout', authMiddleware, (req, res) => {
  res.json(success(null))
})

// ---- 文章 ----
app.get('/api/knowledge/article/page', (req, res) => {
  let filtered = [...articles]
  const { title, categoryId, status, sortField, currentPage = 1, size = 10 } = req.query
  if (title) filtered = filtered.filter(a => a.title.includes(title))
  if (categoryId) filtered = filtered.filter(a => a.categoryId == categoryId)
  if (status !== undefined && status !== '') filtered = filtered.filter(a => a.status == status)

  if (sortField === 'readCount') filtered.sort((a, b) => b.readCount - a.readCount)
  else if (sortField === 'publishedAt') filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const pageNum = parseInt(currentPage)
  const pageSize = parseInt(size)
  const start = (pageNum - 1) * pageSize
  const records = filtered.slice(start, start + pageSize)

  res.json(success({ records, total: filtered.length, current: pageNum, size: pageSize }))
})

app.get('/api/knowledge/category/tree', (req, res) => {
  res.json(success(categories))
})

app.get(/^\/api\/knowledge\/article\/(\d+)$/, (req, res) => {
  const id = parseInt(req.params[0])
  const article = articles.find(a => a.id === id)
  if (article) { article.readCount++; saveData(); return res.json(success(article)) }
  res.json(error('文章不存在'))
})

app.post('/api/knowledge/article', authMiddleware, adminMiddleware, (req, res) => {
  const data = req.body
  const newArticle = {
    id: articles.length + 1,
    ...data,
    authorName: req.user?.nickname || '管理员',
    readCount: 0,
    status: 0,
    createdAt: now(),
    updatedAt: now(),
    categoryName: categories.find(c => c.id === data.categoryId)?.categoryName || ''
  }
  articles.unshift(newArticle)
  saveData()
  res.json(success(newArticle))
})

app.put(/^\/api\/knowledge\/article\/(\d+)$/, authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params[0])
  const index = articles.findIndex(a => a.id === id)
  if (index !== -1) {
    articles[index] = { ...articles[index], ...req.body, updatedAt: now() }
    saveData()
    return res.json(success(articles[index]))
  }
  res.json(error('文章不存在'))
})

app.put(/^\/api\/knowledge\/article\/(\d+)\/status$/, authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params[0])
  const index = articles.findIndex(a => a.id === id)
  if (index !== -1) {
    articles[index].status = req.body.status
    articles[index].updatedAt = now()
    saveData()
    return res.json(success(articles[index]))
  }
  res.json(error('文章不存在'))
})

app.delete(/^\/api\/knowledge\/article\/(\d+)$/, authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params[0])
  const index = articles.findIndex(a => a.id === id)
  if (index !== -1) { articles.splice(index, 1); saveData(); return res.json(success(null)) }
  res.json(error('文章不存在'))
})

// ---- 文件上传 ----
app.post('/api/file/upload', authMiddleware, adminMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.json(error('未收到文件'))
  const filePath = '/uploads/' + req.file.filename
  res.json(success({ filePath }))
})

// ---- 心理咨询会话（需要登录） ----
app.post('/api/psychological-chat/session/start', authMiddleware, (req, res) => {
  const data = req.body
  const id = genId()
  const newSession = {
    id,
    sessionId: `session_${id}`,
    sessionTitle: data.sessionTitle || `对话_${new Date().toLocaleString()}`,
    status: 'ACTIVE',
    userId: req.user?.id,
    startedAt: now(),
    lastMessageTime: now(),
    messageCount: 1,
    lastMessageContent: data.initialMessage?.substring(0, 50) || '新对话'
  }
  sessions.unshift(newSession)
  messagesDB[id] = [{ id: genId(), sessionId: id, senderType: 1, content: data.initialMessage, createdAt: now() }]
  saveData()
  res.json(success({ sessionId: newSession.sessionId, status: newSession.status }))
})

app.get('/api/psychological-chat/sessions', authMiddleware, (req, res) => {
  let filtered = isAdmin(req) ? [...sessions] : sessions.filter(s => s.userId === req.user?.id)
  // 管理员查看时补充用户昵称
  if (isAdmin(req)) {
    filtered = filtered.map(s => ({
      ...s,
      userNickname: users.find(u => u.id === s.userId)?.nickname || '未知用户'
    }))
  }
  const { pageNum = 1, pageSize = 10 } = req.query
  const start = (parseInt(pageNum) - 1) * parseInt(pageSize)
  const records = filtered.slice(start, start + parseInt(pageSize))
  res.json(success({ records, total: filtered.length, current: parseInt(pageNum), size: parseInt(pageSize) }))
})

app.delete(/^\/api\/psychological-chat\/sessions\/([a-zA-Z0-9]+)$/, authMiddleware, (req, res) => {
  const sessionDbId = req.params[0]
  const index = sessions.findIndex(s => s.id == sessionDbId && (isAdmin(req) || s.userId === req.user?.id))
  if (index !== -1) { sessions.splice(index, 1); delete messagesDB[sessionDbId]; saveData() }
  res.json(success(null))
})

// 支持 sessionDbId 和 session_xxx 两种格式
const getSessionById = (id) => sessions.find(s => s.id == id)

// 校验当前用户是否有权访问该会话（管理员可访问全部）
const checkSessionOwner = (req, sessionId) => {
  if (isAdmin(req)) return true
  const session = getSessionById(sessionId)
  return session && session.userId === req.user?.id
}

app.get(/^\/api\/psychological-chat\/sessions\/([a-zA-Z0-9]+)\/messages$/, authMiddleware, (req, res) => {
  const sessionDbId = req.params[0]
  if (!checkSessionOwner(req, sessionDbId)) return res.json(error('会话不存在'))
  const msgs = messagesDB[sessionDbId] || []
  res.json(success(msgs))
})

app.get('/api/psychological-chat/sessions/:sessionId/messages', authMiddleware, (req, res) => {
  const sid = req.params.sessionId
  const realId = sid.toString().replace('session_', '')
  if (!checkSessionOwner(req, realId)) return res.json(error('会话不存在'))
  const msgs = messagesDB[realId] || []
  res.json(success(msgs))
})

app.post('/api/psychological-chat/sessions/:sessionId/message', authMiddleware, (req, res) => {
  const sid = req.params.sessionId
  const realId = sid.toString().replace('session_', '')
  if (!checkSessionOwner(req, realId)) return res.json(error('会话不存在'))
  const { senderType, content } = req.body
  if (!messagesDB[realId]) {
    messagesDB[realId] = []
  }
  messagesDB[realId].push({
    id: genId(),
    sessionId: realId,
    senderType,
    content,
    createdAt: now()
  })
  // 同步更新会话列表中的统计
  const session = sessions.find(s => s.id == realId)
  if (session) {
    session.messageCount = (session.messageCount || 0) + 1
    session.lastMessageTime = now()
    session.lastMessageContent = (content || '').substring(0, 50)
  }
  saveData()
  res.json(success(null))
})

app.get('/api/psychological-chat/session/:sessionId/emotion', authMiddleware, (req, res) => {
  const realId = req.params.sessionId.toString().replace('session_', '')
  if (!checkSessionOwner(req, realId)) return res.json(error('会话不存在'))
  const emotions = [
    { primaryEmotion: '平静', emotionScore: 65, isNegative: false, riskLevel: 0, suggestion: '情绪状态稳定，继续保持', improvementSuggestions: ['尝试深呼吸放松', '听一首喜欢的音乐'] },
    { primaryEmotion: '焦虑', emotionScore: 75, isNegative: true, riskLevel: 1, suggestion: '有些焦虑情绪，建议进行放松练习', improvementSuggestions: ['做5分钟深呼吸', '出门散步10分钟', '写下让你担忧的事情'] },
    { primaryEmotion: '快乐', emotionScore: 85, isNegative: false, riskLevel: 0, suggestion: '情绪状态很好，保持积极心态', improvementSuggestions: ['记录下今天的快乐时刻', '和朋友分享你的好心情'] }
  ]
  const hash = req.params.sessionId.length % 3
  res.json(success(emotions[hash]))
})

// ---- 情绪日志 ----
app.post('/api/emotion-diary', authMiddleware, (req, res) => {
  const data = req.body
  const newDiary = {
    id: emotionDiaries.length + 1,
    ...data,
    userId: req.user?.id || 1,
    nickName: req.user?.nickname || '用户',
    userName: req.user?.username || 'user',
    createdAt: now(),
    updatedAt: now(),
    aiEmotionAnalysis: JSON.stringify({
      primaryEmotion: data.dominantEmotion || '平静',
      emotionScore: (data.moodScore || 5) * 10,
      isNegative: (data.moodScore || 5) < 5,
      riskLevel: (data.moodScore || 5) < 4 ? 1 : 0,
      suggestion: '情绪日记记录是很好的习惯，继续坚持！',
      riskDescription: '',
      improvementSuggestions: ['保持记录习惯', '多关注积极事件']
    })
  }
  emotionDiaries.unshift(newDiary)
  saveData()
  res.json(success(newDiary))
})

// 前台用户查看自己的情绪日记列表
app.get('/api/emotion-diary/my/page', authMiddleware, (req, res) => {
  let filtered = emotionDiaries.filter(d => d.userId === req.user?.id)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const { pageNum = 1, pageSize = 10 } = req.query
  const start = (parseInt(pageNum) - 1) * parseInt(pageSize)
  const records = filtered.slice(start, start + parseInt(pageSize))
  res.json(success({ records, total: filtered.length, current: parseInt(pageNum), size: parseInt(pageSize) }))
})

// 前台用户删除自己的情绪日记
app.delete('/api/emotion-diary/my/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id)
  const index = emotionDiaries.findIndex(d => d.id === id && d.userId === req.user?.id)
  if (index !== -1) { emotionDiaries.splice(index, 1); saveData(); return res.json(success(null)) }
  res.json(error('日记不存在'))
})

app.get('/api/emotion-diary/admin/page', authMiddleware, adminMiddleware, (req, res) => {
  let filtered = [...emotionDiaries]
  const { userId, moodScoreRange, currentPage = 1, size = 10 } = req.query
  if (userId) filtered = filtered.filter(d => d.userId == userId)
  if (moodScoreRange) {
    const [min, max] = moodScoreRange.split('-')
    filtered = filtered.filter(d => d.moodScore >= parseInt(min) && d.moodScore <= parseInt(max))
  }
  const pageNum = parseInt(currentPage)
  const pageSize = parseInt(size)
  const start = (pageNum - 1) * pageSize
  const records = filtered.slice(start, start + pageSize)
  res.json(success({ records, total: filtered.length, current: pageNum, size: pageSize }))
})

app.delete(/^\/api\/emotion-diary\/admin\/(\d+)$/, authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params[0])
  const index = emotionDiaries.findIndex(d => d.id === id)
  if (index !== -1) { emotionDiaries.splice(index, 1); saveData() }
  res.json(success(null))
})

// ---- 数据分析 ----
// 日期辅助函数
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }
  return days
}

app.get('/api/data-analytics/overview', authMiddleware, adminMiddleware, (req, res) => {
  const today = formatDate(new Date())
  const last7Days = getLast7Days()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // 近7天活跃用户（有会话或日记的用户）
  const recentUserIds = new Set()
  sessions.filter(s => new Date(s.startedAt) >= sevenDaysAgo).forEach(s => recentUserIds.add(s.userId))
  emotionDiaries.filter(d => new Date(d.createdAt) >= sevenDaysAgo).forEach(d => recentUserIds.add(d.userId))

  // 情绪趋势：近7天按日期聚合日记
  const emotionTrend = last7Days.map(date => {
    const dayDiaries = emotionDiaries.filter(d => formatDate(d.createdAt || d.diaryDate) === date)
    const sum = dayDiaries.reduce((s, d) => s + (d.moodScore || 0), 0)
    return {
      date,
      avgMoodScore: dayDiaries.length ? Math.round((sum / dayDiaries.length) * 10) : 0,
      recordCount: dayDiaries.length
    }
  })

  // 咨询趋势：近7天按日期聚合会话
  const consultationDailyTrend = last7Days.map(date => {
    const daySessions = sessions.filter(s => formatDate(s.startedAt) === date)
    return {
      date,
      sessionCount: daySessions.length,
      userCount: new Set(daySessions.map(s => s.userId)).size
    }
  })

  // 用户活跃度：近7天按日期聚合
  const userActivity = last7Days.map(date => {
    const daySessions = sessions.filter(s => formatDate(s.startedAt) === date)
    const dayDiaries = emotionDiaries.filter(d => formatDate(d.createdAt || d.diaryDate) === date)
    const activeUserIds = new Set([
      ...daySessions.map(s => s.userId),
      ...dayDiaries.map(d => d.userId)
    ])
    return {
      date,
      activeUsers: activeUserIds.size,
      newUsers: 0,
      diaryUsers: new Set(dayDiaries.map(d => d.userId)).size,
      consultationUsers: new Set(daySessions.map(s => s.userId)).size
    }
  })

  // 总平均情绪评分
  const allScores = emotionDiaries.map(d => d.moodScore || 0)
  const avgMoodScore = allScores.length
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10)
    : 0

  // 平均会话时长（基于消息数估算，假设每条消息约3分钟）
  const avgDurationMinutes = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.messageCount || 1), 0) / sessions.length) * 3
    : 0

  res.json(success({
    systemOverview: {
      totalUsers: users.filter(u => u.userType === 1).length,
      activeUsers: recentUserIds.size || users.filter(u => u.userType === 1).length,
      totalDiaries: emotionDiaries.length,
      todayNewDiaries: emotionDiaries.filter(d => formatDate(d.createdAt || d.diaryDate) === today).length,
      totalSessions: sessions.length,
      todayNewSessions: sessions.filter(s => formatDate(s.startedAt) === today).length,
      avgMoodScore
    },
    emotionTrend,
    consultationStats: {
      totalSessions: sessions.length,
      avgDurationMinutes,
      dailyTrend: consultationDailyTrend
    },
    userActivity
  }))
})

// ---- AI 对话代理（隐藏 API Key） ----
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY

app.post('/api/proxy/chat/completions', authMiddleware, async (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body)
    console.log('[代理] 开始请求 Moonshot，消息数:', req.body.messages?.length)

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + MOONSHOT_API_KEY,
        Accept: 'text/event-stream'
      },
      body: bodyStr,
      signal: AbortSignal.timeout(30000)
    })

    console.log('[代理] Moonshot 状态:', response.status)

    if (!response.ok) {
      const text = await response.text()
      console.error('[代理] Moonshot 返回错误:', response.status, text)
      return res.status(response.status).json({ code: -1, msg: 'AI 服务返回错误', data: null })
    }

    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
    res.end()
    console.log('[代理] 流式响应完成')
  } catch (err) {
    console.error('[代理] 请求失败:', err.name, err.message)
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ code: -1, msg: 'AI 服务超时', data: null })
    }
    if (!res.headersSent) {
      res.status(502).json({ code: -1, msg: 'AI 服务请求失败', data: null })
    }
  }
})

// ==================== 静态文件 & SPA 回退 ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(history())
app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock 服务器启动成功，访问 http://localhost:${PORT}`)
  console.log('局域网访问：http://<本机IP>:' + PORT)
  console.log('登录账号: admin / 123456 (管理员)  或  user1 / 123456 (普通用户)')
})
