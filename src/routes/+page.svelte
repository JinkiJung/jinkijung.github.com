<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import ThreeBackground from '../lib/components/ThreeBackground.svelte';
	import QuestionGrid from '$lib/components/QuestionGrid.svelte';
  import { browser } from '$app/environment';
	import Spectrum from '$lib/components/Spectrum.svelte';
	import OnePager from '$lib/components/OnePager.svelte';

  let Copenhagen: any;
  let Daejeon: any;

  onMount(async () => {
    if (browser) {
      const module = await import('$lib/components/Copenhagen.svelte');
      Copenhagen = module.default;

      const module2 = await import('$lib/components/Daejeon.svelte');
      Daejeon = module2.default;
    }
  });

  let scrollY = 0;
  let scrollPercent = 0;
  let scrollScreen = 0;

  function handleScroll() {
    scrollY = window.scrollY;
    scrollPercent = Math.min(
      100,
      (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    scrollScreen = scrollY / window.innerHeight;
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
      console.log('Scroll event listener added');
    }
    
  });

  onDestroy(() => {
      if (browser) {
          window.removeEventListener('scroll', handleScroll)
      }
  });
    
</script>

<style>
  main {
    position: relative;
    min-height: 930vh;
    overflow-x: hidden;
  }
</style>

<main>
  <!-- 3D 배경 -->
  <Spectrum />
  {#if Copenhagen && scrollScreen >=1 && scrollScreen < 3.5}
    <svelte:component this={Copenhagen} />
  {/if}
  {#if Daejeon && scrollScreen >=3.5 && scrollScreen < 6}
    <svelte:component this={Daejeon} />
  {/if}
  <!--<ThreeBackground {scrollPercent} />-->
  <OnePager />
  <!-- 3D에서 2D로 전환되는 섹션 -->
  
</main>