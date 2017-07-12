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
