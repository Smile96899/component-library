(() => {
  if (window.UiToast) return;
  let region;
  function show(message, { duration = 4000 } = {}) {
    if (typeof message !== 'string' || !message.trim()) throw new TypeError('消息不能为空');
    if (!Number.isFinite(duration) || duration < 0) throw new TypeError('duration 必须是非负毫秒数');
    if (!region?.isConnected) {
      region = document.createElement('div');
      region.className = 'ui-toast-region';
      region.setAttribute('aria-label', '消息通知');
      document.body.append(region);
    }
    const item = document.createElement('div');
    item.className = 'ui-toast';
    const text = document.createElement('span');
    text.className = 'ui-toast__message';
    text.setAttribute('role', 'status');
    text.setAttribute('aria-atomic', 'true');
    const button = document.createElement('button');
    button.className = 'ui-toast__close';
    button.type = 'button';
    button.setAttribute('aria-label', '关闭消息');
    button.textContent = '×';
    item.append(text, button);
    region.append(item);
    requestAnimationFrame(() => { text.textContent = message; });
    let timer;
    let remaining = duration;
    let started;
    let hovering = false;
    const opener = document.activeElement;
    function close() {
      clearTimeout(timer);
      const focused = item.contains(document.activeElement);
      item.remove();
      if (focused && opener instanceof HTMLElement && opener.isConnected) opener.focus();
    }
    function pause() {
      if (timer) { clearTimeout(timer); timer = undefined; remaining = Math.max(0, remaining - (Date.now() - started)); }
    }
    function resume() {
      if (!duration || hovering || item.contains(document.activeElement) || !item.isConnected || timer) return;
      started = Date.now();
      timer = setTimeout(close, remaining);
    }
    button.addEventListener('click', close);
    item.addEventListener('mouseenter', () => { hovering = true; pause(); });
    item.addEventListener('mouseleave', () => { hovering = false; resume(); });
    item.addEventListener('focusin', pause);
    item.addEventListener('focusout', () => setTimeout(resume, 0));
    resume();
    return { close, element:item };
  }
  window.UiToast = { show };
})();
