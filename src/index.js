/* @flow */
import {
  get as _get, set as _set, isPlainObject, toPairs as _toPairs,
  defaults as withDefaults
} from 'lodash'
import { set as _fpSet, update as _fpUpdate } from 'lodash/fp'
import toPath from 'lodash/toPath'

type Path = string | Array<string>
type GetPath = Path | { [string]: Path }
type SetPath = Path | { [Path]: * }
type Updater = (val: any) => any
type UpdatePath = Path | { [Path]: Updater }
type DelPath = Path | { [Path]: boolean }

export const fpOptions = {
  rearg: false,
  curry: false,
  fixed: false, // get defaults
}

function toPairs(obj: Object) {
  return _toPairs(obj).map(([key, val]) => {
    if (key.indexOf(',') !== -1) {
      key = key.split(',')
    }
    return [key, val]
  })
}

const [fpSet, fpUpdate]: [typeof _fpSet, typeof _fpUpdate] =
  (([_fpSet, _fpUpdate].map(fn => fn.convert(fpOptions))): any)

function get<T: Object>(obj: T, path: GetPath, defaults?: *): * {
  if (isPlainObject(path)) {
    const combinedValue = toPairs((path: any)).reduce((newObj, [newKey, subPath]) =>
      _set(newObj, newKey, get(obj, subPath)), {})
    return withDefaults(combinedValue, (defaults: any))
  }
  if (path.length === 0) {
    return obj
  }
  return _get(obj, (path: any), defaults)
}

function set<T: Object>(obj: T, path: SetPath, value?: *): T {
  if (isPlainObject(path)) {
    return toPairs((path: any)).reduce((newObj: T, pair: Array<*>) => fpSet(newObj, ...pair), obj)
  }
  if (path.length === 0) {
    return obj
  }
  return fpSet(obj, (path: any), value)
}

function update<T: Object>(obj: T, path: UpdatePath, fn: ?Updater): T {
  if (isPlainObject(path)) {
    return toPairs((path: any)).reduce((newObj: T, pair: Array<*>) =>
      update(newObj, ...pair), obj)
  }
  if (path.length === 0) {
    return fn ? fn(obj) : obj
  }
  return fn ? fpUpdate(obj, (path: any), fn) : obj
}

function del<T: Object>(obj: T, path: DelPath): T {
  if (isPlainObject(path)) {
    return toPairs((path: any)).reduce((newObj: T, [subPath, isDel]: Array<*>) => {
      return isDel ? del(newObj, subPath) : newObj
    }, obj)
  }
  const pathArray: Array<string> = toPath(path, obj)
  const last = pathArray[pathArray.length - 1]
  const parentPath = pathArray.slice(0, -1)
  if (parentPath.length === 0) {
    const newObj = {...(obj: any)}
    delete newObj[last]
    return newObj
  }
  return update(obj, parentPath, parent => {
    if (parent instanceof Array) {
      const lastIdx = +last
      parent = parent.filter((_, i) => i !== lastIdx)
    } else if (isPlainObject(parent)) {
      parent = { ...parent }
      delete parent[last]
    }
    return parent
  })
}

class ImmuterWrapper<T: Object> {
  _obj: T
  _chain = false
  constructor(obj: T, chain: boolean = false) {
    this._obj = obj
    this._chain = chain
  }
  bindObj(wrap: boolean): ImmuterWrapper<T> {
    return bindObj(this._obj, wrap)
  }
  getObj() {
    return this._obj
  }
  get(path: GetPath, defaults?: *) {
    return get(this._obj, path, defaults)
  }
  set(path: SetPath, value?: *) {
    this._obj = set(this._obj, path, value)
    if (this._chain) return this
    return this._obj
  }
  update(path: SetPath, fn?: ?Updater) {
    this._obj = update(this._obj, path, fn)
    if (this._chain) return this
    return this._obj
  }
  del(path: DelPath) {
    this._obj = del(this._obj, path)
    if (this._chain) return this
    return this._obj
  }
  delete = this.del
}

function bindObj<T: Object>(obj: T, chain: boolean = false): ImmuterWrapper<T> {
  return new ImmuterWrapper(obj, chain)
}

export type ImmuterGet = (path: GetPath, defaults?: *) => *
export type ImmuterSet = <State>(path: SetPath, value?: *) => State
export type ImmuterUpdate = <State>(path: UpdatePath, fn?: Updater) => State
export type ImmuterDel = <State>(path: DelPath) => State

function bindComp<T: Object>(
  ns: boolean | string = false,
  includes?: ?Array<string>,
  excludes: Array<string> = ['bindObj', 'bindComp']
) {
  let names = Object.keys(immuter)
    .filter(name => excludes.indexOf(name) === -1)
    .filter(name => includes ? includes.indexOf(name) !== -1 : true)

  return (comp: React$Component<*, *, T>) => {
    ns = ns === true ? 'immuter' : ns
    const instance = ns ? ((comp: any).prototype[ns] = {}) : (comp: any).prototype
    names.forEach(name => {
      instance[name] = function (...args) {
        const ret = immuter[name](this.state, ...args)
        if (name === 'get') {
          return ret
        }
        return new Promise((resolve, reject) => {
          try {
            this.setState((ret: any), () => resolve(ret))
          } catch (e) {
            reject(e)
            // try fix
            console.error(e)
          }
        })
      }
    })
    return comp
  }
}
const immuter = { bindObj, bindComp, get, set, update, del, delete: del }
export { bindObj, bindComp, get, set, update, del }
export default immuter
