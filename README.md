# HTML 文件托管应用

一个简单的HTML文件托管和分享应用，支持拖拽上传、文件管理和在线预览。

## 功能特性

- 📁 拖拽上传HTML文件
- ✏️ 代码粘贴功能
- 📋 文件列表管理
- 🔗 在线预览和分享
- 🗑️ 文件删除功能
- 🔐 登录密码保护
- 📱 响应式设计
- 💾 SQLite数据库存储
- 🚀 Zeabur 一键部署

## 快速开始

### 本地开发

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量（可选）：
```bash
cp .env.example .env
# 编辑 .env 文件设置登录密码
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:3000`

### 生产部署

1. 安装依赖：
```bash
npm install
```

2. 设置环境变量：
```bash
export LOGIN_PASSWORD="your_secure_password"
export SESSION_SECRET="your_random_secret"
```

3. 启动生产服务器：
```bash
npm start
```

## Zeabur 部署

1. 将代码推送到GitHub仓库
2. 在Zeabur中导入该仓库
3. 在Zeabur环境变量中设置：
   - `LOGIN_PASSWORD`: 设置登录密码
   - `SESSION_SECRET`: 设置session密钥
4. 部署会自动进行

## 环境变量配置

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `LOGIN_PASSWORD` | 登录密码 | `admin123` | 推荐设置 |
| `SESSION_SECRET` | Session加密密钥 | 随机生成 | 推荐设置 |
| `PORT` | 服务器端口 | `3000` | 否 |
| `ZEABUR_MOUNT_PATH` | Zeabur挂载路径 | - | 否 |

## 使用说明

### 登录
1. 首次访问需要输入登录密码
2. 默认密码为 `admin123`（强烈建议修改）
3. 登录后会保持24小时会话

### 文件管理
1. **文件上传**：拖拽HTML文件到上传区域，或点击"选择文件"按钮
2. **代码粘贴**：切换到"代码粘贴"标签，直接粘贴HTML代码
3. **文件预览**：点击"查看"按钮在线预览HTML文件
4. **文件分享**：点击"分享"或"复制链接"按钮分享文件
5. **文件删除**：点击"删除"按钮删除文件
6. **统计信息**：查看总文件数、总大小和访问量统计

## 文件结构

```
html-hosting/
├── server.js          # Express服务器
├── package.json       # 项目配置
├── zeabur.json        # Zeabur部署配置
├── .env.example       # 环境变量示例
├── .gitignore         # Git忽略文件
├── models/            # 数据库模型
│   └── database.js    # SQLite数据库配置
├── uploads/           # 上传文件目录（自动创建）
└── public/            # 静态文件
    └── index.html     # 主页面
```

## 技术栈

- Node.js + Express
- Multer (文件上传)
- Express-session (会话管理)
- Sequelize + SQLite (数据库)
- 原生JavaScript (前端)
- CSS3 (样式)

## 安全注意事项

- **强烈建议修改默认登录密码**
- 在生产环境中设置强密码和随机session密钥
- 仅支持HTML文件上传，文件大小限制：10MB
- 所有功能都需要登录后才能访问
- 文件和数据库存储在服务器本地
- 支持Zeabur挂载硬盘持久化存储

## 更新日志

### v2.0.0
- ✅ 新增登录密码保护功能
- ✅ 新增代码粘贴功能
- ✅ 新增SQLite数据库存储
- ✅ 新增文件访问统计
- ✅ 优化UI界面和用户体验