/* 从指定 JSON 元素读取当前数据，导出为本地 CSV / JSON 文件。 */
(() => {
  function csvCell(value) {
    let text = value == null ? '' : String(value);
    // 将可能被表格软件当作公式的字符串保留为文本。
    if (typeof value === 'string' && (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }

  function csv(data) {
    if (!Array.isArray(data) || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
      throw new Error('CSV 数据须为对象数组');
    }
    const keys = [...new Set(data.flatMap(row => Object.keys(row)))];
    if (!keys.length) throw new Error('没有可导出的数据');
    if (data.some(row => Object.values(row).some(value => value !== null && typeof value === 'object'))) {
      throw new Error('嵌套数据请使用 JSON 格式导出');
    }
    return '\uFEFF' + [keys.map(csvCell).join(','), ...data.map(row => keys.map(key => csvCell(Object.hasOwn(row, key) ? row[key] : null)).join(','))].join('\r\n');
  }

  document.querySelectorAll('[data-ui-export]').forEach(button => {
    if (button.dataset.uiExportReady) return;
    button.dataset.uiExportReady = 'true';
    const status = document.createElement('span');
    status.className = 'ui-export-status';
    status.setAttribute('role', 'status');
    button.after(status);
    let timer;
    button.addEventListener('click', () => {
      clearTimeout(timer);
      status.textContent = '';
      let url;
      let link;
      try {
        const source = document.getElementById(button.dataset.exportTarget);
        if (!source) throw new Error('未找到导出数据');
        let data;
        try { data = JSON.parse(source.textContent); }
        catch { throw new Error('导出数据不是有效 JSON'); }
        if (data === null || (Array.isArray(data) && !data.length)) throw new Error('没有可导出的数据');
        const format = button.dataset.exportFormat || 'csv';
        if (!['csv', 'json'].includes(format)) throw new Error('仅支持 CSV 或 JSON 格式');
        const content = format === 'csv' ? csv(data) : JSON.stringify(data, null, 2);
        const requested = button.dataset.exportFilename || 'export';
        const basename = requested.split(/[\\/]/).pop().replace(/\.(csv|json)$/i, '').replace(/[<>:"|?*\x00-\x1f]/g, '_') || 'export';
        const filename = basename + '.' + format;
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
        url = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        status.textContent = '已开始下载';
        button.dispatchEvent(new CustomEvent('ui:export', { bubbles: true, detail: { filename, format } }));
      } catch (error) {
        status.textContent = error.message || '导出失败';
      } finally {
        link?.remove();
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
        timer = setTimeout(() => { status.textContent = ''; }, 3000);
      }
    });
  });
})();
