(() => {
  if (window.UiPagination) return;
  const ready = new WeakSet();
  function read(element) {
    const total = Number(element.dataset.total ?? 0);
    const pageSize = Number(element.dataset.pageSize ?? 10);
    const requested = Number(element.dataset.page ?? 1);
    if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1 || !Number.isSafeInteger(requested)) throw new TypeError('分页参数须为有效整数');
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pages, Math.max(1, requested));
    element.dataset.page = String(page);
    return { total, pageSize, page, pages };
  }
  function refresh(element) {
    const state = read(element);
    element.replaceChildren();
    function button(label, page, disabled = false, current = false) {
      const item = document.createElement('button');
      item.className = 'ui-pagination__button'; item.type = 'button'; item.textContent = label;
      item.dataset.page = String(page); item.disabled = disabled;
      item.setAttribute('aria-label', label === '‹' ? '上一页' : label === '›' ? '下一页' : '第 ' + page + ' 页');
      if (current) item.setAttribute('aria-current', 'page');
      element.append(item);
    }
    button('‹', state.page - 1, state.page === 1 || !state.total);
    let pages;
    if (state.pages <= 5) pages = Array.from({ length:state.pages }, (_, i) => i + 1);
    else {
      const start = Math.max(2, Math.min(state.page - 1, state.pages - 3));
      pages = [1, start, start + 1, start + 2, state.pages];
    }
    let previous = 0;
    pages.forEach(page => {
      if (page - previous > 1) {
        const dots = document.createElement('span'); dots.className = 'ui-pagination__ellipsis'; dots.textContent = '…'; dots.setAttribute('aria-hidden', 'true'); element.append(dots);
      }
      button(String(page), page, !state.total, page === state.page); previous = page;
    });
    button('›', state.page + 1, state.page === state.pages || !state.total);
    return state;
  }
  function init(root = document) {
    const elements = root.matches?.('[data-ui-pagination]') ? [root] : root.querySelectorAll('[data-ui-pagination]');
    elements.forEach(element => {
      if (ready.has(element)) return;
      refresh(element); ready.add(element);
      element.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('button[data-page]') : null;
        if (!button || button.disabled || !element.contains(button)) return;
        const state = read(element); const next = Number(button.dataset.page);
        if (next === state.page) return;
        element.dataset.page = String(next);
        const updated = refresh(element);
        element.querySelector('[aria-current="page"]')?.focus();
        element.dispatchEvent(new CustomEvent('ui:page-change', { bubbles:true, detail:updated }));
      });
    });
  }
  window.UiPagination = { init, refresh };
  init();
})();
