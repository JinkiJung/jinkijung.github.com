
<script>
  import ProjectSection from '../../lib/components/ProjectSection.svelte';
  import { data } from '../../lib/stores.js';

  let portfolioData;
  $: portfolioData = $data.portfolioData;

</script>

<svelte:head>
  <title>{portfolioData.pageHeader.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
  </style>
</svelte:head>

<div class="main">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="main-title">{portfolioData.pageHeader.title}</h1>
    <div class="links">
      {#each portfolioData.pageHeader.links as link}
        🔗 <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
      {/each}
    </div>
    <p class="description">{portfolioData.pageHeader.description}</p>
  </header>

  <!-- Project Sections -->
  <div class="sections-container">
    {#each portfolioData.sections as section}
      <ProjectSection {section} />
    {/each}
  </div>
</div>

<style>
  .main {
    background-color: black; /* gray-900 */
    color: #f9fafb; /* gray-50 */
    font-family: 'Inter', sans-serif;
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
      /* Add any styles for the container if needed */
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .page-header {
      padding: 2rem 1rem;
    }
    .main-title {
      font-size: 2rem;
    }
    .links a {
      font-size: 0.9rem;
      margin-right: 1rem;
    }
    .description {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .main-title {
      font-size: 1.8rem;
    }
    .description {
      font-size: 0.9rem;
    }
  }
</style>
