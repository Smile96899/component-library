(() => {
  if (window.UiPagination) return;
  const ready = new WeakSet();
  function read(element) {
    const total = Number(element.dataset.total ?? 0);
    const pageSize = Number(element.dataset.pageSize ?? 10);
    const requested = Number(element.dataset.page ?? 1);
    if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1 || !Number.isSafeInteger(requested)) throw new TypeError('分页参数须为有效整数');
    const pages = Math.ceil(total / pageSize);
    const page = Math.min(Math.max(1, pages), Math.max(1, requested));
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
    if (state.pages <= 5) pages = Array.from({ length:Math.max(1, state.pages) }, (_, i) => i + 1);
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
    const total = document.createElement('span');
    total.className = 'ui-pagination__total';
    total.textContent = '共 ' + state.pages + ' 页';
    const jump = document.createElement('span');
    jump.className = 'ui-pagination__jump';
    const label = document.createElement('label');
    label.className = 'ui-pagination__jump-label';
    const input = document.createElement('input');
    input.className = 'ui-pagination__input'; input.type = 'number';
    input.min = '1'; input.max = String(Math.max(1, state.pages)); input.step = '1';
    input.value = String(state.page); input.disabled = !state.total;
    input.setAttribute('aria-label', '跳转页码');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('enterkeyhint', 'go');
    label.append('跳至', input, '页');
    const go = document.createElement('button');
    go.type = 'button'; go.className = 'ui-pagination__button';
    go.dataset.pageJump = ''; go.textContent = '跳转'; go.disabled = !state.total;
    jump.append(label, go);
    const feedback = document.createElement('span');
    feedback.className = 'ui-pagination__feedback'; feedback.setAttribute('role', 'status');
    element.append(total, jump, feedback);
    return state;
  }
  function move(element, next) {
    const state = read(element);
    if (next === state.page) return;
    element.dataset.page = String(next);
    const updated = refresh(element);
    element.querySelector('[aria-current="page"]')?.focus();
    element.dispatchEvent(new CustomEvent('ui:page-change', { bubbles:true, detail:updated }));
  }
  function jump(element) {
    const input = element.querySelector('.ui-pagination__input');
    if (!input || input.disabled) return;
    const state = read(element);
    const next = Number(input.value);
    const feedback = element.querySelector('.ui-pagination__feedback');
    if (!input.value.trim() || !Number.isSafeInteger(next) || next < 1 || next > state.pages || !input.validity.valid) {
      input.setAttribute('aria-invalid', 'true');
      feedback.textContent = '请输入 1 至 ' + state.pages + ' 的整数页码';
      input.focus(); return;
    }
    input.removeAttribute('aria-invalid'); feedback.textContent = '';
    move(element, next);
  }
  function init(root = document) {
    const elements = root.matches?.('[data-ui-pagination]') ? [root] : root.querySelectorAll('[data-ui-pagination]');
    elements.forEach(element => {
      if (ready.has(element)) return;
      refresh(element); ready.add(element);
      element.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('[data-page-jump]')) { jump(element); return; }
        const button = event.target instanceof Element ? event.target.closest('button[data-page]') : null;
        if (!button || button.disabled || !element.contains(button)) return;
        move(element, Number(button.dataset.page));
      });
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target instanceof Element && event.target.matches('.ui-pagination__input')) { event.preventDefault(); jump(element); }
      });
      element.addEventListener('input', event => {
        if (event.target instanceof Element && event.target.matches('.ui-pagination__input')) {
          event.target.removeAttribute('aria-invalid');
          element.querySelector('.ui-pagination__feedback').textContent = '';
        }
      });
    });
  }
  window.UiPagination = { init, refresh };
  init();
})();
