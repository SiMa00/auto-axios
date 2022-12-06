
import type { IReqDefaultVal } from "./reqTypes"

const defaultVal:IReqDefaultVal = {
    timeout: 1 * 60 * 1000, // ms; 默认 1分钟
    defaultLang: 'zh', // TODO 根据系统浏览器

    getErrMsgWay: 'byRes',
    globalErrMsgSwitch: 1, // 1 开启; 0 关闭
    globalLoadingSwitch: 0, // 1 开启; 0 关闭
    IfCancelRepeatpReq: 0, // 是否取消重复请求; 1 取消重复请求; 0 不取消

    langHttpKey: 'accept-language',
    defaultReqWay: 'post',
    post: {},
    get: {},
    xssProtection: {
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
    },
    // nocache: {
    //     Pragma: "no-cache",
    //     "Cache-Control": "no-cache",
    //     Expires: 0,
    // },
}
export default defaultVal
