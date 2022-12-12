
import lodash from 'lodash'

let loading
let getLoadServiceFn
let needLoadingRequestCount = 0 // 当前正在请求的数量

// 防抖：将 600ms 间隔内的关闭 loading 便合并为一次。防止连续请求时， loading闪烁的问题。
const toHideLoading = lodash.debounce(() => {
    if (loading) {
        loading.closeLoadMask()
        loading = null
    }
}, 600)

export const hideLoading = () => {
    needLoadingRequestCount--
    needLoadingRequestCount = Math.max(needLoadingRequestCount, 0) // 做个保护
    if (needLoadingRequestCount === 0) {
        toHideLoading()
    }
}

export const showLoading = () => {
    // 后面这个判断很重要，因为关闭时加了抖动，此时loading对象可能还存在，
    // 但needLoadingRequestCount已经变成0.避免这种情况下会重新创建个loading
    if (needLoadingRequestCount === 0 && !loading) {
        loading = getLoadServiceFn()
        loading.showLoadMask()
    }
    needLoadingRequestCount++
}


export function setLoadService(loadFn) {
    getLoadServiceFn = loadFn
}
