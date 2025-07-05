<!-- src/lib/ProjectCard.svelte -->
<script>
  import Icon from './Icon.svelte';
  export let project;
</script>

<div class="card">
  <img src={project.image} alt={project.title} class="project-image" />
  <div class="card-content">
    <h3 class="project-title">{project.title}</h3>
    <p class="project-description">{project.description}</p>
    
    <div class="contribution">
      <span class="label">기여:</span>
      <p>{project.contribution}</p>
    </div>

    <div class="tech-stack">
      {#each project.tech as techName}
        <Icon name={techName} />
      {/each}
    </div>
    
    <div class="links">
      {#each project.links as link}
        <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-button">
          {link.name}
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .card {
    background-color: #1f2937; /* gray-800 */
    border-radius: 0.75rem; /* 12px */
    overflow: hidden;
    border: 1px solid #374151; /* gray-700 */
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
  .project-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .card-content {
    padding: 1.5rem; /* 24px */
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .project-title {
    font-size: 1.25rem; /* 20px */
    font-weight: 600;
    color: #f9fafb; /* gray-50 */
    margin: 0 0 0.5rem 0;
  }
  .project-description {
    font-size: 1rem; /* 16px */
    color: #d1d5db; /* gray-300 */
    margin: 0 0 1rem 0;
    flex-grow: 1; /* 설명이 카드 높이를 채우도록 함 */
  }
  .contribution {
    font-size: 0.9rem;
    color: #9ca3af; /* gray-400 */
    margin-bottom: 1rem;
    display: flex;
  }
  .contribution .label {
    font-weight: 600;
    margin-right: 0.5rem;
    color: #d1d5db;
  }
  .tech-stack {
    display: flex;
    gap: 0.75rem; /* 12px */
    margin-bottom: 1.5rem; /* 24px */
    flex-wrap: wrap;
  }
  .links {
    margin-top: auto; /* 링크를 카드 하단에 정렬 */
    display: flex;
    gap: 0.75rem; /* 12px */
    flex-wrap: wrap;
  }
  .link-button {
    background-color: #374151; /* gray-700 */
    color: #d1d5db; /* gray-300 */
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem; /* 14px */
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  .link-button:hover {
    background-color: #4b5563; /* gray-600 */
    color: white;
  }
</style>
