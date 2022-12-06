// / <reference types="vite/client" />

// import { AxiosRequestConfig } from 'axios';

// 拦截器里 可以不使用 myRequestConfig，直接 使用 AxiosRequestConfig (前提是要对他做下面的扩展配置)
// declare module 'axios' {
//     export interface AxiosRequestConfig {
//         // 自定义属性声明
//         customedData?: {
//             GetErrMsgWay?: "byMap" | "byRes",
//             GlobalErrMsgSwitch?: 1 | 0, // 全局错误消息 提示开关; 1 开启; 0 关闭
//             GlobalLoadingSwitch?: 1 | 0, // 全局等待层 开关; 1 开启; 0 关闭
//             IfCancelRepeatpReq?: 1 | 0, // 是否取消重复请求; 1 yes=取消重复请求; 0 不取消
//             IfNull2Empty?: boolean,
//             requestMark?: string,
//             // [propName: string | number]: any
//         },
//     }
// }