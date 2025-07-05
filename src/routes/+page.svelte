<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import ThreeBackground from '../lib/components/ThreeBackground.svelte';
	import QuestionGrid from '$lib/components/QuestionGrid.svelte';
  import { browser } from '$app/environment';
	import Spectrum from '$lib/components/Spectrum.svelte';
	import OnePager from '$lib/components/OnePager.svelte';

  let scrollY = 0;
  let scrollPercent = 0;

  function handleScroll() {
    scrollY = window.scrollY;
    scrollPercent = Math.min(
      100,
      (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
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
    min-height: 310vh;
    overflow-x: hidden;
  }
</style>

<main>
  <!-- 3D 배경 -->
  <Spectrum />
  <OnePager />
  <QuestionGrid />
  <!--<ThreeBackground {scrollPercent} />-->

  <!-- 3D에서 2D로 전환되는 섹션 -->
  
</main>