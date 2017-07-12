// @flow
import test from 'ava'
import { Struct } from '../src'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import isEqual from 'lodash/isEqual'

let plain
let book
let originalBook

test.before(() => {
  plain = (obj) => {
    return cloneDeep(obj)
  }
  const category = Struct({
    name: 'novel',
    count: 123,
  })
  book = {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone',
    },
    category,
    category2: Struct.clone(category),
    author: 'J. k. rowling',
    tags: ['novel', 'magic'],
    pub_date: new Date('2017-7-11'),
    reg: /\d/,
  }

  originalBook = cloneDeep(book)
})

test('struct', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  struct1.author = 'New Author'
  t.is(struct.author, book.author)
  t.is(struct1.author, 'New Author')
  t.true(isEqual(plain(struct), {
    'title': {
      'zh': '哈利·波特与魔法石',
      'en': "Harry Potter and the Philosopher's Stone",
    },
    'category': {
      name: 'novel',
      count: 123,
    },
    'category2': {
      name: 'novel',
      count: 123,
    },
    reg: /\d/,
    'author': 'J. k. rowling',
    'tags': [
      'novel',
      'magic',
    ],
    pub_date: book.pub_date,
  }))

  const struct2 = Struct.clone(struct1)
  t.is(struct1.author, 'New Author')
  t.is(struct2.author, 'New Author')
  console.log('struct.title', struct2.title, struct.title, struct2.title === struct.title)
  t.is(struct1.title, struct.title)
  t.true(struct2.title === struct.title)

  t.deepEqual(struct2.title, {
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  })
  struct2.title.en = 'New Title'
  t.deepEqual(struct2.title, {
    zh: '哈利·波特与魔法石',
    en: 'New Title',
  })
  t.deepEqual(struct2.title.zh, '哈利·波特与魔法石')
  t.deepEqual(struct2.title.en, 'New Title')
  t.deepEqual(plain(struct1), {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone',
    },
    category: {
      name: 'novel',
      count: 123,
    },
    category2: {
      name: 'novel',
      count: 123,
    },
    reg: /\d/,
    pub_date: book.pub_date,
    author: 'New Author',
    tags: ['novel', 'magic'],
  })
  t.deepEqual(plain(struct), {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone',
    },
    category: {
      name: 'novel',
      count: 123,
    },
    category2: {
      name: 'novel',
      count: 123,
    },
    reg: /\d/,
    pub_date: book.pub_date,
    author: 'J. k. rowling',
    tags: ['novel', 'magic'],
  })

  t.deepEqual(book, originalBook)
})

test('struct regexp', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  t.deepEqual(struct1.reg, /\d/)
  struct1.reg = /\s/
  t.deepEqual(struct.reg, /\d/)
  t.deepEqual(struct1.reg, /\s/)
})

test('struct date', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  t.deepEqual(struct1.pub_date, new Date('2017-7-11'))
  struct1.pub_date = new Date('2017-7-12')
  t.deepEqual(struct.pub_date, new Date('2017-7-11'))
  t.deepEqual(struct1.pub_date, new Date('2017-7-12'))
})

test('struct array', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  const tags = [...struct1.tags]
  tags[0] = 'abc'
  struct1.tags = tags
  t.deepEqual(struct1.tags, ['abc', 'magic'])
})

test('struct struct', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  struct1.category.name = 'array'
  t.deepEqual(struct1.category.name, 'array')
  t.false(struct1.category === struct.category)
  t.deepEqual(plain(struct1.category), {
    name: 'array',
    count: 123,
  })
  t.is(struct1.title, struct.title)
  t.is(struct1.category2.name, 'novel')
  t.is(struct1.category2, struct.category2)
  t.deepEqual(struct1.category.name, 'array')
})

// test('struct wrong mutate', t => {
//   const struct = Struct(book)
//   const struct1 = Struct.clone(struct)
//   const error = t.throws(() => {
//     struct.author = 'New Author'
//   }, TypeError)
//   t.is(error.message, 'Cannot set a struct\'s property after it\'s cloned, it\'s immutable.')
// })
