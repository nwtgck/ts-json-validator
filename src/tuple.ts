import {Json, JsonRuntimeType} from "./index";

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
