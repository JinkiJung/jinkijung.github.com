<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
</script>

<div class="page">
  <section class="hero">
    <h1>Research</h1>
    <p class="subtitle">Technology Researcher & Innovation Explorer</p>
  </section>

  <section class="content">
    <div class="research-areas">
      <h2>Research Areas</h2>
      <div class="areas-grid">
        <div class="area-card">
          <h3>Artificial Intelligence</h3>
          <ul>
            <li>Machine Learning</li>
            <li>Deep Learning</li>
            <li>Natural Language Processing</li>
            <li>Computer Vision</li>
          </ul>
        </div>
        <div class="area-card">
          <h3>Web Technologies</h3>
          <ul>
            <li>Web Assembly</li>
            <li>Progressive Web Apps</li>
            <li>Web3 & Blockchain</li>
            <li>Real-time Web</li>
          </ul>
        </div>
        <div class="area-card">
          <h3>System Architecture</h3>
          <ul>
            <li>Distributed Systems</li>
            <li>Cloud Computing</li>
            <li>Microservices</li>
            <li>Edge Computing</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="publications">
      <h2>Publications & Papers</h2>
      <div class="papers-grid">
        <div class="paper-card">
          <h3>AI in Web Development</h3>
          <p>Research on implementing AI models in modern web applications.</p>
          <div class="paper-meta">
            <span class="year">2023</span>
            <span class="type">Conference Paper</span>
          </div>
        </div>
        <div class="paper-card">
          <h3>Web3 Architecture Patterns</h3>
          <p>Analysis of successful Web3 application architectures.</p>
          <div class="paper-meta">
            <span class="year">2023</span>
            <span class="type">Journal Article</span>
          </div>
        </div>
        <div class="paper-card">
          <h3>Edge Computing Solutions</h3>
          <p>Study on optimizing web applications for edge computing.</p>
          <div class="paper-meta">
            <span class="year">2022</span>
            <span class="type">Research Paper</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    min-height: 100vh;
    background: #000;
    color: #fff;
  }

  .hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
  }

  h1 {
    font-size: 4rem;
    margin: 0;
    background: linear-gradient(45deg, #fff, #888);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.5rem;
    color: #888;
    margin-top: 1rem;
  }

  .content {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .research-areas {
    margin-bottom: 4rem;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #fff;
  }

  .areas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .area-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 10px;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #888;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .papers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .paper-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 10px;
    transition: transform 0.3s ease;
  }

  .paper-card:hover {
    transform: translateY(-5px);
  }

  .paper-card h3 {
    margin-top: 0;
  }

  .paper-card p {
    color: #888;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .paper-meta {
    display: flex;
    gap: 1rem;
  }

  .year, .type {
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.9rem;
    color: #888;
  }
</style> 