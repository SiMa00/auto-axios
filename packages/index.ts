

// import { setLoadService } from "./reqLoading"
// import { setErrMap } from "./handleRes"
// import { setRequestCfg } from "./reqConfig"
// import { setMyAxios, setInterceptors, pendingReqList } from "./myAxios"
// import { setHttp, getHttp } from "./httpUtil"

// export default {
//     pendingReqList,

//     setLoadService,
//     setErrMap,
//     setRequestCfg,
//     setMyAxios,
//     setInterceptors,
//     setHttp,
//     getHttp,
// }

// const {
//     setErrMap,
//     setRequestCfg,
//     setMyAxios,
//     setInterceptors,
//     setHttp,
//     getHttp,
// } = autoHttp

// setErrMap(errList)
// setRequestCfg(reqConfig)
// const axObj = setMyAxios()
// setInterceptors(axObj)
// setHttp(axObj)
// const http = getHttp()

// export default http
import axios from 'axios'

import { IReqCfg, ILoad, IErrListObj } from "./InterReqCfg"
import { reqWaysDefaultCfg } from "./reqWaysDefaultCfg"

class AutoAxios {
    errList: Array<IErrListObj>
    reqConfig: IReqCfg
    axiosInstance: Object // TODO

    initOrgCfg: {}
    loadService: ILoad
    pendingReqList: []
    constructor(reqConfig0: IReqCfg, errList0: Array<IErrListObj>) {
        this.reqConfig = reqConfig0
        this.errList = errList0
        
    }

    setLoadService(load) {
        this.loadService = load
    }
    setRequestCfg() {}
    setMyAxios() {}
    setInterceptors() {}
    setHttp() {
        this.axiosInstance = axios.create({
            baseURL: this.reqConfig.BASE_URL, // requestCfgObj.baseURL,
            headers: {
                ...(reqWaysDefaultCfg.xssProtection),
                ...(requestCfgObj.ReqWaysCfg.xssProtection),
                ...(reqWaysDefaultCfg.defaultHeader),
                ...(requestCfgObj.ReqWaysCfg.defaultHeader),
            },
            withCredentials: true, // send cookies when cross-domain requests
            timeout: requestCfgObj.ReqConst.Timeout * 1000,
            // transformResponse,
        })
    }
    getHttp() {}
}