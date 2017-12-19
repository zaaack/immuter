// @flow
/* eslint-disable */
import { Struct } from 'immuter'


const struct = Struct({
  title: {
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  },
  author: 'J. k. rowling',
  tags: ['novel', 'magic'],
})

// Create an optimized copy, only change modified part.
const newStruct = Struct.clone(struct, (s) => {
  s.title.en = 'aaa'
})
// @flow

function keymirror<T>(obj: T): {[key: $Keys<T>]: $Keys<T>} {
  return (null: any)
}

const a = keymirror({
  aa: null
})
