---
order: 101
title: 原型链继承与class本质
module: javascript
category: 'dev-lang'
difficulty: advanced
description: JavaScript原型链继承机制与class语法糖本质深度解析。
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/异步编程
  - javascript/闭包的内存泄露与优化
  - javascript/事件循环详解
  - javascript/Promise静态方法
prerequisites:
  - javascript/语法速查
---

## 1. 原型链基础

### 1.1 原型对象

每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`，指向其原型对象：

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const alice = new Person('Alice');

alice.greet(); // "Hello, I'm Alice"
alice.hasOwnProperty('name'); // true
alice.hasOwnProperty('greet'); // false — 来自原型
```

### 1.2 原型链查找

```
alice → Person.prototype → Object.prototype → null

查找属性时沿原型链向上搜索，直到找到或到达 null
```

```javascript
alice.name; // 自身属性 → 'Alice'
alice.greet; // Person.prototype → function
alice.toString; // Object.prototype → function
alice.nonExistent; // null → undefined
```

### 1.3 原型链关系图

```
                    ┌─────────────────┐
                    │  Object.prototype│
                    │  ─────────────── │
                    │  toString()     │
                    │  hasOwnProperty()│
                    │  valueOf()      │
                    └────────┬────────┘
                             │ [[Prototype]]
                    ┌────────┴────────┐
                    │ Person.prototype │
                    │ ─────────────── │
                    │ constructor: Person│
                    │ greet()         │
                    └────────┬────────┘
                             │ [[Prototype]]
                    ┌────────┴────────┐
                    │     alice        │
                    │ ─────────────── │
                    │ name: 'Alice'   │
                    └─────────────────┘
```

## 2. 原型链继承模式

### 2.1 原型链继承

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function Dog(name, breed) {
  Animal.call(this, name); // 借用构造函数
  this.breed = breed;
}

// 原型链继承
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  return `${this.name} barks!`;
};

const rex = new Dog('Rex', 'German Shepherd');
rex.speak(); // "Rex makes a sound" — 来自 Animal.prototype
rex.bark(); // "Rex barks!" — 来自 Dog.prototype
```

### 2.2 Object.create 原理

```javascript
// Object.create 的简化实现
function objectCreate(proto, propertiesObject) {
  function F() {}
  F.prototype = proto;
  const obj = new F();
  if (propertiesObject) {
    Object.defineProperties(obj, propertiesObject);
  }
  return obj;
}
```

### 2.3 继承的完整模式

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.getName = function () {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name); // 第二次调用 Parent
  this.age = age;
}
Child.prototype = Object.create(Parent.prototype); // 第一次调用 Parent
Child.prototype.constructor = Child;
Child.prototype.getAge = function () {
  return this.age;
};
```

## 3. class 语法糖本质

### 3.1 class 声明等价转换

```javascript
// class 写法
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  static create(name) {
    return new Person(name);
  }
}

// 等价的原型写法
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};
Person.create = function (name) {
  return new Person(name);
};
```

### 3.2 class 与 function 的区别

| 特性          | class                                | function                   |
| ------------- | ------------------------------------ | -------------------------- |
| 提升          | 不会提升（TDZ）                      | 函数声明会提升             |
| 严格模式      | 自动启用 `use strict`                | 默认非严格                 |
| 不用 new 调用 | 抛出 TypeError                       | 作为普通函数执行           |
| prototype     | 不可枚举                             | 可枚举                     |
| 方法          | 不可枚举                             | 可枚举                     |
| 内部属性      | `[[FunctionKind]]: classConstructor` | `[[FunctionKind]]: normal` |

### 3.3 class 继承的本质

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 等价于 Animal.call(this, name)
    this.breed = breed;
  }
  bark() {
    return `${this.name} barks!`;
  }
}
```

`extends` 做了两件事：

```javascript
// 1. 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 2. 设置构造函数间的原型链（class 特有）
Object.setPrototypeOf(Dog, Animal);
// Dog.__proto__ === Animal
// 这使得 Dog 可以访问 Animal 的静态方法
```

### 3.4 super 的本质

```javascript
class Child extends Parent {
  constructor() {
    super(); // Parent.prototype.constructor.call(this)
  }

  method() {
    super.method(); // Parent.prototype.method.call(this)
  }

  static staticMethod() {
    super.staticMethod(); // Parent.staticMethod.call(this)
  }
}
```

`super` 在不同上下文中的行为：

| 上下文      | super 指向         |
| ----------- | ------------------ |
| constructor | 父类构造函数       |
| 实例方法    | `Parent.prototype` |
| 静态方法    | `Parent` 本身      |

## 4. 原型链与 class 的陷阱

### 4.1 引用类型共享

```javascript
class List {
  items = []; // 实例属性，每个实例独立

  addItem(item) {
    this.items.push(item);
  }
}

// 如果写在 prototype 上会共享
function ListOld() {}
ListOld.prototype.items = []; //  所有实例共享同一个数组！
```

### 4.2 箭头函数与 this

```javascript
class Button {
  constructor(label) {
    this.label = label;
  }

  // 箭头函数：this 绑定到实例
  handleClick = () => {
    console.log(this.label); // 正确
  };

  // 普通方法：this 取决于调用方式
  handleClickNormal() {
    console.log(this.label); // 可能丢失 this
  }
}

const btn = new Button('Submit');
const { handleClick, handleClickNormal } = btn;
handleClick(); // 'Submit'
handleClickNormal(); // undefined
```

### 4.3 多重继承限制

JavaScript 不支持多重继承，但可通过 Mixin 模式实现：

```javascript
const Serializable = (Base) =>
  class extends Base {
    serialize() {
      return JSON.stringify(this);
    }
  };

const Loggable = (Base) =>
  class extends Base {
    log(message) {
      console.log(`[${this.constructor.name}] ${message}`);
    }
  };

class User extends Loggable(Serializable(Object)) {
  constructor(name) {
    super();
    this.name = name;
  }
}

const user = new User('Alice');
user.log('created'); // "[User] created"
user.serialize(); // '{"name":"Alice"}'
```
