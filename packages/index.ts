// 文件 utils/axios.ts


import axios from 'axios'
import { isNotEmpty, isEmpty, deleteNull, isFunc } from "./utils.js";
import { reqDefaultValCfg } from "./defaultVal"
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { IReqCfg, ILoad, myResponseConfig, myRequestConfig, IErrListObj, IpendingReq } from "./reqTypes"
// import qs from 'qs'

// TODO 测试完毕后，带泛型
class AutoAxios<R, E> {
    private instance: AxiosInstance
    private loadService?: ILoad

    constructor(private reqConfig: IReqCfg, private errList?: Array<IErrListObj>) {
        this.reqConfig = reqConfig
        this.errList = errList
        
        if (reqConfig.getLoadService && isFunc(reqConfig.getLoadService)) {
            this.loadService = reqConfig.getLoadService()
        }

        this.instance = axios.create({
            baseURL: reqConfig.REQ_CONST.BaseUrl,
            headers: {
                ...(reqDefaultValCfg.xssProtection),
                ...reqConfig.REQ_WAYS_CFG?.DefaultHeader,
            },
            timeout: reqConfig.REQ_CONST.Timeout || reqDefaultValCfg.timeout,
            withCredentials: true, // 跨域携带 cookie
        })

        this.setInterceptors()
    }
    
    static pendingRequest:Array<IpendingReq>

    private reqSuccess(config:myRequestConfig) {
        if (config) {
            const reqMethod = config.method
            const reqParams = config.params
            const reqData = config.data

            // 预置 {} 防止报错 cant read undefined
            if (isEmpty(config.headers)) {
                config.headers = {}
            }
            if (isEmpty(config.customedData)) {
                config.customedData = {}
            }
            
            // customedData 里存好值，res 里不用重复判断取值
            let loadingSwitch:0|1
            if (isEmpty(config.customedData?.GlobalLoadingSwitch)) {
                loadingSwitch = (this.reqConfig.REQ_SWITCH.GlobalLoadingSwitch || reqDefaultValCfg.globalLoadingSwitch)
                config.customedData!.GlobalLoadingSwitch = loadingSwitch
            } else {
                loadingSwitch = <0|1>config.customedData?.GlobalLoadingSwitch
            }
            
            if (isEmpty(config.customedData?.GlobalErrMsgSwitch)) {
                config.customedData!.GlobalErrMsgSwitch = (this.reqConfig.REQ_SWITCH.GlobalErrMsgSwitch || reqDefaultValCfg.globalErrMsgSwitch)
            }

            if (loadingSwitch === 1) { // 开启了全局 Loading
                this.handleLoading(true)
            }
            

            // 是否删除 空数据 开关; 有时候不能 删除空数据
            let myIfNull2Empty = false // 是否把 undefined null 转成 空字符串; 默认不转;
            if (config.customedData && isNotEmpty(config.customedData.IfNull2Empty)) {
                myIfNull2Empty = config.customedData.IfNull2Empty!
            }
            
            if (reqMethod === 'get') {
                if (isNotEmpty(reqParams)) {
                    config.params = deleteNull(reqParams, myIfNull2Empty)
                }
            } else {
                if (isNotEmpty(reqData)) {
                    config.data = deleteNull(reqData, myIfNull2Empty)
                }
            }


            const i18nKey = this.reqConfig.RET_FIELDS_CFG.StorageLangKey
            const i18nVal = window.localStorage[i18nKey] || this.reqConfig.REQ_CONST.DefaultLang || reqDefaultValCfg.defaultLang
            const langFd = this.reqConfig.RET_FIELDS_CFG.HttpLangKey || reqDefaultValCfg.httpLangKey
            if (langFd) {
                config.headers![langFd] = i18nVal
            }
            
            // 方法1 登录接口请求头不带 token
            const tokenVal:string = window.localStorage[this.reqConfig.RET_FIELDS_CFG.StorageTokenKey] || ''
            if (isNotEmpty(tokenVal) && config.url !== this.reqConfig.REQ_CONST.LoginUrl) {
                config.headers![this.reqConfig.RET_FIELDS_CFG.HttpTokenKey] = tokenVal
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
            
            if (this.reqConfig.beforeReq && isFunc(this.reqConfig.beforeReq)) {
                this.reqConfig.beforeReq(config)
            }
        }

        return config
    }
    private reqError(error) {
        this.handleLoading(false)
        // TODO 开关
        this.reqConfig.showTipBox('RequstFailed')
        return new Promise(() => {}) // 中断Promise链
    }
    
    private respSuc(response:myResponseConfig) {
        if (response.config && response.config.customedData) {
            const { requestMark } = response.config.customedData
            if (AutoAxios.pendingRequest.length > 0) {
                const markIndex = AutoAxios.pendingRequest.findIndex(item => item.name === requestMark)
                markIndex > -1 && AutoAxios.pendingRequest.splice(markIndex, 1)
            }

            const loadingSwitch = response.config.customedData.GlobalLoadingSwitch
            const errorMsgSwitch = response.config.customedData.GlobalErrMsgSwitch
            
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
    private respError(error: any) {
        this.handleLoading(false)

        // 被取消的请求 => cancle 进来的: error.config + error.request 都是 undefined
        if (axios.isCancel(error)) {
            return new Promise(() => {}) // 中断Promise链
        } else { // 错误向下传递
            if (error && error.config) {
                if (AutoAxios.pendingRequest.length > 0) {
                    const mIndex = AutoAxios.pendingRequest.findIndex(item => item.name === error.config.requestMark)
                    if (mIndex > -1) {
                        AutoAxios.pendingRequest.splice(mIndex, 1)
                    } else {
                        AutoAxios.pendingRequest.length > 0 && AutoAxios.pendingRequest.splice(0, 1)
                    }
                }
            } else { // 拿不到 requestMark 时的处理
                AutoAxios.pendingRequest.length > 0 && AutoAxios.pendingRequest.splice(0, 1)
            }

            if (error && error.response && error.response.status) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const hData = error.response && error.response.data
                
                const retCode = (hData && hData[this.reqConfig.RET_FIELDS_CFG.RetCode]) || error.response.status || ''
                const retMsg = (hData && hData[this.reqConfig.RET_FIELDS_CFG.RetMsg]) || error.response.statusText || ''
                const retData = hData || {}

                let tip = ''
                if (retCode >= 400 && retCode < 500) {
                    tip = 'ClientError'
                } else if (retCode >= 500) {
                    tip = 'ServerError'
                } else {
                    tip = 'SystemError'
                }

                if (AutoAxios.pendingRequest.length === 0) {
                    // 给用户的提示，要方便理解，后台返回的消息展示上去的话，可能不太容易理解
                    this.reqConfig.showTipBox(
                        `${(hData && hData[this.reqConfig.RET_FIELDS_CFG.RetMsg]) || tip}`,
                        retCode,
                        error.response && error.response.status,
                        error.response,
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
                if (AutoAxios.pendingRequest.length === 0) {
                    this.reqConfig.showTipBox('ServerNoResponse', '', error.response && error.response.status, error)
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
                if (error && error.config && error.config.timeout === this.reqConfig.REQ_CONST.Timeout) { // 请求超时
                    newMsg = 'RequestTimeout'
                } else {
                    newMsg = 'SystemError'
                }

                if (AutoAxios.pendingRequest.length === 0) {
                    this.reqConfig.showTipBox(newMsg, '', error.response && error.response.status, error)
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
        if (this.loadService && this.loadService.showLoadMask && this.loadService.closeLoadMask) {
            if (flag) {
                // NProgress.start()
                this.loadService.showLoadMask() 
            } else {
                // NProgress.done()
                this.loadService.closeLoadMask()
            }
        }
    }

    setInterceptors(){
        this.instance.interceptors.request.use(this.reqSuccess, this.reqError) // 请求拦截器
        this.instance.interceptors.response.use(this.respSuc, this.respError) // 响应拦截器
    }

    request(options:AxiosRequestConfig){
        return this.instance(options)
    }

}


export default AutoAxios
