<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
</script>

<div class="app">
  <Header />
  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: 0rem;
    margin-top: 0rem;
    max-width: 1200px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
</style> 