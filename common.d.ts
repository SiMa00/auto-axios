
export type TBase = string|number|boolean
export type TBaseNull = TBase|undefined|null

export interface IObjAny { [propName: string]: any }
export interface IObj { [propName: string]: TBaseNull|Function|Array<TBaseNull>|Array<IObj>|IObj }