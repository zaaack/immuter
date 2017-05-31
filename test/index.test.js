import test from 'ava'
import immuter from '../src'
import cloneDeep from 'lodash/cloneDeep'
const book = {
  title: {
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  },
  author: 'J. k. rowling',
  tags: ['novel', 'magic'],
}

const originalBook = cloneDeep(book)

test('get', t => {
  t.is(immuter.get(book, 'title.en'), 'Harry Potter and the Philosopher\'s Stone')
  t.is(immuter.get(book, ['title', 'en']), 'Harry Potter and the Philosopher\'s Stone')
  t.is(immuter.get(book, 'author'), 'J. k. rowling')
  t.is(immuter.get(book, 'tags[0]'), 'novel')
  t.is(immuter.get(book, 'tags.0'), 'novel')
  t.is(immuter.get(book, ['tags', '0']), 'novel')
  t.is(immuter.get(book, ['tags', '1']), 'magic')
  t.is(immuter.get(book, ['tags', '2']), undefined)
  t.is(immuter.get(book, 'marks_count', 0), 0)
  t.is(immuter.get(book, 'title.rs', 0), 0)
  t.is(immuter.get(book, ['tags', '2'], 'default tag'), 'default tag')
  t.deepEqual(immuter.get(book, {
    'title': 'title.en',
    'author': 'author',
  }, {
    'type': 'book',
  }), {
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J. k. rowling',
    type: 'book',
  })
})

test('immutable set', t => {
  const newBook = immuter.set(book, 'title.en', 'Harry Potter and something...')
  t.deepEqual(book, originalBook)
  t.is(newBook.title.en, 'Harry Potter and something...')
  t.true(newBook.tags === book.tags)
  t.deepEqual(newBook.tags, book.tags)
  t.not(newBook, book)
  t.not(newBook.title, book.title)
  const newBook2 = immuter.set(book, {
    'title.en': 'Harry Potter 1',
    'title.defaults': 'Harry Potter',
    'author': 'J.K.R.',
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook2, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter 1',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic'],
  })
  const newBook3 = immuter.set(book, {
    [['title', 'en']]: 'Harry Potter 1',
    [['title', 'defaults']]: 'Harry Potter',
    'author': 'J.K.R.',
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook3, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter 1',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic'],
  })
})

test('immutable update', t => {
  const newBook = immuter.update(book, 'title.en', title => title + ' (Original Edition)')
  t.deepEqual(book, originalBook)
  t.is(newBook.title.en, 'Harry Potter and the Philosopher\'s Stone (Original Edition)')
  t.true(newBook.tags === book.tags)
  t.deepEqual(newBook.tags, book.tags)
  t.not(newBook, book)
  t.not(newBook.title, book.title)
  const newBook2 = immuter.update(book, {
    'title.en': title => title + ' (Original Edition)',
    'title.defaults': () => 'Harry Potter',
    'author': () => 'J.K.R.',
    'tags': tags => tags.concat(['UK']),
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook2, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone (Original Edition)',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic', 'UK'],
  })
  const newBook3 = immuter.update(book, {
    [['title', 'en']]: title => title + ' (Original Edition)',
    [['title', 'defaults']]: () => 'Harry Potter',
    'author': () => 'J.K.R.',
    'tags': tags => tags.concat(['UK']),
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook3, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone (Original Edition)',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic', 'UK'],
  })
})

test('immutable delete', t => {
  const newBook = immuter.delete(book, 'title.en')
  t.deepEqual(book, originalBook)
  t.false('en' in newBook.title)
  t.true(newBook.tags === book.tags)
  t.deepEqual(newBook.tags, book.tags)
  t.not(newBook, book)
  t.not(newBook.title, book.title)
  const newBook2 = immuter.delete(book, {
    'title.en': true,
    'title.zh': false,
    'author': true,
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook2, {
    title: {
      zh: '哈利·波特与魔法石',
    },
    tags: ['novel', 'magic'],
  })
  const newBook3 = immuter.delete(book, {
    [['title', 'en']]: true,
    [['title', 'zh']]: false,
    'author': true,
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook3, {
    title: {
      zh: '哈利·波特与魔法石',
    },
    tags: ['novel', 'magic'],
  })
})

test('bindObj', t => {
  const immuBook = immuter.bindObj(book)
  const newBook = immuBook.update('title.en', title => title + ' (Original Edition)')
  const newBook2 = immuter.bindObj(book, true)
    .update('title.en', title => title + ' (Original Edition)')
    .getObj()

  t.deepEqual(newBook, newBook2)
  t.deepEqual(book, originalBook)
  t.is(newBook.title.en, 'Harry Potter and the Philosopher\'s Stone (Original Edition)')
  t.true(newBook.tags === book.tags)
  t.deepEqual(newBook.tags, book.tags)
  t.not(newBook, book)
  t.not(newBook.title, book.title)
  const newBook3 = immuBook.update({
    'title.en': title => title + ' 2',
    'title.defaults': () => 'Harry Potter',
    'author': () => 'J.K.R.',
    'tags': tags => tags.concat(['UK']),
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(newBook3, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone (Original Edition) 2',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic', 'UK'],
  })
})

test('bindComp', t => {
  @immuter.bindComp()
  class Comp {
    state = book
    setState(state) {
      this.state = Object.assign({}, this.state, state)
    }
  }
  const comp = new Comp()
  comp.update('title.en', title => title + ' (Original Edition)')
  const newBook = comp.state
  t.deepEqual(book, originalBook)
  t.is(newBook.title.en, 'Harry Potter and the Philosopher\'s Stone (Original Edition)')
  t.true(newBook.tags === book.tags)
  t.deepEqual(newBook.tags, book.tags)
  t.not(newBook, book)
  t.not(newBook.title, book.title)
  comp.update({
    'title.en': title => title + ' 2',
    'title.defaults': () => 'Harry Potter',
    'author': () => 'J.K.R.',
    'tags': tags => tags.concat(['UK']),
  })
  t.deepEqual(book, originalBook)
  t.deepEqual(comp.state, {
    title: {
      zh: '哈利·波特与魔法石',
      en: 'Harry Potter and the Philosopher\'s Stone (Original Edition) 2',
      defaults: 'Harry Potter',
    },
    author: 'J.K.R.',
    tags: ['novel', 'magic', 'UK'],
  })
})
