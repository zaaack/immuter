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

test('struct deep', t => {
  const data = {
    deep: {
      child: {
        bb: {
          cc: {
            dd: 1,
          },
        },
      },
      ee: 'ee',
    },
  }
  const struct = Struct(data)
  const struct1 = Struct.clone(struct)
  t.is(struct1.deep.child.bb.cc.dd, 1)
  t.true(struct.deep.child.bb.cc.dd === struct1.deep.child.bb.cc.dd)
  t.true(struct.deep.child.bb === struct1.deep.child.bb)
  struct1.deep.child.bb.cc.dd = 2
  t.is(struct1.deep.child.bb.cc.dd, 2)
  t.is(struct.deep.child.bb.cc.dd, 1)
  t.false(struct1.deep.child.bb === struct.deep.child.bb)
  t.false(struct1.deep.child.bb.cc === struct.deep.child.bb.cc)
})

test('struct clone child', t => {
  const data = {
    deep: {
      child: {
        bb: {
          cc: {
            dd: 1,
          },
        },
      },
      ee: 'ee',
    },
  }
  const struct = Struct(data)
  const { dd } = struct.deep.child.bb.cc
  const child = Struct.clone(struct.deep.child)
  Struct.debug(child, true)
  // t.true(child.bb === struct.deep.child.bb) wrong set context order, then you are editint struct.deep.child
  try {
    child.bb.cc.dd = 2
  } catch (e) {
    Struct.debug(child, true)
    throw e
  }
  t.false(child.bb === struct.deep.child.bb)
  t.false(child.bb.cc === struct.deep.child.bb.cc)
  t.is(child.bb.cc.dd, 2)
  t.is(struct.deep.child.bb.cc.dd, 1)
  t.is(dd, 1)
})

test('struct right mutate', t => {
  const struct = Struct(book)
  const struct1 = Struct.clone(struct)
  const { category: category1 } = struct1
  category1.name = 'New Title'
  const { category } = struct
  t.is(category.name, 'novel')
  category.name = 'New Title 2'
  t.is(struct.category.name, 'New Title 2')
  t.is(struct1.category.name, 'New Title')
})

// // This will cause modify recently called struct without error, can't fix in runtime.
// test('struct wrong mutate', t => {
//   const struct = Struct(book)
//   const struct1 = Struct.clone(struct)
//   const { category } = struct1
//   console.log(struct.category)
//   category.name = 'New Title'
//   t.is(struct.category.name, 'novel')
//   t.is(struct1.category.name, 'New Title')
// })
