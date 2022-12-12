
import { setLoadService } from "./reqLoading"
import { setErrMap } from "./handleRes"
import { setRequestCfg } from "./reqConfig"
import { setMyAxios, setInterceptors, pendingReqList } from "./myAxios"
import { setHttp, getHttp } from "./httpUtil"

export default {
    pendingReqList,
    setLoadService,
    setErrMap,
    setRequestCfg,
    setMyAxios,
    setInterceptors,
    setHttp,
    getHttp,
}
