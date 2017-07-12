// @flow
import Struct from './struct'

class MutableStructArray {

}

export default class StructArray<T: Object> extends Array<T> {
  __array: Array<T>
  constructor(arr: Array<T>) {
    super()
    this.__array = arr
  }

  get length(): number {
    return this.__array.length
  }

  item(index: number) {
    return Struct(this.__array[index])
  }
}
