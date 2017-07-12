/* @flow */
import { set as _fpSet, unset as _fpUnset, update as _fpUpdate } from 'lodash/fp'

export type Path = string | Array<string>
export type GetPath = Path | { [string]: Path }
export type SetPath = Path | { [string]: any }
export type Updater = (val: any) => any
export type UpdatePath = Path | { [string]: Updater }
export type DelPath = Path | { [string]: boolean }

export const fpOptions = {
  rearg: false,
  curry: false,
  fixed: false, // get defaults
}

const [fpSet, fpUnset, fpUpdate]: [typeof _fpSet, typeof _fpUnset, typeof _fpUpdate] =
  (([_fpSet, _fpUnset, _fpUpdate].map(fn => fn.convert(fpOptions))): any)

export { fpSet, fpUnset, fpUpdate }

export class IterableWeakMap {
  constructor(init) {
    this._keys = new WeakSet(Object.keys(init))
    this._wm = new WeakMap(init)
  }
  clear() {
    this._wm = new WeakMap()
    this._keys = new WeakSet()
  }
  delete(k) {
    this._keys.delete(k)
    return this._wm.delete(k)
  }
  get(k) {
    return this._wm.get(k)
  }
  has(k) {
    return this._wm.has(k) && this._keys.has(k)
  }
  set(k, v) {
    this._wm.set(k, v)
    return this
  }
}
