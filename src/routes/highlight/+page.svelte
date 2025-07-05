<div class="highlight">
  <h1>Highlights</h1>
  
  <div class="highlight-grid">
    <div class="highlight-card">
      <div class="card-image" style="background-color: #007bff"></div>
      <div class="card-content">
        <h2>Achievement 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <span class="date">Jan 2024</span>
      </div>
    </div>

    <div class="highlight-card">
      <div class="card-image" style="background-color: #28a745"></div>
      <div class="card-content">
        <h2>Achievement 2</h2>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <span class="date">Feb 2024</span>
      </div>
    </div>

    <div class="highlight-card">
      <div class="card-image" style="background-color: #ffc107"></div>
      <div class="card-content">
        <h2>Achievement 3</h2>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
        <span class="date">Mar 2024</span>
      </div>
    </div>
  </div>
</div>

<style>
  .highlight {
    padding: 2rem 0;
  }

  .highlight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .highlight-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .highlight-card:hover {
    transform: translateY(-5px);
  }

  .card-image {
    height: 200px;
    width: 100%;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-content h2 {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .card-content p {
    color: #666;
    margin-bottom: 1rem;
  }

  .date {
    display: block;
    color: #999;
    font-size: 0.9rem;
  }
</style> 