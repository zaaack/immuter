"use strict";
var immuter_1 = require("immuter");
var struct = immuter_1.Struct({
    aa: {
        bb: "aha",
        cc: 123,
    },
    dd: false,
});
var struct2 = immuter_1.Struct.clone(struct);
struct2.aa.bb = '123';
