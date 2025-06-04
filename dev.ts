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
  try {
    const rendererPath = path.resolve(__dirname, 'packages', 'renderer')
    const server = await createServer({
      configFile: path.resolve(rendererPath, 'vite.config.ts'),
      root: rendererPath,
      server: {
        port: 5173, // 确保端口与 renderer 的配置一致
        strictPort: true, // 确保端口不可用时抛出错误
        hmr: true, // 启用热模块替换
      }
    })
    var s = await server.listen()
    server.printUrls()
    console.log('✅ Vite 开发服务已启动')
    return server
  } catch (error) {
    console.error('❌ 启动 Vite 开发服务失败:', error)
    process.exit(1) // 退出进程
  }

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

async function emptyOutDir(dirPath: string) {
  const absPath = path.resolve(dirPath)
  try {
    await fs.access(absPath)
    await fs.rm(absPath, { recursive: true, force: true })
    console.log(`✅ 已清空目录: ${absPath}`)
  }
  catch (error) {
    console.error(`❌ 清空目录失败: ${absPath}`, error)
  }

}

async function buildMain() {
  const result = await build({
    build: {
      lib: {
        entry: path.resolve('packages', 'main', 'src/index.ts'),
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      sourcemap: true,
      outDir: outDir,
      emptyOutDir: false,
      target: 'node22',
      rollupOptions: {
        external: ['electron', 'fs', 'path'],
      },
    },
  })
}

async function buildPreload() {
  const result = await build({
    build: {
      lib: {
        entry: path.resolve('packages', 'preload', 'src/index.ts'),
        formats: ['cjs'],
        fileName: () => 'preload.js',
      },
      sourcemap: true,
      outDir: outDir,
      target: 'node22',
      emptyOutDir: false,
      rollupOptions: {
        external: ['electron', 'fs', 'path'],
      },
    },
  })
}

function restartElectron() {
  if (electronProcess) {
    electronProcess.kill()
    electronProcess = null
  }

  spawn(electronPath as unknown as string, [path.resolve(outDir, './main.js'), '--remote-debugging-port=9222'], {
    stdio: 'inherit', // 或 'pipe' 用于监听子进程输出
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ELECTRON_RENDERER_URL: 'http://localhost:5173', // 确保 renderer 的 URL 正确
    }
  });

  console.log('[electron] restarted.')
}

async function main() {
  await emptyOutDir(outDir)
  var server = await startRenderer()
  if (!server) {
    console.error('❌ Vite renderer server failed to start.')
    return
  }
  console.log('[vite] renderer dev server running...')
  await ensureDirExists(outDir);
  console.log('[vite] output directory ensured:', outDir);
  await buildPreload()
  console.log('[vite] preload built successfully.')
  console.log('[vite] main process build started...')
  await buildMain()

  // 开始监听打包输出
  watch(outDir, { recursive: true }, () => {
    restartElectron()
  })
  console.log('[vite] main process watching for changes...')

  restartElectron()
  console.log('[electron] main process started.')

  process.on('SIGINT', async () => {
    console.log('🛑 收到 SIGINT，正在关闭 Vite 服务...')
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('🛑 收到 SIGTERM，正在关闭 Vite 服务...')
    await server.close()
    process.exit(0)
  })
}

main()

