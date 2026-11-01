# 分页

引入本目录 CSS 和 JS。data-total 是总条数，data-page-size 是每页条数，data-page 从 1 开始。组件显示“共 X 页”，支持页码按钮、上一页/下一页，以及输入页码后点击“跳转”或按 Enter。

页码必须为 1 到总页数之间的整数。空值、小数、负数或超过总页数会显示提示，不执行切页。零条数据时显示“共 0 页”，第 1 页、前后按钮和跳页输入均禁用。

监听 ui:page-change，event.detail 包含 page、pageSize、total、pages；业务方据此请求数据。修改 data-total 或 data-page-size 后调用 UiPagination.refresh(element)，总页数同步更新，当前页码自动收敛到有效范围。动态插入新组件后调用 UiPagination.init(element)。refresh 不触发切页事件；跳转到当前页不触发事件。

页码按钮、总页数、输入框和跳转按钮始终在同一行。容器宽度不足时仅分页区域可横向滚动，不挤压控件或撑宽页面；输入错误提示显示在下方。

## 引入

```html
<link rel="stylesheet" href="pagination/pagination.css">
<script src="pagination/pagination.js" defer></script>
<nav class="ui-pagination" aria-label="列表分页" data-ui-pagination data-total="95" data-page-size="10" data-page="1"></nav>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-pagination-color / --ui-pagination-border / --ui-pagination-bg / --ui-pagination-active-bg / --ui-pagination-active-border。

[打开独立演示](index.html)
