<!-- src/lib/Header.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let categories;
  export let selectedCategory;
  export let categoryDescription;

  const dispatch = createEventDispatcher();

  function selectCategory(category) {
    dispatch('select', category);
  }
</script>

<header>
  <div class="header-top">
    <h1>Jinki's Tech Showroom</h1>
  </div>
  <div class="header-middle">
    <p>{categoryDescription}</p>
  </div>
  <div class="header-bottom">
    <div class="category-filters">
      {#each Object.keys(categories) as category}
        <button 
          class:active={selectedCategory === category}
          on:click={() => selectCategory(category)}
        >
          {category}
        </button>
      {/each}
    </div>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    background: rgba(17, 24, 39, 0.8); /* gray-900 with alpha */
    backdrop-filter: blur(10px);
    z-index: 10;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #374151; /* gray-700 */
  }

  .header-top h1 {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 1rem 0;
    color: #f9fafb; /* gray-50 */
  }

  .header-middle {
    text-align: center;
    min-height: 2.25rem; /* 설명이 없을 때도 높이 유지 */
    margin-bottom: 1.5rem;
  }
  
  .header-middle p {
    color: #9ca3af; /* gray-400 */
    font-size: 1.1rem;
    margin: 0;
    transition: opacity 0.3s ease;
  }

  .category-filters {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .category-filters button {
    background: #374151; /* gray-700 */
    color: #d1d5db; /* gray-300 */
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-filters button:hover {
    background: #4b5563; /* gray-600 */
    color: white;
  }

  .category-filters button.active {
    background: #60a5fa; /* blue-400 */
    color: #111827; /* gray-900 */
    font-weight: 600;
    transform: scale(1.05);
  }
</style>
