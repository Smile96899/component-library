/* 原生 dialog 提供模态焦点约束与 Escape 关闭。 */
(() => {
  if (window.UiConfirm) return;
  function open(dialog, opener = document.activeElement) {
    if (!(dialog instanceof HTMLDialogElement) || !dialog.classList.contains('ui-confirm') || dialog.open) return;
    dialog.returnValue = '';
    dialog.addEventListener('close', () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      dialog.dispatchEvent(new CustomEvent('ui:confirm', { bubbles:true, detail:{ confirmed:dialog.returnValue === 'confirm' } }));
    }, { once:true });
    dialog.showModal();
    dialog.querySelector('[data-ui-confirm-cancel]')?.focus();
  }
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target?.closest('[data-ui-confirm]');
    if (trigger) open(document.getElementById(trigger.dataset.uiConfirm), trigger);
    const cancel = target?.closest('[data-ui-confirm-cancel]');
    const accept = target?.closest('[data-ui-confirm-accept]');
    (cancel || accept)?.closest('dialog.ui-confirm')?.close(accept ? 'confirm' : 'cancel');
  });
  window.UiConfirm = { open };
})();
