# 用户管理表格

独立 CSS / JS，无框架或其他组件依赖。紧凑圆角表格，默认中性颜色；窄屏在表格内横向滚动。

字段顺序：UID、姓名、邮箱或者手机号、可用资金、冻结资金、最后登录 IP / 时间、注册 IP / 时间、操作。

邮箱与手机号共用一列，优先显示邮箱，没有邮箱时显示手机号。最后登录 IP 和时间、注册 IP 和时间分别在各自单元格内分两行。缺失值显示“—”，空列表显示“暂无用户”。

## 引入

```html
<link rel="stylesheet" href="user-table/user-table.css">
<script src="user-table/user-table.js" defer></script>
<div class="ui-users" data-ui-users>
  <div class="ui-users__scroll" role="region" aria-label="用户管理表格，可横向滚动" tabindex="0">
    <table class="ui-users__table">
      <caption>用户管理</caption>
      <thead><tr><th scope="col">UID</th><th scope="col">姓名</th><th scope="col">邮箱或者手机号</th><th scope="col" class="ui-users__money">可用资金</th><th scope="col" class="ui-users__money">冻结资金</th><th scope="col">最后登录 IP / 时间</th><th scope="col">注册 IP / 时间</th><th scope="col">操作</th></tr></thead>
      <tbody><tr><td colspan="8" class="ui-users__empty">暂无用户</td></tr></tbody>
    </table>
  </div>
</div>
```

等 DOM 和脚本加载完成后传入业务数据；不引入 demo.js，它仅提供演示数据和操作反馈。

```js
const table = document.querySelector('[data-ui-users]');
UiUserTable.render(table, [{
  uid: '100001',
  name: '林晓',
  email: 'lin.xiao@example.com',
  phone: '',
  availableFunds: '12,580.00',
  frozenFunds: '500.00',
  lastLoginIp: '192.0.2.18',
  lastLoginTime: '2026/11/02 09:32:16',
  registrationIp: '203.0.113.12',
  registeredAt: '2026/10/18 14:20:08'
}]);

table.addEventListener('ui:user-action', event => {
  const { uid, action } = event.detail;
  // action: view / edit / login-history / funds-history
  // 在这里打开项目自己的详情、编辑窗口或记录页面。
});
```

render 可重复调用，替换当前数据；同一列表内 UID 必须非空且唯一，建议始终使用字符串。多个组件实例互不影响。所有数据按文本渲染，不解析 HTML。

资金字段接收已经格式化的字符串，原样展示，不做浮点计算，也不预设货币或修改余额。时间字段同样按传入文本显示，时区和格式由业务层统一。手机号脱敏由业务侧处理。

操作栏提供“查看”“编辑”，以及“更多”下的“登录记录”“资金记录”，点击只发出事件；此组件不自带账号接口、权限系统或资金操作。它只显示传入的当前页数据，搜索、分页和服务端授权由接入项目处理。

## 样式配置

覆盖 --ui-users-color / --ui-users-muted / --ui-users-border / --ui-users-bg / --ui-users-header-bg / --ui-users-button-border / --ui-users-button-bg / --ui-users-focus。默认不使用品牌色。

[独立演示](index.html)
