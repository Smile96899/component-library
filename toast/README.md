# 消息提示

引入本目录 CSS 和 JS 后调用 UiToast.show("操作已完成")。默认 4000ms 自动关闭，鼠标悬停或键盘焦点进入消息时暂停倒计时，离开后继续。UiToast.show("请检查输入", { duration:0 }) 可保持显示直到关闭。返回 { close, element }，可主动调用 close()。文本使用 textContent 渲染，支持读屏提示，不自动抢焦点。触发按钮只是演示，业务中可在任意操作完成后调用 API。

## 引入

```html
<link rel="stylesheet" href="toast/toast.css">
<script src="toast/toast.js" defer></script>
<button class="ui-toast-trigger" type="button" id="toast-demo">显示消息提示</button>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-toast-bg / --ui-toast-color / --ui-toast-border / --ui-toast-focus（建议定义在 :root 或 body 上，提示容器挂载在 body）。

[打开独立演示](index.html)
