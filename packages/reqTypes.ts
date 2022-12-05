
// GetErrorMsgWay: 返回失败 时,
// 方式1 byMap: 不论有无 respData 的返回消息,直接根据返回码 取 错误映射的消息
// 方式2 byRes: 先取 respData 的返回消息,若无,再取 错误映射的消息

import type { AxiosRequestConfig, RawAxiosRequestHeaders, AxiosResponse } from 'axios'

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
export interface IAutoRequestCfg {
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
        IfCancelRepeatpReq?: 1 | 0, // 是否取消重复请求; 1 取消重复请求; 0 不取消
    },
    RET_FIELDS_CFG: {
        RetCode: string,
        RetMsg: string,
        RetData: string,
        RetCount: string, // 列表查询条数 统计字段
        StorageTokenKey: string,
        HttpTokenKey: string,

        StorageLangKey: string, // 存储 里的 语言字段 key
        HttpLangKey?: string, // 发送给后台的 语言字段
    },
    REQ_WAYS_CFG?: {
        DefaultWay?: 'post' | 'get' | 'delete' | 'put',
        DefaultHeader?: objAny, // { 'x-tenant-header': 'electronic-commerce' },
    },
    showTipBox(
        retMsg?: string | number | Array<any>,
        retCode?: string | number,
        statusCode?: string | number,
        response?: AxiosResponse,
    ): void;
    // 返回 loadService 对象需要提供 closeLoadMask() + showLoadMask() 方法
    getLoadService?: () => ILoad;
    beforeReq?: (config:AxiosRequestConfig) => void;
}

// laoding 对象接口
export interface ILoad {
    showLoadMask(): void;
    closeLoadMask(): void;
}
// 错误码集合里的 错误对象
export interface IErrListItem {
    retCode: string;
    retMsg: string;
}
export interface IErrMap { [propName: string | number]: IErrListItem }

// 默认请求配置
export interface IreqDefaultVal {
    defaultHeader?: objAny,
    defaultWay?: 'post' | 'get' | 'put' | 'delete'
    post?: objAny,
    get?: objAny,
    xssProtection?: objAny,
}
export interface IRequestCfg extends AxiosRequestConfig {
    customedData?: {
        GetErrMsgWay?: "byMap" | "byRes",
        GlobalErrMsgSwitch?: 1 | 0, // 全局错误消息 提示开关; 1 开启; 0 关闭
        GlobalLoadingSwitch?: 1 | 0, // 全局等待层 开关; 1 开启; 0 关闭
        IfCancelRepeatpReq?: 1 | 0, // 是否取消重复请求; 1 yes=取消重复请求; 0 不取消
        IfNull2Empty?: boolean,
        requestMark?: string,
        // [propName: string | number]: any 
    },
}
export type IResponseCfg = { config: IRequestCfg } & Omit<AxiosResponse, 'config'>

export interface IpendingReq {
    name: string;
    cancel: Function;
    pendingCancelSwitch?: Array<any>;
}
export interface objAny { [propName: string | number]: any }
export interface Ires {
    retCode: number|string,
    retMsg:string,
    total: number|string,
    retData: objAny,
    orgResData: objAny,
    isOk: boolean, // 增加判断是否成功的方法，避免后续大量判断 ReqConst['ReturnSuccessCode'].includes(retCode)
}


