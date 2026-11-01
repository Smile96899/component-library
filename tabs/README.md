# 标签页

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

点击或左右方向键切换；Home / End 跳到首尾，自动跳过 disabled 标签。正确维护 aria-selected、焦点和面板 hidden。监听 ui:tab-change，读取 event.detail.id / panelId。多个组件实例的 tab 与 panel ID 必须全页唯一，并对应 aria-controls / aria-labelledby。动态插入后调用 UiTabs.init(element)。只切换本地内容，不自动加载网络数据。

## 引入

```html
<link rel="stylesheet" href="tabs/tabs.css">
<script src="tabs/tabs.js" defer></script>
<div class="ui-tabs" data-ui-tabs>
  <div class="ui-tabs__list" role="tablist" aria-label="内容分类">
    <button type="button" role="tab" id="tab-overview" aria-controls="panel-overview" aria-selected="true">概览</button>
    <button type="button" role="tab" id="tab-details" aria-controls="panel-details" aria-selected="false" tabindex="-1">详情</button>
    <button type="button" role="tab" id="tab-records" aria-controls="panel-records" aria-selected="false" tabindex="-1">记录</button>
  </div>
  <div class="ui-tabs__panel" role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" tabindex="0">概览内容</div>
  <div class="ui-tabs__panel" role="tabpanel" id="panel-details" aria-labelledby="tab-details" tabindex="0" hidden>详情内容</div>
  <div class="ui-tabs__panel" role="tabpanel" id="panel-records" aria-labelledby="tab-records" tabindex="0" hidden>记录内容</div>
</div>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-tabs-color / --ui-tabs-border / --ui-tabs-active-bg / --ui-tabs-active-color / --ui-tabs-focus。

[独立演示](index.html)
