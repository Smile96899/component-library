/* 可选增强：清除搜索词和复制。脚本可重复加载，避免重复绑定事件。 */
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

(() => {
  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // 兼容不提供 Clipboard API 的环境；失败时明确反馈。
    const previous = document.activeElement;
    const area = document.createElement('textarea');
    area.value = text;
    area.readOnly = true;
    area.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px;';
    document.body.append(area);
    try {
      area.select();
      if (!document.execCommand('copy')) throw new Error('Copy unavailable');
    } finally {
      area.remove();
      previous?.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll('[data-ui-copy]').forEach(button => {
    if (button.dataset.uiCopyReady) return;
    button.dataset.uiCopyReady = 'true';
    const status = document.createElement('span');
    status.className = 'ui-copy-status';
    status.setAttribute('role', 'status');
    button.after(status);
    let pending = false;
    let resetTimer;
    const originalLabel = button.getAttribute('aria-label') || '复制';
    button.addEventListener('click', async () => {
      if (pending) return;
      pending = true;
      clearTimeout(resetTimer);
      button.dataset.copyState = 'pending';
      button.setAttribute('aria-label', originalLabel);
      button.setAttribute('aria-busy', 'true');
      status.textContent = '';
      try {
        const targetId = button.dataset.copyTarget;
        const target = targetId ? document.getElementById(targetId) : null;
        if (targetId && !target) throw new Error('Copy target missing');
        const text = target ? ('value' in target ? target.value : target.textContent) : button.dataset.copyText;
        if (typeof text !== 'string' || text.length === 0) {
          status.textContent = '没有可复制的内容';
          button.dataset.copyState = 'empty';
          return;
        }
        await copyText(text);
        button.dataset.copyState = 'success';
        button.setAttribute('aria-label', '已复制');
        status.textContent = '已复制';
      } catch {
        button.dataset.copyState = 'error';
        status.textContent = '复制失败，请选择内容后手动复制';
      } finally {
        pending = false;
        button.removeAttribute('aria-busy');
        resetTimer = setTimeout(() => {
          delete button.dataset.copyState;
          button.setAttribute('aria-label', originalLabel);
          status.textContent = '';
        }, 3000);
      }
    });
  });
})();
