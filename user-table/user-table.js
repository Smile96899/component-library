(() => {
  if (window.UiUserTable) return;
  const initialized = new WeakSet();
  const display = value => value == null || String(value).trim() === '' ? '—' : String(value);
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-users]')];
    if (scope.matches?.('[data-ui-users]')) elements.unshift(scope);
    elements.forEach(el => {
      if (initialized.has(el)) return;
      initialized.add(el);
      const emit = (control, action) => {
        const row = control.closest('tr[data-uid]');
        if (!row || row.closest('[data-ui-users]') !== el) return;
        el.dispatchEvent(new CustomEvent('ui:user-action', {bubbles:true, detail:{uid:row.dataset.uid, action}}));
      };
      el.addEventListener('click', e => {
        const control = e.target.closest('button[data-user-action]');
        if (control) emit(control, control.dataset.userAction);
      });
      el.addEventListener('change', e => {
        if (!e.target.matches('select[data-user-more]') || !e.target.value) return;
        const action = e.target.value; e.target.value = ''; emit(e.target, action);
      });
    });
  }
  function render(el, users) {
    if (!el?.matches('[data-ui-users]')) throw new TypeError('需要 data-ui-users 容器');
    if (!Array.isArray(users)) throw new TypeError('users 必须为数组');
    const ids = new Set();
    users.forEach(user => {
      if (!user || user.uid == null || !String(user.uid).trim()) throw new TypeError('每个用户必须有 UID');
      const uid = String(user.uid);
      if (ids.has(uid)) throw new TypeError('UID 不能重复');
      ids.add(uid);
    });
    init(el);
    const fragment = document.createDocumentFragment();
    users.forEach(user => {
      const row = document.createElement('tr'); row.dataset.uid = String(user.uid);
      const cell = (value, className = '') => {
        const td = document.createElement('td'); td.textContent = display(value); td.className = className; row.append(td); return td;
      };
      cell(user.uid, 'ui-users__mono'); cell(user.name);
      cell(user.email || user.phone, 'ui-users__contact');
      cell(user.availableFunds, 'ui-users__money'); cell(user.frozenFunds, 'ui-users__money');
      const login = cell(user.lastLoginIp, 'ui-users__mono');
      const time = document.createElement('span'); time.className = 'ui-users__secondary'; time.textContent = display(user.lastLoginTime); login.append(time);
      const registration = cell(user.registrationIp, 'ui-users__mono');
      const registeredTime = document.createElement('span'); registeredTime.className = 'ui-users__secondary'; registeredTime.textContent = display(user.registeredAt); registration.append(registeredTime);
      const actions = cell(''); actions.textContent = '';
      const group = document.createElement('div'); group.className = 'ui-users__actions';
      for (const [action, label] of [['view','查看'],['edit','编辑']]) {
        const button = document.createElement('button'); button.type = 'button'; button.dataset.userAction = action; button.textContent = label;
        button.setAttribute('aria-label', label + '用户 ' + user.uid); group.append(button);
      }
      const more = document.createElement('select'); more.dataset.userMore = ''; more.setAttribute('aria-label', '用户 ' + user.uid + ' 的更多操作');
      for (const [value, label] of [['','更多'],['login-history','登录记录'],['funds-history','资金记录']]) {
        const option = document.createElement('option'); option.value = value; option.textContent = label; more.append(option);
      }
      group.append(more); actions.append(group); fragment.append(row);
    });
    if (!users.length) {
      const row = document.createElement('tr'), td = document.createElement('td');
      td.colSpan = 8; td.className = 'ui-users__empty'; td.textContent = '暂无用户'; row.append(td); fragment.append(row);
    }
    el.querySelector('tbody').replaceChildren(fragment);
  }
  window.UiUserTable = {init, render}; init();
})();
