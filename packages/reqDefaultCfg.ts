
import type { reqDefault } from "./InterReqCfg"


export const reqDefaultValCfg = {
    timeout: 1 * 60 * 1000, // ms; 默认 1分钟
    defaultLang: 'zh', // TODO 根据系统浏览器
    getErrMsgWay: 'byRes',

    globalErrMsgSwitch: 1,
    globalLoadingSwitch: 0,
    IfCancelRepeatpReq: 0,

    httpLang: 'i18n',
    // defaultReqWay: 'post',
    // defaultHeader: {},
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
