import { fileURLToPath, URL } from 'node:url'
import path from "path"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@pks': fileURLToPath(new URL('./packages', import.meta.url)),
        },
    },
    build: {
        // outDir: "lib-name", // 默认 dist
        lib: { // 库编译模式配置
            entry: path.resolve(__dirname, './packages/index.ts'), // 指定编译入口文件
            name: 'AutoTools', // name 是暴露的全局变量
            // fileName: 'v3-antd-kits' // 是输出的包文件名，默认 fileName 是 package.json 的 name 选项
            // fileName: (format) => `build.${format}.ts`
        },
        rollupOptions: { // rollup打包配置
            // 确保外部化处理 那些你不想打包进库的依赖
            external: ['vue'],
            output: {
              exports: 'named', // https://rollupjs.org/configuration-options/#output-exports
              // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
              // globals: {
              //     vue: 'Vue'
              // }
            }
        }
    },
})
