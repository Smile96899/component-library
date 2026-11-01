# 单选框

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

只需 CSS。使用原生 radio，同组使用相同 name，不同组使用不同 name。没有可见的附加文字；每项用 aria-label 指明含义。支持方向键选择、checked、disabled、required 和原生表单提交。读取表单中的 plan，或监听原生 change 事件。

## 引入

```html
<link rel="stylesheet" href="radio/radio.css">
<div class="ui-radio-group" role="group" aria-label="选择方案">
  <label class="ui-radio"><input type="radio" name="plan" value="a" aria-label="方案 A" checked></label>
  <label class="ui-radio"><input type="radio" name="plan" value="b" aria-label="方案 B"></label>
</div>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-radio-color / --ui-radio-border / --ui-radio-bg / --ui-radio-active / --ui-radio-focus。

[独立演示](index.html)
