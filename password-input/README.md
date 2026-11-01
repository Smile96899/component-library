# 密码规则输入框

独立 CSS / JS，无其他组件依赖。胶囊圆角密码框，下方单独显示规则面板；输入内容始终以密码形式遮挡，不预填密码。每次输入、粘贴或 change 后更新五项规则：

- 至少 8 位。
- 至少一个大写英文字母 A–Z。
- 至少一个小写英文字母 a–z。
- 至少一个数字 0–9。
- 至少一个特殊字符（Unicode 标点或符号，例如 !、@、#；空格不算特殊字符）。

满足时显示绿色 ✓，未满足显示红色 ×；读屏同时获得文字状态。颜色可以单独覆盖。长度按 Unicode 码点计数，不裁剪或修改输入值。

## 引入

```html
<link rel="stylesheet" href="password-input/password-input.css">
<script src="password-input/password-input.js" defer></script>
<div class="ui-password" data-ui-password>
  <input class="ui-password__input" data-password-input type="password" name="password" aria-label="设置密码" autocomplete="new-password" autocapitalize="none" spellcheck="false" required>
  <ul class="ui-password__rules" data-password-rules aria-label="密码要求">
    <li data-password-rule="length" data-passed="false"><span class="ui-password__mark" aria-hidden="true">×</span><span>至少 8 位</span><span class="ui-password__sr" data-rule-status>（未满足）</span></li>
    <li data-password-rule="uppercase" data-passed="false"><span class="ui-password__mark" aria-hidden="true">×</span><span>至少一个大写字母</span><span class="ui-password__sr" data-rule-status>（未满足）</span></li>
    <li data-password-rule="lowercase" data-passed="false"><span class="ui-password__mark" aria-hidden="true">×</span><span>至少一个小写字母</span><span class="ui-password__sr" data-rule-status>（未满足）</span></li>
    <li data-password-rule="number" data-passed="false"><span class="ui-password__mark" aria-hidden="true">×</span><span>至少一个数字</span><span class="ui-password__sr" data-rule-status>（未满足）</span></li>
    <li data-password-rule="special" data-passed="false"><span class="ui-password__mark" aria-hidden="true">×</span><span>至少一个特殊字符</span><span class="ui-password__sr" data-rule-status>（未满足）</span></li>
  </ul>
  <span class="ui-password__sr" data-password-status role="status" aria-live="polite" aria-atomic="true"></span>
</div>
```

所有规则满足时通过校验；默认 required，空值不通过。移除 required 后允许留空，但填写后仍须满足五项规则。通过 setCustomValidity 接入原生表单校验，业务表单可调用 checkValidity() / reportValidity()。组件不会提交密码，也不存储或记录密码；服务端需要执行对应校验。

## 接入事件

```js
const element = document.querySelector('[data-ui-password]');
element.addEventListener('ui:password-validity', event => {
  const { valid, passed, rules } = event.detail;
  // valid: 是否有效；passed: 通过项数；rules: 五项规则的布尔值。
  // 事件中不含密码原文。
});
UiPassword.getValidity(element); // 仅读取校验状态
UiPassword.validate(element); // 更新界面与原生表单校验
```

动态插入完整组件后调用 UiPassword.init(element)。程序设置 input.value 后调用 validate(element)。支持表单 reset 和多实例；不要复制已初始化组件的 ID，模板中的规则列表不需要手写 ID，由组件生成唯一关联。

这五项是格式要求，不是密码强度评分。

## 样式配置

覆盖 --ui-password-color / --ui-password-border / --ui-password-bg / --ui-password-focus / --ui-password-panel-border / --ui-password-panel-bg / --ui-password-pass / --ui-password-fail。

[独立演示](index.html)
