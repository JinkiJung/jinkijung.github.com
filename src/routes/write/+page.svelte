
<script>
  import { data } from '../../lib/stores.js';

  let writeData;
  $: writeData = $data.writeData;

</script>

<svelte:head>
  <title>Jinki Jung | {writeData.pageHeader.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
  </style>
</svelte:head>

<div class="main">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="main-title">{writeData.pageHeader.title}</h1>
    <div class="links">
      {#each writeData.pageHeader.links as link}
        🔗 <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
      {/each}
    </div>
    <p class="description">{writeData.pageHeader.description}</p>
  </header>

  <!-- Content Sections (to be populated from data.js) -->
  <div class="sections-container">
    {#if writeData.sections && writeData.sections.length > 0}
      {#each writeData.sections as section}
        <!-- You can create a new component for writing sections or use ProjectSection if it fits -->
        <!-- For now, just displaying a placeholder -->
        <section class="writing-section">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </section>
      {/each}
    {:else}
      <p class="placeholder">Writing samples will be added here soon.</p>
    {/if}
  </div>
</div>

<style>
  .main {
    background-color: black; /* gray-900 */
    color: #f9fafb; /* gray-50 */
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
  }

  .page-header {
    max-width: 960px;
    margin: 0 auto;
    padding: 4rem 2rem;
    text-align: left;
  }

  .main-title {
    font-family: 'Roboto Slab', serif;
    font-size: 2.5rem; /* 40px */
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
  }

  .links {
    margin-bottom: 1.5rem;
  }

  .links a {
    color: #9ca3af; /* gray-400 */
    text-decoration: none;
    margin-right: 1.5rem;
    font-size: 1rem;
    transition: color 0.2s ease-in-out;
  }

  .links a:hover {
    color: #fff;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #d1d5db; /* gray-300 */
    max-width: 80ch; /* Limit line length for readability */
  }

  .sections-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem 4rem 2rem;
  }

  .placeholder {
    color: #9ca3af; /* gray-400 */
    font-style: italic;
  }

  /* Add styles for .writing-section if you create it */

</style>
