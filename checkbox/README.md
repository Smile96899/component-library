# 复选框

默认只显示选择框，不显示旁边文字。`aria-label` 为读屏软件保留名称，接入时改为对应选项名称。

只需要 CSS；通过 checked、disabled 控制状态。监听 change 读取 event.target.checked；半选状态通过 input.indeterminate = true 设置，HTML 属性不能代替此属性。

## 引入

```html
<link rel="stylesheet" href="checkbox/checkbox.css">
<label class="ui-checkbox"><input class="ui-checkbox__control" type="checkbox" name="selected" aria-label="选择此项" checked></label>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-checkbox-active / --ui-checkbox-mark / --ui-checkbox-border / --ui-checkbox-focus。

[打开独立演示](index.html)
