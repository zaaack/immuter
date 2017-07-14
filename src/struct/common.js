// @flow
import { fromPairs } from 'lodash'
export function getType(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
export function symbol(label: string) {
  return label
  // Looks like proxy-polyfill doesn't support symbol property
  // return (typeof Symbol === 'function') ? Symbol(label) : label
}
symbol.existed = typeof Symbol === 'function'
// export just for debug
export const STRUCT_ROOT = symbol('##__structRoot') // just mark it's root
export const STRUCT_STATE = symbol('##__structState') // lost after clone
export const STRUCT_CONTEXT = symbol('##__structContext') // won't lost after clone
export const STRUCT_CHILD_RAW = symbol('##__structChildRaw') // raw value of child
export const STRUCT_CHAIN = symbol('##__structChain')
export const primitiveTypes = fromPairs([
  'boolean', 'string', 'number', 'null', 'undefined',
  'array', 'map', 'set', 'function', 'date', 'regexp',
  'symbol',
].map(i => [i, true]))

export type OnChange = (chain: Array<string | number>, val: any) => void
export type State<T=any> = {
  data: T,
  onChange?: OnChange,
}
export type Context = {
  cache: WeakMap<any, Proxy<any>>
}
export type StructT<T> = T
