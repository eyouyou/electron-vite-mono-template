# electron-vite-mono-template

[![npm version](https://img.shields.io/npm/v/electron-vite-mono-template.svg?style=flat-square)](https://www.npmjs.com/package/electron-vite-mono-template)
[![License](https://img.shields.io/github/license/eyouyou/electron-vite-mono-template.svg?style=flat-square)](LICENSE)

## 项目简介
这是一个基于 **Vite + PNPM Workspace + Electron** 的单仓（Monorepo）项目模板，专为快速开发跨平台桌面应用设计。项目采用模块化架构，支持多进程开发、热更新和高效打包，适用于中小型 Electron 应用开发。


## 主要特性
1. **技术栈**  
   - **Vite**：极速构建工具，支持 ESBuild 预编译和 HMR（热模块替换）  
   - **PNPM Workspace**：单仓管理多个子项目，共享依赖，提升开发效率  
   - **Electron**：跨平台桌面应用开发，支持 Windows/macOS/Linux  
   - **TypeScript**：类型安全，开发体验更友好  
   - **React**：可选 Vue/Vue3/Angular（需手动配置）  

2. **工程化能力**  
   - 主进程（Main Process）与渲染进程（Renderer Process）分离  
   - 支持开发环境热更新（主进程/渲染进程双 HMR）  
   - 生产环境一键打包（支持 NSIS/DMG/DEB 等格式）  
   - 预配置 ESLint + Prettier，统一代码风格  
   - 内置 TypeScript 声明文件，完善的类型提示  


## 目录结构
```plaintext
electron-vite-mono-template/  
├─ packages/
│  ├─ main/        # Electron main process code (Node.js environment)
│  ├─ preload/     # Preload scripts (context bridge)
│  ├─ renderer/    # Renderer process (React/Vue/any frontend framework)
├─ node_modules/
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.json
├─ ...
```
## 快速开始

### 前置条件
- 安装 [Node.js](https://nodejs.org/)（>= v16.0）  
- 安装 [PNPM](https://pnpm.io/installation)（>= v7.0）  

### 1. 克隆项目
```bash
# 方式一：从 GitHub 克隆
git clone https://github.com/eyouyou/electron-vite-mono-template.git my-electron-app
cd my-electron-app

# 方式二：通过 degit 模板创建（推荐）
npx degit eyouyou/electron-vite-mono-template my-electron-app
cd my-electron-app
```

如果觉得项目有用，欢迎给个 ⭐ Star 支持！

