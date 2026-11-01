# 输入框

只需要 CSS；使用原生 value、input、change、required、disabled。密码输入可将 type 改为 password。错误状态设置 aria-invalid="true"，并用 aria-describedby 关联错误说明。

## 引入

```html
<link rel="stylesheet" href="text-input/text-input.css">
<input class="ui-input" type="text" name="name" aria-label="输入内容" placeholder="请输入内容">
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-input-border / --ui-input-focus / --ui-input-bg / --ui-input-color。

[打开独立演示](index.html)
