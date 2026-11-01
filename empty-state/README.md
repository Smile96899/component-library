# 空状态

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

只需 CSS。默认无边框、透明背景，包含小图标、标题和说明。可替换文字为“没有搜索结果”等业务状态；不需要说明时可删除 description 段落。通过 hidden 切换显隐。需要操作入口时由项目绑定自己的按钮；组件不会自动请求数据。

## 引入

```html
<link rel="stylesheet" href="empty-state/empty-state.css">
<div class="ui-empty" role="status">
  <svg class="ui-empty__icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 5-7h12l5 7v13H5V13Z"/><path d="M5 14h7l2 4h4l2-4h7"/></svg>
  <p class="ui-empty__title">暂无数据</p>
  <p class="ui-empty__description">有数据后会显示在这里</p>
</div>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-empty-bg / --ui-empty-color / --ui-empty-icon / --ui-empty-muted。

[独立演示](index.html)
