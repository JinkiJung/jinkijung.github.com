
<script>
  import { data } from '../../lib/stores.js';

  let researchData;
  $: researchData = $data.researchData;

</script>

<svelte:head>
  <title>Jinki Jung | {researchData.pageHeader.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
  </style>
</svelte:head>

<div class="main">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="main-title">{researchData.pageHeader.title}</h1>
    <div class="links">
      {#each researchData.pageHeader.links as link}
        🔗 <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
      {/each}
    </div>
    <p class="description">{researchData.pageHeader.description}</p>
  </header>

  <!-- Research Sections -->
  <div class="research-container">
    {#each researchData.sections as section, i}
      <section class="research-section">
        <div class="section-content">
          <h2 class="section-title">{section.title}</h2>
          <p class="section-description">{section.description}</p>
        </div>
        <div class="video-container">
          <iframe 
            src={`https://www.youtube.com/embed/${section.videoId}`}
            title={section.title} 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </section>
    {/each}

    <!-- Closing Section -->
    <section class="closing-section">
      <p>{researchData.closing}</p>
    </section>
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

  .research-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem 4rem 2rem; /* Adjusted padding */
  }

  .research-section {
    margin-bottom: 4rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .research-section {
      grid-template-columns: repeat(2, 1fr);
      gap: 4rem;
    }
    .research-section:nth-child(even) .section-content {
      order: 2;
    }
  }

  .section-title {
    font-family: 'Roboto Slab', serif;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
  }

  .section-description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #d1d5db; /* gray-300 */
  }

  .video-container {
    position: relative;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .closing-section {
    text-align: center;
    padding: 4rem 2rem;
    border-top: 1px solid #374151; /* gray-700 */
    margin-top: 4rem;
  }

  .closing-section p {
    font-size: 1.25rem;
    font-style: italic;
    color: #9ca3af; /* gray-400 */
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.8;
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
    .research-container {
      padding: 0 1rem 2rem 1rem;
    }
    .research-section {
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.8rem;
    }
    .section-description {
      font-size: 0.9rem;
    }
    .video-container {
      padding-top: 75%; /* 4:3 Aspect Ratio for better mobile fit */
    }
    .closing-section {
      padding: 2rem 1rem;
      margin-top: 2rem;
    }
    .closing-section p {
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
    .section-title {
      font-size: 1.5rem;
    }
    .section-description {
      font-size: 0.8rem;
    }
  }
</style>
