
export type TBase = string|number|boolean
export type TBaseNull = TBase|undefined|null

export interface IObjAny { [propName: string]: any }
export interface IObj { [propName: string]: TBaseNull|Function|Array<TBaseNull>|Array<IObj>|IObj }

export declare function postFrameMsg<D, ETY>(actData:{ type: ETY, data?: D }, host:string = '*'):void;
export declare function hasChangeData(data1:IObj, data2:IObj):boolean;
export declare function getStorageVal(field:string, moduleKey = 'admin-user', storage?: 'local'|'session'): string;
export declare function getArrObjKVs(arr:Array<IObjAny>, label = 'label', value = 'value', needStr = true): ({ labelList:Array<string>, valueList:Array<string> });
export declare function list2ObjAttr(array:Array<IObjAny>, obj:IObjAny, key = 'key'): IObjAny;
export declare function list2ObjAttr2(array:Array<IObjAny>, obj:IObjAny, key = 'modelKey'): IObjAny;
export declare function handlePhnoPlus(phn:string, prefix = '+86'): string;
export declare function handlePhnoSub(phn:string, prefix = '+86'): string;
export declare function parseTime(time:number|'now', pattern?:string): string;
export declare function getTimeStamp(time:string|dayjs.Dayjs): number|'';
export declare function findIdxByKey(arr:Array<IObjAny>, val:string|number, by = 'modelKey'): number;
export declare function setRangeNumArr(start:number, end:number): Array<number>;
export declare function getCurrentLang(): string;
export declare function downloadFile(): void;
export declare function batchDownload(): void;
export declare function ExportExlFile(): void;
export declare function isEmpty<T>(b:T): boolean;
export declare function isNotEmpty<T>(b:T): boolean;
export declare function deleteNull(obj:IObjAny, trans2EmptyChar:boolean = false, trim:boolean = true): IObjAny;
export declare function isArrayVal<T>(arr:T): boolean;
export declare function isFuncVal<T>(fn:T): boolean;
export declare function isAsyncFuncVal<T>(fn:T): boolean;
export declare function isObjectVal<T>(obj:T): boolean;
export declare function isStringVal<T>(str:T): boolean;
export declare function isBoolVal<T>(b:T): boolean;
export declare function isPromiseVal<T>(p:T): boolean;
export declare function isNumberVal<T>(n:T): boolean;
export declare function getRandomColor(): string;
export declare function tranlateTime10(t:number|string): number|string;
export declare function getUTCtime(): string;
export declare function delRepeat(list:Array<IObjAny>, key = 'id'): Array<IObjAny>;
export declare function getCrossArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex = false): Array<string|number>;
export declare function getUnionArray(arrA:Array<string|number>, ArrB:Array<string|number>, complex = false): Array<string|number>;
export declare function sortArrById(arr:Array<IObjAny>, id = 'pid'): Array<IObjAny>;
export declare function arr2Tree(arr:Array<IObjAny>, pid = 'pid'): Array<IObjAny>;
export declare function tree2Arr(treeData:Array<IObjAny>): Array<IObjAny>;
export declare function list2Map(list:Array<IObjAny>, key = 'value'): IObjAny;
export declare function getRepeatProNum(arr:Array<IObjAny>): ({ [propName: string]: number });