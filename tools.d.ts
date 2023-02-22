
import type { Dayjs } from 'dayjs'
import type { TBaseNull, IObjAny, IObj } from "./common";

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
export declare function isEmpty<T>(b:T): boolean;

/**
 * 是否不为空
 * @param b 
 */
export declare function isNotEmpty<T>(b:T): boolean;

/**
 * 处理对象数据里的 空字段属性
 * @param obj 
 * @param trans2EmptyChar 是否把 空 转成 空字符串;默认 false 
 * @param trim 是否清除左右空字符串;默认 true
 * @returns OBJ
 */
export declare function deleteNull(obj:IObjAny, trans2EmptyChar?:boolean, trim?:boolean): IObjAny;
export declare function isArrayVal<T>(arr:T): boolean;
export declare function isFuncVal<T>(fn:T): boolean;
export declare function isAsyncFuncVal<T>(fn:T): boolean;
export declare function isObjectVal<T>(obj:T): boolean;
export declare function isStringVal<T>(str:T): boolean;
export declare function isBoolVal<T>(b:T): boolean;
export declare function isPromiseVal<T>(p:T): boolean;
export declare function isNumberVal<T>(n:T): boolean;

/**
 * iframe 内外通讯
 * @param actData ({ type:事件类型, data?:事件携带数据 })
 * @param host string; 默认 *
 */
export declare function postFrameMsg<ETY, D>(actData:{ type: ETY, data?: D }, host?:string):void;

/**
 * 对比数据是否发生过改变;
 * @param data1 OBJ
 * @param data2 OBJ
 * @returns boolean
 */
export declare function hasChangeData(data1:IObj, data2:IObj):boolean;

/**
 * 获取 存储模块数据
 * @param field 想要获取的字段
 * @param moduleKey 模块名称; 默认 admin-user
 * @param storage 存储类型; 默认 local,表示 localStorage
 */
export declare function getStorageVal(field:string, moduleKey?:string, storage?: 'local'|'session'): TBaseNull;

/**
 * 获取 对象数组的 keys values
 * @param arr 
 * @param label 默认 'label'
 * @param value 默认 'value'
 * @param needStr 要不要把 value 转成 string形式 
 * @returns ({ labelList, valueList })
 * @example [{ id, name }] 获取数组里 所有对象的 id 的集合 / name集合;
 */
export declare function getArrObjKVs(
    arr:Array<IObjAny>, 
    label?:string, 
    value?:string, 
    needStr?:boolean
): ({ labelList:Array<string>, valueList:Array<string|number> });

/**
 * 数组key转对象属性
 * @param array 
 * @param obj 要返回的 obj
 * @param key 默认 'key'
 * @example [{ key: 'name', defaultVal: 'ff' }, { key: 'age', }] =>> { name: 'ff', age: '', }
 * 注意：obj若是一个空对象，可以返回一个新对象，斩断引用关系,若不是则会保持对源对象;
 *      '' 可能有特殊含义，所以不能轻易使用 ''
 */
export declare function list2ObjAttr(array:Array<IObjAny>, obj:IObjAny, key?:string): IObjAny;

/**
 * 特殊的(input前后带select定制化的) list2ObjAttr 
 * preDefaultVal input前 select默认值 
 * appDefaultVal input后 select默认值 
 */
export declare function list2ObjAttr2(array:Array<IObjAny>, obj:IObjAny, key?:string): IObjAny;

/**
 * 手机号 添加 前缀
 * @param phn 手机号
 * @param prefix 前缀 默认 '+86'
 * @returns 前缀+手机号
 */
export declare function handlePhnoPlus(phn:string, prefix?:string): string;

/**
 * 手机号 去除 前缀
 * @param phn 手机号
 * @param prefix 前缀 默认 '+86'
 * @returns 手机号
 */
export declare function handlePhnoSub(phn:string, prefix?:string): string;

/**
 * 日期 格式化;
 * @param time 时间
 * @param pattern 格式
 */
export declare function parseTime(time:number|'now', pattern?:string): string;

/**
 * 获取指定时间戳
 * @param time
 * @returns TimeStamp
 */
export declare function getTimeStamp(time:string|Dayjs): number|'';

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
export declare function findIdxByKey(arr:Array<IObjAny>, val:string|number, by?:string): number;

/**
 * 根据开始 结束 返回 数组
 * @param start 数字
 * @param end 数字
 * @returns Array<number>
 * @example start 0 end   24 => [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
 */
export declare function setRangeNumArr(start:number, end:number): Array<number>;

/**
 * 获取当前语言
 * @returns 当前语言
 */
export declare function getCurrentLang(): string;

/**
 * 下载文件
 * @param file Blob|文件url
 * @param fileName 默认当前时间戳的字符串形式
 * @param openType 默认 _blank
 * @param suffixTxt 文件后缀
 */
export declare function downloadFile(file:Blob|string, fileName?:string, openType?:string, suffixTxt?:string): void;

/**
 * URL 批量下载
 * @param urlArr 
 * @param clearSecond 默认 5000 清除定时器
 */
export declare function batchDownload(urlArr:Array<string>, clearSecond?:number): void;

/**
 * 导出 excle 后端返回列表数据(只能下载返回的数据)
 * @param data Blob
 * @param fileName 默认当前时间戳
 */
export declare function ExportExlFile(data:Blob, fileName?:string): void;

/**
 * 获取随机色; 随机数取整，并转换成16进制
 * @return 颜色值
 */
export declare function getRandomColor(): string;

/**
 * 0-9数字加0处理
 * @param t 
 */
export declare function tranlateTime10(t:number|string): number|string;
export declare function getUTCtime(): string;

/**
 * 数组去重
 * @param list 待去重数组
 * @param key 根据什么去重; 默认 id
 * @returns 
 */
export declare function delRepeat(list:Array<IObjAny>, key?:string): Array<IObjAny>;

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
export declare function getCrossArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex?:boolean): Array<string|number>;

// 数组取并集; 可能会重复;
export declare function getUnionArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex?:boolean): Array<string|number>;

/**
 * 数组排序
 * @param arr 待排序数组
 * @param id 根据什么排序; 默认 pid
 * @returns 
 */
export declare function sortArrById(arr:Array<IObjAny>, id?:string): Array<IObjAny>;

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
export declare function arr2Tree(arr:Array<IObjAny>, pid?:string): Array<IObjAny>;

/**
 * tree 平铺展开 成数组对象, 包括 1级、2级等 所有级别, 不重复
 * @param tree 树结构数组
 */
export declare function tree2Arr(treeData:Array<IObjAny>): Array<IObjAny>;

/**
 * list--> map
 * @param list 数组；key:String; 默认是 'id'
 * @param key map的key; 默认是 'value'
 */
export declare function list2Map(list:Array<IObjAny>, key?:string): IObjAny;

/**
 * @description 获取对象属性重复数目
 * @example 
 * [{name:'apple'},{name:'apple'},{name:'orange'},{name:'apple'},{name:'pear'}] => {"apple":3,"orange":1,"pear":1}
 */
export declare function getRepeatProNum(arr:Array<IObjAny>): ({[propName: string]: number});