import {Union} from "./union";

export * from "./union";

export type Json =
  Null |
  Boolean |
  Number |
  String |
  Literal<unknown> |
  Union |
  Optional<any> |
  Array<any> |
  Object<{[key: string]: Json}>;

export type JsonRuntimeType =
  'null'    |
  'boolean' |
  'number'  |
  'string'  |
  {base: 'literal', value: any} |
  {base: 'optional', element: JsonRuntimeType} |
  {base: 'array', element: JsonRuntimeType} |
  {base: 'tuple', elements: JsonRuntimeType[]} |
  {base: 'union', elements: JsonRuntimeType[]} |
  {base: 'object', keyValues: {[key: string]: JsonRuntimeType}};

type NonOptionalKeys<Obj extends {[key: string]: Json}> = {
  [K in keyof Obj]: undefined extends Obj[K]['jsType'] ? never : K
}[keyof Obj];

type OptionalKeys<Obj extends {[key: string]: Json}> = {
  [K in keyof Obj]:  undefined extends Obj[K]['jsType'] ? K: never;
}[keyof Obj];

type NonOptionalObj<Obj extends {[key: string]: Json}> = Pick<Obj, NonOptionalKeys<Obj>>;
type OptionalObj<Obj extends {[key: string]: Json}> = Pick<Obj, OptionalKeys<Obj>>;
export type JsObjectType<Obj extends {[key: string]: Json}> = {
  [K in keyof NonOptionalObj<Obj>]: Obj[K]['jsType'];
} & {
  [K in keyof OptionalObj<Obj>]?: Obj[K]['jsType'];
}

export type JsType<J extends Json> =
  J extends Object<infer KV> ? JsObjectType<KV>:
  J['jsType'];

export interface Null {
  jsType: null;
  runtimeType: 'null';
}

export interface Boolean {
  jsType: boolean;
  runtimeType: 'boolean';
}

export interface Number {
  jsType: number
  runtimeType: 'number';
}

export interface String {
  jsType: string;
  runtimeType: 'string';
}

export interface Literal<Lit> {
  jsType: Lit;
  runtimeType: JsonRuntimeType;
}

export interface Optional<T extends Json> {
  jsType: T['jsType'] | undefined
  runtimeType: {
    base: 'optional',
    element: JsonRuntimeType
  };
}

export interface Array<T extends Json> {
  jsType: T['jsType'][];
  runtimeType: {
    base: 'array',
    element: JsonRuntimeType
  };
}

export interface Tuple1<T1 extends Json> {
  jsType: [T1['jsType']];
  runtimeType: {
    base: 'tuple',
    elements: [JsonRuntimeType],
  }
}
export interface Tuple2<T1 extends Json, T2 extends Json> {
  jsType: [T1['jsType'], T2['jsType']];
  runtimeType: {
    base: 'tuple',
    elements: [JsonRuntimeType, JsonRuntimeType],
  }
}
export interface Tuple3<T1 extends Json, T2 extends Json, T3 extends Json> {
  jsType: [T1['jsType'], T2['jsType'], T3['jsType']];
  runtimeType: {
    base: 'tuple',
    elements: [JsonRuntimeType, JsonRuntimeType, JsonRuntimeType],
  }
}
export interface TupleN {
  jsType: unknown,
  runtimeType: {
    base: 'tuple',
    elements: JsonRuntimeType[],
  }
}
export type Tuple = Tuple1<any> | Tuple2<any, any> | Tuple3<any, any, any> | TupleN;

export function tuple<T1 extends Json>(e1: T1): Tuple1<T1>;
export function tuple<T1 extends Json, T2 extends Json>(e1: T1, e2: T2): Tuple2<T1, T2>;
export function tuple<T1 extends Json, T2 extends Json, T3 extends Json>(e1: T1, e2: T2, e3: T3): Tuple3<T1, T2, T3>;
export function tuple<T extends Json>(...elements: Json[]): Tuple {
  return {
    jsType: [],
    runtimeType: {
      base: 'tuple',
      elements: elements.map(e => e.runtimeType),
    },
  };
}

export interface Object<O extends {[key: string]: Json}> {
  jsType: { [K in keyof O]: O[K]['jsType'] };
  runtimeType: {
    base: 'object',
    keyValues: {[key: string]: JsonRuntimeType}
  }
}

export const nul: Null = {jsType: null, runtimeType: 'null'};

// NOTE: jsType has a dummy value
export const bool: Boolean = {jsType: false, runtimeType: 'boolean'};

// NOTE: jsType has a dummy value
export const num: Number = {jsType: 0, runtimeType: 'number'};

// NOTE: jsType has a dummy value
export const str: String = {jsType: '', runtimeType: 'string'};

export function literal<Lit>(literal: Lit): Literal<Lit> {
  return {jsType: literal, runtimeType: {base: 'literal', value: literal}}
}

export function opt<T extends Json>(elem: T): Optional<T> {
  // NOTE: jsType has a dummy value
  return {
    jsType: undefined,
    runtimeType: {base: 'optional', element: elem.runtimeType}
  }
}

export function arr<T extends Json>(elem: T): Array<T> {
  // NOTE: jsType has a dummy value
  return {
    jsType: [],
    runtimeType: {base: 'array', element: elem.runtimeType}
  };
}

export function obj<T extends {[key: string]: Json}>(o: T): Object<T> {
  const keyValues: {[key: string]: JsonRuntimeType} = {};
  for(const [key, value] of Object.entries(o)) {
    keyValues[key] = value.runtimeType;
  }
  return {
    jsType: {} as any,
    runtimeType: {
      base: 'object',
      keyValues: keyValues
    }
  }
}

export function isValid(runtimeType: JsonRuntimeType, obj: any): boolean {
  switch (runtimeType) {
    case 'null':
      return obj === null;
    case 'boolean':
      return typeof obj === 'boolean';
    case 'number':
      return typeof obj === 'number';
    case 'string':
      return typeof obj === 'string';
    default:
      switch (runtimeType.base) {
        case 'literal':
          return obj === runtimeType.value;
        case 'optional':
          return obj === undefined || isValid(runtimeType.element, obj);
        case "union":
          return runtimeType.elements.some((t) => isValid(t, obj));
        case "array":
          return obj instanceof Array && obj.every((e) => isValid(runtimeType.element, e));
        case "tuple":
          return obj instanceof Array &&
                 runtimeType.elements.length === obj.length &&
                 runtimeType.elements.every((typ, i) => isValid(typ, obj[i]));
        case "object":
          if (obj === null || typeof obj !== 'object') {
            return false;
          }
          return Object.entries(runtimeType.keyValues).every(([key, typ]) =>
            isValid(typ, obj[key])
          );
      }
  }
  throw new Error(`Unexpected error in isValid(): ${runtimeType}, ${obj}`);
}

export function validate<J extends Json>(format: J, obj: any): JsType<J> | undefined {
  return isValid(format.runtimeType, obj) ? obj: undefined;
}

export function validatingParse<J extends Json>(format: J, jsonString: string): JsType<J> | undefined {
  return validate(format, JSON.parse(jsonString));
}
