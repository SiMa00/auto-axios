

export const isEmpty = (b) => {
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

export const isNotEmpty = (b) => {
    return !isEmpty(b)
}

export const list2Map = (list, key = 'id') => {
    const map = {}
    if (list) {
        for (let index = 0; index < list.length; index++) {
            const val = list[index][key]
            map[val] = list[index]
        }
    }
    return map
}

export const isStringData = (str) => {
    return Object.prototype.toString.call(str) === "[object String]"
}
export const isNumber = (str) => {
    return Object.prototype.toString.call(str) === '[object Number]'
}
export function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}

// 把 返回结果里 带 空的，转成 undefined; 方便antd undefined时显示 placeHolder
export const transNullChar = (obj, transUndefined = true) => {
    if (obj && isObject(obj)) {
        const temObj = {}

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const val = obj[key]
                const f1 = isStringData(val) && (val.trim() === '')
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
export const deleteNull = (obj, trans2EmptyChar = false, trim = true) => {
    if (obj && isObject(obj)) {
        const temObj = {}
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
                            if (trim === true && isStringData(val)) {
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
