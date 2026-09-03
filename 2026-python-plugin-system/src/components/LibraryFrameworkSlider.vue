<template>
  <figure
    class="library-framework-slider"
    role="img"
    aria-label="从 Library、Framework 到 Application：越靠近 Library，需要编写的代码越多；越靠近 Application，需要编写的配置越多。"
  >
    <div class="end-labels">
      <strong>Library</strong>
      <strong>Framework</strong>
      <strong>Application</strong>
    </div>

    <div class="track" aria-hidden="true" />

    <div class="tradeoff-labels">
      <span>Code</span>
      <span>Config</span>
    </div>
  </figure>
</template>

<style scoped>
.library-framework-slider {
  margin: 0;
  padding: 14px 18px 13px;
  border: 3px solid var(--ink);
  background: var(--paper);
  box-shadow: 0 5px 0 rgba(26, 26, 26, 0.22);
}

.end-labels,
.tradeoff-labels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
}

.end-labels strong {
  font-size: 21px;
  line-height: 1;
}

.end-labels strong:nth-child(2) {
  text-align: center;
}

.end-labels strong:last-child {
  text-align: right;
}

.track {
  position: relative;
  height: 16px;
  margin: 7px 8px 5px 0;
  border-bottom: 3px solid var(--ink);
}

.track::after {
  content: '';
  position: absolute;
  right: -1px;
  bottom: -7px;
  width: 11px;
  height: 11px;
  border-top: 3px solid var(--ink);
  border-right: 3px solid var(--ink);
  transform: rotate(45deg);
}

.tradeoff-labels {
  grid-template-columns: 1fr 1fr;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink-soft);
}

.tradeoff-labels span:last-child {
  text-align: right;
}
</style>
