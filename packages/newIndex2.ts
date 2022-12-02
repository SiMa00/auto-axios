// 文件 utils/axios.ts


import axios from 'axios'
import { isNotEmpty, deleteNull } from "./utils.js";
import { reqDefaultValCfg } from "./reqDefaultCfg.ts"
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { IReqCfg, cusReqConfig, ILoad, IErrListObj } from "./InterReqCfg"

// import qs from 'qs'


class AutoAxios {
    instance: AxiosInstance
    
    reqConfig: IReqCfg
    errList?: Array<IErrListObj>

    constructor(reqConfig0: IReqCfg, errList0: Array<IErrListObj>) {
        this.reqConfig = reqConfig0
        this.errList = errList0

        this.instance = axios.create({
            baseURL: reqConfig0.REQ_CONST.BaseUrl,
            headers: {
                ...(reqDefaultValCfg.xssProtection),
                ...reqConfig0.REQ_WAYS_CFG?.DefaultHeader,
            },
            timeout: reqConfig0.REQ_CONST.Timeout || reqDefaultValCfg.timeout,
            withCredentials: true, // 跨域携带 cookie
        })

        this.interceptors()
    }
    
    private reqSuccess(config:cusReqConfig) {
        if (config) {
            const reqMethod = config.method
            const reqParams = config.params
            const reqData = config.data
            
            const loadingSwitch = isNotEmpty(config.headers?.globalLoadingSwitch)
                ? config.headers?.globalLoadingSwitch
                : this.reqConfig.REQ_SWITCH.GlobalLoadingSwitch

            const errorMsgSwitch = isNotEmpty(config.headers?.globalErrorMsgSwitch)
                ? config.headers?.globalErrorMsgSwitch
                : this.reqConfig.REQ_SWITCH.GlobalErrMsgSwitch
            if (loadingSwitch === 1) { // 开启全局 Loading
                // NProgress.start()
                if (this.reqConfig.getLoadService) {
                    const loadService = this.reqConfig.getLoadService()
                    if (loadService && loadService.showLoadMask) {
                        loadService.showLoadMask()
                    }
                }
                
            }

            // 是否删除 空数据 开关; 有时候不能 删除空数据
            let ifNull2Empty:boolean | undefined = false // 是否把 undefined null 转成 空字符串; 默认不转;
            if (config.headers && isNotEmpty(config.headers.ifNull2Empty)) {
                ifNull2Empty = config.headers?.ifNull2Empty
                delete config.headers.ifNull2Empty
            }
            if (reqMethod === 'get') {
                if (isNotEmpty(reqParams)) {
                    config.params = deleteNull(reqParams, ifNull2Empty)
                }
            } else {
                if (isNotEmpty(reqData)) {
                    config.data = deleteNull(reqData, ifNull2Empty)
                }
            }


            // 把自定义 头的配置,移到 config.customedData 里
            config.customedData = {
                GlobalLoadingSwitch: loadingSwitch,
                GlobalErrMsgSwitch: errorMsgSwitch,
            }
            delete config.headers.GlobalLoadingSwitch
            delete config.headers.GlobalErrMsgSwitch

            // 待 优化
            
            const i18n = localStorage.getItem([this.reqConfig.RET_FIELDS_CFG.StorageLang]) || this.reqConfig.REQ_CONST.DefaultLang
            // config.headers[requestCfgObj.RetFieldsCfg.HttpLangField] = i18n
            config.headers['accept-language'] = i18n

            // 方法1 登录接口请求头不带 token
            const token = localStorage.getItem([requestCfgObj.RetFieldsCfg.StorageTokenField]) || ''
            if (isNotEmpty(token) && config.url !== requestCfgObj.ReqConst.LOGIN_URL) {
                config.headers[requestCfgObj.RetFieldsCfg.HttpTokenField] = token
            }
            // 方法2 登录接口请求头不带 token
            // const hasPms = isNotEmpty(config.params)
            // const hasData = isNotEmpty(config.data)
            // if ((hasPms && config.params.isLoginReq === true) || (hasData && config.data.isLoginReq === true)) {
            //     if (hasPms) {
            //         delete config.params.isLoginReq
            //     }
            //     if (hasData) {
            //         delete config.data.isLoginReq
            //     }
            // } else {
            //     config.headers[requestCfgObj.RetFieldsCfg.HttpTokenField] = localStorage.getItem([requestCfgObj.RetFieldsCfg.StorageTokenField]) || ''
            // }

            /** ************************************** 处理重复请求 start  **************************************/
            if (requestCfgObj.ReqConst.IF_CANCEL_RPREQ === 1) { // 取消重复请求
                const { url, method, data = {}, params = {}, pendingCancelSwitch = true } = config
                // // 将数据转为JSON字符串格式，后面比较好对比;
                // // 是否是同一个请求: url method data params都应该相等,但是考虑到 参数里有时间戳的话, 就不可能存在相同的请求了;
                const jData = JSON.stringify(data)
                const jParams = JSON.stringify(params)

                // pendingCancelSwitch
                // 有些公共请求，不受且不应受页面的切换而受到影响的请求，这类请求就不应该在切换路由的时候取消掉了
                // 默认请求 在切换路由时 都要取消
                const requestMark = method === 'get' ? `${method}_${url}_${jParams}` : `${method}_${url}_${jData}`
                const markIndex = pendingRequest.findIndex(item => item.name === requestMark)
                if (markIndex > -1) {
                    pendingRequest[markIndex].cancel()
                    pendingRequest.splice(markIndex, 1)
                }
                // （重新）新建针对这次请求的axios的cancelToken标识
                const CancelToken = axios.CancelToken
                const source = CancelToken.source()
                config.cancelToken = source.token
                config.requestMark = requestMark // 设置自定义配置requestMark项，主要用于响应拦截中
                pendingRequest.push({
                    name: requestMark,
                    cancel: source.cancel,
                    pendingCancelSwitch: pendingCancelSwitch, // 可能会有优先级高于默认设置的 pendingCancelSwitch 项值
                })
            }

            if (requestCfgObj.beforeReq) {
                requestCfgObj.beforeReq(config)
            }
        }

        return config
    }
    private reqError() {
        // NProgress.done()
        hideLoading()
        requestCfgObj.showTipBox('RequstFailed')
        return new Promise(() => {}) // 中断Promise链
    }
    
    private respSuc(response) {
        const { requestMark } = response.config
        if (pendingRequest.length > 0) {
            const markIndex = pendingRequest.findIndex(item => item.name === requestMark)
            markIndex > -1 && pendingRequest.splice(markIndex, 1)
        }

        const loadingSwitch = isNotEmpty(response.config.customedData) &&
            isNotEmpty(response.config.customedData.globalLoadingSwitch)
            ? response.config.customedData.globalLoadingSwitch
            : requestCfgObj.ReqConst.GLOBAL_LOADING_SWITCH
        const errorMsgSwitch = isNotEmpty(response.config.customedData) &&
            isNotEmpty(response.config.customedData.globalErrorMsgSwitch)
            ? response.config.customedData.globalErrorMsgSwitch
            : requestCfgObj.ReqConst.GLOBAL_ERROR_MSG_SWITCH
        if (loadingSwitch === 1) { // 开启了 全局 Loading
            // NProgress.done()
            hideLoading()
        }
        if (response.status === 200 && response.data instanceof Blob) {
            return Promise.resolve({ isOk: true, retData: response.data })
        } else {
            return resHandler(response, errorMsgSwitch === 1, pendingRequest)
        }
    }
    private respError(error) {
        // NProgress.done()
        hideLoading()

        // 被取消的请求 => cancle 进来的: error.config + error.request 都是 undefined
        if (axios.isCancel(error)) {
            return new Promise(() => {}) // 中断Promise链
        } else { // 错误向下传递
            if (error && error.config) {
                if (pendingRequest.length > 0) {
                    const mIndex = pendingRequest.findIndex(item => item.name === error.config.requestMark)
                    if (mIndex > -1) {
                        pendingRequest.splice(mIndex, 1)
                    } else {
                        pendingRequest.length > 0 && pendingRequest.splice(0, 1)
                    }
                }
            } else { // 拿不到 requestMark 时的处理
                pendingRequest.length > 0 && pendingRequest.splice(0, 1)
            }

            if (error && error.response && error.response.status) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const hData = error.response && error.response.data
                const retCode = (hData && hData[requestCfgObj.RetFieldsCfg.MyRetCode]) || error.response.status || ''
                const retMsg = (hData && hData[requestCfgObj.RetFieldsCfg.MyRetMsg]) || error.response.statusText || ''
                const retData = hData || {}

                let tip = ''
                if (retCode >= 400 && retCode < 500) {
                    tip = 'ClientError'
                } else if (retCode >= 500) {
                    tip = 'ServerError'
                } else {
                    tip = 'SystemError'
                }

                if (pendingRequest.length === 0) {
                    // 给用户的提示，要方便理解，后台返回的消息展示上去的话，可能不太容易理解
                    requestCfgObj.showTipBox(
                        `${(hData && hData[requestCfgObj.RetFieldsCfg.MyRetMsg]) || tip}`,
                        retCode,
                        error.response && error.response.status,
                        error.response,
                        error,
                    )
                }

                return Promise.resolve({
                    retCode,
                    retMsg,
                    retData,
                    isOk: false,
                })
            } else if (error.request) {
                // The request was made but no response was received
                const msgRes = error.message || 'ServerNoResponse'
                if (pendingRequest.length === 0) {
                    requestCfgObj.showTipBox('ServerNoResponse', '', error.response && error.response.status, error.response, error)
                }

                return Promise.resolve({
                    retCode: '',
                    retMsg: msgRes,
                    retData: {},
                    isOk: false,
                })
            } else {
                // Something happened in setting up the request that triggered an Error
                const msg = error.message || ''
                let newMsg = ''
                if (error && error.config && error.config.timeout === requestCfgObj.ReqConst.Timeout) { // 请求超时
                    newMsg = 'RequestTimeout'
                } else {
                    newMsg = 'SystemError'
                }

                if (pendingRequest.length === 0) {
                    requestCfgObj.showTipBox(newMsg, '', error.response && error.response.status, error.response, error)
                }

                return Promise.resolve({
                    retCode: '',
                    retMsg: msg || newMsg,
                    retData: {},
                    isOk: false,
                })
            }
        }
    }

    interceptors(){
        // 请求拦截器
        this.instance.interceptors.request.use(this.reqSuccess, this.reqError)
        // 响应拦截器
        this.instance.interceptors.response.use(this.respSuc, this.respError)
    }

    request(options:AxiosRequestConfig){
        // const loading = ref(true)
        // const res = ref(null)
        // const errMsg = ref(null)
        // return this.instance(options).then(response => {
        //     // res.value = response;
        // }).catch(e => {
        //     errMsg.value = e.message || '未知错误'
        // })
    }

}


export default new Http()
