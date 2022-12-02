
import { requestCfgObj } from './reqConfig'
import { reqWaysDefaultCfg } from './reqDefaultCfg'
// import { deleteNull, isNotEmpty } from './utils'

let myAjax = {}

// 根据 请求方法 处理 请求头
// function getReqNewHeader(oldHeader, method) {
//     let newHeaders = {}
//     if (method === 'get') {
//         newHeaders = {
//             ...(reqWaysDefaultCfg.nocache),
//             ...(requestCfgObj.ReqWaysCfg.nocache),
//             ...(reqWaysDefaultCfg.get),
//             ...(requestCfgObj.ReqWaysCfg.get),
//             ...oldHeader,
//         }
//     } else {
//         newHeaders = {
//             ...(reqWaysDefaultCfg.post),
//             ...(requestCfgObj.ReqWaysCfg.post),
//             ...oldHeader,
//         }
//     }

//     return newHeaders
// }

const httpUtil = async (ajaxCfg = {}) => {
    if (ajaxCfg && ajaxCfg.url) {
        let method = requestCfgObj.ReqWaysCfg.defaultWay.toLowerCase() || reqWaysDefaultCfg.defaultWay.toLowerCase()
        if (ajaxCfg && ajaxCfg.method) {
            method = ajaxCfg.method.toLowerCase()
        }

        try {
            const res = await myAjax(ajaxCfg)

            return Promise.resolve(res)
        } catch (err) {
            return Promise.reject(err)
        }
    } else {
        requestCfgObj.showTipBox('EmptyUrl')
        return new Promise(() => { }) // 中断Promise链
        // return Promise.reject({retCode:'', isSuccessful: false, retMsg: vI18n.t('emptyUrl'), retData: {},})
    }
}

// csrfSwitch === '1' 增删改操作 需鉴权; csrfSwitch !=='1' 无需鉴权
const http = async (ajaxCfg = {}) => {
    const operationFlag = ajaxCfg && ajaxCfg.data && ajaxCfg.data.csrfSwitch && ajaxCfg.data.csrfSwitch === '1'
    if (operationFlag) {
        try {
            const resp = await hCsrf()
            const csrf = {
                csrfToken: resp.retData.csrfToken,
                csrfTokenKey: resp.retData.csrfTokenKey,
                csrfTraceId: resp.retData.csrfTraceId,
            }
            const newAjxCfg = JSON.parse(JSON.stringify(ajaxCfg) || '{}')
            newAjxCfg.headers = {
                ...(newAjxCfg.headers),
                ...csrf,
            }

            const res = await httpUtil(newAjxCfg)
            return Promise.resolve(res)
        } catch (err) {
            return Promise.reject(err)
        }
    } else {
        return httpUtil(ajaxCfg)
    }
}

// hCsrf 不需要预置数据
const hCsrf = async ({ data, headers }) => {
    const ajaxCfg = {
        url: requestCfgObj.ReqConst.AuthOperationUrl || '',
        method: 'post',
        data: {},
        headers,
    }

    return httpUtil(ajaxCfg)
}


export function setHttp(ax) {
    myAjax = ax
}
export function getHttp() {
    return http
}
