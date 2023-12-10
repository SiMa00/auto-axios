
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

export interface IOptionNo {
    label: string;
    value: number;
}
export interface IOptionStr {
    label: string;
    value: string;
}
export interface IOptionStrNo {
    label: string;
    value: string|number;
}
export interface IFOption { // form 里的 option
    label: string;
    value: string;
    disabled?: boolean;
}
export interface IOptionMore {
    label: string;
    value: string|number;
    [propName: string|number]: any;
}

// 转 tree 结构  后端返回的原始数据
export interface IBackendTree {
  id: number|string;
  parentId: number|string; // 不写死 父id字段1
  // [key:string]:number|string; // 不写死 父id字段2
}
export interface ITreeNode extends IBackendTree {
  children?: ITreeNode[];
}
/*************************************************************  菜单相关 开始 ***********************************************************/
export interface IRoute {
    path: string; 
    name?: string; 
    component: () => Promise<any>; 
    children?: Array<IRoute>;
    meta?: IObjAny;
}
export type IReqMth = 'GET'|'POST'|'DELETE'|'PUT'
export interface ICreateUpdate {
    createTime: number|string;
    creatorName: string;
    updateTime: number|string;
    updaterName: string;
}
export enum MENU_TYPE {
    PAGE = 'P', // 页面
    DIR = 'D', // 目录
    BUTTON = 'B', // 按钮
}

export interface IMenu extends ICreateUpdate {
    id: string|number; // 菜单id
    menuName: string; // 菜单名称
    menuType: string; // 菜单类型; 以 http:// 或者 https:// 开头的 会被当初外链
    parentId: string|number; // 父菜单id
    perms: string; // 权限字符
    path?: string; // 路由地址(页面时)、请求地址(接口时); 不可重复(有域名时，拼上域名不可重复)
    index: number; // 排序
    icon?: string; // 图标
    platformId: string|number;  // 平台id
    platformStr?: string;
    reqMethod?: IReqMth; // 请求方法(接口时)
    visible: 0|1; // 是否显示; 0显示
}
// 菜单模型--后台 model 字段映射;接口返回的菜单对象，一定要包含这些字段，若没有，则映射
export interface IBackMenuField {
    id?: string;
    menuName?: string;
    menuType?: string;
    parentId?: string;
    perms?: string;
    path?: string;
    index?: string;
    icon?: string;
    platformId?: string;
    platformStr?: string;
    reqMethod?: string;
    visible?: string;
    componentPath?: string;
    children?: string;
    createTime?: string;
    creatorName?: string;
    updateTime?: string;
    updaterName?: string;
}
// 菜单模型--后台 model
export interface IBackMenu extends IMenu {
    componentPath?: string; // 菜单组件 路径; 可以 .vue 或者 A/index 或者 A 
    children?: Array<IBackMenu>;
}
// 菜单模型--前台页面(未脱敏)
export interface IFontMenu extends IMenu {
    component?: () => Promise<any>;
    children?: Array<IFontMenu>;
}
// 菜单模型--左侧 作前端展示; 仅仅满足Menu组件需要，作前端展示(脱敏)
export interface ISiderShowMenu {
    title: string; // 显示的 菜单标题
    isClass1: boolean; // 是否是 一级菜单
    routeKey?: string; // 外链时 时url值得形式;非外链 则是 路由/a/b的形式;自身域名时，则会去掉 域名变成 /a/b
    menuType: string;
    icon?: string,
    children?: Array<ISiderShowMenu>|[];
}

/*************************************************************  菜单相关 结束 ***********************************************************/

