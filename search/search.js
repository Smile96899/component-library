/* 可选增强：清除搜索词。脚本可重复加载，避免重复绑定事件。 */
document.querySelectorAll('[data-ui-search]').forEach((search) => {
  if (search.dataset.uiReady) return;
  const input = search.querySelector('.ui-search__input');
  const clear = search.querySelector('.ui-search__clear');
  if (!input || !clear) return;
  search.dataset.uiReady = 'true';
  const update = () => { clear.hidden = input.value.length === 0; };
  input.addEventListener('input', update);
  clear.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  });
  input.form?.addEventListener('reset', () => setTimeout(update, 0));
  update();
});
