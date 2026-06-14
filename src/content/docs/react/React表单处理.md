---
order: 59
title: 'React表单处理'
module: 'react'
category: 'React'
difficulty: 'beginner'
description: '受控组件与非受控组件'
author: 'fanquanpp'
updated: 2026-06-14
---

## 1. 受控组件

```jsx
function Form() {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 2. 非受控组件

```jsx
function Form() {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
    </form>
  );
}
```

## 3. 对比

| 特性     | 受控组件    | 非受控组件 |
| -------- | ----------- | ---------- |
| 数据源   | React state | DOM        |
| 实时验证 |             |            |
| 条件禁用 |             |            |
| 代码量   | 较多        | 较少       |
