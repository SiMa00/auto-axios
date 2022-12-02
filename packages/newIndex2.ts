// 文件 utils/axios.ts


import axios from 'axios'
import { isNotEmpty, isEmpty, deleteNull } from "./utils.js";
import { reqDefaultValCfg } from "./reqDefaultCfg.ts"
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { IReqCfg, cusReqConfig, ILoad, myRequestConfig, IErrListObj, IpendingReq } from "./InterReqCfg"

// import qs from 'qs'


class AutoAxios {
    private instance: AxiosInstance
    private reqConfig: IReqCfg
    private errList?: Array<IErrListObj>

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
    
    static pendingRequest:Array<IpendingReq>

    private reqSuccess(config:myRequestConfig) {
        if (config) {
            const reqMethod = config.method
            const reqParams = config.params
            const reqData = config.data
            const hasHeaders = isNotEmpty(config.headers)
            if (isEmpty(config.customedData)) {
                config.customedData = {}
            }
            
            const loadingSwitch:1|0 = isNotEmpty(config.customedData?.GlobalLoadingSwitch)
                ? config.customedData?.GlobalLoadingSwitch
                : (this.reqConfig.REQ_SWITCH.GlobalLoadingSwitch || reqDefaultValCfg.globalLoadingSwitch)
            
            const errorMsgSwitch:1|0 = isNotEmpty(config.customedData?.GlobalErrMsgSwitch)
                ? config.customedData?.GlobalErrMsgSwitch
                : (this.reqConfig.REQ_SWITCH.GlobalErrMsgSwitch || reqDefaultValCfg.globalErrMsgSwitch)

            if (loadingSwitch === 1) { // 开启了全局 Loading
                this.handleLoading(true)
            }
            

            // 是否删除 空数据 开关; 有时候不能 删除空数据
            let ifNull2Empty = false // 是否把 undefined null 转成 空字符串; 默认不转;
            if (config.customedData && isNotEmpty(config.customedData.ifNull2Empty)) {
                ifNull2Empty = config.customedData.ifNull2Empty!
                delete config.customedData.ifNull2Empty
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


            // 待 优化
            const i18nFd = this.reqConfig.RET_FIELDS_CFG.StorageLang
            const i18n = window.localStorage[i18nFd] || this.reqConfig.REQ_CONST.DefaultLang || reqDefaultValCfg.defaultLang
            if (hasHeaders) {
                config.headers!['accept-language'] = i18n
            }
            
            
            // 方法1 登录接口请求头不带 token
            const token:string = window.localStorage[this.reqConfig.RET_FIELDS_CFG.StorageToken] || ''
            if (isNotEmpty(token) && config.url !== this.reqConfig.REQ_CONST.LoginUrl) {
                if (hasHeaders) {
                    config.headers![this.reqConfig.RET_FIELDS_CFG.HttpToken] = token
                }
                
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
            //     config.customedData[requestCfgObj.RetFieldsCfg.HttpTokenField] = localStorage.getItem([requestCfgObj.RetFieldsCfg.StorageTokenField]) || ''
            // }
            
            /** ************************************** 处理重复请求 start  **************************************/
            if (this.reqConfig.REQ_SWITCH.IfCancelRepeatpReq === 1) { // 取消重复请求
                const { url, method, data = {}, params = {} } = config
                // const { url, method, data = {}, params = {}, pendingCancelSwitch = true } = config
                // // 将数据转为JSON字符串格式，后面比较好对比;
                // // 是否是同一个请求: url method data params都应该相等,但是考虑到 参数里有时间戳的话, 就不可能存在相同的请求了;
                const jData = JSON.stringify(data)
                const jParams = JSON.stringify(params)
                // pendingCancelSwitch
                // 有些公共请求，不受且不应受页面的切换而受到影响的请求，这类请求就不应该在切换路由的时候取消掉了
                // 默认请求 在切换路由时 都要取消
                const requestMark = method === 'get' ? `${method}_${url}_${jParams}` : `${method}_${url}_${jData}`
                const markIndex = AutoAxios.pendingRequest.findIndex(item => item.name === requestMark)
                if (markIndex > -1) {
                    AutoAxios.pendingRequest[markIndex].cancel()
                    AutoAxios.pendingRequest.splice(markIndex, 1)
                }
                // （重新）新建针对这次请求的axios的cancelToken标识
                const CancelToken = axios.CancelToken
                const source = CancelToken.source()
                config.cancelToken = source.token
                
                config.customedData!.requestMark = requestMark // 设置自定义配置requestMark项，主要用于响应拦截中
                AutoAxios.pendingRequest.push({
                    name: requestMark,
                    cancel: source.cancel,
                    // pendingCancelSwitch: pendingCancelSwitch, // 可能会有优先级高于默认设置的 pendingCancelSwitch 项值
                })
            }
            
            if (this.reqConfig.beforeReq) {
                this.reqConfig.beforeReq(config)
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
    // AxiosRequestConfig<myRequestConfig>
    private respSuc(response:AxiosResponse) {
        if (response.config && response.config.customedData) {
            const { requestMark } = response.config.customedData
            if (AutoAxios.pendingRequest.length > 0) {
                const markIndex = AutoAxios.pendingRequest.findIndex(item => item.name === requestMark)
                markIndex > -1 && AutoAxios.pendingRequest.splice(markIndex, 1)
            }

            const hasCusData = response.config && isNotEmpty(response.config.customedData)
            const loadingSwitch = hasCusData && isNotEmpty(response.config.customedData.GlobalLoadingSwitch)
                ? response.config.customedData.GlobalLoadingSwitch
                : (this.reqConfig.REQ_SWITCH.GlobalLoadingSwitch || reqDefaultValCfg.globalLoadingSwitch)
            
            const errorMsgSwitch = hasCusData && isNotEmpty(response.config.customedData.GlobalErrMsgSwitch)
                ? response.config.customedData.GlobalErrMsgSwitch
                : (this.reqConfig.REQ_SWITCH.GlobalErrMsgSwitch || reqDefaultValCfg.globalErrMsgSwitch)
            
            if (loadingSwitch === 1) { // 开启了全局 Loading
                this.handleLoading(false)
            }

            if (response.status === 200 && response.data instanceof Blob) {
                return Promise.resolve({ isOk: true, retData: response.data })
            } else {
                return resHandler(response, errorMsgSwitch === 1, AutoAxios.pendingRequest)
            }
        }
    }
    private respError(error: AxiosError) {
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
    // flag: true show loading
    private handleLoading(flag:boolean):void {
        // NProgress.done()
        if (this.reqConfig.getLoadService) {
            const loadService = this.reqConfig.getLoadService()
            if (loadService && loadService.showLoadMask && loadService.closeLoadMask) {
                if (flag) {
                    loadService.showLoadMask() 
                } else {
                    loadService.closeLoadMask()
                }
            }
        }
    }

    interceptors(){
        this.instance.interceptors.request.use(this.reqSuccess, this.reqError) // 请求拦截器
        this.instance.interceptors.response.use(this.respSuc, this.respError) // 响应拦截器
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
