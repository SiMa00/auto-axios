

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

import type { IObjAny, IObj, TBaseNull } from "./types"

/**
 * @description 验证是否为 '' null undefined {} []
 * @return {boolean}
 * @example
 *  isEmpty(0)      false   注意 数字 0 在这里不为空;
 *  isEmpty(1)      false
 *  isEmpty(false)  false
 *
 *  isEmpty('   ')  true
 *  isEmpty({})     true
 *  isEmpty([])     true
 *  isEmpty(null),     true
 *  isEmpty(undefined) true
 */
export function isEmpty<T>(b:T) {
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
export function isNotEmpty<T>(b:T) {
    return !isEmpty(b)
}

/**
 * 处理对象数据里的 空字段属性
 * @param obj 
 * @param trans2EmptyChar 是否把 空 转成 空字符串;默认 false 
 * @param trim 是否清除左右空字符串;默认 true
 * @returns OBJ
 */
export function deleteNull(obj:IObjAny, trans2EmptyChar:boolean = false, trim:boolean = true) {
    if (obj && isObjectVal(obj)) {
        const temObj:IObjAny = {}
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const val = obj[key]
                const nFlag = isNumberVal(val) // isNumberVal(NaN) true; isNaN(NaN) true

                if ((nFlag && !isNaN(val)) || (!nFlag)) {
                    if (isEmpty(val) && trans2EmptyChar) {
                        temObj[key] = ''
                    } else {
                        if (isNotEmpty(val)) {
                            let rStr = val
                            if (trim === true && isStringVal(val)) {
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

export function isArrayVal<T>(arr:T) {
    return Object.prototype.toString.call(arr) === "[object Array]"
}
export function isFuncVal<T>(fn:T) {
    return Object.prototype.toString.call(fn) === "[object Function]"
}
export function isAsyncFuncVal<T>(fn:T) {
    return Object.prototype.toString.call(fn) === "[object AsyncFunction]"
}
export function isObjectVal<T>(obj:T) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}
export function isStringVal<T>(str:T) {
    return Object.prototype.toString.call(str) === "[object String]"
}
export function isBoolVal<T>(b:T) {
    return Object.prototype.toString.call(b) === '[object Boolean]'
}
export function isPromiseVal<T>(p:T) {
    return Object.prototype.toString.call(p) === "[object Promise]"
}
export function isNumberVal<T>(n:T) {
    return Object.prototype.toString.call(n) === '[object Number]'
}

/**
 * iframe 内外通讯
 * @param actData ({ type:事件类型, data?:事件携带数据 })
 * @param host string; 默认 *
 */
export function postFrameMsg<ETY, D>(actData:{ type: ETY, data?: D }, host:string = '*') {
    window.parent.postMessage(actData, host)
}
/**
 * 对比数据是否发生过改变;
 * @param data1 OBJ
 * @param data2 OBJ
 * @returns boolean
 */
export function hasChangeData(data1:IObj, data2:IObj):boolean {
    return JSON.stringify(data1) !== JSON.stringify(data2)
}
/**
 * 获取 存储模块数据
 * @param field 想要获取的字段
 * @param moduleKey 模块名称; 默认 admin-user
 * @param storage 存储类型; 默认 local,表示 localStorage
 */
export function getStorageVal(field:string, moduleKey = 'admin-user', storage?: 'local'|'session'):TBaseNull {
    let myStorage = window.localStorage
    if (storage === 'session') {
        myStorage = window.sessionStorage
    }
    const storageObj:IObjAny = JSON.parse(myStorage.getItem(moduleKey) || '{}')
    return storageObj[field]
}

/**
 * 获取 对象数组的 keys values
 * @param arr 
 * @param label 默认 'label'
 * @param value 默认 'value'
 * @param needStr 要不要把 value 转成 string形式 
 * @returns ({ labelList, valueList })
 * @example [{ id, name }] 获取数组里 所有对象的 id 的集合 / name集合;
 */
export function getArrObjKVs(arr:Array<IObjAny>, label = 'label', value = 'value', needStr = true) {
    const labelList:Array<string> = []
    const valueList:Array<string|number> = []

    for (let index = 0; index < arr.length; index++) {
        const ele = arr[index]
        labelList.push(ele[label])
        let kV = ele[value]
        if (needStr) {
            kV += ''
        }
        valueList.push(kV)
    }
    return { labelList, valueList }
}


/**
 * 数组key转对象属性
 * @param array 
 * @param obj 要返回的 obj
 * @param key 默认 'key'
 * @example [{ key: 'name', defaultVal: 'ff' }, { key: 'age', }] =>> { name: 'ff', age: '', }
 * 注意：obj若是一个空对象，可以返回一个新对象，斩断引用关系,若不是则会保持对源对象;
 *      '' 可能有特殊含义，所以不能轻易使用 ''
 */
export function list2ObjAttr(array:Array<IObjAny>, obj:IObjAny, key = 'key') {
    for (let i = 0; i < array.length; i++) {
        const at = array[i][key]
        const dftVal = array[i].defaultVal
        obj[at] = isNotEmpty(dftVal) ? dftVal : undefined
    }

    return obj
}
/**
 * 特殊的(input前后带select定制化的) list2ObjAttr 
 * preDefaultVal input前 select默认值 
 * appDefaultVal input后 select默认值 
 */
export function list2ObjAttr2(array:Array<IObjAny>, obj:IObjAny, key = 'modelKey') {
    for (let i = 0; i < array.length; i++) {
        const at = array[i][key]
        const dftVal = array[i].defaultVal
        obj[at] = isNotEmpty(dftVal) ? dftVal : undefined


        const bModelKey = array[i].preModelKey
        const aModelKey = array[i].appModelKey
        if (isNotEmpty(bModelKey)) {
            const bModelDftVal = array[i].preDefaultVal
            obj[bModelKey] = isNotEmpty(bModelDftVal) ? bModelDftVal : undefined
        }
        if (isNotEmpty(aModelKey)) {
            const aModelDftVal = array[i].appDefaultVal
            obj[aModelKey] = isNotEmpty(aModelDftVal) ? aModelDftVal : undefined
        }
    }

    return obj
}

/**
 * 手机号 添加 前缀
 * @param phn 手机号
 * @param prefix 前缀 默认 '+86'
 * @returns 前缀+手机号
 */
export function handlePhnoPlus(phn:string, prefix = '+86') {
    if (isNotEmpty(phn)) {
        return phn.startsWith(prefix) ? phn : prefix + phn
    } else {
        return ''
    }
}

/**
 * 手机号 去除 前缀
 * @param phn 手机号
 * @param prefix 前缀 默认 '+86'
 * @returns 手机号
 */
export function handlePhnoSub(phn:string, prefix = '+86') {
    if (isNotEmpty(phn)) {
        return phn.startsWith(prefix) ? phn.substring(prefix.length) : phn
    } else {
        return ''
    }
}

/**
 * 日期 格式化;
 * @param time 时间
 * @param pattern 格式
 */
export function parseTime(time:number|'now', pattern?:string) {
    const _pattern = pattern || 'YYYY-MM-DD HH:mm:ss'

    if (time === 'now') {
        return dayjs().format(_pattern)
    } else {
        if (isNotEmpty(time)) {
            return dayjs(time).format(_pattern)
        } else {
            return ''
        }
    }
}

/**
 * 获取指定时间戳
 * @param time
 * @returns TimeStamp
 */
export function getTimeStamp(time:string|Dayjs) {
    if (isNotEmpty(time)) {
        if (time instanceof dayjs) {
            return time.valueOf()
        } else if (time instanceof Date) {
            return time.getTime()
        } else if (isStringVal(time)) {
            return new Date(<string>time).getTime()
        } else {
            return ''
        }
    } else {
        return ''
    }
}

/**
 * 查找指定 key 的索引
 * @param arr 
 * @param val 要找的 key 值
 * @param by 默认 modelKey
 * @returns 找到的索引
 * @example 在 formModelList 里，找到 modelKey = remoteCategory 的对象的索引
 *   formModelList = [
 *      { modelKey: 'remoteCategory', },
 *      { modelKey: 'nnn', },
 *   ]
 *   const i = findIdxByKey('modelKey', 'remoteCategory', formModelList)
 */
export function findIdxByKey(arr:Array<IObjAny>, val:string|number, by = 'modelKey') {
    return arr.findIndex(ite => ite[by] === val)
}


/**
 * 根据开始 结束 返回 数组
 * @param start 数字
 * @param end 数字
 * @returns Array<number>
 * @example start 0 end   24 => [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
 */
export const setRangeNumArr = (start:number, end:number) => {
    const result = []

    for (let i = start; i < end; i++) {
        result.push(i)
    }

    return result
}

/**
 * 获取当前语言
 * @returns 当前语言
 */
export function getCurrentLang() {
    return 'zhCN'
}
/**
 * 一个url能否触发浏览器自动下载:
 * 主要看该请求响应头response header是否满足，一般是看Content-Disposition和Content-Type这两个消息头：
    response header中指定了Content-Disposition为attachment，它表示让浏览器把消息体以附件的形式下载并保存到本地
    (一般还会指定filename, 下载的文件名默认就是filename)

    response header中指定了Content-Type 为 application/octet-stream(无类型) 或 application/zip(zip包时)等等。
    (
        其中 application/octet-stream表示http response为二进制流(没指定明确的type), 用在未知的应用程序文件，
        浏览器一般不会自动执行或询问执行。浏览器会像对待 设置了HTTP头Content-Disposition 值为 attachment 的文件一样来对待这类文件
    )

    suffixTxt: 指定下载文件的后缀 以 .开头，如，.pdf
 */
export function downloadFile (file:Blob|string, fileName:string = Date.now()+'', openType = '_blank', suffixTxt?:string) {
    if (isStringVal(file)) {
        window.open(<string>file, openType)
    } else {
        // 后端返回 content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        const link = document.createElement('a')
        link.download = suffixTxt ? fileName + suffixTxt : fileName 
        link.href = window.URL.createObjectURL(<Blob>file)
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
    }
}

/**
 * URL 批量下载
 * @param urlArr 
 * @param clearSecond 默认 5000 清除定时器
 */
export function batchDownload(urlArr:Array<string>, clearSecond = 5000) {
    // 批量下载 方式 1
    // urlArr.forEach(url => {
    //     window.open(url, '_blank')
    // })

    if (isNotEmpty(urlArr)) {
        const iframeFather = document.createElement('div')
        iframeFather.id = 'iframe_down_dom'
        iframeFather.style.display = 'none'
        document.body.appendChild(iframeFather)

        urlArr.forEach(url => {
            if (isNotEmpty(url)) {
                const iframe = document.createElement("iframe")
                iframe.style.display = "none" // 防止影响页面设置不可见
                iframe.style.height = "0" // 防止影响页面高度设置为0
                iframe.src = url
                iframeFather.appendChild(iframe) // 这一行必须，iframe挂在到dom树上才会发请求

                const timer2 = setTimeout(function() {
                    const iDom = document.getElementById("iframe_down_dom")
                    if (iDom) {
                        document.body.removeChild(iDom)
                    }

                    clearTimeout(timer2)
                }, clearSecond)
            }
        })
    }
}

/**
 * 导出 excle 后端返回列表数据(只能下载返回的数据)
 * @param data Blob
 * @param fileName 默认当前时间戳
 */
export const ExportExlFile = (data:Blob, fileName=Date.now()+'') => {
    const blob = new Blob([data], { type: "application/vnd.ms-excel" }) // 转成blob格式

    const link = document.createElement("a")
    link.download = fileName
    link.href = URL.createObjectURL(blob)
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()

    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
}

/**
 * 获取随机色; 随机数取整，并转换成16进制
 * @return 颜色值
 */
export function getRandomColor() {
    let random = '#'
    for (let i = 0; i < 6; i++) {
        random += parseInt((Math.random() * 15)+'').toString(16)
    }
    return random
}

/**
 * 0-9数字加0处理
 * @param t 
 */
export function tranlateTime10(t:number|string) {
    return t < 10 ? '0' + t : t
}
export function getUTCtime() {
    const dateObj = new Date()
    const year = dateObj.getUTCFullYear() +''

    const month = tranlateTime10(dateObj.getUTCMonth() + 1)
    const day = tranlateTime10(dateObj.getUTCDate())
    const hh = tranlateTime10(dateObj.getUTCHours())
    const mm = tranlateTime10(dateObj.getUTCMinutes())
    const ss = tranlateTime10(dateObj.getUTCSeconds())

    return year + month + day + hh + mm + ss
}

/**
 * 数组去重
 * @param list 待去重数组
 * @param key 根据什么去重; 默认 id
 */
export function delRepeat(list:Array<IObjAny>, key = 'id') {
    const obj:IObjAny = {}
    const result = []
    for (let i = 0; i < list.length; i++) {
        if (!obj[list[i][key]]) {
            result.push(list[i])
            obj[list[i][key]] = true
        }
    }
    return result
}

/**
 * 数组取交集
 * @param arrA 待取交集数组
 * @param ArrB 待取交集数组
 * @param complex false,即为简单数组; 默认 fasle; 复杂数组,即数组对象,暂未开发
 * @returns Array<string|number>
 * @example 
 * let a = [1,2,3,3,4,5]; let b = [1,3,4,55,6];
 * getCrossArray(a,b) => [1, 3, 3, 4]
 */
export function getCrossArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex = false) {
    let crossArray:Array<string|number> = []
    if (complex) { // 复杂数组 TODO

    } else {
        crossArray = arrA.filter(item => (ArrB.includes(item)))
    }
    return crossArray
}
/**
 * @description 数组取并集; 可能会重复;
 * @param  arrA, ArrB 待取并集数组 ; complex:复杂数组,即数组对象,false,即为简单数组;
 * @return arr
 * @example let a = [1,2,3,3,4,5];
            let b = [1,3,4,55,6];
            getUnionArray(a,b) => [1, 2, 3, 3, 4, 5, 1, 3, 4, 55, 6]
 */
export function getUnionArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex = false) {
    let crossArray:Array<string|number> = []
    if (complex) { // 复杂数组

    } else {
        crossArray = [...arrA, ...ArrB]
    }
    return crossArray
}

/**
 * 数组排序
 * @param arr 待排序数组
 * @param id 根据什么排序; 默认 pid
 * @returns 
 */
export function sortArrById(arr:Array<IObjAny>, id = 'pid') {
    const a = arr
    a.sort((a, b) => {
        const aId = parseInt(a[id])
        const bId = parseInt(b[id])
        if (!(aId && bId) && aId !== 0 && bId !== 0) {
            console.log('sortArrById error!')
            throw new Error('sortArrById error')
        }
        return aId - bId
    })
    return a
}

/**
 * 数组对象 转换成 tree 结构;
 * @param arr
 * @param pid 父元素id字段
 * @example
 * let c1 = [
      {id: '021', name: 'n021', pid: '02', children:[]},
      {id: '032', name: 'n032', pid: '03', children:[]},
      {id: '01', name: 'n01', pid: '0', children:[]},
      {id: '02', name: 'n01', pid: '0', children:[]},
    ]
    ===>
    let c1 = [
      {id: '01', name: 'n01', pid: '0', children:[]},
      {id: '02', name: 'n02', pid: '0', children:[
        {id: '021', name: 'n021', pid: '02', children:[]},
      ]},
    ]
 */
export function arr2Tree(arr:Array<IObjAny>, pid = 'pid') {
    const a = sortArrById(arr)
    const aMap = list2Map(a)
    const b = []

    for (let index = 0, al = a.length; index < al; index++) {
        const element = a[index]
        if (element[pid] === '0') {
            b.push(element)
        } else {
            const obj = aMap[element[pid]]
            if (obj.children) {
                obj.children.push(element)
            }
        }
    }
    return b
}

/**
 * tree 平铺展开 成数组对象, 包括 1级、2级等 所有级别, 不重复
 * @param tree 树结构数组
 */
export function tree2Arr(treeData:Array<IObjAny>) {
    const arr = [] as Array<IObjAny>
    const spreadTree = (trees:Array<IObjAny>) => {
        if (trees && trees.length > 0) {
            trees.forEach(e => {
                arr.push(e)
                spreadTree(e.children)
            })
        }
    }
    spreadTree(treeData)
    return arr
}

/**
 * list--> map
 * @param list 数组；key:String; 默认是 'id'
 * @param key map的key; 默认是 'value'
 */
export function list2Map(list:Array<IObjAny>, key = 'value') {
    const map:IObjAny = {}
    if (isNotEmpty(list)) {
        for (let index = 0; index < list.length; index++) {
            const val = list[index][key]
            map[val] = list[index]
        }
    }
    return map
}

/**
 * @description 获取对象属性重复数目
 * @example 
 * [{name:'apple'},{name:'apple'},{name:'orange'},{name:'apple'},{name:'pear'}] => {"apple":3,"orange":1,"pear":1}
 */
export function getRepeatProNum(arr:Array<IObjAny>) {
    const obj:IObjAny = {}
    for (let i = 0, l = arr.length; i < l; i++) {
        const item = arr[i].TX
        obj[item] = (obj[item] + 1) || 1
    }
    return obj
}
