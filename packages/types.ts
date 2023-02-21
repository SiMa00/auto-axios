
export type TBase = string|number|boolean
export type TBaseNull = TBase|undefined|null

// 不带 {} 的类型
export type TBaseValNull = TBaseNull|Array<TBaseNull>
export interface IBaseObj { [propName: string]: TBase|Array<TBase> }
export interface IBaseObjNull { [propName: string]: TBaseNull|Array<TBaseNull> }

// 带 {} 的类型
export interface IObjNumber { [propName: string]: number }
export interface IObjAny { [propName: string]: any }
export interface IObj { [propName: string]: TBaseNull|Function|Array<TBaseNull>|Array<IObj>|IObj }

export interface IOption { // form 里的 option
    label: string;
    value: string;
    [propName: string]: any;
}
export interface IOptionStr {
    label: string;
    value: string;
}
export interface IOptionNo {
    label: string;
    value: number;
}
export interface IOptionStrNo {
    label: string;
    value: string|number;
}

