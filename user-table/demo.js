// 仅用于独立演示和组件总览；接入业务时不引入此文件。
window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-user-table-demo]');
  if (!root) return;
  const table = root.querySelector('[data-ui-users]');
  UiUserTable.render(table, [
  {
    "uid": "100001",
    "name": "林晓",
    "email": "lin.xiao@example.com",
    "availableFunds": "12,580.00",
    "frozenFunds": "500.00",
    "lastLoginIp": "192.0.2.18",
    "lastLoginTime": "2026/11/02 09:32:16",
    "registeredAt": "2026/10/18 14:20:08"
  },
  {
    "uid": "100002",
    "name": "陈明",
    "phone": "138****2468",
    "availableFunds": "8,240.50",
    "frozenFunds": "0.00",
    "lastLoginIp": "198.51.100.26",
    "lastLoginTime": "2026/11/01 18:45:02",
    "registeredAt": "2026/10/22 10:15:36"
  },
  {
    "uid": "100003",
    "name": "周宁",
    "email": "zhou.ning@example.com",
    "availableFunds": "0.00",
    "frozenFunds": "1,200.00",
    "lastLoginIp": null,
    "lastLoginTime": null,
    "registeredAt": "2026/11/02 08:10:00"
  }
]);
  const labels = {view:'查看', edit:'编辑', 'login-history':'登录记录', 'funds-history':'资金记录'};
  table.addEventListener('ui:user-action', event => {
    root.querySelector('[data-user-demo-status]').textContent = labels[event.detail.action] + ' · UID ' + event.detail.uid + '（演示，未连接业务接口）';
  });
});
