
import { isEmpty, list2Map, transNullChar } from './utils'
import { requestCfgObj } from './reqConfig'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { IAutoRequestCfg, ILoad, IResponseCfg, IRequestCfg, IErrItem, IpendingReq } from "./reqTypes"

let ErrorMap = {}
function getMsgByCode(respDataCode:number|string):string {
    const key:string = respDataCode + ''
    const retMsgObj = ErrorMap[key]
    return (retMsgObj && retMsgObj.retMsg) || 'ErrMapCodeMissing' // 错误码映射缺失
}

// 处理返回数据
export const getRetData = (response:IResponseCfg) => {
    const retCode = response.data[requestCfgObj.RetFieldsCfg.MyRetCode]
    const retMsg = (response.data && response.data[requestCfgObj.RetFieldsCfg.MyRetMsg]) || ''
    const res = {
        retCode,
        retMsg,
        retData: {},
        isOk: false, // 增加判断是否成功的方法，避免后续大量判断 ReqConst['ReturnSuccessCode'].includes(retCode)
    }

    if (isEmpty(response.data)) { // 返回空数据
        res.retMsg = 'EmptyResponseData'
    } else if (isEmpty(retCode)) { // 返回码 为空
        res.retMsg = 'EmptyReturnCode'
    } else if (requestCfgObj.ReqConst.LoginExpiredCode.includes(retCode)) { // 会话超时
        res.retMsg = 'LoginExpired'
    } else if (!requestCfgObj.ReqConst.ReturnSuccessCode.includes(retCode)) { // 返回失败
        // 方式1: 先取 respData 的返回消息,若无,再取 错误映射的消息
        // 方式2: 不论有无 respData 的返回消息,直接根据返回码 取 错误映射的消息
        let finalMsg = ''
        if (requestCfgObj.ReqConst.getErrorMsgWay === 'byMap') {
            finalMsg = getMsgByCode(retCode)
        } else {
            if (isEmpty(retMsg)) {
                finalMsg = getMsgByCode(retCode)
            } else {
                finalMsg = retMsg
            }
        }

        res.retMsg = finalMsg
    } else { // 正常返回
        res.retData = transNullChar(response.data[requestCfgObj.RetFieldsCfg.MyRetData] || response.data) // 预防一些接口的特殊返回
        res.isOk = requestCfgObj.ReqConst.ReturnSuccessCode.includes(retCode)
        res.total = response.data[requestCfgObj.RetFieldsCfg.MyRetCount]
        res.orgResData = response.data // 原始返回，以防万一，需要使用
    }

    return res
}

// 全局错误消息提示处理
export function resHandler(response:IResponseCfg, errorMsgFlag:boolean, pendingRequest:Array<IpendingReq>) {
    const res0 = getRetData(response)
    if (res0.isOk !== true) {
        if (errorMsgFlag && pendingRequest.length === 0) {
            requestCfgObj.showTipBox(res0.retMsg, res0.retCode, response.status)
        }

        if (requestCfgObj.ReqConst.LoginExpiredCode.includes(res0.retCode)) {
            return new Promise(() => {}) // 中断Promise链
        } else {
            return res0
        }
    } else {
        return res0
    }
}

export function setErrMap(arr) {
    ErrorMap = list2Map(arr, 'retCode')
}
