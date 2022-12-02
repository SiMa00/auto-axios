// 文件 utils/axios.ts


import axios from 'axios'
import { reqWaysDefaultCfg } from "./reqWaysDefaultCfg"
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { IReqCfg, ILoad, IErrListObj } from "./InterReqCfg"


class HttpRequest {
    // private readonly baseUrl: string;
    errList: Array<IErrListObj>
    reqConfig: IReqCfg
    // axiosInstance: AxiosInstance // TODO

    // loadService: ILoad
    // pendingReqList: []
    constructor(reqConfig0: IReqCfg, errList0: Array<IErrListObj>) {
        // this.baseUrl = 'http://localhost:3000'
        this.reqConfig = reqConfig0
        this.errList = errList0
    }
    getInsideConfig() {
        const config = {
            // baseURL: this.baseUrl,
            headers: {
                //
            },
        }
        return config
    }

    // 请求拦截
    interceptors(instance: AxiosInstance, url: string | number | undefined) {
        instance.interceptors.request.use(config => {
            // 添加全局的loading..
            // 请求头携带token
            return config
        }, (error: any) => {
            return Promise.reject(error)
        })
        
        // 响应拦截
        instance.interceptors.response.use(res => {
            // 返回数据
            const {data} = res
            console.log('返回数据处理',res)
            return data
        }, (error: any) => {
            console.log('error==>',error)
            return Promise.reject(error)
        })
    }

    request(options: AxiosRequestConfig) {
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig(), options)
        this.interceptors(instance, options.url)
        return instance(options)
    }
}

const http = new HttpRequest()
export default http
