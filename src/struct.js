// @flow
import { get as _get, fromPairs, isPlainObject } from 'lodash'
import { fpSet } from './common'

function getType(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
const STRUCT_INSTANCE = '__structInstance'
const primitiveTypes = fromPairs([
  'boolean', 'string', 'number', 'null', 'undefined',
  'array', 'map', 'set', 'function', 'date', 'regexp',
].map(i => [i, true]))

export default function Struct<T: Object>(state: T): T {
  return (new InternalStruct(state): any)
}

Struct.clone = function<T: Object> (struct: T): T {
  const ctx = struct[STRUCT_INSTANCE]
  if (!ctx) {
    return (new InternalStruct(struct): any)
  }
  return (new InternalStruct(ctx.__state, ctx.__newState): any)
}

Struct.is = function (struct: any) {
  if (!struct) {
    return false
  }
  return Boolean(struct[STRUCT_INSTANCE])
}

function makeHandler({ctx, chain = []}: {
  ctx: {__state: any, __newState: any},
  chain?: string[]
}) {
  return {
    get(target: any, property: string, receiver: any) {
      // console.log('get', property, /*ctx.__state, ctx.__newState, ctx*/)
      if (target === ctx.__state && property === STRUCT_INSTANCE) {
        // console.log('get instance', STRUCT_INSTANCE, ctx)
        return ctx
      }
      const _chain = chain.concat(property)
      let val = _get(ctx.__newState, _chain)
      if (typeof val === 'undefined') {
        val = _get(ctx.__state, _chain)
      } else if (isPlainObject(val) || (val instanceof InternalStruct)) {
        val = {
          ...(_get(ctx.__state, _chain) || {}),
          ...val,
        }
      }
      // console.log('val before scalar', _chain, val)
      if (getType(val) in primitiveTypes) {
        return val
      }
      // console.log('val', val)
      return new Proxy(val, makeHandler({ctx, chain: _chain}))
    },
    set(target, property, value, receiver) {
      // console.log('set', chain, property, value)
      ctx.__newState = fpSet(ctx.__newState, chain.concat(property), value)
      return true
    },
  }
}

export class InternalStruct<T: Object> {
  constructor(state: T, newState?: Object) {
    if (!(this instanceof InternalStruct)) {
      return new InternalStruct(state, newState)
    }
    const _this: {__state: any, __newState: any, clone: any} = (this: any)
    _this.__state = {...state}
    _this.__newState = {}
    if (newState) {
      _this.__newState = newState
    }
    // Fix ie polyfill
    Object.defineProperty(_this.__state, STRUCT_INSTANCE, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: _this,
    })
    const ret: any = new Proxy(_this.__state, makeHandler({ctx: _this}))
    return ret
  }
}
