// @flow

const Immuter = require('../lib/index')
const Benchmark = require('benchmark')
const Immutable = require('immutable')
const timm = require('timm')
const { Struct } = Immuter
const SeamlessImmutable = require('seamless-immutable')
const async = false
const assert = require('assert')
const category = Struct({
  name: 'novel',
  count: 123,
})

const { Record } = Immutable

const book = {
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
  aa: {
    bb: {
      cc: {
        dd: {
          ee: {
            ff: {
              gg: {
                hh: {
                  ii: {
                    jj: 123,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
let originalStructBook = Struct(book)
let structBook = Struct.clone(originalStructBook)
let immuterBook = Immuter.bindObj(book, true)
let immutableBook = createImmutable()
let seamlessImmutableBook = SeamlessImmutable(book)

function init() {
  structBook = Struct.clone(originalStructBook)
  immuterBook = Immuter.bindObj(book, true)
  immutableBook = createImmutable()
  seamlessImmutableBook = SeamlessImmutable(book)
}

function createImmutable() {
  const Category = Record({
    name: 'novel',
    count: 123,
  })
  const Title = Record({
    zh: '哈利·波特与魔法石',
    en: 'Harry Potter and the Philosopher\'s Stone',
  })
  const category = new Category()
  const Book = Record({
    title: new Title(),
    category: category,
    category2: category,
    author: 'J. k. rowling',
    tags: ['novel', 'magic'],
    pub_date: new Date('2017-7-11'),
    reg: /\d/,
    aa: Immutable.fromJS({
      bb: {
        cc: {
          dd: {
            ee: {
              ff: {
                gg: {
                  hh: {
                    ii: {
                      jj: 123,
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  })
  return new Book()
}

const suitOptions = {
  onCycle(event) {
    console.log(String(event.target))
  },
  onComplete () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
    console.log('\n')
  },
  onStart(bench) {
    console.log('Start Suit:', bench.currentTarget.name)
  },
  onError(err) {
    console.error(err)
  },
}

// add tests
// new Benchmark.Suite('Create', suitOptions)
//   .add('Struct', function() {
//     Struct(book)
//   })
//   .add('Immuter', function() {
//     Immuter.bindObj(book, true)
//   })
//   .add('Immutable', function() {
//     createImmutable()
//   })
//   .add('SeamlessImmutable', function() {
//     SeamlessImmutable(book)
//   })
//   // run async
//   .run({ async })

// add tests
new Benchmark.Suite('Get one key', suitOptions)
  .add('Struct', function() {
    const title = structBook.title
  })
  .add('Immuter', function() {
    const title = immuterBook.get('title')
  })
  .add('Immutable', function() {
    const title = immutableBook.title
  })
  .add('SeamlessImmutable', function() {
    const title = seamlessImmutableBook.getIn(['title'])
  })
  .add('timm', function() {
    const title = timm.getIn(book, ['title'])
  })
  .add('vanilla', function() {
    const title = book.title
  })
  // run async
  .run({ async })

const keyArray = 'aa.bb.cc.dd.ee.ff.gg.hh.ii.jj'.split('.')

// add tests
new Benchmark.Suite('Get 2 key', suitOptions)
  .add('Struct', function() {
    const ret = structBook.aa.bb
  })
  .add('Immuter', function() {
    const ret = immuterBook.get('aa.bb')
  })
  .add('Immutable', function() {
    const ret = immutableBook.aa.getIn(['bb'])
  })
  .add('SeamlessImmutable', function() {
    const ret = seamlessImmutableBook.getIn(['aa', 'bb'])
  })
  .add('timm', function() {
    const ret = timm.getIn(book, ['aa', 'bb'])
  })
  .add('vanilla', function() {
    const ret = book.aa.bb
  })
  // run async
  .run({ async })

// add tests
new Benchmark.Suite('Get 5 key', suitOptions)
  .add('Struct', function() {
    const ret = structBook.aa.bb.cc.dd.ee
  })
  .add('Immuter', function() {
    const ret = immuterBook.get('aa.bb.cc.dd.ee')
  })
  .add('Immutable', function() {
    const ret = immutableBook.aa.getIn(['bb', 'cc', 'dd', 'ee'])
  })
  .add('SeamlessImmutable', function() {
    const ret = seamlessImmutableBook.getIn(['bb', 'cc', 'dd', 'ee'])
  })
  .add('timm', function() {
    const ret = timm.getIn(book, ['aa', 'bb', 'cc', 'dd', 'ee'])
  })
  .add('vanilla', function() {
    const ret = book.aa.bb.cc.dd.ee
  })
  // run async
  .run({ async })

// add tests
new Benchmark.Suite('Get 10 key', suitOptions)
  .add('Struct', function() {
    const ret = structBook.aa.bb.cc.dd.ee.ff.gg.hh.ii.jj
  })
  .add('Immuter', function() {
    const ret = immuterBook.get(keyArray)
  })
  .add('Immutable', function() {
    const ret = immutableBook.aa.getIn(keyArray.slice(1))
  })
  .add('SeamlessImmutable', function() {
    const ret = seamlessImmutableBook.getIn(keyArray)
  })
  .add('timm', function() {
    const ret = timm.getIn(book, ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj'])
  })
  .add('vanilla', function() {
    const ret = book.aa.bb.cc.dd.ee.ff.gg.hh.ii.jj
  })
  // run async
  .run({ async })

  // add tests
new Benchmark.Suite('Set One key', Object.assign({}, suitOptions, {
  onStart(bench) {
    suitOptions.onStart(bench)
    init()
  },
}))
    .add('Struct', function() {
      structBook.author = 'haha'
    })
    .add('Immuter', function() {
      immuterBook.set('author', 'haha')
    })
    .add('Immutable', function() {
      immutableBook.setIn(['author'], 'haha')
    })
    .add('SeamlessImmutable', function() {
      seamlessImmutableBook.setIn(['author'], 'haha')
    })
    .add('timm', function() {
      timm.setIn(book, ['author'], 'haha')
    })
    // run async
    .run({ async })
// add tests
new Benchmark.Suite('Set 2 key', Object.assign({}, suitOptions, {
  onStart(bench) {
    suitOptions.onStart(bench)
    init()
  },
}))
  .add('Struct', function() {
    structBook.aa.bb = {
      aa: 123,
    }
  })
  .add('Immuter', function() {
    immuterBook.set('aa.bb', {
      aa: 123,
    })
  })
  .add('Immutable', function() {
    immutableBook.aa.setIn(['aa', 'bb'], {
      aa: 123,
    })
  })
  .add('SeamlessImmutable', function() {
    seamlessImmutableBook.setIn(['aa', 'bb'], {
      aa: 123,
    })
  })
  .add('timm', function() {
    timm.setIn(book, ['aa', 'bb'], {
      aa: 123,
    })
  })
  // run async
  .run({ async })

// add tests
new Benchmark.Suite('Set 5 key', Object.assign({}, suitOptions, {
  onStart(bench) {
    suitOptions.onStart(bench)
    init()
  },
}))
  .add('Struct', function() {
    structBook.aa.bb.cc.dd.ee = {
      aa: 123,
    }
  })
  .add('Immuter', function() {
    immuterBook.set('aa.bb.cc.dd.ee', {
      aa: 123,
    })
  })
  .add('Immutable', function() {
    immutableBook.set('aa', immutableBook.aa.setIn(['bb', 'cc', 'dd', 'ee'], {
      aa: 123,
    }))
  })
  .add('SeamlessImmutable', function() {
    seamlessImmutableBook.setIn(['aa', 'bb', 'cc', 'dd', 'ee'], {
      aa: 1,
    })
  })
  .add('timm', function() {
    timm.setIn(book, ['aa', 'bb', 'cc', 'dd', 'ee'], {
      aa: 1,
    })
  })
  // run async
  .run({ async })

// add tests
new Benchmark.Suite('Set 10 key', Object.assign({}, suitOptions, {
  onStart(bench) {
    suitOptions.onStart(bench)
    init()
  },
}))
  .add('Struct', function() {
    structBook.aa.bb.cc.dd.ee.ff.gg.hh.ii.jj = 1
    // assert(structBook.author === originalStructBook.author)
    // assert(structBook.aa !== originalStructBook.aa)
    // assert(structBook.aa.bb !== originalStructBook.aa.bb)
    // assert(structBook.aa.bb.cc !== originalStructBook.aa.bb.cc)
    // assert(structBook.aa.bb.cc.dd !== originalStructBook.aa.bb.cc.dd)
    // assert(structBook.aa.bb.cc.dd.ee !== originalStructBook.aa.bb.cc.dd.ee)
    // assert(structBook.aa.bb.cc.dd.ee.ff !== originalStructBook.aa.bb.cc.dd.ee.ff)
    // assert(structBook.aa.bb.cc.dd.ee.ff.gg !== originalStructBook.aa.bb.cc.dd.ee.ff.gg)
    // assert(structBook.aa.bb.cc.dd.ee.ff.gg.hh !== originalStructBook.aa.bb.cc.dd.ee.ff.gg.hh)
    // assert(structBook.aa.bb.cc.dd.ee.ff.gg.hh.ii !== originalStructBook.aa.bb.cc.dd.ee.ff.gg.hh.ii)
    // assert(structBook.aa.bb.cc.dd.ee.ff.gg.hh.ii.jj !== originalStructBook.aa.bb.cc.dd.ee.ff.gg.hh.ii.jj)
  })
  .add('Immuter', function() {
    immuterBook.set(keyArray, {
      aa: 123,
    })
  })
  .add('Immutable', function() {
    immutableBook.set('aa', immutableBook.aa.setIn(keyArray.slice(1), 1))
  })
  .add('SeamlessImmutable', function() {
    seamlessImmutableBook.setIn(keyArray, 1)
  })
  .add('timm', function() {
    timm.setIn(book, keyArray, 1)
  })
  // run async
  .run({ async })
