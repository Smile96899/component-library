(() => {
  if (window.UiTabs) return;
  const initialized = new WeakSet();
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-tabs]')];
    if (scope.matches?.('[data-ui-tabs]')) elements.unshift(scope);
    elements.forEach(el => {
      if (initialized.has(el)) return;
      initialized.add(el);
      const tabs = [...el.querySelectorAll('[role="tab"]')].filter(t => t.closest('[data-ui-tabs]') === el);
      const panels = [...el.querySelectorAll('[role="tabpanel"]')].filter(p => p.closest('[data-ui-tabs]') === el);
      function activate(tab, focus = false, emit = true) {
        if (tab.disabled) return;
        tabs.forEach(t => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
        panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
        if (focus) tab.focus();
        if (emit) el.dispatchEvent(new CustomEvent('ui:tab-change', {bubbles:true, detail:{id:tab.id, panelId:tab.getAttribute('aria-controls')}}));
      }
      const initial = tabs.find(t => !t.disabled && t.getAttribute('aria-selected') === 'true') || tabs.find(t => !t.disabled);
      if (initial) activate(initial, false, false);
      tabs.forEach(tab => {
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', e => {
          const enabled = tabs.filter(t => !t.disabled);
          let index = enabled.indexOf(tab);
          if (e.key === 'ArrowRight') index = (index + 1) % enabled.length;
          else if (e.key === 'ArrowLeft') index = (index - 1 + enabled.length) % enabled.length;
          else if (e.key === 'Home') index = 0;
          else if (e.key === 'End') index = enabled.length - 1;
          else return;
          e.preventDefault(); activate(enabled[index], true);
        });
      });
    });
  }
  window.UiTabs = {init}; init();
})();
