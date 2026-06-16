---
order: 63
title: this类型与多态
module: typescript
category: TypeScript
difficulty: intermediate
description: TypeScript中this类型与多态this
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/类型体操实用模式
  - typescript/协变与逆变
  - typescript/符号与唯一类型
  - typescript/命名空间与模块
prerequisites:
  - typescript/语法速查
---

## 1. this 类型

```typescript
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
```

## 2. 多态 this

```typescript
class Animal {
  name: string;
  clone(): this {
    return Object.create(this);
  }
}

class Dog extends Animal {
  breed: string;
}

const dog = new Dog();
const cloned = dog.clone(); // Dog — 返回 this 类型
```

## 3. this 参数

```typescript
interface UIElement {
  addClickListener(onClick: (this: void, e: Event) => void): void;
}

// 确保回调函数中没有 this
class Handler {
  info: string;
  //  this 指向 Handler，不是 void
  // badHandler(this: Handler, e: Event) { console.log(this.info); }

  //  箭头函数没有自己的 this
  goodHandler = (e: Event) => {
    console.log(this.info);
  };
}
```

## 4. ThisType 工具

```typescript
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>;
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  const data = desc.data ?? ({} as D);
  const methods = desc.methods ?? ({} as M);
  return { ...data, ...methods } as D & M;
}

const obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // this 有 x 和 y
      this.y += dy;
    },
  },
});
```
