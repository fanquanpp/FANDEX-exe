import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;
function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== TypeScript (32 files) ====================
addFile(
  'typescript',
  'TypeScript',
  50,
  '字面量类型与联合类型',
  '字面量类型、联合类型与类型缩窄',
  'intermediate',
  `## 1. 字面量类型

\`\`\`typescript
type Direction = 'left' | 'right' | 'up' | 'down';
type HTTPStatus = 200 | 301 | 404 | 500;
type True = true;
\`\`\`

## 2. 联合类型

\`\`\`typescript
type ID = string | number;

// 可辨识联合
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.size ** 2;
    case 'rectangle': return shape.width * shape.height;
  }
}
\`\`\`

## 3. 类型缩窄

\`\`\`typescript
// typeof / instanceof / in / 赋值缩窄
function pad(value: string | number) {
  if (typeof value === 'string') return value.toUpperCase();
  return value.toFixed(2);
}

// 可辨识联合缩窄
type Fish = { swim: () => void };
type Bird = { fly: () => void };
function move(animal: Fish | Bird) {
  if ('swim' in animal) animal.swim();
  else animal.fly();
}
\`\`\`

## 4. 模板字面量类型

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
type CSSValue = \`\${number}\${'px' | 'em' | 'rem'}\`;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  51,
  '交叉类型与类型合并',
  '交叉类型、接口合并与类型覆盖',
  'intermediate',
  `## 1. 交叉类型

\`\`\`typescript
type Person = { name: string };
type Employee = { employeeId: number };
type EmployeePerson = Person & Employee;

// 属性冲突
type A = { prop: string };
type B = { prop: number };
type C = A & B; // prop: never
\`\`\`

## 2. 接口合并

\`\`\`typescript
interface Box { height: number; width: number; }
interface Box { depth: number; }
// Box = { height: number; width: number; depth: number }
\`\`\`

## 3. 类型覆盖

\`\`\`typescript
type Override<T, U> = Omit<T, keyof U> & U;
type Modified = Override<{ id: string; name: string }, { id: number }>;
// { name: string; id: number }
\`\`\`

## 4. 交叉 vs 继承

| 特性 | 交叉类型 | 接口继承 |
|------|---------|---------|
| 冲突处理 | 产生 never | 编译错误 |
| 声明合并 | ❌ | ✅ |
| 性能 | 大量交叉变慢 | 更优 |
`
);

addFile(
  'typescript',
  'TypeScript',
  52,
  '类型守卫与自定义守卫',
  '类型守卫、自定义类型谓词',
  'intermediate',
  `## 1. 内置类型守卫

\`\`\`typescript
// typeof / instanceof / in / Array.isArray
function process(value: string | number) {
  if (typeof value === 'string') return value.toUpperCase();
  return value.toFixed(2);
}
\`\`\`

## 2. 自定义类型守卫

\`\`\`typescript
interface Dog { bark(): void }
interface Cat { meow(): void }
type Pet = Dog | Cat;

function isDog(pet: Pet): pet is Dog {
  return 'bark' in pet;
}

// 断言函数
function assertDefined<T>(value: T | undefined): asserts value is NonNullable<T> {
  if (value == null) throw new Error('Value is null');
}
\`\`\`

## 3. 通用守卫工具

\`\`\`typescript
function isString(v: unknown): v is string { return typeof v === 'string'; }
function isNumber(v: unknown): v is number { return typeof v === 'number' && !isNaN(v); }
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  53,
  '索引签名与动态属性',
  '索引签名、Record与动态属性访问',
  'intermediate',
  `## 1. 索引签名

\`\`\`typescript
interface StringMap { [key: string]: string; }
interface NumberMap { [key: number]: string; }
\`\`\`

## 2. Record 工具类型

\`\`\`typescript
type UserRoles = Record<'admin' | 'editor' | 'viewer', boolean>;
const roles: UserRoles = { admin: true, editor: false, viewer: true };
\`\`\`

## 3. 动态属性访问

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

## 4. satisfies 操作符（TS 4.9+）

\`\`\`typescript
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<string, string | number[]>;

colors.red[0]; // number ✅ — 保留具体类型
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  54,
  '映射类型进阶',
  '键重映射、模板映射与递归映射类型',
  'advanced',
  `## 1. 键重映射

\`\`\`typescript
type Getters<T> = {
  [P in keyof T as \`get\${Capitalize<string & P>}\`]: () => T[P];
};

interface User { name: string; age: number; }
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
\`\`\`

## 2. 过滤键

\`\`\`typescript
type FilterByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type StringProps = FilterByType<User, string>; // { name: string }
\`\`\`

## 3. 递归映射类型

\`\`\`typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function ? T[P] : DeepReadonly<T[P]>
    : T[P];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function ? T[P] : DeepPartial<T[P]>
    : T[P];
};
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  55,
  '条件类型与infer',
  '条件类型、infer关键字与类型推断',
  'advanced',
  `## 1. 条件类型基础

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<string>;  // true
type B = IsString<number>;  // false
\`\`\`

## 2. 分布式条件类型

\`\`\`typescript
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// 阻止分布式
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
\`\`\`

## 3. infer 关键字

\`\`\`typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
\`\`\`

## 4. 递归条件类型

\`\`\`typescript
type PathKeys<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${PathKeys<T[K]>}\` }[keyof T & string]
  : never;

type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type IsEqual<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  56,
  '模板字面量类型',
  '模板字面量类型与字符串操作',
  'advanced',
  `## 1. 基本语法

\`\`\`typescript
type World = 'world';
type Greeting = \`hello \${World}\`; // 'hello world'
\`\`\`

## 2. 内置字符串操作

\`\`\`typescript
Uppercase<'hello'>   // 'HELLO'
Lowercase<'HELLO'>   // 'hello'
Capitalize<'hello'>  // 'Hello'
Uncapitalize<'Hello'> // 'hello'
\`\`\`

## 3. 实际应用

\`\`\`typescript
// 事件系统
type OnEvent<T> = {
  [K in keyof T & string as \`on\${Capitalize<K>}\`]: (event: T[K]) => void;
};

// CSS 类型
type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
type CSSValue = \`\${number}\${CSSUnit}\`;

// 路由类型
type APIRoute = \`/api/v\${1 | 2 | 3}/\${string}\`;

// 解析键值对
type ParseKV<S extends string> =
  S extends \`\${infer K}=\${infer V}\` ? { key: K; value: V } : never;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  57,
  '泛型约束与默认值',
  '泛型约束、默认类型参数与条件泛型',
  'intermediate',
  `## 1. 泛型约束

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

interface HasLength { length: number; }
function logLength<T extends HasLength>(value: T): void {
  console.log(value.length);
}
\`\`\`

## 2. 默认类型参数

\`\`\`typescript
interface PaginatedResponse<T, Meta = { total: number; page: number }> {
  data: T[];
  meta: Meta;
}
\`\`\`

## 3. 条件泛型

\`\`\`typescript
type ApiResponse<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

type EventHandler<T> = T extends undefined ? () => void : (payload: T) => void;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  58,
  '装饰器详解',
  'TypeScript装饰器与元编程',
  'advanced',
  `## 1. 装饰器概述

\`\`\`json
{ "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
\`\`\`

## 2. 类装饰器

\`\`\`typescript
function LogClass(target: Function) {
  console.log(\`类 \${target.name} 被创建\`);
}

@LogClass
class MyClass {}

// 工厂装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
\`\`\`

## 3. 方法装饰器

\`\`\`typescript
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(\`调用 \${key}，参数: \${args}\`);
    return original.apply(this, args);
  };
}

class Calculator {
  @Log
  add(a: number, b: number) { return a + b; }
}
\`\`\`

## 4. 属性装饰器

\`\`\`typescript
function DefaultValue(value: any) {
  return function(target: any, key: string) {
    Object.defineProperty(target, key, {
      value,
      writable: true,
      enumerable: true
    });
  };
}

class User {
  @DefaultValue('Anonymous')
  name: string;
}
\`\`\`

## 5. 参数装饰器

\`\`\`typescript
function Required(target: any, key: string, index: number) {
  const requiredParams: number[] = Reflect.getMetadata('required', target, key) || [];
  requiredParams.push(index);
  Reflect.defineMetadata('required', requiredParams, target, key);
}
\`\`\`

## 6. TC39 Stage 3 装饰器（新标准）

\`\`\`typescript
// 新装饰器语法（TS 5.0+）
function logged(originalMethod: any, context: ClassMethodDecoratorContext) {
  return function(this: any, ...args: any[]) {
    console.log(\`调用 \${String(context.name)}\`);
    return originalMethod.call(this, ...args);
  };
}

class MyClass {
  @logged
  method() {}
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  59,
  '声明文件编写',
  '编写与发布TypeScript声明文件',
  'intermediate',
  `## 1. 声明文件基础

\`\`\`typescript
// .d.ts 文件
declare const myLib: {
  version: string;
  doSomething(value: string): number;
};

// 声明模块
declare module 'my-lib' {
  export function doSomething(value: string): number;
  export const version: string;
}
\`\`\`

## 2. 全局声明

\`\`\`typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      init(): void;
    };
  }
}

export {};
\`\`\`

## 3. 模块声明

\`\`\`typescript
// types/my-lib/index.d.ts
declare module 'my-lib' {
  interface Options {
    timeout?: number;
    retries?: number;
  }

  export function request(url: string, options?: Options): Promise<Response>;
  export class Client {
    constructor(baseURL: string);
    get<T>(url: string): Promise<T>;
  }
  export default Client;
}
\`\`\`

## 4. 声明合并

\`\`\`typescript
// 扩展第三方类型
declare module 'express' {
  interface Request {
    userId?: string;
    userRole?: 'admin' | 'user';
  }
}
\`\`\`

## 5. 发布声明文件

\`\`\`json
// package.json
{
  "name": "@types/my-lib",
  "types": "index.d.ts",
  "files": ["index.d.ts"]
}
\`\`\`

## 6. 三斜线指令

\`\`\`typescript
/// <reference path="./utils.d.ts" />
/// <reference types="node" />
/// <reference lib="es2020" />
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  60,
  '模块解析策略',
  'TypeScript模块解析与路径映射',
  'intermediate',
  `## 1. 模块解析策略

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler" // "node" | "nodenext" | "bundler"
  }
}
\`\`\`

| 策略 | 说明 |
|------|------|
| \`node\` | Node.js 经典解析 |
| \`nodenext\` | Node.js ESM 解析 |
| \`bundler\` | 现代打包工具解析 |

## 2. 路径映射

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
\`\`\`

\`\`\`typescript
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
\`\`\`

## 3. 模块导出

\`\`\`typescript
// 命名导出
export const name = 'Alice';
export function greet() {}

// 默认导出
export default class App {}

// 重导出
export { Button } from './Button';
export * from './utils';

// 类型导出
export type { User } from './types';
\`\`\`

## 4. 命名空间

\`\`\`typescript
namespace Utils {
  export function formatDate(d: Date): string { return d.toISOString(); }
  export const VERSION = '1.0.0';
}

Utils.formatDate(new Date());
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  61,
  '类型体操实用模式',
  '常见类型编程模式与技巧',
  'advanced',
  `## 1. 类型判断工具

\`\`\`typescript
type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type IsUnknown<T> = IsNever<T> extends true ? false : IsAny<T> extends true ? false : unknown extends T ? true : false;
type IsEqual<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
\`\`\`

## 2. 集合操作

\`\`\`typescript
// 并集
type Union<A, B> = A | B;

// 交集
type Intersect<A, B> = A extends B ? A : never;

// 差集
type Diff<A, B> = A extends B ? never : A;

// 补集
type Complement<A, B extends A> = A extends B ? never : A;
\`\`\`

## 3. 元组操作

\`\`\`typescript
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type Reverse<T extends any[]> = T extends [infer H, ...infer R] ? [...Reverse<R>, H] : [];
type Length<T extends any[]> = T['length'];
\`\`\`

## 4. 对象操作

\`\`\`typescript
type PickByType<T, U> = { [K in keyof T as T[K] extends U ? K : never]: T[K] };
type OmitByType<T, U> = { [K in keyof T as T[K] extends U ? never : K]: T[K] };
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
\`\`\`

## 5. 递归类型

\`\`\`typescript
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
type DeepRequired<T> = { [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] };
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  62,
  '协变与逆变',
  'TypeScript中的型变关系',
  'advanced',
  `## 1. 型变概述

| 型变 | 说明 | 示例 |
|------|------|------|
| 协变 | 子类型关系保持方向 | \`Dog[]\` 是 \`Animal[]\` 的子类型 |
| 逆变 | 子类型关系反转 | \`(x: Animal) => void\` 是 \`(x: Dog) => void\` 的子类型 |
| 不变 | 无子类型关系 | 既是协变也是逆变 |
| 双变 | 同时允许协变和逆变 | TS 函数参数的默认行为 |

## 2. 协变

\`\`\`typescript
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// Dog 是 Animal 的子类型 → Dog[] 是 Animal[] 的子类型（协变）
const dogs: Dog[] = [{ name: 'Rex', breed: 'Husky' }];
const animals: Animal[] = dogs; // ✅ 协变

// Promise 也是协变的
type AsyncDog = Promise<Dog>;
type AsyncAnimal = Promise<Animal>;
const ap: AsyncAnimal = (async () => ({ name: 'Rex', breed: 'Husky' }))() as AsyncDog;
\`\`\`

## 3. 逆变

\`\`\`typescript
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

// DogHandler 是 AnimalHandler 的子类型
const dogHandler: DogHandler = (dog) => console.log(dog.breed);
const animalHandler: AnimalHandler = dogHandler; // ✅ 逆变
\`\`\`

## 4. strictFunctionTypes

\`\`\`json
{ "compilerOptions": { "strictFunctionTypes": true } }
\`\`\`

启用后函数参数严格逆变，禁用则双变。

## 5. 型变与泛型

\`\`\`typescript
// 协变位置
interface Box<out T> {  // TS 5.0+ 使用 out 修饰符
  get(): T;
}

// 逆变位置
interface Sink<in T> {  // TS 5.0+ 使用 in 修饰符
  consume(value: T): void;
}

// 不变
interface Storage<in out T> {  // 同时 in out
  get(): T;
  set(value: T): void;
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  63,
  'this类型与多态',
  'TypeScript中this类型与多态this',
  'intermediate',
  `## 1. this 类型

\`\`\`typescript
class Calculator {
  protected value = 0;

  add(n: number): this {
    this.value += n;
    return this;
  }

  multiply(n: number): this {
    this.value *= n;
    return this;
  }

  getResult(): number {
    return this.value;
  }
}

new Calculator().add(5).multiply(2).getResult(); // 10
\`\`\`

## 2. 多态 this

\`\`\`typescript
class Animal {
  name: string;
  clone(): this { return Object.create(this); }
}

class Dog extends Animal {
  breed: string;
}

const dog = new Dog();
const cloned = dog.clone(); // Dog — 返回 this 类型
\`\`\`

## 3. this 参数

\`\`\`typescript
interface UIElement {
  addClickListener(onClick: (this: void, e: Event) => void): void;
}

// 确保回调函数中没有 this
class Handler {
  info: string;
  // ❌ this 指向 Handler，不是 void
  // badHandler(this: Handler, e: Event) { console.log(this.info); }

  // ✅ 箭头函数没有自己的 this
  goodHandler = (e: Event) => { console.log(this.info); };
}
\`\`\`

## 4. ThisType 工具

\`\`\`typescript
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>;
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  const data = desc.data ?? {} as D;
  const methods = desc.methods ?? {} as M;
  return { ...data, ...methods } as D & M;
}

const obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // this 有 x 和 y
      this.y += dy;
    }
  }
});
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  64,
  '符号与唯一类型',
  'Symbol与unique symbol',
  'intermediate',
  `## 1. Symbol 类型

\`\`\`typescript
const sym: symbol = Symbol('description');

// unique symbol — 每个都是唯一的
const key1: unique symbol = Symbol('key');
const key2: unique symbol = Symbol('key');

type T1 = typeof key1; // unique symbol
type T2 = typeof key2; // unique symbol
// T1 和 T2 不兼容
\`\`\`

## 2. Symbol 作为属性键

\`\`\`typescript
const nameKey: unique symbol = Symbol('name');

interface Person {
  [nameKey]: string;
  age: number;
}

const person: Person = {
  [nameKey]: 'Alice',
  age: 25
};

console.log(person[nameKey]); // 'Alice'
\`\`\`

## 3. 内置 Symbol

\`\`\`typescript
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}

// Symbol.hasInstance
class MyArray {
  static [Symbol.hasInstance](instance: unknown) {
    return Array.isArray(instance);
  }
}

// Symbol.toPrimitive
class Money {
  constructor(private amount: number) {}
  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') return \`$\${this.amount}\`;
    return this.amount;
  }
}
\`\`\`

## 4. well-known Symbol 类型

\`\`\`typescript
typeof Symbol.iterator    // unique symbol
typeof Symbol.hasInstance // unique symbol
typeof Symbol.toPrimitive // unique symbol
typeof Symbol.toStringTag // unique symbol
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  65,
  '枚举进阶',
  '枚举高级用法与替代方案',
  'intermediate',
  `## 1. 枚举类型

\`\`\`typescript
// 数字枚举
enum Direction { Up, Down, Left, Right }

// 字符串枚举
enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }

// 异构枚举（不推荐）
enum BooleanLike { No = 0, Yes = 'YES' }
\`\`\`

## 2. const 枚举

\`\`\`typescript
const enum Colors {
  Red = '#FF0000',
  Green = '#00FF00',
  Blue = '#0000FF'
}

let color = Colors.Red; // 编译为 '#FF0000'
\`\`\`

## 3. 枚举与类型

\`\`\`typescript
// 枚举成员类型
enum ShapeKind { Circle, Square }

interface Circle { kind: ShapeKind.Circle; radius: number; }
interface Square { kind: ShapeKind.Square; size: number; }

type Shape = Circle | Square;

// 枚举合并
enum Weekday { Mon, Tue, Wed }
enum Weekday { Thu = 3, Fri, Sat, Sun }
\`\`\`

## 4. 枚举替代方案

\`\`\`typescript
// as const 对象
const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT'
} as const;

type Direction = typeof Direction[keyof typeof Direction];
// 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// 联合类型
type Status = 'active' | 'inactive' | 'pending';

// 辅助函数
function enumFromObj<T extends Record<string, string>>(obj: T) {
  return { ...obj, values: Object.values(obj) as (T[keyof T])[] };
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  66,
  '工具类型实现原理',
  '内置工具类型的实现与自定义',
  'intermediate',
  `## 1. 常用内置工具类型

\`\`\`typescript
// 属性修饰
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// 属性选择
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 联合类型操作
type Exclude<U, E> = U extends E ? never : U;
type Extract<U, E> = U extends E ? U : never;
type NonNullable<T> = T extends null | undefined ? never : T;

// 函数类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;
type InstanceType<T> = T extends new (...args: any[]) => infer I ? I : never;

// 其他
type Record<K extends string | number | symbol, V> = { [P in K]: V };
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
\`\`\`

## 2. 自定义工具类型

\`\`\`typescript
// 深度版本
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
type DeepRequired<T> = { [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] };
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };

// 值类型
type ValueOf<T> = T[keyof T];

// 可空
type Nullable<T> = T | null;

// 不可变
type Immutable<T> = { readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P] };

// 提取 Promise 值
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;

// 键类型
type KeysOf<T> = keyof T;
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  67,
  '条件类型分发',
  '分布式条件类型与控制',
  'advanced',
  `## 1. 分布式条件类型

\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// 空类型不分发
type NeverTest = ToArray<never>; // never
\`\`\`

## 2. 控制分发

\`\`\`typescript
// 阻止分发：用元组包裹
type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never;
type Result = ToArrayNoDistribute<string | number>; // (string | number)[]

// 只对非 never 分发
type Wrap<T> = [T] extends [never] ? never : T extends any ? { value: T } : never;
\`\`\`

## 3. 分发的实际应用

\`\`\`typescript
// 类型过滤
type Filter<T, U> = T extends U ? T : never;
type OnlyStrings = Filter<string | number | boolean, string>; // string

// 类型映射
type MapType<T, U, V> = T extends U ? V : T;
type ReplaceNumber = MapType<string | number | boolean, number, null>; // string | null | boolean

// 递归展开
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;
\`\`\`

## 4. 分发与联合类型

\`\`\`typescript
// 检查是否为联合类型
type IsUnion<T> = [T] extends [never]
  ? false
  : T extends any
    ? [T] extends [T]
      ? false
      : true
    : never;

type A = IsUnion<string>;          // false
type B = IsUnion<string | number>; // true
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  68,
  '类型推断infer扩展',
  'infer在各类场景中的应用',
  'advanced',
  `## 1. 函数类型推断

\`\`\`typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type LastParameter<T> = T extends (...args: [...any[], infer L]) => any ? L : never;
\`\`\`

## 2. Promise 推断

\`\`\`typescript
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type Deep = Promise<Promise<Promise<number>>>;
type Result = Awaited<Deep>; // number
\`\`\`

## 3. 数组/元组推断

\`\`\`typescript
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type ElementOf<T> = T extends (infer E)[] ? E : never;
\`\`\`

## 4. 字符串推断

\`\`\`typescript
type TrimLeft<S extends string> = S extends \` \${infer Rest}\` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends \`\${infer Rest} \` ? TrimRight<Rest> : S;
type Trim<S> = TrimLeft<TrimRight<S>>;

type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\` ? [Head, ...Split<Tail, D>] : [S];

type Join<T extends string[], D extends string> =
  T extends [infer Head extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? Head : \`\${Head}\${D}\${Join<Rest, D>}\`
    : '';
\`\`\`

## 5. 对象类型推断

\`\`\`typescript
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type OmitByValue<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] };
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  69,
  '递归类型与深度操作',
  '递归条件类型与深度类型操作',
  'advanced',
  `## 1. 递归条件类型

TS 4.5+ 支持尾递归优化，使得深度递归类型成为可能。

\`\`\`typescript
// 深度 Readonly
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// 深度 Partial
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

// 深度 Required
type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T;
\`\`\`

## 2. 深度 Pick/Omit

\`\`\`typescript
type DeepPick<T, Path extends string> =
  Path extends \`\${infer K}.\${infer Rest}\`
    ? K extends keyof T
      ? { [P in K]: DeepPick<T[K], Rest> }
      : never
    : Path extends keyof T
      ? Pick<T, Path>
      : never;

type User = { profile: { name: string; address: { city: string } }; age: number };
type Result = DeepPick<User, 'profile.address.city'>;
// { profile: { address: { city: string } } }
\`\`\`

## 3. 递归类型展开

\`\`\`typescript
// 展开嵌套数组
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;
type Nested = string[][][];
type Flat = Flatten<Nested>; // string

// 递归键路径
type PathKeys<T, Prefix extends string = ''> = T extends object
  ? { [K in keyof T & string]: PathKeys<T[K], Prefix extends '' ? K : \`\${Prefix}.\${K}\`> }[keyof T & string] | Prefix
  : Prefix;
\`\`\`

## 4. 递归类型限制

\`\`\`typescript
// TS 有递归深度限制（约 1000 层）
// 超过会报 "Type instantiation is excessively deep"

// 使用尾递归优化（TS 4.5+）
type Accurate<T, Acc extends any[] = []> =
  T extends \`\${Acc['length']}\` ? Acc['length'] : Accurate<T, [...Acc, 0]>;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  70,
  '类型安全的事件系统',
  '构建类型安全的事件发射器',
  'advanced',
  `## 1. 基础事件系统

\`\`\`typescript
type EventMap = {
  click: { x: number; y: number };
  change: { value: string };
  submit: {};
};

class EventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }

  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }
}

const emitter = new EventEmitter<EventMap>();
emitter.on('click', ({ x, y }) => console.log(x, y));
emitter.emit('click', { x: 100, y: 200 });
\`\`\`

## 2. 异步事件

\`\`\`typescript
class AsyncEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  async emit<K extends keyof Events>(event: K, payload: Events[K]): Promise<void> {
    const fns = this.listeners.get(event);
    if (fns) await Promise.all([...fns].map(fn => fn(payload)));
  }
}
\`\`\`

## 3. 类型安全的事件构建器

\`\`\`typescript
type EventBuilder = {
  [K in string]: any;
};

function defineEvents<E extends EventBuilder>() {
  return {
    createEmitter: () => new EventEmitter<E>(),
    on: <K extends keyof E & string>(
      emitter: EventEmitter<E>,
      event: K,
      listener: (payload: E[K]) => void
    ) => emitter.on(event, listener)
  };
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  71,
  '类型安全的API客户端',
  '构建端到端类型安全的HTTP客户端',
  'advanced',
  `## 1. API 类型定义

\`\`\`typescript
interface APIClient {
  '/users': {
    GET: { response: User[]; query?: { page: number } };
    POST: { response: User; body: Omit<User, 'id'> };
  };
  '/users/:id': {
    GET: { response: User; params: { id: string } };
    PUT: { response: User; params: { id: string }; body: Partial<User> };
    DELETE: { response: void; params: { id: string } };
  };
}
\`\`\`

## 2. 类型安全请求

\`\`\`typescript
type PathsWithMethod<M extends string> = {
  [P in keyof APIClient]: M extends keyof APIClient[P] ? P : never;
}[keyof APIClient];

async function request<
  Path extends PathsWithMethod<Method>,
  Method extends keyof APIClient[Path] = 'GET'
>(
  path: Path,
  options: {
    method?: Method;
    params?: APIClient[Path][Method] extends { params: infer P } ? P : never;
    query?: APIClient[Path][Method] extends { query: infer Q } ? Q : never;
    body?: APIClient[Path][Method] extends { body: infer B } ? B : never;
  }
): Promise<APIClient[Path][Method] extends { response: infer R } ? R : never> {
  // 实现...
}
\`\`\`

## 3. 路由参数替换

\`\`\`typescript
type ReplaceParams<Path, Params> = Path extends \`\${infer Before}:\${infer Param}\${infer After}\`
  ? Params extends { [K in Param]: string }
    ? \`\${Before}\${Params[Param & keyof Params]}\${ReplaceParams<After, Params>}\`
    : never
  : Path;
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  72,
  '类型安全的状态管理',
  '构建类型安全的状态管理',
  'advanced',
  `## 1. 类型安全的 Store

\`\`\`typescript
interface Store<S> {
  getState(): S;
  setState(partial: Partial<S> | ((state: S) => Partial<S>)): void;
  subscribe(listener: (state: S) => void): () => void;
}

function createStore<S extends object>(initialState: S): Store<S> {
  let state = { ...initialState };
  const listeners = new Set<(state: S) => void>();

  return {
    getState: () => state,
    setState(partial) {
      const update = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...update };
      listeners.forEach(fn => fn(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
\`\`\`

## 2. 类型安全的选择器

\`\`\`typescript
function createSelector<S, R>(
  store: Store<S>,
  selector: (state: S) => R,
  equalityFn?: (a: R, b: R) => boolean
): () => R {
  let lastValue = selector(store.getState());
  return () => {
    const newValue = selector(store.getState());
    if (equalityFn ? !equalityFn(lastValue, newValue) : lastValue !== newValue) {
      lastValue = newValue;
    }
    return lastValue;
  };
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  73,
  '类型安全的表单验证',
  '构建类型安全的表单验证系统',
  'intermediate',
  `## 1. 验证器类型

\`\`\`typescript
type Validator<T> = (value: T) => string | undefined;

type Schema<T> = {
  [K in keyof T]: Validator<T[K]>;
};

function validate<T>(schema: Schema<T>, data: T): Record<keyof T, string | undefined> {
  const result = {} as Record<keyof T, string | undefined>;
  for (const key in schema) {
    result[key] = schema[key](data[key]);
  }
  return result;
}
\`\`\`

## 2. 验证器组合

\`\`\`typescript
function required(msg = '此字段必填'): Validator<string> {
  return (value) => value.trim() ? undefined : msg;
}

function minLength(min: number): Validator<string> {
  return (value) => value.length >= min ? undefined : \`最少 \${min} 个字符\`;
}

function maxLength(max: number): Validator<string> {
  return (value) => value.length <= max ? undefined : \`最多 \${max} 个字符\`;
}

function compose<T>(...validators: Validator<T>[]): Validator<T> {
  return (value) => {
    for (const v of validators) {
      const error = v(value);
      if (error) return error;
    }
    return undefined;
  };
}

// 使用
const nameValidator = compose(required(), minLength(2), maxLength(50));
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  74,
  '类型安全的路由',
  '构建类型安全的路由系统',
  'advanced',
  `## 1. 路由类型定义

\`\`\`typescript
type Routes = {
  '/': {};
  '/users': { page?: number };
  '/users/:id': { id: string };
  '/posts/:postId/comments/:commentId': { postId: string; commentId: string };
};

type ExtractParams<T extends string> =
  T extends \`\${infer _}:\${infer Param}\${infer Rest}\`
    ? Param extends \`\${infer P}/\${infer _}\`
      ? P | ExtractParams<Rest>
      : Param | ExtractParams<Rest>
    : never;
\`\`\`

## 2. 类型安全的导航

\`\`\`typescript
function navigate<Path extends keyof Routes>(
  path: Path,
  params: ExtractParams<Path> extends never ? {} : Record<ExtractParams<Path> & string, string>,
  query?: Routes[Path]
): void {
  let url: string = path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(\`:\${key}\`, value);
  }
  if (query) {
    url += '?' + new URLSearchParams(query as any).toString();
  }
  history.pushState(null, '', url);
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  75,
  '类型安全的国际化',
  '构建类型安全的i18n系统',
  'intermediate',
  `## 1. 类型定义

\`\`\`typescript
type Locale = 'zh-CN' | 'en-US';

type TranslationKeys = {
  'app.title': string;
  'user.greeting': { name: string };
  'user.profile': { name: string; age: number };
  'items.count': { count: number };
};

type TranslatableKeys = {
  [K in keyof TranslationKeys]: TranslationKeys[K] extends string
    ? () => string
    : (params: TranslationKeys[K]) => string;
};
\`\`\`

## 2. 实现

\`\`\`typescript
const translations: Record<Locale, Record<keyof TranslationKeys, string | Function>> = {
  'zh-CN': {
    'app.title': '我的应用',
    'user.greeting': ({ name }: { name: string }) => \`你好，\${name}\`,
    'user.profile': ({ name, age }: { name: string; age: number }) => \`\${name}，\${age}岁\`,
    'items.count': ({ count }: { count: number }) => \`\${count} 个项目\`
  },
  'en-US': {
    'app.title': 'My App',
    'user.greeting': ({ name }: { name: string }) => \`Hello, \${name}\`,
    'user.profile': ({ name, age }: { name: string; age: number }) => \`\${name}, \${age} years old\`,
    'items.count': ({ count }: { count: number }) => \`\${count} items\`
  }
};

function t<K extends keyof TranslationKeys>(
  key: K,
  ...args: TranslationKeys[K] extends string ? [] : [TranslationKeys[K]]
): string {
  const value = translations[currentLocale][key];
  return typeof value === 'function' ? value(args[0]) : value;
}
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  76,
  '类型安全的配置系统',
  '构建类型安全的应用配置',
  'intermediate',
  `## 1. 配置类型定义

\`\`\`typescript
interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
    retries: number;
  };
  features: {
    darkMode: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  version: string;
}

type ConfigPath = \`api.\${string}\` | \`features.\${string}\` | 'version';
\`\`\`

## 2. 类型安全的配置访问

\`\`\`typescript
type DeepGet<T, P extends string> =
  P extends \`\${infer K}.\${infer Rest}\`
    ? K extends keyof T ? DeepGet<T[K], Rest> : never
    : P extends keyof T ? T[P] : never;

class ConfigManager<T> {
  constructor(private config: T) {}

  get<P extends string>(path: P): DeepGet<T, P> {
    return path.split('.').reduce((obj: any, key) => obj?.[key], this.config);
  }

  set<P extends string>(path: P, value: DeepGet<T, P>): void {
    const keys = path.split('.');
    const last = keys.pop()!;
    const target = keys.reduce((obj: any, key) => obj[key], this.config);
    target[last] = value;
  }
}

const config = new ConfigManager<AppConfig>({
  api: { baseURL: 'https://api.example.com', timeout: 5000, retries: 3 },
  features: { darkMode: true, analytics: false, notifications: true },
  version: '1.0.0'
});

config.get('api.baseURL');  // string
config.get('features.darkMode'); // boolean
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  77,
  '类型安全的数据库查询',
  '构建类型安全的查询构建器',
  'advanced',
  `## 1. 模式定义

\`\`\`typescript
interface Schema {
  users: {
    id: number;
    name: string;
    email: string;
    age: number;
  };
  posts: {
    id: number;
    title: string;
    content: string;
    userId: number;
    createdAt: Date;
  };
}
\`\`\`

## 2. 查询构建器

\`\`\`typescript
class QueryBuilder<T extends keyof Schema, S extends Schema> {
  private wheres: string[] = [];
  private selectFields: (keyof S[T])[] = [];

  constructor(private table: T) {}

  select<K extends keyof S[T]>(...fields: K[]): QueryBuilder<T, S> {
    this.selectFields = fields;
    return this;
  }

  where<K extends keyof S[T]>(field: K, op: string, value: S[T][K]): this {
    this.wheres.push(\`\${String(field)} \${op} ?\`);
    return this;
  }

  async execute(): Promise<Pick<S[T], typeof this.selectFields[number]>[]> {
    // 实现查询逻辑
    return [] as any;
  }
}

// 使用
const users = await new QueryBuilder<'users', Schema>('users')
  .select('id', 'name')
  .where('age', '>', 18)
  .execute();
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  78,
  '类型安全的发布订阅',
  '构建类型安全的发布订阅模式',
  'intermediate',
  `## 1. 类型定义

\`\`\`typescript
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'cart:add': { productId: string; quantity: number };
  'cart:remove': { productId: string };
  'order:create': { orderId: string; total: number };
};

type EventKey = keyof EventMap;
type EventHandler<K extends EventKey> = (payload: EventMap[K]) => void;
\`\`\`

## 2. 实现

\`\`\`typescript
class PubSub<Events extends Record<string, any>> {
  private subscribers = new Map<keyof Events, Set<Function>>();

  subscribe<K extends keyof Events & string>(
    event: K,
    handler: (payload: Events[K]) => void
  ): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(handler);
    return () => this.subscribers.get(event)?.delete(handler);
  }

  publish<K extends keyof Events & string>(event: K, payload: Events[K]): void {
    this.subscribers.get(event)?.forEach(fn => fn(payload));
  }

  once<K extends keyof Events & string>(
    event: K,
    handler: (payload: Events[K]) => void
  ): () => void {
    const unsubscribe = this.subscribe(event, (payload) => {
      handler(payload);
      unsubscribe();
    });
    return unsubscribe;
  }
}

const bus = new PubSub<EventMap>();
bus.subscribe('user:login', ({ userId }) => console.log(userId));
bus.publish('user:login', { userId: '123', timestamp: new Date() });
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  79,
  '类型安全的环境变量',
  '构建类型安全的环境变量访问',
  'beginner',
  `## 1. 环境变量类型定义

\`\`\`typescript
interface EnvVars {
  VITE_API_URL: string;
  VITE_APP_TITLE: string;
  VITE_DEBUG: 'true' | 'false';
  VITE_MAX_RETRIES: string; // 环境变量总是字符串
}
\`\`\`

## 2. 类型安全访问

\`\`\`typescript
function getEnv<K extends keyof EnvVars>(key: K): EnvVars[K] {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(\`Missing env var: \${key}\`);
  }
  return value as EnvVars[K];
}

const apiUrl = getEnv('VITE_API_URL'); // string
const debug = getEnv('VITE_DEBUG') === 'true'; // boolean
\`\`\`

## 3. 验证与转换

\`\`\`typescript
function parseEnv<T extends Record<string, any>>(
  schema: { [K in keyof T]: (value: string | undefined) => T[K] }
): T {
  const result = {} as T;
  for (const [key, parser] of Object.entries(schema)) {
    result[key as keyof T] = parser(import.meta.env[key]);
  }
  return result;
}

const env = parseEnv({
  VITE_API_URL: (v) => v ?? 'http://localhost:3000',
  VITE_DEBUG: (v) => v === 'true',
  VITE_MAX_RETRIES: (v) => parseInt(v ?? '3', 10),
});

env.VITE_API_URL;  // string
env.VITE_DEBUG;    // boolean
env.VITE_MAX_RETRIES; // number
\`\`\`
`
);

addFile(
  'typescript',
  'TypeScript',
  80,
  'TypeScript5新特性',
  'TypeScript 5.x新特性详解',
  'intermediate',
  `## 1. 装饰器（Stage 3）

\`\`\`typescript
function logged(originalMethod: any, context: ClassMethodDecoratorContext) {
  return function(this: any, ...args: any[]) {
    console.log(\`调用 \${String(context.name)}\`);
    return originalMethod.call(this, ...args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number) { return a + b; }
}
\`\`\`

## 2. const 类型参数

\`\`\`typescript
function createRoutes<const T extends readonly string[]>(routes: T) {
  return routes;
}

const routes = createRoutes(['/home', '/about', '/contact']);
// type: readonly ["/home", "/about", "/contact"] — 保留字面量类型
\`\`\`

## 3. 枚举改进

\`\`\`typescript
// 所有枚举现在都是联合枚举
enum Color { Red, Green, Blue }
// 每个成员都有独立的类型
\`\`\`

## 4. 模块解析 bundler

\`\`\`json
{ "compilerOptions": { "moduleResolution": "bundler" } }
\`\`\`

## 5. 装饰器元数据

\`\`\`typescript
// emitDecoratorMetadata 现在基于 Stage 3 装饰器
\`\`\`

## 6. extends 多配置继承

\`\`\`json
// tsconfig.json
{
  "extends": ["./tsconfig.base.json", "./tsconfig.strict.json"]
}
\`\`\`

## 7. 其他改进

- \`--verbatimModuleSyntax\` 替代 \`--importsNotUsedAsValues\`
- 枚举类型安全增强
- JSDoc \`@satisfies\` 支持
- 性能优化与包体积减小
`
);

addFile(
  'typescript',
  'TypeScript',
  81,
  'satisfies操作符',
  'satisfies操作符详解',
  'intermediate',
  `## 1. satisfies 语法

\`\`\`typescript
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<string, string | number[]>;
\`\`\`

## 2. satisfies vs 类型注解

\`\`\`typescript
// 类型注解：拓宽类型
const colors1: Record<string, string | number[]> = {
  red: [255, 0, 0],
  green: '#00ff00'
};
colors1.red[0]; // string | number — 类型被拓宽

// satisfies：保留具体类型
const colors2 = {
  red: [255, 0, 0],
  green: '#00ff00'
} satisfies Record<string, string | number[]>;
colors2.red[0]; // number — 保留具体类型 ✅
colors2.green.toUpperCase(); // string — 保留具体类型 ✅
\`\`\`

## 3. 实际应用

\`\`\`typescript
// 配置对象
const config = {
  api: { baseURL: 'https://api.example.com', timeout: 5000 },
  features: { darkMode: true, analytics: false }
} satisfies Record<string, Record<string, string | number | boolean>>;

config.api.baseURL; // string ✅
config.features.darkMode; // boolean ✅

// 映射常量
const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  ERROR: 500
} satisfies Record<string, number>;

STATUS_CODES.OK; // 200 — 数字字面量类型 ✅
\`\`\`
`
);

console.log(`\nDone! Total TypeScript files created: ${total}`);
