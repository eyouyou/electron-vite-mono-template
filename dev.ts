// electron 流程
import path from 'path'
import { createServer, build } from 'vite'
import { spawn } from 'child_process'
import { watch, promises as fs } from 'fs'
import type { ChildProcess } from 'child_process'
import electronPath from 'electron'

const outDir = path.resolve(__dirname, './dist')

let electronProcess: ChildProcess | null = null

async function startRenderer() {
  const server = await createServer({
    configFile: path.resolve(__dirname, 'packages', 'renderer', 'vite.config.ts'),
    server: {
      port: 5173, // 确保端口与 renderer 的配置一致
      strictPort: true, // 确保端口不可用时抛出错误
      hmr: true, // 启用热模块替换
    }
  })
  await server.listen()
  console.log('[vite] renderer dev server running...')
}

async function ensureDirExists(dirPath: string) {
  try {
    await fs.access(dirPath) // 尝试访问
    // 如果能访问，不做任何处理
  } catch {
    // 如果无法访问（不存在），就创建
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function buildMainAndWatch() {
  await ensureDirExists(outDir);
  const result = await build({
    build: {
      lib: {
        entry: path.resolve('packages', 'main', 'src/main.ts'),
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      outDir: outDir,
      target: 'node22',
      rollupOptions: {
        external: ['electron', 'fs', 'path'],
      },
    },
  })
  // 开始监听打包输出
  watch(outDir, { recursive: true }, () => {
    restartElectron()
  })
}

function restartElectron() {
  if (electronProcess) {
    electronProcess.kill()
    electronProcess = null
  }

  spawn(electronPath as unknown as string, [path.resolve(outDir, './main.js')], {
    stdio: 'inherit', // 或 'pipe' 用于监听子进程输出
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ELECTRON_RENDERER_URL: 'http://localhost:5173' // 确保 renderer 的 URL 正确
    }
  });

  console.log('[electron] restarted.')
}

async function main() {
  await startRenderer()
  await buildMainAndWatch()
  restartElectron()
}

main()

