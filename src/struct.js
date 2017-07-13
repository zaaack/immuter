// @flow
import { fromPairs } from 'lodash'
import { getIn, setIn } from 'timm'

function getType(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
function symbol(label) {
  return label
  // return typeof Symbol === 'function' ? Symbol(label) : label
}
const STRUCT_STATE = symbol('__structState') // lost after clone
const STRUCT_CONTEXT = symbol('__structContext') // won't lost after clone
const STRUCT_IMMUTABLE = symbol('__structIsImmutable')
const primitiveTypes = fromPairs([
  'boolean', 'string', 'number', 'null', 'undefined',
  'array', 'map', 'set', 'function', 'date', 'regexp',
].map(i => [i, true]))

type State = {
  data: any,
  [typeof STRUCT_IMMUTABLE]: boolean,
}
type Context = {
  cache: WeakMap<any, Map<string, Proxy<any>>>
}

export type StructT<T: Object> = T

// Pre define property for ie polyfill
function preDefine(obj: Object, key: string, val: any) {
  if (key in obj) return
  Object.defineProperty(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value: val,
  })
}

function makeHandler({
  state,
  chain = [],
  ctx,
  root,
}: {
  state: State,
  chain?: string[],
  ctx: Context,
  root: boolean,
}) {
  // Create closure ctx binding for each proxy,
  // than we can change cached proxy's ctx later
  const { cache } = ctx
  return {
    get(target: any, property: string, receiver: Proxy<*>) {
      if (root) {
        switch (property) {
          case STRUCT_STATE:
            return state
          case STRUCT_CONTEXT:
            return ctx
          default:
        }
      }
      const _chain = chain.concat(property)
      let val = getIn(state.data, _chain)
      const valType = getType(val)
      // console.log('val before scalar', _chain, val)
      if (valType in primitiveTypes) {
        return val
      }
      let ProxyMap = cache.get(val)
      if (!ProxyMap) {
        ProxyMap = new Map()
        cache.set(val, ProxyMap)
      }
      let chainStr
      try {
        chainStr = _chain.join('.')
      } catch (e) {
        console.error(_chain)
        throw e
      }
      let proxy = ProxyMap.get(chainStr)
      if (!proxy) {
        preDefine(val, STRUCT_STATE, state)
        // preDefineProperty(val, STRUCT_ORIGINAL_STATE, state)
        proxy = new Proxy(val, makeHandler({state, chain: _chain, ctx, root: false}))
        ProxyMap.set(chainStr, proxy)
      } else {
        // Change state to current state
        // this might cause a problem if you read and write properties of two copy alternately
        let _proxy: any = proxy
        _proxy[STRUCT_STATE] = state
      }
      return proxy
    },
    set(target: any, property: string, value: any, receiver: Proxy<*>) {
      if (property === STRUCT_STATE) {
        state = value
        return true
      }
      // if (state[STRUCT_IMMUTABLE]) {
      //   throw new TypeError('Cannot set a struct\'s property after it\'s cloned, it\'s immutable.')
      // }
      const _chain = chain.concat(property)
      state.data = setIn(state.data, _chain, value)
      return true
    },
  }
}

function _Struct<T: Object>(
  data: T,
  ctx?: Context = {cache: new WeakMap()}
): T {
  if (!data) {
    return data
  }
  const state = {
    data: {...data},
    [STRUCT_IMMUTABLE]: false,
  }
  // Fix ie polyfill
  preDefine(state.data, STRUCT_STATE, state)
  // preDefineProperty(state.data, STRUCT_ORIGINAL_STATE, state)
  preDefine(state.data, STRUCT_CONTEXT, ctx)
  const ret: any = new Proxy(state.data, makeHandler({state, ctx, root: true}))
  return ret
}

export default function Struct<T: Object>(data: T): StructT<T> {
  if (Struct.isStruct(data)) {
    return data
  }
  return _Struct(data)
}

Struct.clone = function<T: Object> (struct: StructT<T>): StructT<T> {
  const state = struct[STRUCT_STATE]
  const ctx = struct[STRUCT_CONTEXT]
  if (!state || !ctx) {
    console.log(struct)
    console.trace()
    throw new TypeError('Cannot clone a non-struct type!')
  }
  // state[STRUCT_IMMUTABLE] = true
  return _Struct(state.data, ctx)
}

Struct.isStruct = function (struct: any) {
  if (!struct) {
    return false
  }
  return Boolean(struct[STRUCT_STATE] && struct[STRUCT_CONTEXT])
}
