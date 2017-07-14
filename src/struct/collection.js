import { updateIn, setIn } from 'timm'
function symbol(label) {
  return (typeof Symbol === 'function') ? Symbol(label) : label
}
export const STRUCT_STATE = symbol('__structStateInCollection')
export const STRUCT_CHAIN = symbol('__structChainInCollection')

let Struct
function getStruct() {
  if (!Struct) {
    Struct = require('./index').default
  }
  return Struct
}

export class StructArray<T> {
  constructor(data: Array<T> = []) {
    ;(this: any)._data = data
  }
  mutate(updater: Array<T> => Array<T>) {
    const _this: any = this
    const Struct = getStruct()
    _this._data = updater(_this._data.map(item => Struct(item)))

    const state: any = _this[STRUCT_STATE]
    const chain: any = _this[STRUCT_CHAIN]
    state.data = setIn(state.data, chain, new StructArray(_this._data))
  }
}

function updateCollection(ctx: any, Type: any) {
  const state: any = ctx[STRUCT_STATE]
  const mapChain: any = ctx[STRUCT_CHAIN]
  state.data = setIn(state.data, mapChain, new Type(ctx._data))
}

class MutableMap<K, V> extends Map<K, V> {
  __onChange = (key: any, chain: Array<string | number>, val: any) => {
    const _this: any = this

    const Struct = getStruct()
    const structValue: any = this.get(key)
    if (structValue) {
      this.set(key, (Struct.clone(structValue, void 0, {
        onChange: this.__onChange(),
      }): any))
    } else {
      console.log('Set unknow key', key, structValue)
    }
  }

  get(key: K): V | void {
    let value = super.get(key)
    if (!value) {
      return value
    }
    const Struct: any = getStruct()
    if (Struct.isStruct(value)) {
      return value
    }
    value = Struct(value, (...args) => this.__onChange(key, ...args))
    super.set(key, value)
    return value
  }
}

export class ImmutableMap<K, V> {
  constructor(data: Map<K, V> = new Map()) {
    ;(this: any)._data = data
  }

  mutate(updater: Map<K, V> => Map<K, V>): ImmutableMap<K, V> {
    const _this: any = this
    const Struct = getStruct()
    _this._data = updater(new MutableMap(_this._data))

    const state: any = _this[STRUCT_STATE]
    const chain: any = _this[STRUCT_CHAIN]
    state.data = setIn(state.data, chain, new ImmutableMap(_this._data))
    return this
  }
}

export class ImmutableArray<T> extends Array<T> {

}
