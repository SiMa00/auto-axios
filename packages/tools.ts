

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { IObjAny, IBackMenu, IBackMenuField, ISiderShowMenu, IRoute, IFontMenu, IObj, TBaseNull } from "./types"
import { MENU_TYPE } from "./types"

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
 * 处理对象数据里的 空
 * @param obj 数据源对象
 * @param absDelNull 是否删除 所有空值(包括[]、{}) 的属性
 * @param delNull 是否删除 一般空值(''|null|undefined)的属性
 * @param if2EmptyStr 是否把 一般空 的值转化为 空字符串''
 * @returns IObjAny
 */
export function handleObjNull(obj:IObjAny, absDelNull = false, delNull = false, if2EmptyStr = true) {
    if (isNotEmpty(obj) && isObjectVal(obj)) {
        const temObj:IObjAny = {}
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                let val = obj[key]
                const isNum = typeof val === 'number' // isNumberVal(NaN) true; typeof NaN === 'number'; isNaN(NaN) true
                if ((isNum && !isNaN(val)) || (!isNum)) {
                    if (absDelNull && isEmpty(val)) { // 删除所有空，包括 {} []
                        // Reflect.deleteProperty(temObj, key)
                    } else {
                        if (typeof val === 'string') val = val.trim()
                        const isNull = val === '' || val === null || val === undefined
                        
                        if (isNull) { // 把 空转成 空字符串,不包括 [] {}
                            if (delNull) { // 是否把 空值 的属性，直接剔除掉
                                // Reflect.deleteProperty(temObj, key)
                            } else {
                                if (if2EmptyStr) temObj[key] = ''
                            }
                        } else {
                            temObj[key] = val
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
 * 向父 iframe 发送消息
 * @param cfg 消息配置
 * @param host 域名
 */
export function postParentMsg<ETY, D> (cfg: { type: ETY, data: D}, host = '*') {
    window.parent.postMessage({ type: cfg.type, data: cfg.data }, host)
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
 * @description 可配合 pinia; 根据 module key 持久化取值
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
 * beforeModelKey input前 select默认值 
 * afterModelKey input后 select默认值 
 */
export function list2ObjAttrAB(array:Array<IObjAny>, obj:IObjAny, key = 'modelKey') {
    for (let i = 0; i < array.length; i++) {
        const at = array[i][key]
        const dftVal = array[i].defaultVal
        obj[at] = isNotEmpty(dftVal) ? dftVal : undefined


        const bModelKey = array[i].beforeModelKey
        const aModelKey = array[i].afterModelKey
        if (isNotEmpty(bModelKey)) {
            const bModelDftVal = array[i].defaultSBVal
            obj[bModelKey] = isNotEmpty(bModelDftVal) ? bModelDftVal : undefined
        }
        if (isNotEmpty(aModelKey)) {
            const aModelDftVal = array[i].defaultSAVal
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
export function getPlusPhone(phn:string, prefix = '+86') {
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
export function getSubPhone(phn:string, prefix = '+86') {
    if (isNotEmpty(phn)) {
        return phn.startsWith(prefix) ? phn.substring(prefix.length) : phn
    } else {
        return ''
    }
}

/**
 * 日期 格式化;
 * @param time 时间; now 获取当前时间的 时间格式
 * @param pattern 格式; 默认 YYYY-MM-DD HH:mm:ss
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
 * @description 获取 Date、dayjs、日期字符串 形式的时间戳
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
 * 获取 校验表单 结果
 * @param formRefVal form ref值的 value，如：myForm.value
 * @description 适合 antd 形式的 表单校验; 注意，formRefVal 一定要.value
 */
export async function validateMyForm<F extends { validateFields: Function, [propName: string]:any }>(formRefVal:F|undefined|null) {
    if (formRefVal) {
        try {
            const res = await formRefVal.validateFields()
            if (res) {
                return true
            } else {
                return false
            }
        } catch (error) {
            return false
        }
    } else {
        return false
    }
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

/**
 * 下载文件
 * @param file Blob|string 文件流或者文件 url
 * @param fileName 文件名;默认时间戳
 * @param openType 文件 url时， window.open的打开方式，默认 _blank
 * @param suffixTxt 文件名后缀，默认没有
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
export const ExportExlFile = (data:Blob, fileName = Date.now()+'') => {
    const blob = new Blob([data], { type: "application/vnd.ms-excel" }) // 转成blob格式
    downloadFile(blob, fileName)
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
 * 0-9数字加 0 处理
 * @param t 
 * @description 非数字 返回 --
 */
export function tranlateTime10(t:number|string) {
    const t1 = Number(t)
    if (isNaN(t1)) {
        return '--'
    } else {
        return t1 < 10 ? '0' + t1 : t1
    }
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
 * @param arrB 待取交集数组
 * @param crossBy 数组时根据什么字段 取交集;
 *  有值，表示数组对象类型的取交集，默认为空表示简单数组
 *  数组对象的取交集，是根据 crossBy 字段来的
 * @returns Array<string|number>
 * @example 
 * let a = [1,2,3,3,4,5]; let b = [1,3,4,55,6];
 * getCrossArray(a,b) => [1, 3, 3, 4]
 */
export function getCrossArray(arrA:Array<string|number|IObjAny>, arrB:Array<string|number|IObjAny>, crossBy = '',) {
    let crossArray:Array<string|number|IObjAny> = []
    if (crossBy) { // 数组对象
        const idsB:Array<number|string> = arrB.map((item0:any) => item0[crossBy])
        arrA.filter((item:any) => (idsB.includes(item[crossBy])))
    } else {
        crossArray = arrA.filter(item => (arrB.includes(item)))
    }
    return crossArray
}
/**
 * @description 数组取并集; 可能会重复;
 * @param  arrA, arrB 待取并集数组 ; complex:复杂数组,即数组对象,false,即为简单数组;
 * @return arr
 * @example let a = [1,2,3,3,4,5];
            let b = [1,3,4,55,6];
            getUnionArray(a,b) => [1, 2, 3, 3, 4, 5, 1, 3, 4, 55, 6]
 */
export function getUnionArray(arrA:Array<string|number>, arrB:Array<string|number>, complex = false) {
    let crossArray:Array<string|number> = []
    if (complex) { // 复杂数组

    } else {
        crossArray = [...arrA, ...arrB]
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
    const map:{ [propName: string|number]:IObjAny } = {}
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


/**
 * 把 Obj里 空值(''|null|undefined|[]|{})，转成 undefined; 方便antd等 undefined时显示 placeHolder
 * @param obj {}类型的参数，不是 {}类型的话，会返回原数据
 * @param toUndefined 是否把 空 转成 undefined; true
 * @returns obj
 */
export function val2Undefined(obj:IObjAny, toUndefined = true) {
    if (obj && isObjectVal(obj)) {
        const temObj:IObjAny = {}

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const val = obj[key]
                if (isEmpty(val) && toUndefined) {
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

// export function getEleStyle(ele:HTMLElement, attr:string) {
//     if (ele.currentStyle) {
//         return ele.currentStyle[attr]
//     } else {
//         return document.defaultView && document.defaultView.getComputedStyle(ele, null)[attr]
//     }
// }

/*************************************************************  菜单相关 开始 ***********************************************************/

/**
 * 处理菜单
 * @param viewModules 批量注册路由: import.meta.glob 的值
 * @param frameRoute 布局layout 入口的 路由;
 * @param list0 菜单接口返回的 菜单数据; T接口返回的菜单类型
 * @param isAdmin 是否是 管理员;
 * @param ifTranslate 是否需要 把接口菜单转换成指定字段;true
 * @param fieldCfg 转换成指定字段配置;有默认值,也可以直接赋值 {}
 * @param splitUrls 根据指定urls 分割path以挑出自带页面path(可以加载本地代码);默认为[],表示不用分割;
 * @param menuDirVal 是目录 类型时 menuType 的值;['D']
 * @param menuPageVal 是页面 类型时 menuType 的值;['P']
 * @param menuButtonVal 是按钮类 型时 menuType 的值;['B']
 * @param visibleVal 菜单显示时 visible的值;0
 * @param isI18n 是否处于国际化环境中;false
 * @returns 
 * myAllMenus所有菜单  
 * mySiderMenu左侧展示 可见的菜单  
 * myPerms按钮 级别权限字符  
 * myPathList菜单的 path 集合
 */
export function generateMenuRoutes<T extends IObjAny>(
    viewModules: Record<string, () => Promise<any>>,
    frameRoute:IRoute,
    list0:Array<T>, 
    isAdmin:boolean, 
    ifTranslate = true, 
    fieldCfg?:IBackMenuField,
    splitUrls:Array<string> = [],
    menuDirVal = <Array<string>>[MENU_TYPE.DIR], // 是目录类型; 数组类型，防止某些情况下，存在多个值
    menuPageVal = <Array<string>>[MENU_TYPE.PAGE], // 是页面类型; 数组类型，防止某些情况下，存在多个值
    menuButtonVal = <Array<string>>[MENU_TYPE.BUTTON], // 是页面类型
    visibleVal = 0, // 0 显示
    isI18n = false,
) {
    const list = translateMenusField(list0, ifTranslate, fieldCfg)
    let myAllMenus = <Array<IFontMenu>>[] // 用户权限内的 可见 + 不可见 所有菜单(目录 页面 按钮等); 但不一定是全部的
    let mySiderMenu = <Array<IFontMenu>>[] // 用户 左侧展示 可见的菜单
    const myPerms = <Array<string>>[] // 用户 按钮 级别权限字符
    const myPagePaths = <Array<string>>[] // 所有页面的 path 集合;不可重复;若菜单数据一次性返回，前端自己可以校验重复

    for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const isDir = menuDirVal.includes(item.menuType)
        const isPage = menuPageVal.includes(item.menuType)
        
        if (isPage || isDir) { // dir 的 path 和 component 不用管
            const hasPath = isNotEmpty(item.path)
            const hasComPath = isNotEmpty(item.componentPath)
            const vFlag = isAdmin || item.visible === visibleVal
            const mcObj:IFontMenu = { ...item, } // 适用于 路由 的菜单item
            if (isPage && hasPath) { // path 不能重复
                // 自身 path 被写成外链 path，不能加载本地代码，只能提过iframe加载，但是又想加载本地代码时，可以启用
                if (isNotEmpty(splitUrls)) {
                    const isLink = item.path?.startsWith('http://') || item.path?.startsWith('https://') //是否是 外链
                    let fpath = item.path
                    if (isLink) { // 用域名分割 1;只要确保 自身 页面不配成 iframe 这段代码可注释掉；为了防止自身路由被配成 外链
                        splitUrls.forEach(urlele => {
                            // 剔除 http 协议，不然 http 和 https要各写一遍
                            // 假设 splitUrls=['http://uims-test.fjdac.cn']  fpath = http://uims-test.fjdac.cn/a/b/  
                            // 'http://uims-test.fjdac.cn/a/b/' => ['http:', 'uims-test.fjdac.cn/a/b/']
                            const httpArr = urlele.split('//')
                            if (httpArr.length === 2) {
                                if (fpath?.includes(httpArr[1])) {
                                    const fpArrTem = fpath.split(httpArr[1])
                                    fpath = fpArrTem[1]
                                }
                            }
                        })
                        mcObj.path = fpath // 自身路由的 path 已经去掉了域名
                        // // 生成 去域名 后 的 path 部分 => /iframe/b/c
                        // // split('/') http://uop-test.fjdac.cn/iframe/b/c => ['http:', '', 'uop-test.fjdac.cn', 'iframe', 'b', 'c']
                        // const pathArrStr = item.path!.split('/').filter((obj, i) => i > 2).join('/')
                    }
                }
                
                myPagePaths.push(item.path!)
                const newIsLink = mcObj.path?.startsWith('http://') || mcObj.path?.startsWith('https://')
                if (hasComPath && !newIsLink) { // 用域名分割 2 放开 !newIsLink
                    const cmpth = item.componentPath?.startsWith('/') ? item.componentPath : '/' + item.componentPath // 带 / 开头
                    if (item.componentPath?.endsWith('.vue')) {
                        mcObj.component = viewModules[`../views${cmpth}`]
                    } else if (item.componentPath?.endsWith('index')) {
                        mcObj.component = viewModules[`../views${cmpth}.vue`]
                    } else { // 默认文件夹名字;文件夹下 有个 index.vue
                        mcObj.component = viewModules[`../views${cmpth}/index.vue`]
                    }
                    // mcObj.component = () => import(/* webpackChunkName: "layout-route" */`../views/${item.componentPath}/index.vue`)
                
                    // 外链不需要注册 路由;外链 提过 iframe url 展示,点击菜单 也是 router.push('/frame') 带query的形式跳转路由
                    if (vFlag) {
                        const rname = isI18n ? mcObj.path! : mcObj.menuName  // 处于国际化时，以path为 key
                        frameRoute.children && frameRoute.children.push({ 
                            name: rname,
                            path: mcObj.path!,
                            component: mcObj.component,
                            meta: { title: rname, },
                        })
                    }
                }
            }
            
            if (vFlag) mySiderMenu.push(mcObj)
        }

        if (!isAdmin && isNotEmpty(item.perms)) {
            myPerms.push(item.perms)
        }

        myAllMenus.push(item)
    }

    myAllMenus = sortRelationship(myAllMenus, menuButtonVal)
    mySiderMenu = sortRelationship(mySiderMenu, menuButtonVal)

    // 开启默认走 sider第一个的路由的话，可能存在的情况：第一个路由被人配置错误，导致展示页面出问题
    // if (isNotEmpty(mySiderMenu)) {
    //     frameRoute.children.push({
    //         path: '/frame',
    //         redirect: getDefaultRoute(mySiderMenu),
    //     })
    // }
    
    return { myAllMenus, mySiderMenu, myPerms, myPagePaths }
}

/**
 * 转换 菜单接口返回的 model，使之符合内部需要
 * @param list 接口返回的菜单 集合
 * @param ifTranslate 是否需要转换成指定字段
 * @param fieldCfg 指定字段配置; key 是内部使用的字段，value 是接口对应的字段
 * @returns IBackMenu
 */
export function translateMenusField<T extends IObjAny>(list: Array<T>, ifTranslate = true, fieldCfg?:IBackMenuField):Array<IBackMenu> {
    if (ifTranslate) {
        let arr0 = <Array<IBackMenu>>[]
        if (isNotEmpty(list)) {
            const defaultCfg = {
                id: 'id', // 菜单id
                menuName: 'menuName', // 菜单名称
                menuType: 'menuType', // 菜单类型
                parentId: 'parentId', // 父菜单id
                perms: 'perms', // 权限字符
                path: 'path', // 路由地址(页面时)、请求地址(接口时); 不可重复
                index: 'index', // 排序
                icon: 'icon', // 图标
                platformId: 'platformId',  // 平台id
                platformStr: 'platformStr',
                reqMethod: 'reqMethod', // 请求方法(接口时)
                visible: 'visible', // 是否显示; 0显示
                componentPath: 'componentPath', // 菜单组件 路径
                children: 'children',
                createTime: 'createTime',
                creatorName: 'creatorName',
                updateTime: 'updateTime',
                updaterName: 'updaterName',
            }
            const newCfg = Object.assign(defaultCfg, fieldCfg)
            arr0 = list.map(item => ({
                id: item[newCfg.id] + '',
                menuName: item[newCfg.menuName],
                menuType: item[newCfg.menuType],
                parentId: item[newCfg.parentId] + '',
                perms: item[newCfg.perms],
                path: item[newCfg.path],
                index: item[newCfg.index],
                icon: item[newCfg.icon],
                platformId: item[newCfg.platformId],
                platformStr: item[newCfg.platformStr],
                reqMethod: item[newCfg.reqMethod],
                visible: item[newCfg.visible],
                componentPath: item[newCfg.componentPath],
                children: item[newCfg.children],
                createTime: item[newCfg.createTime],
                creatorName: item[newCfg.creatorName],
                updateTime: item[newCfg.updateTime],
                updaterName: item[newCfg.updaterName],
            }))
        }
        return arr0
    } else {
        return <Array<any>>list
    }
}

/**
 * sider菜单 仅做展示用，去除了多余的敏感数据
 * @param arr 菜单数据源
 * @returns 脱敏后的菜单({ title, routeKey, menuType, icon, children })
 */
export function translateSiderOps(arr:Array<IFontMenu>) {
    const newArr:Array<ISiderShowMenu> = []
    for (let i = 0; i < arr.length; i++) {
        const ele = arr[i];

        const newObj:ISiderShowMenu = { 
            title: ele.menuName, 
            routeKey: ele.path,
            menuType: ele.menuType, 
            icon: ele.icon, 
            children: [],
        }
        
        if (ele.children && isNotEmpty(ele.children)) {
            newObj.children = translateSiderOps(ele.children)
        }
        if (newArr) {
            newArr.push(newObj)
        }
    }

    return newArr
}

/**
 * 菜单树形关系排序
 * @param rArr 菜单数据源
 * @param menuButtonVal 按钮 类型的值
 * @returns 树形菜单数据
 */
export function sortRelationship(rArr:Array<IFontMenu>, menuButtonVal:Array<string>) {
    const allMenuData = rArr.filter(father => {
        const branchArr = rArr.filter(child => father.id === child.parentId)
        if (isNotEmpty(branchArr)) {
            branchArr.sort((a, b) => a.index - b.index)
            if (!(menuButtonVal.includes(father.menuType))) { // 不是 button时
                father.children = branchArr
            }
        }

        return (father.parentId === 0) || (father.parentId === '0')
    })
    allMenuData.sort((a, b) => a.index - b.index)

    return allMenuData || []
}

/*************************************************************  菜单相关 结束 ***********************************************************/

// // 推荐使用
// export function sortTreeRelation(rArr:Array<IFontMenu>) {
//     const rArr0 = cloneDeep(rArr)
//     for (let i = 0; i < rArr0.length; i++) {
//         const element = rArr0[i]
//         const branchArr = rArr0.filter(child => element.id === child.parentId)
//         if (isNotEmpty(branchArr)) {
//             branchArr.sort((a, b) => a.index - b.index)
//             element.children = branchArr
//         }
//     }

//     const rArr1 = cloneDeep(rArr0)
//     for (let y = 0; y < rArr0.length; y++) {
//         const element = rArr0[y]
//         if (element.children && isNotEmpty(element.children)) {
//             for (let k = 0; k < element.children.length; k++) {
//                 const ele = element.children[k]
//                 const idx = rArr1.findIndex(item => item.id === ele.id)
//                 if (idx > -1) {
//                     rArr1.splice(idx, 1)
//                 }
//             }
//         }
//     }

//     rArr1.sort((a, b) => a.index - b.index)
//     return rArr1
// }
// // sider菜单 仅做展示用，去除了多余的敏感数据
// export function translateSiderOps(arr:Array<IFontMenu>) {
//     const newArr:Array<ISiderShowMenu> = []
//     for (let i = 0; i < arr.length; i++) {
//         const ele = arr[i];

//         const newObj:ISiderShowMenu = { 
//             title: ele.menuName, 
//             routeKey: ele.path,
//             menuType: ele.menuType, 
//             icon: ele.icon, 
//             children: [],
//         }
        
//         if (ele.children && isNotEmpty(ele.children)) {
//             newObj.children = translateSiderOps(ele.children)
//         }
//         if (newArr) {
//             newArr.push(newObj)
//         }
//     }

//     return newArr
// }
// function getDefaultRoute(arr: Array<IFontMenu>) {
//     let rStr = ''
//     if (isNotEmpty(arr)) {
//         for (let i = 0; i < arr.length; i++) {
//             const element = arr[i]
//             const mType = element.menuType

//             if ((mType === '菜单' || mType === 'C') && element.isLinkMenu === 1) { // isLinkMenu = 1 不是外链
//                 if (isNotEmpty(element.path)) {
//                     rStr = element.path!
//                     break
//                 }
//             } else if (mType === '目录' || mType === 'M') {
//                 if (isNotEmpty(element.children)) {
//                     rStr = getDefaultRoute(element.children!)
//                     if (isNotEmpty(rStr)) {
//                         break
//                     }
//                 }
//             }
//         }

//     }

//     return rStr

// }
// // 根据 index 和 createTime进行排序
// // rArr1.sort((a, b) => sortOrder(a, b))
// function sortOrder(a:IObjAny, b:IObjAny) {
//     if ((a.index - b.index === 0) && a.createTime) {
//         return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
//     } else {
//         return a.index - b.index
//     }
// }

