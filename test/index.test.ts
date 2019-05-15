import * as assert from 'power-assert';

import {nul, bool, num, str, literal, opt, arr, tuple, obj, union, TsType, isValid, validatingParse} from "../src";


// Define a format of Human
const humanFormat = obj({
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
  myTuple: tuple(str, num, bool),
});

// Generate Human type
type Human = TsType<typeof humanFormat>

describe('ts-json-validator', () => {
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
      onlyNull: null,
      myTuple: ['my text', 14, false],
    };
  });

  it('should define optional property in object array without compile error', () => {
    // NOTE: This structure found in JsonWebKey
    const myFormat = obj({
      oth: arr( obj({
        r: opt(str),
      })),
    });
    type myFormatType = TsType<typeof myFormat>;

    type TypeMyFormat = {
      oth: {
        d?: string
      }[];
    }

    const a: TypeMyFormat = {oth: []};
    const b: myFormatType = a;
  });

  context('isValid', () => {
    it('should validate null', () => {
      const objFormat = nul;
      assert.strictEqual(isValid(objFormat.runtimeType, null), true);
      assert.strictEqual(isValid(objFormat.runtimeType, 'my text'), false);
    });

    it('should validate number', () => {
      const objFormat = num;
      const obj1 = 19;
      assert.strictEqual(isValid(objFormat.runtimeType, obj1), true);
    });

    it('should validate string', () => {
      const objFormat = str;
      const obj1 = 'hello';
      assert.strictEqual(isValid(objFormat.runtimeType, obj1), true);
    });

    it('should validate optional', () => {
      const objFormat = opt(str);
      assert.strictEqual(isValid(objFormat.runtimeType, 'my text'), true);
      assert.strictEqual(isValid(objFormat.runtimeType, undefined), true);
    });

    it('should validate literal', () => {
      const objFormat = literal('my-literal' as const);
      const obj1 = 'my-literal';
      assert.strictEqual(isValid(objFormat.runtimeType, 'my-literal'), true);
      assert.strictEqual(isValid(objFormat.runtimeType, 'my-lit'), false);
    });

    it('should validate union', () => {
      const objFormat = union(str, num);
      assert.strictEqual(isValid(objFormat.runtimeType, 'hello'), true);
      assert.strictEqual(isValid(objFormat.runtimeType, 19), true);
      assert.strictEqual(isValid(objFormat.runtimeType, true), false);
    });

    it('should validate should tuple', () => {
      const objFormat = tuple(str, num);
      assert.strictEqual(isValid(objFormat.runtimeType, ['hello', 40]), true);
      assert.strictEqual(isValid(objFormat.runtimeType, ['hello', true]), false);
    });

    it('should validate should array', () => {
      const objFormat = arr(str);
      const obj1 = ['hello', 'world'];
      assert.strictEqual(isValid(objFormat.runtimeType, obj1), true);
    });

    it('should validate object', () => {
      const objFormat = obj({
        name: str,
        age: num
      });
      const obj1 = {
        name: "jack",
        age: 4
      };
      assert.strictEqual(isValid(objFormat.runtimeType, obj1), true);
    });

    it('should validate complex nested object', () => {
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
        onlyNull: null,
        myTuple: ['my text', 14, false],
      };
      assert.strictEqual(isValid(humanFormat.runtimeType, human), true);
    });
  });

  context('validatingParse', () => {
    it('should parse with validation', () => {
      const objFormat = obj({
        name: str,
        age: num
      });
      const json1: string = '{"name": "jack", "age": 4}';
      assert.deepStrictEqual(validatingParse(objFormat, json1), {name: "jack", age: 4});
      // NOTE: age is true not number
      const json2: string = '{"name": "jack", "age": true}';
      assert.deepStrictEqual(validatingParse(objFormat, json2), undefined);
      // NOTE: isHuman is not defined in format but parsed
      const json3: string = '{"name": "jack", "age": 4, "isHuman": true}';
      assert.deepStrictEqual(validatingParse(objFormat, json3), {name: "jack", age: 4, isHuman: true});
    });
  });
});
