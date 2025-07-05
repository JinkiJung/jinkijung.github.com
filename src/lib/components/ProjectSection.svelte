<!-- src/lib/ProjectSection.svelte -->
<script>
  import ProjectCard from './ProjectCard.svelte';
  export let section;
</script>

<section class="section-wrapper">
  <div class="section-header">
    <h2 class="section-title">
      <span class="chapter-number">{section.chapter}</span>
      {section.title}
    </h2>
    <p class="section-description">{section.description}</p>
  </div>
  <div class="project-grid">
    {#each section.projects as project}
      <ProjectCard {project} />
    {/each}
  </div>
</section>

<style>
  .section-wrapper {
    padding: 5rem 1rem; /* 상하 80px, 좌우 16px */
    max-width: 1280px;
    margin: 0 auto;
  }
  .section-header {
    text-align: center;
    margin-bottom: 4rem; /* 64px */
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .section-title {
    font-size: 2.25rem; /* 36px */
    font-weight: 700;
    color: #f9fafb; /* gray-50 */
    margin: 0 0 1rem 0;
  }
  .chapter-number {
    display: block;
    font-size: 1.125rem; /* 18px */
    font-weight: 500;
    color: #60a5fa; /* blue-400 */
    margin-bottom: 0.5rem;
  }
  .section-description {
    font-size: 1.125rem; /* 18px */
    line-height: 1.75;
    color: #d1d5db; /* gray-300 */
  }
  .project-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 2rem; /* 32px */
  }

  /* 태블릿 이상 화면 */
  @media (min-width: 768px) {
    .project-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* 데스크탑 이상 화면 */
  @media (min-width: 1024px) {
    .project-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .section-wrapper {
        padding-left: 2rem;
        padding-right: 2rem;
    }
  }
</style>
