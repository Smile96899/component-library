# 表格

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

支持当前 tbody 的文本/数字升降序排序、单行勾选、全选和半选。只处理已渲染行，不自动分页或请求服务器；无数据时由项目展示空状态组件。每行 data-row-id 必须唯一。监听 ui:table-select 的 detail.ids；监听 ui:table-sort 的 detail.column（从 0 开始）和 direction。UiTable.getSelected(table) 读取已选 ID；增删行、程序修改选中状态后调用 refresh(table)。动态插入组件后调用 init(table)。数字列建议提供 data-sort-value，非有效数字按 0 排序。禁用行不参与全选。窄屏只在表格内部横向滚动。

## 引入

```html
<link rel="stylesheet" href="table/table.css">
<script src="table/table.js" defer></script>
<div class="ui-table-wrap" tabindex="0" role="region" aria-label="示例数据，可横向滚动">
  <table class="ui-table" data-ui-table>
    <caption>示例数据</caption>
    <thead><tr><th scope="col"><input type="checkbox" data-table-all aria-label="选择全部行"></th><th scope="col" aria-sort="none"><button type="button" data-table-sort="text">名称 <span data-sort-mark aria-hidden="true">↕</span></button></th><th scope="col" aria-sort="none"><button type="button" data-table-sort="number">数量 <span data-sort-mark aria-hidden="true">↕</span></button></th><th scope="col">状态</th></tr></thead>
    <tbody>
      <tr data-row-id="a"><td><input type="checkbox" data-table-row aria-label="选择示例 A"></td><td>示例 A</td><td data-sort-value="12">12</td><td>启用</td></tr>
      <tr data-row-id="b"><td><input type="checkbox" data-table-row aria-label="选择示例 B"></td><td>示例 B</td><td data-sort-value="3">3</td><td>停用</td></tr>
      <tr data-row-id="c"><td><input type="checkbox" data-table-row aria-label="选择示例 C"></td><td>示例 C</td><td data-sort-value="25">25</td><td>启用</td></tr>
    </tbody>
  </table>
</div>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-table-color / --ui-table-border / --ui-table-bg / --ui-table-header-bg / --ui-table-active / --ui-table-selected-bg / --ui-table-focus。

[独立演示](index.html)
