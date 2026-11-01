# 确认弹窗

引入本目录 CSS 和 JS。点击 data-ui-confirm 指向的 dialog ID 打开，支持 Esc、取消和确认，默认焦点落在取消按钮，关闭后返回触发按钮。监听 dialog 的 ui:confirm 事件，仅在 event.detail.confirmed 为 true 时执行业务操作。也可调用 UiConfirm.open(dialog, opener)。不自动删除或提交业务数据。多个弹窗的 ID 和标题关联 ID 必须唯一。依赖支持原生 dialog.showModal() 的现代浏览器。

## 引入

```html
<link rel="stylesheet" href="confirm-dialog/confirm-dialog.css">
<script src="confirm-dialog/confirm-dialog.js" defer></script>
<button class="ui-confirm-trigger" type="button" data-ui-confirm="confirm-example">打开确认弹窗</button>
<dialog class="ui-confirm" id="confirm-example" aria-labelledby="confirm-title" aria-describedby="confirm-description">
  <h2 class="ui-confirm__title" id="confirm-title">确认操作</h2>
  <p class="ui-confirm__description" id="confirm-description">确定要继续此操作吗？</p>
  <div class="ui-confirm__actions">
    <button class="ui-confirm__button" type="button" data-ui-confirm-cancel>取消</button>
    <button class="ui-confirm__button" type="button" data-ui-confirm-accept>确认</button>
  </div>
</dialog>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-confirm-bg / --ui-confirm-color / --ui-confirm-border / --ui-confirm-button-bg / --ui-confirm-backdrop。

[打开独立演示](index.html)
