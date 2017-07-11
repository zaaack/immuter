import { Struct } from 'immuter'

const struct = Struct({
  aa: {
    bb: "aha",
    cc: 123,
  },
  dd: false,
})

// Create an optimized copy, only clone modified part
const struct2 = Struct.clone(struct)

struct2.aa.bb = '123'
