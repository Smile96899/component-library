# 开关

默认只显示开关，不显示旁边文字。`aria-label` 为读屏软件保留名称，接入时改为对应功能名称。

只需要 CSS；通过 checked 设置初始状态，监听 change 并读取 event.target.checked。disabled 可禁用，原生 form.reset() 可恢复初始值。

## 引入

```html
<link rel="stylesheet" href="toggle-switch/toggle-switch.css">
<label class="ui-toggle"><input class="ui-toggle__control" type="checkbox" role="switch" name="notifications" aria-label="启用通知"></label>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-toggle-on / --ui-toggle-off / --ui-toggle-thumb / --ui-toggle-focus。

[打开独立演示](index.html)
