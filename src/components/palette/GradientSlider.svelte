<script lang="ts">
  import { beginDrag, endDrag } from '../../stores/history';
  let { value, min, max, step, gradient, ticks = [], oninput }: {
    value: number;
    min: number;
    max: number;
    step: number;
    gradient: string;
    ticks?: Array<{ pos: number; label?: string; style?: string }>;
    oninput: (v: number) => void;
  } = $props();
</script>

<div class="gs-wrap">
  <div class="gs-track">
    <input
      type="range"
      {min} {max} {step} {value}
      style="--gs-grad: {gradient}"
      oninput={(e) => oninput(+(e.target as HTMLInputElement).value)}
      onpointerdown={beginDrag}
      onpointerup={endDrag}
      onpointercancel={endDrag}
    />
    {#each ticks as tick}
      <div class="gs-tick" style="left: calc({tick.pos} * (100% - 16px) + 8px); {tick.style ?? ''}">
        {#if tick.label}<span class="gs-tick-label">{tick.label}</span>{/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .gs-wrap { flex: 1; min-width: 0; }
  .gs-track { position: relative; height: 16px; }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    display: block;
    width: 100%;
    height: 16px;
    margin: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    outline: none;
    border-radius: 4px;
  }
  input[type='range']::-webkit-slider-runnable-track {
    background: var(--gs-grad);
    height: 16px;
    border-radius: 4px;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid rgba(0, 0, 0, 0.4);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    margin-top: 1px;
  }
  input[type='range']::-moz-range-track {
    background: var(--gs-grad);
    height: 16px;
    border-radius: 4px;
    border: none;
  }
  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid rgba(0, 0, 0, 0.4);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .gs-tick {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    pointer-events: none;
    background: rgba(255, 255, 255, 0.6);
  }
  .gs-tick-label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: var(--text-3);
    white-space: nowrap;
    margin-bottom: 1px;
    line-height: 1;
  }
</style>
