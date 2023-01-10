
import { DEFAULT_VAL } from "./defaultCfg";
import type { IObjAny } from "./reqTypes"

export function isEmpty<T>(b:T):boolean {
    if (b == null) {
        return true
    }
    if (typeof (b) === 'string') {
        if (b.trim() === 'undefined' || b.trim() === '') {
            return true
        }
    } else if (typeof (b) === 'object') {
        for (const name in b) {
            if (Object.hasOwnProperty.call(b, name)) {
                return false
            }
        }
        return true
    }
    return false
}
export function isNotEmpty<T>(b:T):boolean {
    return !isEmpty(b)
}


export function list2Map(list: Array<IObjAny>, key:string|number = 'id') {
    const map:IObjAny = {}
    if (list) {
        for (let index = 0; index < list.length; index++) {
            const val = list[index][key]
            map[val] = list[index]
        }
    }

    return map
}

export function isArray<T>(arr:Array<T>) {
    return Object.prototype.toString.call(arr) === "[object Array]"
}
export function isFunc<T>(fn:T) {
    return Object.prototype.toString.call(fn) === "[object Function]"
}
export function isAsyncFunc<T>(fn:T) {
    return Object.prototype.toString.call(fn) === "[object AsyncFunction]"
}
export function isObject(obj:IObjAny) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}
export function isString(str:string) {
    return Object.prototype.toString.call(str) === "[object String]"
}
export function isBool(b:boolean) {
    return Object.prototype.toString.call(b) === '[object Boolean]'
}
export function isPromise<T>(p:T) {
    return Object.prototype.toString.call(p) === "[object Promise]"
}
export function isNumber(n:number) {
    return Object.prototype.toString.call(n) === '[object Number]'
}

// 把 返回结果里 带 空的，转成 undefined; 方便antd undefined时显示 placeHolder
export function transNullChar(obj:IObjAny, transUndefined:boolean = true) {
    if (obj && isObject(obj)) {
        const temObj:IObjAny = {}

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const val = obj[key]
                const f1 = isString(val) && (val.trim() === '')
                if (transUndefined && (f1 || val === null)) {
                    temObj[key] = undefined
                } else {
                    temObj[key] = val
                }
            }
        }

        return temObj
    } else {
        return obj
    }
}

// trans2EmptyChar 是否需要把 null + Undefined + '' 的值转成 空字符串
// 默认不转 空的话，不会加入参数里
export function deleteNull(obj:IObjAny, trans2EmptyChar:boolean = false, trim:boolean = true) {
    if (obj && isObject(obj)) {
        const temObj:IObjAny = {}
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const val = obj[key]
                const nFlag = isNumber(val) // isNumber(NaN) true; isNaN(NaN) true

                if ((nFlag && !isNaN(val)) || (!nFlag)) {
                    if (isEmpty(val) && trans2EmptyChar) {
                        temObj[key] = ''
                    } else {
                        if (isNotEmpty(val)) {
                            let rStr = val
                            if (trim === true && isString(val)) {
                                rStr = val.trim()
                            }
                            temObj[key] = rStr
                        }
                    }
                }
            }
        }

        return temObj
    } else {
        return obj
    }
}
// true 放开不控制 弹框; false 不能再弹框了
export async function handleMask1(maskClassNames?:Array<string>):Promise<boolean> {
    let flag = true
    const classArr = maskClassNames || DEFAULT_VAL.MaskClassNames
    
    // for (let i = 0; i < classArr.length; i++) {
    //     const ele = classArr[i]
    //     const dom = document.querySelector(ele)
    //     if (dom) {
    //         flag = false
    //     }
    // }

    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            for (let i = 0; i < classArr.length; i++) {
                const ele = classArr[i]
                const dom = document.querySelector(ele)
                if (dom) {
                    flag = false
                }
                
            }
            resolve(flag)
        }, 200)
    })
}
