declare module 'immuter' {
  type Path = string | string[]
  type GetPath = Path | { [key: string]: Path }
  type SetPath = Path | { [key: string]: any }
  type Updater = (val: any) => any
  type UpdatePath = Path | { [key: string]: Updater }
  type DelPath = Path | { [key: string]: boolean }
  export type ImmuterGet = (path: GetPath, defaults?: any) => any
  export type ImmuterSet<State> = (path: SetPath, value?: any) => State
  export type ImmuterUpdate<State> = (path: UpdatePath, fn?: Updater) => State
  export type ImmuterDel<State> = (path: DelPath) => State
  export class ImmuterWrapper<T> {
    constructor(obj: T, chain: boolean);
    bindObj(wrap: boolean): ImmuterWrapper<T>;
    getObj(): T;
    get(path: GetPath, defaults?: any): any;
    set(path: SetPath, value?: any): T;
    update(path: SetPath, fn?: Updater): T;
    del(path: DelPath): T;
  }

  export interface ImmuterInterface {
    bindObj<T>(obj: T, wrap?: boolean): ImmuterWrapper<T>;
    get<T>(obj: T, path: GetPath, defaults?: any): any;
    set<T>(obj: T, path: SetPath, value?: any): T;
    update<T>(obj: T, path: SetPath, fn?: Updater): T;
    del<T>(obj: T, path: DelPath): T;
    Struct: StringConstructor;
  }

  export interface StructConstructor {
    <T>(obj: T): T;
    isStruct<T>(obj: T): boolean;
    clone<T>(obj: T): T;
  }

  export const Struct: StructConstructor
  export const Immuter: ImmuterInterface
  export default Immuter
}
