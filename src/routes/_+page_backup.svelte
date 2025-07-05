<script lang="ts">
  import { onMount } from 'svelte';
  import Canvas from '$lib/components/Canvas.svelte';
  
  let sections: HTMLElement[] = [];
  let currentSection = 0;

  function handleScroll(event: Event) {
    const container = event.target as HTMLElement;
    const scrollPosition = container.scrollTop;
    const windowHeight = window.innerHeight;

    sections.forEach((section, index) => {
      const sectionTop = index * windowHeight;
      const distance = scrollPosition - sectionTop;
      
      if (distance >= 0 && distance < windowHeight) {
        currentSection = index;
        section.style.opacity = (1 - (distance / windowHeight)).toString();
      } else if (distance < 0) {
        section.style.opacity = "1";
      } else {
        section.style.opacity = "0";
      }
    });
  }
</script>

<div class="container" on:scroll={handleScroll}>
  <section class="page page1" bind:this={sections[0]}>
    <Canvas />
  </section>

  <section class="page page2" bind:this={sections[1]}>
    <div class="content">
      <h2>Second Page</h2>
      <p>Continue your journey</p>
    </div>
  </section>

  <section class="page page3" bind:this={sections[2]}>
    <div class="content">
      <h2>Third Page</h2>
      <p>Discover more</p>
    </div>
  </section>

  <section class="page page4" bind:this={sections[3]}>
    <div class="content">
      <h2>Fourth Page</h2>
      <p>Almost there</p>
    </div>
  </section>

  <section class="page page5" bind:this={sections[4]}>
    <div class="content">
      <h2>Fifth Page</h2>
      <p>You've made it</p>
    </div>
  </section>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
    scroll-snap-type: y mandatory;
  }

  .page {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    position: relative;
    transition: opacity 0.3s ease;
  }

  .content {
    text-align: center;
    color: white;
    padding: 2rem;
    z-index: 1;
  }

  h1, h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 1.5rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }

  .page1 {
    background-color: #1a1a1a;
  }

  .page2 {
    background-color: #4ECDC4;
  }

  .page3 {
    background-color: #45B7D1;
  }

  .page4 {
    background-color: #96C93D;
  }

  .page5 {
    background-color: #FED766;
  }

  @media (max-width: 768px) {
    h1, h2 {
      font-size: 2rem;
    }

    p {
      font-size: 1.2rem;
    }
  }
</style>
