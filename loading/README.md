# 加载提示

独立组件，无框架依赖。默认中性样式，颜色可自行配置。

只需 CSS，显示紧凑的旋转图标，不显示旁边文字；role=status 内含供读屏使用的“加载中”文本。尊重系统减少动画设置。通过 hidden 控制显隐；请求期间给实际内容区域设置 aria-busy="true"，结束后移除。放进按钮时由业务代码禁用重复提交，并保留按钮的可访问名称。

## 引入

```html
<link rel="stylesheet" href="loading/loading.css">
<span class="ui-loading" role="status"><span class="ui-loading__spinner" aria-hidden="true"></span><span class="ui-loading__sr">加载中，请稍候</span></span>
```

## 样式配置

在组件或其父容器上覆盖 CSS 变量：--ui-loading-color / --ui-loading-track。

[独立演示](index.html)
