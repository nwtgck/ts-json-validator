import {Union} from "./union";
import {Tuple} from "./tuple";

// Export all union
export * from "./union";
// Export all tuple
export * from "./tuple";

export type Json =
  Null |
  Boolean |
  Number |
  String |
  Literal<unknown> |
  Union |
  Tuple |
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

export type TsType<J extends Json> = J['tsType'];

export interface Null {
  tsType: null;
  runtimeType: 'null';
}

export interface Boolean {
  tsType: boolean;
  runtimeType: 'boolean';
}

export interface Number {
  tsType: number
  runtimeType: 'number';
}

export interface String {
  tsType: string;
  runtimeType: 'string';
}

export interface Literal<Lit> {
  tsType: Lit;
  runtimeType: JsonRuntimeType;
}

export interface Optional<T extends Json> {
  tsType: T['tsType'] | undefined
  runtimeType: {
    base: 'optional',
    element: JsonRuntimeType
  };
}

export interface Array<T extends Json> {
  tsType: T['tsType'][];
  runtimeType: {
    base: 'array',
    element: JsonRuntimeType
  };
}

type NonOptionalKeys<Obj extends {[key: string]: Json}> = {
  [K in keyof Obj]: undefined extends Obj[K]['tsType'] ? never : K
}[keyof Obj];

type OptionalKeys<Obj extends {[key: string]: Json}> = {
  [K in keyof Obj]: undefined extends Obj[K]['tsType'] ? K: never;
}[keyof Obj];

type NonOptionalObj<Obj extends {[key: string]: Json}> = Pick<Obj, NonOptionalKeys<Obj>>;
type OptionalObj<Obj extends {[key: string]: Json}> = Pick<Obj, OptionalKeys<Obj>>;

export interface Object<O extends {[key: string]: Json}> {
  tsType: {
    [K in keyof NonOptionalObj<O>]: O[K]['tsType'];
  } & {
    [K in keyof OptionalObj<O>]?: O[K]['tsType'];
  };
  runtimeType: {
    base: 'object',
    keyValues: {[key: string]: JsonRuntimeType}
  }
}

export const nul: Null = {tsType: null, runtimeType: 'null'};

// NOTE: tsType has a dummy value
export const bool: Boolean = {tsType: false, runtimeType: 'boolean'};

// NOTE: tsType has a dummy value
export const num: Number = {tsType: 0, runtimeType: 'number'};

// NOTE: tsType has a dummy value
export const str: String = {tsType: '', runtimeType: 'string'};

export function literal<Lit>(literal: Lit): Literal<Lit> {
  return {tsType: literal, runtimeType: {base: 'literal', value: literal}}
}

export function opt<T extends Json>(elem: T): Optional<T> {
  // NOTE: tsType has a dummy value
  return {
    tsType: undefined,
    runtimeType: {base: 'optional', element: elem.runtimeType}
  }
}

export function arr<T extends Json>(elem: T): Array<T> {
  // NOTE: tsType has a dummy value
  return {
    tsType: [],
    runtimeType: {base: 'array', element: elem.runtimeType}
  };
}

export function obj<T extends {[key: string]: Json}>(o: T): Object<T> {
  const keyValues: {[key: string]: JsonRuntimeType} = {};
  for(const [key, value] of Object.entries(o)) {
    keyValues[key] = value.runtimeType;
  }
  return {
    tsType: {} as any,
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

export function validate<J extends Json>(format: J, obj: any): TsType<J> | undefined {
  return isValid(format.runtimeType, obj) ? obj: undefined;
}

export function validatingParse<J extends Json>(format: J, jsonString: string): TsType<J> | undefined {
  return validate(format, JSON.parse(jsonString));
}
