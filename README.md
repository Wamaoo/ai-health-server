# 心语 - 后端服务

心语心理健康 AI 助手的后端 API 服务，为前端提供数据接口与 AI 对话代理。

## 技术栈

| 技术 | 用途 |
|------|------|
| Node.js | 运行环境 |
| Express | Web 框架 |
| Multer | 文件上传处理 |
| dotenv | 环境变量管理 |

## 快速启动

```bash
# 安装依赖
npm install

# 配置环境变量（复制后填入 Moonshot API Key）
cp .env.example .env

# 启动服务
node server.js
```

默认地址：`http://localhost:8088`

测试账号：
- 管理员：`admin` / `123456`
- 普通用户：`user1` / `123456`

## API 接口

### 用户模块
- `POST /api/user/login` — 登录
- `POST /api/user/add` — 注册
- `POST /api/user/logout` — 退出登录

### 文章知识库
- `GET /api/knowledge/article/page` — 分页查询文章
- `GET /api/knowledge/article/:id` — 文章详情
- `POST /api/knowledge/article` — 新增文章（管理员）
- `PUT /api/knowledge/article/:id` — 编辑文章（管理员）
- `DELETE /api/knowledge/article/:id` — 删除文章（管理员）
- `GET /api/knowledge/category/tree` — 分类列表

### AI 心理咨询
- `POST /api/psychological-chat/session/start` — 创建会话
- `GET /api/psychological-chat/sessions` — 会话列表
- `DELETE /api/psychological-chat/sessions/:id` — 删除会话
- `GET /api/psychological-chat/sessions/:id/messages` — 获取消息
- `POST /api/psychological-chat/sessions/:id/message` — 发送消息
- `GET /api/psychological-chat/session/:id/emotion` — 情绪分析

### AI 对话代理
- `POST /api/proxy/chat/completions` — 代理 Moonshot API（SSE 流式响应）

### 情绪日记
- `POST /api/emotion-diary` — 新增记录
- `GET /api/emotion-diary/my/page` — 我的日记列表
- `DELETE /api/emotion-diary/my/:id` — 删除日记
- `GET /api/emotion-diary/admin/page` — 管理端列表
- `DELETE /api/emotion-diary/admin/:id` — 管理端删除

### 数据统计
- `GET /api/data-analytics/overview` — 仪表盘数据总览

### 文件上传
- `POST /api/file/upload` — 上传图片（管理员）

## 项目结构

```
├── server.js          # 入口，路由与业务逻辑
├── data.json           # JSON 文件持久化
├── uploads/            # 上传文件目录
├── public/             # 静态文件（前端打包产物）
├── .env                # 环境变量（API Key 等）
└── package.json
```

## 部署

支持部署到 Railway 等平台，需配置环境变量：

- `PORT` — 端口号（默认 8088）
- `MOONSHOT_API_KEY` — Moonshot AI API 密钥
