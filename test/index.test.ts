import * as assert from 'power-assert';

import {nul, bool, num, str, literal, opt, arr, obj, union, JsObjectType} from "../src";


// Define a format of Human
const humanFormat = {
  name: str,
  age: num,
  isHuman: opt(bool),
  aliases: arr(str),
  myObj: obj({
    bos: str,
    bosAge: num,
  }),
  myUnion: union(num, bool),
  objs: arr(obj({
    prop1: str,
    prop2: num
  })),
  myLit: literal('POST' as const),
  myLitUnion: union(literal('POST' as const), literal('GET' as const)),
  myNullable: union(str, nul),
  onlyNull: nul,
};

// Generate Human type
type Human = JsObjectType<typeof humanFormat>

describe('JsObjectType', () => {
  it('should define a human without compile error', () => {
    const human: Human = {
      name: "jack",
      age: 4,
      // isHuman: undefined,
      aliases: ['world', 'abc'],
      myObj: {
        bos: 'adam',
        bosAge: 8
      },
      myUnion: false,
      objs: [{
        prop1: 'hello',
        prop2: 3
      }],
      myLit: 'POST',
      myLitUnion: 'GET',
      myNullable: 'hey',
      onlyNull: null
    };
  });
});
