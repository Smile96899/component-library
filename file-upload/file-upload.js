(() => {
  if (window.UiUpload) return;
  const states = new WeakMap();
  const getFiles = el => [...(states.get(el)?.files || [])];
  function accepts(file, accept) {
    if (!accept.trim()) return true;
    return accept.split(',').some(raw => {
      const rule = raw.trim().toLowerCase(), type = file.type.toLowerCase();
      if (!rule) return false;
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
  }
  function init(scope = document) {
    const elements = [...scope.querySelectorAll('[data-ui-upload]')];
    if (scope.matches?.('[data-ui-upload]')) elements.unshift(scope);
    elements.forEach(el => {
      if (states.has(el)) return;
      const state = {files:[]}; states.set(el, state);
      const input = el.querySelector('[data-upload-input]'), drop = el.querySelector('[data-upload-drop]');
      const list = el.querySelector('[data-upload-list]'), status = el.querySelector('[data-upload-status]'), clear = el.querySelector('[data-upload-clear]');
      function update(files) {
        state.files = files;
        list.replaceChildren(...files.map(file => { const li = document.createElement('li'); li.textContent = file.name; return li; }));
        clear.hidden = !files.length;
        status.textContent = files.length ? '已选择 ' + files.length + ' 个文件（尚未上传）' : '';
        el.dispatchEvent(new CustomEvent('ui:files-change', {bubbles:true, detail:{files:getFiles(el)}}));
      }
      function select(files) {
        if (!files.length) return;
        const maxFiles = Number(el.dataset.maxFiles) > 0 ? Number(el.dataset.maxFiles) : 5;
        const maxBytes = Number(el.dataset.maxBytes) > 0 ? Number(el.dataset.maxBytes) : 10485760;
        let error = '';
        if (files.length > (input.multiple ? maxFiles : 1)) error = '文件数量超出限制';
        else if (files.some(f => f.size > maxBytes)) error = '单个文件大小超出限制';
        else if (files.some(f => !accepts(f, input.accept))) error = '文件类型不符合要求';
        if (error) {
          status.textContent = error + '，原选择保留';
          el.dispatchEvent(new CustomEvent('ui:files-error', {bubbles:true, detail:{message:error}}));
        } else update(files);
      }
      el.querySelector('[data-upload-pick]').addEventListener('click', () => input.click());
      input.addEventListener('change', () => { select([...input.files]); input.value = ''; });
      clear.addEventListener('click', () => { input.value = ''; update([]); });
      let depth = 0;
      drop.addEventListener('dragenter', e => { e.preventDefault(); depth++; drop.setAttribute('data-dragging', ''); });
      drop.addEventListener('dragover', e => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
      drop.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; drop.removeAttribute('data-dragging'); } });
      drop.addEventListener('drop', e => { e.preventDefault(); depth = 0; drop.removeAttribute('data-dragging'); select([...e.dataTransfer.files]); });
      el.closest('form')?.addEventListener('reset', () => { input.value = ''; update([]); });
    });
  }
  window.UiUpload = {init, getFiles}; init();
})();
