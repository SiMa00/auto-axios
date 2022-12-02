
import { Loading } from 'element-ui'

// GetErrorMsgWay: 返回失败 时,
// 方式1 byMap: 不论有无 respData 的返回消息,直接根据返回码 取 错误映射的消息
// 方式2 byRes: 先取 respData 的返回消息,若无,再取 错误映射的消息
export default {
    baseURL: process.env.VUE_APP_BASE_API,
    ReqConst: {
        // AuthOperationUrl: '',
        LoginExpiredCode: ["201101", 1], // 会话超时
        ReturnSuccessCode: [0], // 返回成功
        Timeout: 60, // s; window.systemCfg.reqTimeout, // m * s
        GetErrorMsgWay: "byMap",
        DefaultLang: 'zh',
        GLOBAL_ERROR_MSG_SWITCH: 1, // 全局错误消息 提示开关; 1 开启; 0 关闭
        GLOBAL_LOADING_SWITCH: 1, // 全局等待层 开关; 1 开启; 0 关闭
        LOGIN_URL: '/portal/routing/uaa/login', // login请求的 path部分, 目的：登录请求不带 token过去
        IF_CANCEL_RPREQ: 0, // 是否取消重复请求; 1 yes=取消重复请求; 0 不取消
    },
    RetFieldsCfg: {
        MyRetCode: 'code',
        MyRetMsg: 'msg',
        MyRetData: 'data',
        MyRetCount: 'count', // 列表查询条数 统计字段
        StorageLangField: 'currentLang', // 存储 里的 语言字段
        HttpLangField: 'i18n', // 发送给后台的 语言字段
        StorageTokenField: 'TOKEN',
        HttpTokenField: 'Authorization',
    },
    ReqWaysCfg: {
        defaultWay: 'post',
        defaultHeader: { 'x-tenant-header': 'electronic-commerce' },
        // post: {
        //     dataType: "json",
        //     "Content-Type": "application/json; charset=utf-8",
        // },
        // get: {},
        // xssProtection: {},
        // nocache: {}
    },
    // loadService 对象需要提供 closeLoadMask() + showLoadMask() 方法
    // TODO:可能没有用,待验证; 若实在不行，element不使用自带的 loading，用 spin
    getLoadService() {
        // const load = Loading.service({
        //     lock: true,
        //     text: 'Loading...',
        //     background: 'rgb(228 231 237 / 58%)',
        //     target: 'body'
        // })
        // return load

        const newLoad = Loading
        const opt = {
            lock: true,
            text: 'Loading...',
            background: 'rgb(228 231 237 / 58%)',
            target: 'body',
        }
        newLoad.showLoadMask = () => Loading.service(opt)
        newLoad.closeLoadMask = newLoad.close

        return newLoad
    },
    showTipBox(msg, retCode) {
        console.log('showTipBox >>', msg, retCode)
    },
}
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
