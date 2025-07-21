<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import ThreeBackground from '../lib/components/ThreeBackground.svelte';
	import QuestionGrid from '$lib/components/QuestionGrid.svelte';
  import { browser } from '$app/environment';
	import Spectrum from '$lib/components/Spectrum.svelte';
	import OnePager from '$lib/components/OnePager.svelte';
  import { en } from '../resources/data_en.js';
  import { ko } from '../resources/data_ko.js';
  import { language } from '$lib/stores.js'; // language store import

  let Copenhagen: any;
  let Daejeon: any;

  let currentLanguageData: any; // 현재 언어 데이터를 저장할 변수

  // language store 구독
  language.subscribe(lang => {
    currentLanguageData = lang === 'en' ? en : ko;
  });

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
    min-height: 910vh;
    overflow-x: hidden;
  }

  /* 모바일 레이아웃 */
  @media (max-width: 768px) {
    main {
      min-height: 180vh; /* 모바일에서 min-height 변경 */
    }
    .desktop-only {
      display: none; /* 모바일에서 해당 섹션 숨김 */
    }
  }
</style>

<main>
  <!-- 3D 배경 -->
  <Spectrum />
  <div class="desktop-only">
    <div style="height: 300vh;"></div>
    <div style="height: 300vh;"></div>
    {#if Copenhagen && scrollScreen >=1 && scrollScreen < 3.5}
      <svelte:component this={Copenhagen} startY={window.innerHeight} endY={window.innerHeight * 3.5} text={currentLanguageData.sceneTexts.copenhagen} fadeOffset={400}/>
    {/if}
    {#if Daejeon && scrollScreen >=3.5 && scrollScreen < 6}
      <svelte:component this={Daejeon} startY={window.innerHeight*3.5} endY={window.innerHeight*6} text={currentLanguageData.sceneTexts.daejeon} fadeOffset={400}/>
    {/if}
  </div>
  <OnePager />
  <div class="desktop-only">
    <QuestionGrid />
  </div>
  
</main>