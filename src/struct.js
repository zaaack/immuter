// @flow
import { get as _get, fromPairs, isPlainObject } from 'lodash'
import { fpSet } from './common'

function getType(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
const STRUCT_CONTEXT = '__structContext'
const primitiveTypes = fromPairs([
  'boolean', 'string', 'number', 'null', 'undefined',
  'array', 'map', 'set', 'function', 'date', 'regexp',
].map(i => [i, true]))

export default function Struct<T: Object>(state: T): T {
  return _Struct(state)
}

Struct.clone = function<T: Object> (struct: T): T {
  const ctx = struct[STRUCT_CONTEXT]
  if (!ctx) {
    return _Struct(struct)
  }
  return _Struct(ctx.state, ctx.newState)
}

Struct.isStruct = function (struct: any) {
  if (!struct) {
    return false
  }
  return Boolean(struct[STRUCT_CONTEXT])
}

function makeHandler({ctx, chain = []}: {
  ctx: {state: any, newState: any},
  chain?: string[]
}) {
  return {
    get(target: any, property: string, receiver: any) {
      // console.log('get', property, /*ctx.state, ctx.newState, ctx*/)
      if (target === ctx.state && property === STRUCT_CONTEXT) {
        // console.log('get instance', STRUCT_INSTANCE, ctx)
        return ctx
      }
      const _chain = chain.concat(property)
      let val = _get(ctx.newState, _chain)
      if (typeof val === 'undefined') {
        val = _get(ctx.state, _chain)
      } else if (isPlainObject(val) || (Struct.isStruct(val))) {
        val = {
          ...(_get(ctx.state, _chain) || {}),
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
      ctx.newState = fpSet(ctx.newState, chain.concat(property), value)
      return true
    },
  }
}

function _Struct<T: Object>(state: T, newState?: Object): T {
  const ctx = {
    state: {...state},
    newState: newState || {},
  }
  // Fix ie polyfill
  Object.defineProperty(ctx.state, STRUCT_CONTEXT, {
    enumerable: false,
    configurable: true,
    writable: true,
    value: ctx,
  })
  return (new Proxy(ctx.state, makeHandler({ctx})): any)
}
