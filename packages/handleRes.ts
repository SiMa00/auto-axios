
import { isEmpty, transNullChar } from './utils'
import reqDefaultValCfg from "./defaultVal"
import type { AutoRequestCfg, IRespConfig, IErrMap, AutoResp, IpendingReq } from "./reqTypes"

function getMsgByCode(respCode:number|string, errorMapIn?:IErrMap):string {
    if (errorMapIn) {
        const key:string = respCode + ''
        const retMsgObj = errorMapIn[key]
        return (retMsgObj && retMsgObj.retMsg)
    } else {
        return 'ErrMapCodeMissing' // 错误码映射缺失
    }
}

// 处理返回数据
function getRetData(reqConfig:AutoRequestCfg, response:IRespConfig, errMap?:IErrMap):AutoResp {
    const retCode = response.data[reqConfig.RET_FIELDS_CFG.RetCode]
    const retMsg = (response.data && response.data[reqConfig.RET_FIELDS_CFG.RetMsg]) || ''
    const res:AutoResp = {
        retCode,
        retMsg,
        total: 0,
        retData: {},
        orgResData: {},
        isOk: false, // 增加判断是否成功的方法，避免后续大量判断 ReqConst['ReturnSuccessCode'].includes(retCode)
    }

    if (isEmpty(response.data)) { // 返回空数据
        res.retMsg = 'EmptyResponseData'
    } else if (isEmpty(retCode)) { // 返回码 为空
        res.retMsg = 'EmptyReturnCode'
    } else if (reqConfig.REQ_CONST.LoginExpiredCode.includes(retCode)) { // 会话超时
        res.retMsg = 'LoginExpired'
    } else if (!reqConfig.REQ_CONST.RetSucCode.includes(retCode)) { // 返回失败
        // 方式1: 先取 respData 的返回消息,若无,再取 错误映射的消息
        // 方式2: 不论有无 respData 的返回消息,直接根据返回码 取 错误映射的消息
        let finalMsg = ''
        const msgWay = reqConfig.REQ_SWITCH.GetErrMsgWay || reqDefaultValCfg.getErrMsgWay
        if (msgWay === 'byMap') {
            finalMsg = getMsgByCode(retCode, errMap)
        } else {
            if (isEmpty(retMsg)) {
                finalMsg = getMsgByCode(retCode, errMap)
            } else {
                finalMsg = retMsg
            }
        }

        res.retMsg = finalMsg
    } else { // 正常返回
        res.retData = transNullChar(response.data[reqConfig.RET_FIELDS_CFG.RetData] || response.data) // 预防一些接口的特殊返回
        res.isOk = reqConfig.REQ_CONST.RetSucCode.includes(retCode)
        res.total = response.data[reqConfig.RET_FIELDS_CFG.RetCount]
        res.orgResData = response.data // 原始返回，以防万一，需要使用
    }

    return res
}

export function getAutoResult(
    reqConfig:AutoRequestCfg,
    response:IRespConfig,
    errMsgFlag:boolean, errMap?:IErrMap,
    pendingReq?:Array<IpendingReq>,
):AutoResp {
    const res0 = getRetData(reqConfig, response, errMap)
    if (res0.isOk === true) {
        return res0
    } else {
        if (errMsgFlag && pendingReq && pendingReq.length === 0) {
            reqConfig.showTipBox(res0.retMsg, res0.retCode, response.status, response)
        }
        
        return res0

        // // 原来的代码
        // if (reqConfig.REQ_CONST.LoginExpiredCode.includes(res0.retCode)) {
        //     return new Promise(() => {}) // 中断Promise链
        // } else {
        //     return Promise.resolve(res0)
        // }
    }
}
