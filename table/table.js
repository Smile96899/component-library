(() => {
  if (window.UiTable) return;
  const initialized = new WeakSet();
  const rows = table => [...table.querySelectorAll('tbody [data-table-row]')].filter(i => !i.disabled);
  const getSelected = table => rows(table).filter(i => i.checked).map(i => i.closest('tr').dataset.rowId);
  function refresh(table) {
    const all = table.querySelector('[data-table-all]');
    if (!all) return;
    const items = rows(table), count = items.filter(i => i.checked).length;
    all.checked = items.length > 0 && count === items.length;
    all.indeterminate = count > 0 && count < items.length;
    all.disabled = !items.length;
  }
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-table]')];
    if (scope.matches?.('[data-ui-table]')) elements.unshift(scope);
    elements.forEach(table => {
      if (initialized.has(table)) return;
      initialized.add(table); refresh(table);
      table.addEventListener('change', e => {
        if (!e.target.matches('[data-table-all], [data-table-row]')) return;
        if (e.target.matches('[data-table-all]')) rows(table).forEach(i => { i.checked = e.target.checked; });
        refresh(table);
        table.dispatchEvent(new CustomEvent('ui:table-select', {bubbles:true, detail:{ids:getSelected(table)}}));
      });
      table.addEventListener('click', e => {
        const button = e.target.closest('[data-table-sort]');
        if (!button || !table.contains(button)) return;
        const header = button.closest('th'), column = header.cellIndex;
        const direction = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        const body = table.tBodies[0];
        if (!body) return;
        const entries = [...body.rows];
        const value = row => row.cells[column]?.dataset.sortValue ?? row.cells[column]?.textContent.trim() ?? '';
        entries.sort((a,b) => {
          let result;
          if (button.dataset.tableSort === 'number') {
            const av = Number(value(a)), bv = Number(value(b));
            result = (Number.isFinite(av) ? av : 0) - (Number.isFinite(bv) ? bv : 0);
          } else result = value(a).localeCompare(value(b), 'zh-CN', {numeric:true});
          return direction === 'ascending' ? result : -result;
        });
        body.append(...entries);
        table.querySelectorAll('th[aria-sort]').forEach(th => {
          th.setAttribute('aria-sort', th === header ? direction : 'none');
          const mark = th.querySelector('[data-sort-mark]');
          if (mark) mark.textContent = th === header ? (direction === 'ascending' ? '↑' : '↓') : '↕';
        });
        table.dispatchEvent(new CustomEvent('ui:table-sort', {bubbles:true, detail:{column, direction}}));
      });
      table.closest('form')?.addEventListener('reset', () => setTimeout(() => refresh(table), 0));
    });
  }
  window.UiTable = {init, refresh, getSelected}; init();
})();
