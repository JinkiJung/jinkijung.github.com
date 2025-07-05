<script>
  import { icons } from '../../resources/data.js';

  export let name;
  export let size = 24;

  const path = icons[name] || '';
</script>

<div class="icon-wrapper" style="width: {size}px; height: {size}px;">
  {#if path}
  <img src="{path}" height="{size}" alt="{name}">
    
  {/if}
  <span class="tooltip">{name}</span>
</div>

<style>
  .icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af; /* gray-400 */
    transition: color 0.2s;
  }
  .icon-wrapper:hover {
    color: #f9fafb; /* gray-50 */
  }
  .icon-wrapper .tooltip {
    visibility: hidden;
    width: max-content;
    background-color: #1f2937; /* gray-800 */
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%; /* 아이콘 위에 툴팁 표시 */
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.8rem;
  }
  .icon-wrapper:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
</style>