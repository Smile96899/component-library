# 文件上传

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

支持点击选择、拖拽、文件列表和清空。每次有效选择替换整个列表；取消选择保持原列表。默认最多 5 个、单个不超过 10 MiB，可修改 data-max-files / data-max-bytes。input.accept 可限定扩展名或 MIME（例如 .png,.jpg,application/pdf），选择和拖拽均校验；失败保留原列表并发出 ui:files-error。前端检查不替代服务端验证。

组件只选择文件，不会自行发送请求。监听 ui:files-change 的 detail.files（File 数组），或 UiUpload.getFiles(element)。内部 input 每次读取后会清空，不能直接通过普通表单上传；业务侧将返回的 File 逐一 append 到 FormData，再调用自己的上传接口。动态插入后调用 UiUpload.init(element)。

## 引入

```html
<link rel="stylesheet" href="file-upload/file-upload.css">
<script src="file-upload/file-upload.js" defer></script>
<div class="ui-upload" data-ui-upload data-max-files="5" data-max-bytes="10485760">
  <div class="ui-upload__drop" data-upload-drop>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5"/></svg>
    <button type="button" data-upload-pick>选择文件</button>
    <span class="ui-upload__hint">或拖拽到此处</span>
    <input type="file" data-upload-input aria-label="选择文件" multiple hidden>
  </div>
  <ul class="ui-upload__list" data-upload-list></ul>
  <p class="ui-upload__status" data-upload-status role="status" aria-live="polite"></p>
  <button class="ui-upload__clear" type="button" data-upload-clear hidden>清空</button>
</div>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-upload-color / --ui-upload-border / --ui-upload-bg / --ui-upload-drag-bg / --ui-upload-muted / --ui-upload-focus。

[独立演示](index.html)
