(() => {
  if (window.UiPassword) return;
  const initialized = new WeakSet();
  let sequence = 0;
  function inspect(element) {
    const input = element.querySelector('[data-password-input]');
    if (!input) throw new TypeError('密码组件需要 data-password-input');
    const value = input.value;
    const rules = {
      length: Array.from(value).length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[\p{P}\p{S}]/u.test(value)
    };
    const empty = value.length === 0;
    const passed = Object.values(rules).filter(Boolean).length;
    return {input, result:{empty, valid:empty ? !input.required : passed === 5, passed, rules}};
  }
  function validate(element, {showErrors = true, announce = false} = {}) {
    const {input, result} = inspect(element);
    for (const item of element.querySelectorAll('[data-password-rule]')) {
      const passed = result.rules[item.dataset.passwordRule] === true;
      item.dataset.passed = String(passed);
      item.querySelector('.ui-password__mark').textContent = passed ? '✓' : '×';
      item.querySelector('[data-rule-status]').textContent = passed ? '（已满足）' : '（未满足）';
    }
    input.setCustomValidity(result.valid ? '' : result.empty ? '请填写密码' : '密码尚未满足全部五项要求');
    if (showErrors && !result.valid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    if (announce) {
      const status = element.querySelector('[data-password-status]');
      const message = result.passed === 5 ? '已满足全部密码要求' : '已满足 ' + result.passed + ' / 5 项密码要求';
      if (status && status.textContent !== message) status.textContent = message;
    }
    return result;
  }
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-password]')];
    if (scope.matches?.('[data-ui-password]')) elements.unshift(scope);
    elements.forEach(element => {
      if (initialized.has(element)) return;
      const {input} = inspect(element);
      const list = element.querySelector('[data-password-rules]');
      if (!list) throw new TypeError('密码组件需要规则列表');
      if (!list.id) {
        let id;
        do { id = 'ui-password-rules-' + (++sequence); } while (document.getElementById(id));
        list.id = id;
      }
      const descriptions = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      descriptions.add(list.id); input.setAttribute('aria-describedby', [...descriptions].join(' '));
      const emit = (showErrors, announce) => {
        const detail = validate(element, {showErrors, announce});
        element.dispatchEvent(new CustomEvent('ui:password-validity', {bubbles:true, detail}));
      };
      input.addEventListener('input', () => emit(input.value.length > 0, true));
      input.addEventListener('change', () => emit(input.value.length > 0, true));
      input.addEventListener('blur', () => emit(true, false));
      input.addEventListener('invalid', () => validate(element));
      input.form?.addEventListener('reset', () => setTimeout(() => {
        const status = element.querySelector('[data-password-status]');
        if (status) status.textContent = '';
        emit(false, false);
      }, 0));
      initialized.add(element); validate(element, {showErrors:false});
    });
  }
  window.UiPassword = {init, validate, getValidity:element => inspect(element).result}; init();
})();
