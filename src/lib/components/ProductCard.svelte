<!-- src/lib/ProductCard.svelte -->
<script>
  export let project;
  export let icons;
</script>

<div class="product-card">
  <div class="card-image-placeholder">
    <!-- 실제 프로젝트 이미지를 넣을 수 있습니다. -->
    <span>{project.title.charAt(0)}</span>
  </div>
  <div class="card-content">
    <h3 class="card-title">{project.title}</h3>
    <p class="card-description">{project.description}</p>
    <div class="tech-icons">
      {#each project.tech as techName}
        <img src={icons[techName]} alt={techName} title={techName} />
      {/each}
    </div>
    <div class="card-links">
      {#each project.links as link}
        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
      {/each}
    </div>
  </div>
</div>

<style>
  .product-card {
    background: #1f2937; /* gray-800 */
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid #374151; /* gray-700 */
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
  .card-image-placeholder {
    height: 120px;
    background: #111827; /* gray-900 */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    color: #4b5563;
  }
  .card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f9fafb;
    margin: 0 0 0.5rem 0;
  }
  .card-description {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0 0 1rem 0;
    flex-grow: 1;
  }
  .tech-icons {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .tech-icons img {
    width: 24px;
    height: 24px;
  }
  .card-links {
    margin-top: auto;
    display: flex;
    gap: 0.75rem;
  }
  .card-links a {
    color: #60a5fa;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .card-links a:hover {
    text-decoration: underline;
  }
</style>
