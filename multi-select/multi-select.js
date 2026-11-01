(() => {
  if (window.UiMultiSelect) return;
  const initialized = new WeakSet();
  const inputs = el => [...el.querySelectorAll('input[type="checkbox"]')];
  const getValue = el => inputs(el).filter(i => i.checked && !i.disabled).map(i => i.value);
  function refresh(el) {
    const label = el.querySelector('[data-multi-summary]');
    const count = getValue(el).length;
    label.textContent = count ? '已选 ' + count + ' 项' : label.dataset.placeholder || '请选择';
  }
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-multi]')];
    if (scope.matches?.('[data-ui-multi]')) elements.unshift(scope);
    elements.forEach(el => {
      if (initialized.has(el)) return;
      initialized.add(el); refresh(el);
      el.addEventListener('change', () => {
        refresh(el);
        el.dispatchEvent(new CustomEvent('ui:multi-change', {bubbles:true, detail:{values:getValue(el)}}));
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el.open) { e.preventDefault(); el.open = false; el.querySelector('summary').focus(); }
      });
      document.addEventListener('click', e => { if (!el.contains(e.target)) el.open = false; });
      el.closest('form')?.addEventListener('reset', () => setTimeout(() => refresh(el), 0));
    });
  }
  window.UiMultiSelect = {init, refresh, getValue};
  init();
})();
