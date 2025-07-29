# HTML 文件托管应用

一个简单的HTML文件托管和分享应用，支持拖拽上传、文件管理和在线预览。

## 功能特性

- 📁 拖拽上传HTML文件
- 📋 文件列表管理
- 🔗 在线预览和分享
- 🗑️ 文件删除功能
- 📱 响应式设计
- 🚀 Zeabur 一键部署

## 快速开始

### 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 打开浏览器访问 `http://localhost:3000`

### 生产部署

1. 安装依赖：
```bash
npm install
```

2. 启动生产服务器：
```bash
npm start
```

## Zeabur 部署

1. 将代码推送到GitHub仓库
2. 在Zeabur中导入该仓库
3. 部署会自动进行，无需额外配置

## 使用说明

1. 在主页拖拽HTML文件到上传区域，或点击"选择文件"按钮
2. 文件上传后会显示在文件列表中
3. 点击"查看"按钮可以在线预览HTML文件
4. 点击"删除"按钮可以删除文件
5. 每个文件都有独立的分享链接

## 文件结构

```
html-hosting/
├── server.js          # Express服务器
├── package.json       # 项目配置
├── zeabur.json        # Zeabur部署配置
├── .gitignore         # Git忽略文件
├── uploads/           # 上传文件目录（自动创建）
└── public/            # 静态文件
    └── index.html     # 主页面
```

## 技术栈

- Node.js + Express
- Multer (文件上传)
- 原生JavaScript (前端)
- CSS3 (样式)

## 注意事项

- 仅支持HTML文件上传
- 文件大小限制：10MB
- 上传的文件存储在服务器本地
- 重启服务器会清空上传的文件（生产环境建议使用数据库或对象存储）