# 分页

引入本目录 CSS 和 JS。data-total 是总条数，data-page-size 是每页条数，data-page 从 1 开始。监听 ui:page-change，event.detail 包含 page、pageSize、total、pages；业务方据此请求数据。修改 data-total 或 data-page-size 后调用 UiPagination.refresh(element)，页码会自动收敛到有效范围。动态插入新组件后调用 UiPagination.init(element)。refresh 不触发切页事件；当前页重复点击不触发事件。零条数据时显示禁用的第 1 页和前后按钮。

## 引入

```html
<link rel="stylesheet" href="pagination/pagination.css">
<script src="pagination/pagination.js" defer></script>
<nav class="ui-pagination" aria-label="列表分页" data-ui-pagination data-total="95" data-page-size="10" data-page="1"></nav>
```

## 配色

默认中性配色，按项目覆盖 CSS 变量：--ui-pagination-color / --ui-pagination-border / --ui-pagination-bg / --ui-pagination-active-bg / --ui-pagination-active-border。

[打开独立演示](index.html)
