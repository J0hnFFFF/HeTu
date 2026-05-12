
# 📦 客户端打包指南

本指南将指导您如何将 **河图情报分析系统** 从 Web 网页应用打包成可在 Windows、macOS 和 Linux 上运行的独立桌面应用程序 (.exe / .dmg / .AppImage)。

我们将使用业界标准的 **Electron** 框架进行封装。

---

## 1. 环境准备

确保您的开发环境已安装：
*   **Node.js** (v18 或更高版本)
*   **npm** (Node 包管理器)

---

## 2. 安装 Electron 依赖

在项目根目录下，打开终端运行以下命令来安装 Electron 及其打包工具：

```bash
# 安装 Electron 主程序
npm install --save-dev electron

# 安装打包构建工具 (Electron Builder)
npm install --save-dev electron-builder

# 安装开发辅助工具 (用于同时运行 React 和 Electron)
npm install --save-dev concurrently wait-on cross-env
```

---

## 3. 创建 Electron 主进程文件

在项目根目录下创建一个名为 `electron.js` 的文件。这是桌面应用的入口点，负责创建窗口并加载 React 应用。

**文件: `electron.js`**

```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // 1. 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Nexus OSINT Platform",
    backgroundColor: '#0B0F19', // 匹配应用背景色
    icon: path.join(__dirname, 'public/favicon.ico'), // 确保你有这个图标，或者删除此行
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 注意：生产环境建议开启隔离并使用 preload 脚本
    },
  });

  // 2. 隐藏默认菜单栏 (可选，为了沉浸式体验)
  // Menu.setApplicationMenu(null);

  // 3. 加载应用
  if (isDev) {
    // 开发模式：加载本地 React 服务
    win.loadURL('http://localhost:3000');
    // 打开开发者工具
    win.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的 HTML 文件
    // 假设构建输出在 build 文件夹 (Create React App) 或 dist 文件夹 (Vite)
    // 请根据实际情况修改: 'build/index.html' 或 'dist/index.html'
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// 当 Electron 完成初始化时调用
app.whenReady().then(createWindow);

// macOS 窗口管理行为
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

---

## 4. 配置 package.json

您需要修改 `package.json` 文件以识别 Electron 并配置打包脚本。

**1. 添加 `main` 入口:**
找到 `package.json` 中的入口字段（如果没有则添加），指向我们刚才创建的文件：

```json
{
  "name": "nexus-osint-platform",
  "version": "6.2.0",
  "main": "electron.js", 
  ...
}
```

**2. 添加 `homepage` (关键):**
为了确保打包后的资源路径正确（避免白屏），请添加：

```json
{
  ...
  "homepage": "./",
  ...
}
```

**3. 添加运行脚本:**
在 `scripts` 部分添加以下命令：

```json
"scripts": {
  "start": "react-scripts start", 
  "build": "react-scripts build", 
  
  "electron:dev": "concurrently \"cross-env BROWSER=none npm start\" \"wait-on http://localhost:3000 && electron .\"",
  "electron:build": "npm run build && electron-builder -c.extraMetadata.main=electron.js"
},
```
*(注意：如果您使用的是 Vite，请将 `react-scripts` 替换为 `vite`，并将 build 输出目录调整为 dist)*

**4. 配置打包选项 (build):**
在 `package.json` 的底部添加 `build` 字段，用于定义生成的安装包信息：

```json
"build": {
  "appId": "com.nexus.osint",
  "productName": "Nexus OSINT",
  "files": [
    "dist/**/*", 
    "electron.js",
    "package.json"
  ],
  "directories": {
    "output": "release"
  },
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "public/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "public/icon.png"
  }
}
```
*(注意：请确保 `dist/**/*` 与您的 Web 构建输出目录一致，React Create React App 默认为 `build/**/*`，Vite 默认为 `dist/**/*`)*

---

## 5. 处理 API Key (重要)

由于是桌面应用，我们不能依赖服务器环境变量。有几种处理方式：

**方法 A: 构建时注入 (简单，仅限个人使用)**
在项目根目录创建 `.env` 文件：
```env
REACT_APP_API_KEY=your_google_api_key_here
# 如果使用 Vite:
VITE_API_KEY=your_google_api_key_here
```
构建时，打包器会将 Key 写入代码中。注意：如果你分发这个 .exe，别人可以通过反编译获取你的 Key。

**方法 B: 运行时输入 (推荐，安全)**
修改代码，在应用启动时弹出一个对话框让用户输入自己的 Gemini API Key，并将其保存在 `localStorage` 中。Nexus 平台目前的代码结构支持从环境变量读取，若要商业化分发，建议修改 `geminiService.ts` 优先读取 `localStorage`。

---

## 6. 打包运行

**开发模式调试 (桌面版):**
```bash
# 记得设置 API_KEY 环境变量
npm run electron:dev
```

**构建生产安装包:**
```bash
npm run electron:build
```

构建完成后，安装包将生成在项目的 `release` 文件夹中：
*   **Windows**: `HetuOSINT Setup 6.2.0.exe`
*   **macOS**: `HetuOSINT-6.2.0.dmg`
*   **Linux**: `HetuOSINT-6.2.0.AppImage`

---

## 7. 高级建议

对于专业的情报分析工具，打包为客户端后可以扩展以下功能：
1.  **本地文件系统访问**: 利用 Electron 的 `fs` 模块，直接保存报告到桌面，而不是通过浏览器下载。
2.  **离线数据库**: 集成 SQLite 或 PouchDB，将情报数据保存在本地硬盘，保证数据隐私。
3.  **原生通知**: 当长时间运行的爬虫任务完成时，发送系统级通知。
