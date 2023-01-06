
import axios from 'axios'
import { cloneDeep } from "lodash"
import { isNotEmpty, isEmpty, deleteNull, isFunc, list2Map, handleMask1 } from "./utils";
import { DEFAULT_VAL } from "./defaultCfg"
import { getAutoResult } from "./handleRes"
import type { AxiosInstance } from 'axios'
import type {
    IAutoRequestCfg,
    ILoad,
    IRespConfig,
    IRequestConfig,
    IAutoResp,
    IErrListItem,
    IpendingReq,
    IErrMap,
} from "./reqTypes"
import { ESwitch } from "./reqTypes"

class AutoAxios {
    private readonly instance: AxiosInstance

    private static errMap:IErrMap = {} // 手动调用 setErrMap 设置
    private static loadService?:ILoad
    static pendingRequest:Array<IpendingReq> = [] // 针对发出去的请求，取消的 + 发不出去的请求，不算

    constructor(private readonly reqConfig: IAutoRequestCfg) {
        this.reqConfig = reqConfig
        
        if (reqConfig.getLoadService && isFunc(reqConfig.getLoadService)) {
            AutoAxios.loadService = reqConfig.getLoadService()
        }

        this.instance = axios.create({
            baseURL: reqConfig.REQ_CONST.BaseUrl,
            headers: {
                ...(DEFAULT_VAL.XssProtection),
                ...reqConfig.REQ_WAYS_CFG?.DefaultHeader,
            },
            timeout: reqConfig.REQ_CONST.Timeout || DEFAULT_VAL.Timeout,
            withCredentials: true, // 跨域携带 cookie
        })

        this.setInterceptors()
    }

    private setInterceptors(){
        // 不 bind 的话，函数里面的 this 会有问题
        this.instance.interceptors.request.use(this.reqSuccess.bind(this), this.reqError.bind(this)) // 请求拦截器
        this.instance.interceptors.response.use(this.respSuc.bind(this), this.respError.bind(this)) // 响应拦截器
    }

    static setErrMap(eList: Array<IErrListItem>) {
        if (isNotEmpty(eList)) {
            AutoAxios.errMap = list2Map(eList, 'retCode')
        }
    }

    private reqSuccess(config:IRequestConfig) {
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
            let loadingSwitch:ESwitch
            if (config.customedData?.GlobalLoadingSwitch) {
                loadingSwitch = <ESwitch>config.customedData?.GlobalLoadingSwitch
            } else {
                loadingSwitch = (this.reqConfig.REQ_SWITCH?.GlobalLoadingSwitch || DEFAULT_VAL.GlobalLoadingSwitch)
                config.customedData!.GlobalLoadingSwitch = loadingSwitch
            }
            
            if (isEmpty(config.customedData?.GlobalErrMsgSwitch)) {
                config.customedData!.GlobalErrMsgSwitch = (this.reqConfig.REQ_SWITCH?.GlobalErrMsgSwitch || DEFAULT_VAL.GlobalErrMsgSwitch)
            }

            if (loadingSwitch === ESwitch.On) { // 开启了全局 Loading
                this.handleLoading(true)
            }
            

            // 是否删除 空数据 开关; 有时候不能 删除空数据
            let myIfNull2Empty = DEFAULT_VAL.IfNull2Empty // 是否把 undefined null 转成 空字符串; 默认不转;
            let myIfHandlePms:boolean = DEFAULT_VAL.IfHandlePms
            if (config.customedData) {
                if (isNotEmpty(config.customedData.IfNull2Empty)) {
                    myIfNull2Empty = config.customedData.IfNull2Empty!
                }
                if (isNotEmpty(config.customedData.IfHandlePms)) {
                    myIfHandlePms = config.customedData.IfHandlePms!
                }
            }
            
            if (reqMethod === 'get') {
                if (isNotEmpty(reqParams) && myIfHandlePms) {
                    config.params = deleteNull(reqParams, myIfNull2Empty)
                }
            } else {
                if (isNotEmpty(reqData) && myIfHandlePms) {
                    config.data = deleteNull(reqData, myIfNull2Empty)
                }
            }


            const i18nKey = this.reqConfig.RET_FIELDS_CFG.LangStorageKey
            const i18nVal = window.localStorage[i18nKey] || this.reqConfig.REQ_CONST.DefaultLang || DEFAULT_VAL.DefaultLang
            const langFd = this.reqConfig.RET_FIELDS_CFG.LangHttpKey || DEFAULT_VAL.LangHttpKey
            if (langFd && i18nVal) {
                config.headers![langFd] = i18nVal
            }
            
            // 方法1 登录接口请求头不带 token
            const tokenVal:string = window.localStorage[this.reqConfig.RET_FIELDS_CFG.TokenStorageKey] || ''
            if (isNotEmpty(tokenVal) && config.url !== this.reqConfig.REQ_CONST.LoginUrl) {
                config.headers![this.reqConfig.RET_FIELDS_CFG.TokenHttpKey] = tokenVal
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
            const reptReqFlag = config.customedData?.IfCancelDupReq || this.reqConfig.REQ_SWITCH?.IfCancelDupReq || DEFAULT_VAL.IfCancelDupReq
            if (reptReqFlag === ESwitch.On) { // 取消重复请求
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
    // error:any
    private reqError() {
        this.handleLoading(false)
        // TODO 开关 单个请求开关
        const mask1Flag = handleMask1(this.reqConfig.REQ_CONST.MaskClassNames)
        if (AutoAxios.pendingRequest.length === 0 && mask1Flag) {
            this.reqConfig.showTipBox('RequstFailed')
        }
        
        return new Promise(() => {}) // 中断Promise链
    }
    
    private respSuc(response:IRespConfig) {
        if (response.config.customedData) {
            const { requestMark } = response.config.customedData
            if (AutoAxios.pendingRequest.length > 0) {
                const markIndex = AutoAxios.pendingRequest.findIndex(item => item.name === requestMark)
                markIndex > -1 && AutoAxios.pendingRequest.splice(markIndex, 1)
            }
        }
        
        const loadingSwitch = <ESwitch>response.config.customedData!.GlobalLoadingSwitch
        if (loadingSwitch === ESwitch.On) { // 开启了全局 Loading
            this.handleLoading(false)
        }

        return response
    }
    private respError(error:any) {
        // 被取消的请求 => cancle 进来的: error.config + error.request 都是 undefined
        if (axios.isCancel(error)) {
            return new Promise(() => {}) // 中断Promise链
        } else { // 错误向下传递
            const mask1Flag = handleMask1(this.reqConfig.REQ_CONST.MaskClassNames)
            
            if (error && error.config && error.config.customedData) {
                if (AutoAxios.pendingRequest.length > 0) {
                    const mIndex = AutoAxios.pendingRequest.findIndex(item => item.name === error.config.customedData.requestMark)
                    if (mIndex > -1) {
                        AutoAxios.pendingRequest.splice(mIndex, 1)
                    } else {
                        AutoAxios.pendingRequest.length > 0 && AutoAxios.pendingRequest.splice(0, 1)
                    }
                }

                if (error.config.customedData.GlobalLoadingSwitch === ESwitch.On) { // 开启过 loading
                    this.handleLoading(false)
                }
            } else {
                // 拿不到 requestMark 时的处理
                AutoAxios.pendingRequest.length > 0 && AutoAxios.pendingRequest.splice(0, 1)
            }

            if (error && error.response && error.response.status) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const hData = error.response && error.response.data
                
                const retCode = (hData && hData[this.reqConfig.RET_FIELDS_CFG.RetCode]) || error.response.status
                const retMsg = (hData && hData[this.reqConfig.RET_FIELDS_CFG.RetMsg])
                const retData = hData || {}

                let tip = ''
                if (retCode >= 400 && retCode < 500) {
                    tip = 'ClientError'
                } else if (retCode >= 500) {
                    tip = 'ServerError'
                } else {
                    tip = 'SystemError'
                }

                if (AutoAxios.pendingRequest.length === 0 && mask1Flag) {
                    // 给用户的提示，要方便理解，后台返回的消息展示上去的话，可能不太容易理解
                    this.reqConfig.showTipBox(
                        `${retMsg || tip}`,
                        retCode,
                        error.response && error.response.status,
                        error.response,
                    )
                }

                return Promise.resolve<IAutoResp>({
                    retCode,
                    retMsg,
                    retData,
                    orgResData: error,
                    isOk: false,
                })
            } else if (error.request) {
                // The request was made but no response was received
                const msgRes = error.message || 'ServerNoResponse'
                if (AutoAxios.pendingRequest.length === 0 && mask1Flag) {
                    this.reqConfig.showTipBox('ServerNoResponse', '', error.response && error.response.status, error)
                }

                return Promise.resolve<IAutoResp>({
                    retCode: '',
                    retMsg: msgRes,
                    retData: {},
                    orgResData: error,
                    isOk: false,
                })
            } else {
                // Something happened in setting up the request that triggered an Error
                const msg = error.message
                let newMsg = ''
                if (error && error.config && error.config.timeout === this.reqConfig.REQ_CONST.Timeout) { // 请求超时
                    newMsg = 'RequestTimeout'
                } else {
                    newMsg = 'RequestError'
                }

                if (AutoAxios.pendingRequest.length === 0 && mask1Flag) {
                    this.reqConfig.showTipBox(newMsg, '', error.response && error.response.status, error)
                }

                return Promise.resolve<IAutoResp>({
                    retCode: '',
                    retMsg: msg || newMsg,
                    retData: {},
                    orgResData: error,
                    isOk: false,
                })
            }
        }
    }

    // flag: true show loading
    private handleLoading(flag:boolean):void {
        if (AutoAxios.loadService) {
            if (flag) {
                // NProgress.start()
                AutoAxios.loadService.showLoadMask()
            } else {
                // NProgress.done()
                AutoAxios.loadService.closeLoadMask()
            }
        }
    }
    private async httpUtil(ajaxCfg:IRequestConfig):Promise<IAutoResp> {
        if (ajaxCfg && ajaxCfg.url) {
            try {
                const response:IRespConfig = await this.instance(ajaxCfg)
                if (response.status === 200 && response.data instanceof Blob) {
                    return {
                        retCode: response.status,
                        retMsg: 'ok',
                        isOk: true,
                        retData: response.data,
                        orgResData: response,
                    }
                } else {
                    const errorMsgSwitch = <ESwitch>response.config.customedData!.GlobalErrMsgSwitch
                    return getAutoResult(this.reqConfig, response, errorMsgSwitch === ESwitch.On, AutoAxios.errMap, AutoAxios.pendingRequest)
                }
            } catch (err) {
                return Promise.resolve<IAutoResp>({ retCode:'', isOk: false, retMsg: 'RequestError', retData: {}, orgResData: { err } })
            }
        } else {
            const msgSwitch = ajaxCfg.customedData?.GlobalErrMsgSwitch || DEFAULT_VAL.GlobalErrMsgSwitch
            if (msgSwitch === ESwitch.On) {
                const mask1Flag = handleMask1(this.reqConfig.REQ_CONST.MaskClassNames)
                mask1Flag && this.reqConfig.showTipBox('EmptyUrl')
            }
            
            return Promise.resolve<IAutoResp>({ retCode:'', isOk: false, retMsg: 'emptyUrl', retData: {}, orgResData: {} })
            // return new Promise(() => {}) // 中断Promise链
        }
    }

    // csrfSwitch === '1' 增删改操作 需鉴权; csrfSwitch !=='1' 无需鉴权
    async http(options:IRequestConfig){
        
        if (options && options.customedData && (options.customedData.CsrfSwitch === ESwitch.On)) {
            try {
                const resp = await this.httpUtil({
                    url: this.reqConfig.REQ_CONST.AuthOperationUrl,
                    method: options.method,
                    headers: options.headers,
                })
                const csrf = {
                    csrfToken: resp.retData.csrfToken,
                    csrfTokenKey: resp.retData.csrfTokenKey,
                    csrfTraceId: resp.retData.csrfTraceId,
                }
                const newOps = cloneDeep(options)
                newOps.headers = { ...(newOps.headers), ...csrf }
                const res = await this.httpUtil(newOps)
                return Promise.resolve(res)
            } catch (err) {
                return Promise.resolve<IAutoResp>({ retCode:'', isOk: false, retMsg: 'RequestError', retData: {}, orgResData: { err } })
            }
        } else {
            return await this.httpUtil(options)
        }
    }
}


export default AutoAxios