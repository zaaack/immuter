import { Struct } from 'immuter'

let struct = Struct({
  title: {
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  },
  author: 'J. k. rowling',
  tags: ['novel', 'magic'],
})

struct = Struct.clone(struct, s => {
  s.author === 'J. k. rowling' // true
  s.title.en = 'New Title'
}) // Clone struct, it will only change modified part to optimize performance.
