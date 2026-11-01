# 手动日期范围

开始日期和结束日期均为 `type="text"`，手动填写年月日，不使用 `type="date"`，不显示日历或下拉选择。独立 CSS / JS，不依赖其他组件。

## 引入

```html
<link rel="stylesheet" href="date-range/date-range.css">
<script src="date-range/date-range.js" defer></script>

<div class="ui-date-range" data-ui-date-range>
  <div class="ui-date-range__row">
    <label class="ui-date-range__field">
      <span class="ui-date-range__label">开始日期</span>
      <input class="ui-date-range__input" type="text" name="start_date"
             data-date-start placeholder="YYYY-MM-DD" inputmode="numeric"
             autocomplete="off" spellcheck="false" maxlength="10">
    </label>
    <span class="ui-date-range__separator" aria-hidden="true">至</span>
    <label class="ui-date-range__field">
      <span class="ui-date-range__label">结束日期</span>
      <input class="ui-date-range__input" type="text" name="end_date"
             data-date-end placeholder="YYYY-MM-DD" inputmode="numeric"
             autocomplete="off" spellcheck="false" maxlength="10">
    </label>
  </div>
  <p class="ui-date-range__error" role="status"></p>
</div>
```

## 输入与校验

- 接受 `2026-11-02`、`2026-1-2`、`2026/11/02` 和纯数字 `20261102`，离开输入框时整理成 `YYYY-MM-DD`。数字键盘可直接输入八位数字，不需要输入分隔符。
- 校验真实日历日期、闰年及大小月，年份范围为 0001–9999；不依赖时区转换。
- 结束日期不能早于开始日期；同一天可以作为范围。
- 两项都空表示未设置范围；只填一项不合法。需要必填时给两个 input 加 `required`。
- 输入期间不反复弹错误；离开输入框时显示提示，并设置原生表单约束 `setCustomValidity`。表单提交会拦截不合法日期。
- 用 `value` 设置初始值，`disabled` 禁用输入；表单 reset 恢复初始值并重新校验。

## 获取范围

```js
const range = document.querySelector('[data-ui-date-range]');
range.addEventListener('ui:date-range-change', event => {
  const { start, end, valid, empty } = event.detail;
  if (valid && !empty) {
    // 用标准格式的 start / end 查询业务数据。
  }
});

const result = UiDateRange.getValue(range); // 只读取，不显示错误
UiDateRange.validate(range); // 主动校验并显示错误
```

事件会在输入、失焦和表单重置后发出；只有 `valid` 为 true 时才用于业务查询。无效日期的对应值为 null；两项皆空时 empty 为 true。设置 input.value 不会自动触发事件，程序赋值后调用 `UiDateRange.validate(range)`；需要同步改为标准格式可传 `{ normalize:true }`。动态插入组件后调用 `UiDateRange.init(element)`。

默认透明背景、胶囊描边、单层输入框；可覆盖 `--ui-date-color`、`--ui-date-bg`、`--ui-date-border`、`--ui-date-focus`、`--ui-date-placeholder`。服务端仍需验证收到的日期范围。

[打开独立演示](index.html)
