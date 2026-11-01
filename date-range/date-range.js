(() => {
  if (window.UiDateRange) return;
  const initialized = new WeakSet();
  let sequence = 0;
  function parse(value) {
    const text = value.trim();
    if (!text) return null;
    const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
    const separated = /^(\d{4})([-/])(\d{1,2})\2(\d{1,2})$/.exec(text);
    if (!compact && !separated) return undefined;
    const [year, month, day] = compact ? compact.slice(1).map(Number) : [separated[1], separated[3], separated[4]].map(Number);
    if (year < 1 || month < 1 || month > 12) return undefined;
    const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > days[month - 1]) return undefined;
    return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }
  function inspect(element) {
    const startInput = element.querySelector('[data-date-start]');
    const endInput = element.querySelector('[data-date-end]');
    if (!startInput || !endInput) throw new TypeError('日期范围需要开始和结束输入框');
    const start = parse(startInput.value);
    const end = parse(endInput.value);
    const empty = start === null && end === null;
    const required = startInput.required || endInput.required;
    let startError = start === undefined ? '开始日期无效，请填写正确的年月日' : '';
    let endError = end === undefined ? '结束日期无效，请填写正确的年月日' : '';
    if (start === null && (required || !empty)) startError = '请填写开始日期';
    if (end === null && (required || !empty)) endError = '请填写结束日期';
    if (start && end && start > end) endError = '结束日期不能早于开始日期';
    return { startInput, endInput, startError, endError, value:{ start:start ?? null, end:end ?? null, empty, valid:!startError && !endError } };
  }
  function validate(element, { showErrors = true, normalize = false } = {}) {
    const state = inspect(element);
    for (const [input, error, value] of [[state.startInput,state.startError,state.value.start],[state.endInput,state.endError,state.value.end]]) {
      input.setCustomValidity(error);
      if (showErrors && error) input.setAttribute('aria-invalid','true');
      else input.removeAttribute('aria-invalid');
      if (normalize && value) input.value = value.replaceAll('-', '/');
    }
    const feedback = element.querySelector('.ui-date-range__error');
    if (feedback) feedback.textContent = showErrors ? [state.startError,state.endError].filter(Boolean).join('；') : '';
    return state.value;
  }
  function init(root = document) {
    const elements = root.matches?.('[data-ui-date-range]') ? [root] : root.querySelectorAll('[data-ui-date-range]');
    elements.forEach(element => {
      if (initialized.has(element)) return;
      const { startInput, endInput } = inspect(element);
      let feedback = element.querySelector('.ui-date-range__error');
      if (!feedback) { feedback=document.createElement('p'); feedback.className='ui-date-range__error'; element.append(feedback); }
      feedback.setAttribute('role','status');
      if (!feedback.id) {
        let id;
        do { id='ui-date-range-error-' + (++sequence); } while (document.getElementById(id));
        feedback.id=id;
      }
      for (const input of [startInput,endInput]) {
        const descriptions = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
        descriptions.add(feedback.id); input.setAttribute('aria-describedby',[...descriptions].join(' '));
        input.addEventListener('input', () => emit(false, false));
        input.addEventListener('blur', () => emit(true, true));
        input.addEventListener('invalid', () => validate(element));
      }
      function emit(showErrors, normalize) {
        const detail = validate(element, { showErrors, normalize });
        element.dispatchEvent(new CustomEvent('ui:date-range-change',{ bubbles:true,detail }));
      }
      for (const form of new Set([startInput.form,endInput.form].filter(Boolean))) form.addEventListener('reset', () => setTimeout(() => emit(false,false),0));
      initialized.add(element);
      validate(element,{showErrors:false});
    });
  }
  window.UiDateRange = { init, validate, getValue:element=>inspect(element).value };
  init();
})();
