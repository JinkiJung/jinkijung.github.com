<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { onMount } from 'svelte';
  import CopenhagenScene from './CopenhagenScene.svelte';

  export let startY: number;
  export let endY: number;
  export let text: string;
  let scrollY = 0;

  onMount(() => {
    scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="fullscreen">
  <Canvas>
    <CopenhagenScene scrollY={scrollY} url="/daejeon.glb" {startY} {endY} {text}/>
  </Canvas>
</div>

<style>
  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
  }
</style>
