# 多选下拉框

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

原生 details 展开后使用复选框多选，支持键盘 Tab / 空格、Esc 收起并回到触发器、点击外部收起。面板展开时在文档流内占位。多项使用同一个 name，表单中通过 FormData.getAll("statuses") 读取。监听 ui:multi-change，event.detail.values 为已选值数组。UiMultiSelect.getValue(element) 读取当前值；程序修改 checked 或 disabled 后调用 refresh(element)。动态插入后调用 init(element)。无强制必选限制。

## 引入

```html
<link rel="stylesheet" href="multi-select/multi-select.css">
<script src="multi-select/multi-select.js" defer></script>
<details class="ui-multi" data-ui-multi>
  <summary class="ui-multi__trigger" aria-label="选择状态"><span data-multi-summary data-placeholder="选择状态">选择状态</span><span aria-hidden="true">⌄</span></summary>
  <div class="ui-multi__panel" role="group" aria-label="可选状态">
    <label><input type="checkbox" name="statuses" value="enabled">启用</label>
    <label><input type="checkbox" name="statuses" value="disabled">停用</label>
    <label><input type="checkbox" name="statuses" value="pending">待审核</label>
  </div>
</details>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-multi-color / --ui-multi-border / --ui-multi-bg / --ui-multi-panel-bg / --ui-multi-active / --ui-multi-focus。

[独立演示](index.html)
