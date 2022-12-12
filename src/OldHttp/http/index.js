
// import ax from "../http0/entryHttp";
import errorArray from "./errorMap"
import reqConfig, { getLoadService } from "./reqConfig"

import autoHttp from 'auto-cfg-axios'

const {
    pendingReqList,
    setLoadService,
    setErrMap,
    setRequestCfg,
    setMyAxios,
    setInterceptors,
    setHttp,
    getHttp,
} = autoHttp

setLoadService(getLoadService)
setErrMap(errorArray)
setRequestCfg(reqConfig)
const axObj = setMyAxios()
setInterceptors(axObj)
setHttp(axObj)
const http = getHttp()

export default http
