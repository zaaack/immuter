// @flow
import { fromPairs } from 'lodash'
import { getIn, setIn } from 'timm'

function getType(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
function symbol(label) {
  return label
  // Looks like proxy-polyfill doesn't support symbol property
  // return (typeof Symbol === 'function') ? Symbol(label) : label
}
symbol.existed = typeof Symbol === 'function'
// export just for debug
const STRUCT_ROOT = symbol('##__structRoot') // just mark it's root
const STRUCT_STATE = symbol('##__structState') // lost after clone
const STRUCT_CONTEXT = symbol('##__structContext') // won't lost after clone
const STRUCT_CHILD_RAW = symbol('##__structChildRaw') // raw value of child
const STRUCT_CHAIN = symbol('##__structChain')
const primitiveTypes = fromPairs([
  'boolean', 'string', 'number', 'null', 'undefined',
  'array', 'map', 'set', 'function', 'date', 'regexp',
  'symbol',
].map(i => [i, true]))

type State = {
  data: any,
}
type Context = {
  cache: WeakMap<any, Proxy<any>>
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

const dummy = {}
// Fix ie polyfill
function preDefineAll(val: Object) {
  preDefine(val, STRUCT_STATE, dummy)
  preDefine(val, STRUCT_CHILD_RAW, dummy)
  preDefine(val, STRUCT_CHAIN, dummy)
  preDefine(val, STRUCT_ROOT, dummy)
  preDefine(val, STRUCT_CONTEXT, dummy)
}

function makeHandler({
  state,
  chain = [],
  ctx,
  root,
}: {
  state: State,
  chain?: Array<string | number>,
  ctx: Context,
  root: boolean,
}) {
  // Create closure ctx binding for each proxy,
  // than we can change cached proxy's ctx later
  const { cache } = ctx
  return {
    get(target: any, property: string, receiver: Proxy<*>) {
      if (property === STRUCT_STATE) {
        return root ? state : void 0
      } else if (property === STRUCT_ROOT) {
        return root ? true : void 0
      } else if (property === STRUCT_CONTEXT) {
        return ctx
      }

      if (property === STRUCT_CHILD_RAW) {
        // if (!root) {
        //   console.log('get child raw value:', state.data, chain)
        // }
        return !root ? getIn(state.data, chain) : undefined
      }

      const _chain = chain.concat(property)
      let val = getIn(state.data, _chain)
      const valType = getType(val)
      // console.log('val before scalar', _chain, val)
      if (valType in primitiveTypes) {
        return val
      }
      // console.log('val after scalar', _chain, val)
      let proxy = cache.get(val)
      if (!proxy) {
        preDefineAll(val)
        proxy = new Proxy(val, makeHandler({state, chain: _chain, ctx, root: false}))
        cache.set(val, proxy)
      } else {
        // Change state to current state
        // this might cause a problem if you read and write properties of two copy alternately
        let _proxy: any = proxy
        _proxy[STRUCT_STATE] = state
        _proxy[STRUCT_CHAIN] = _chain
        // console.log('hit cache', _chain.join('.'))
      }
      return proxy
    },
    set(target: any, property: string, value: any, receiver: Proxy<*>) {
      if (property === STRUCT_STATE) {
        state = value
        return true
      } else if (property === STRUCT_CHAIN) {
        chain = value
        return true
      }
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
  }
  preDefineAll(state.data)
  const ret: any = new Proxy(state.data, makeHandler({state, ctx, root: true}))
  return ret
}

export default function Struct<T: Object>(data: T): StructT<T> {
  if (Struct.isStruct(data)) {
    return Struct.clone(data)
  }
  return _Struct(data)
}

Struct.clone = function<T: Object> (struct: StructT<T> | T): StructT<T> {
  const state = struct[STRUCT_STATE]
  const isRoot = struct[STRUCT_ROOT]
  const ctx = struct[STRUCT_CONTEXT]
  if (isRoot && state && ctx) {
    return _Struct(state.data, ctx)
  }
  const raw = struct[STRUCT_CHILD_RAW]
  if (!isRoot && raw && ctx && typeof raw === 'object') {
    return _Struct(raw, ctx)
  }
  console.error(struct, state, isRoot, ctx)
  throw new TypeError('Cannot clone a non-struct!')
}

Struct.isStruct = function (struct: any) {
  if (!struct) {
    return false
  }
  return Boolean(struct[STRUCT_ROOT] && struct[STRUCT_STATE] && struct[STRUCT_CONTEXT])
}

Struct.debug = function (struct: any, json: boolean = false) {
  let meta = {
    isStruct: Struct.isStruct(struct),
    struct: struct,
  }
  if (struct) {
    meta = {
      ...meta,
      '[STRUCT_ROOT]': struct[STRUCT_ROOT],
      '[STRUCT_STATE]': struct[STRUCT_STATE],
      '[STRUCT_CONTEXT]': struct[STRUCT_CONTEXT],
      '[STRUCT_CHILD_RAW]': struct[STRUCT_CHILD_RAW],
    }
  }
  if (json) {
    meta = JSON.stringify(meta, null, 2)
  }
  console.log(meta)
}

const chainMap: WeakMap<Object, string[]> = new WeakMap()
function chainCollector<T: Object>(data: T): T {
  const chain = []
  const proxy = new Proxy(data, {
    get(target: any, property: string, receiver: Proxy<*>) {
      chain.push(property)
      return proxy
    },
  })
  chainMap.set(proxy, chain)
  return proxy
}

export function setT<T: Object, F>(data: T, keyPath: (key: T) => F): (val: F) => T {
  const collector: any = keyPath(chainCollector(data))
  const path: Array<string | number> = (chainMap.get(collector): any)
  return (val: F) => setIn(data, path, val)
}
