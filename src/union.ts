import {Json, JsonRuntimeType} from "./index";

export interface Union2<T1 extends Json, T2 extends Json> {
  jsType: T1['jsType'] | T2['jsType'],
  runtimeType: {
    base: 'union',
    elements: [JsonRuntimeType, JsonRuntimeType]
  }
}

export interface Union3<T1 extends Json, T2 extends Json, T3 extends Json> {
  jsType: T1['jsType'] | T2['jsType'] | T3['jsType'],
  runtimeType: {
    base: 'union',
    elements: [JsonRuntimeType, JsonRuntimeType, JsonRuntimeType]
  }
}

export interface Union4<T1 extends Json, T2 extends Json, T3 extends Json, T4 extends Json> {
  jsType: T1['jsType'] | T2['jsType'] | T3['jsType'] | T4['jsType'],
  runtimeType: {
    base: 'union',
    elements: [JsonRuntimeType, JsonRuntimeType, JsonRuntimeType, JsonRuntimeType]
  }
}

export interface UnionN {
  jsType: unknown,
  runtimeType: {
    base: 'union',
    elements: JsonRuntimeType[]
  }
}

export type Union = Union2<any, any> | Union3<any, any, any> | Union4<any, any, any, any> | UnionN;


export function union<T1 extends Json, T2 extends Json>(e1: T1, e2: T2): Union2<T1, T2>
export function union<T1 extends Json, T2 extends Json, T3 extends Json>(e1: T1, e2: T2, e3: T3): Union3<T1, T2, T3>
export function union<T1 extends Json, T2 extends Json, T3 extends Json, T4 extends Json>(e1: T1, e2: T2, e3: T3, e4: T4): Union4<T1, T2, T3, T4>
export function union<T extends Json>(...elements: Json[]): Union {
  return {
    jsType: null,
    runtimeType: {
      base: 'union',
      elements: elements.map(e => e.runtimeType),
    }
  }
}
