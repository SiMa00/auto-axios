
// GetErrorMsgWay: 返回失败 时,
// 方式1 byMap: 不论有无 respData 的返回消息,直接根据返回码 取 错误映射的消息
// 方式2 byRes: 先取 respData 的返回消息,若无,再取 错误映射的消息

import type { AxiosRequestConfig, RawAxiosRequestHeaders, AxiosResponse } from 'axios'

// laoding 对象接口
export interface ILoad {
    showLoadMask(): void;
    closeLoadMask(): void;
}
// 错误码集合里的 错误对象
export interface IErrListObj {
    retCode: string;
    retMsg: string;
}

// 默认请求配置
export interface reqDefault {
    defaultHeader?: { [propName: string | number]: any },
    defaultWay?: 'post' | 'get' | 'put' | 'delete'
    post?: { [propName: string | number]: any },
    get?: { [propName: string | number]: any },
    xssProtection?: { [propName: string | number]: any },
}

type newHeader = RawAxiosRequestHeaders & {
    GlobalErrMsgSwitch: 1 | 0, // 全局错误消息 提示开关; 1 开启; 0 关闭
    GlobalLoadingSwitch: 1 | 0, // 全局等待层 开关; 1 开启; 0 关闭
    IfCancelRepeatpReq?: 1 | 0, // 是否取消重复请求; 1 yes=取消重复请求; 0 不取消
    ifNull2Empty?: boolean, // 是否把 undefined null 转成 空字符串;
}
export type cusReqConfig = { 
    headers?:newHeader,
    customedData?: {
        GlobalErrMsgSwitch: 1 | 0, // 全局错误消息 提示开关; 1 开启; 0 关闭
        GlobalLoadingSwitch: 1 | 0, // 全局等待层 开关; 1 开启; 0 关闭
    }
} & Omit<AxiosRequestConfig, 'headers'>
// export interface cusReqConfig extends AxiosRequestConfig {
//     // RawAxiosRequestHeaders
// }



/** 自定义的 返回消息
 * EmptyUrl 请求url为空
 * EmptyResponseData 返回数据为空
 * EmptyReturnCode 返回码为空
 * LoginExpired 登录超时
 * ErrMapCodeMissing 错误码映射缺失
 * RequstFailed 请求失败
 * ClientError 客户端错误
 * ServerError 服务器错误
 * SystemError 系统异常
 * ServerNoResponse 服务器没有响应
 * RequestTimeout 请求超时
 * ServerNoResponse 服务器没有响应
 *
 */
export interface IReqCfg {
    REQ_CONST: {
        // AuthOperationUrl: '',
        BaseUrl: string,
        LoginExpiredCode: Array<number|string>, // 会话超时
        RetSucCode: Array<number|string>, // 返回成功
        LoginUrl: string, // login请求的 path部分, 目的：登录请求不带 token过去

        Timeout?: number, // s; window.systemCfg.reqTimeout, // m * s
        DefaultLang?: string,
    }
    REQ_SWITCH: {
        GetErrMsgWay?: "byMap" | "byRes",
        GlobalErrMsgSwitch?: 1 | 0, // 全局错误消息 提示开关; 1 开启; 0 关闭
        GlobalLoadingSwitch?: 1 | 0, // 全局等待层 开关; 1 开启; 0 关闭
        IfCancelRepeatpReq?: 1 | 0, // 是否取消重复请求; 1 yes=取消重复请求; 0 不取消
    },
    RET_FIELDS_CFG: {
        RetCode: string,
        RetMsg: string,
        RetData: string,
        RetCount: string, // 列表查询条数 统计字段
        StorageToken: string,
        HttpToken: string, // TODO 可考虑删除 与 取值应 与 StorageToken 字段一致

        StorageLang: string, // 存储 里的 语言字段 key
        HttpLang?: string, // 发送给后台的 语言字段 // TODO 可考虑删除 与 取值应 与 StorageLang 字段一致
    },
    REQ_WAYS_CFG?: {
        DefaultWay?: 'post' | 'get' | 'delete' | 'put',
        DefaultHeader?: { [propName: string | number]: any }, // { 'x-tenant-header': 'electronic-commerce' },
    },
    // 返回 loadService 对象需要提供 closeLoadMask() + showLoadMask() 方法
    getLoadService?: () => ILoad;
    showTipBox(
        retMsg: string | number | Array<any>,
        retCode: string | number,
        statusCode: string | number,
        response: AxiosResponse,
    ): void;
}


