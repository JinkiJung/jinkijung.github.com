<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { onMount } from 'svelte';
  import CopenhagenScene from './CopenhagenScene.svelte';

  export let startY: number;
  export let endY: number;
  export let text: string;
  export let fadeOffset: number;
  let scrollY = 0;
  let overlayOpacity = 0; // 오버레이 투명도 상태
  let overlayTextOpacity = 0; // 오버레이 텍스트 투명도 상태

  onMount(() => {
    scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
      // 오버레이 투명도 계산
      const fadeInStart = startY; // 페이드 인 시작 스크롤 위치
      const fadeInEnd = startY + fadeOffset; // 페이드 인 종료 스크롤 위치
      const fadeOutStart = endY - fadeOffset; // 페이드 아웃 시작 스크롤 위치
      const fadeOutEnd = endY; // 페이드 아웃 종료 스크롤 위치

      if (scrollY < fadeInEnd) {
        // 페이드 인 구간: 오버레이 투명도 1 (완전히 검은색) -> 0 (투명)
        overlayOpacity = 1 - Math.max(0, Math.min(1, (scrollY - fadeInStart) / (fadeInEnd - fadeInStart)));
      } else if (scrollY > fadeOutStart) {
        // 페이드 아웃 구간: 오버레이 투명도 0 (투명) -> 1 (완전히 검은색)
        overlayOpacity = Math.max(0, Math.min(1, (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
      } else {
        // 중간 구간: 오버레이 투명도 0 (투명)
        overlayOpacity = 0;
      }

      // 오버레이 텍스트 투명도 계산 (fadeOffset의 80% 적용)
      const textFadeOffset = fadeOffset * 0.5;
      const textFadeInStart = startY; // 텍스트 페이드 인 시작 스크롤 위치
      const textFadeInEnd = startY + textFadeOffset; // 텍스트 페이드 인 종료 스크롤 위치
      const textFadeOutStart = endY - textFadeOffset; // 텍스트 페이드 아웃 시작 스크롤 위치
      const textFadeOutEnd = endY; // 텍스트 페이드 아웃 종료 스크롤 위치

      if (scrollY < textFadeInEnd) {
        // 텍스트 페이드 인 구간: 투명도 0 -> 1
        overlayTextOpacity = Math.max(0, Math.min(1, (scrollY - textFadeInStart) / (textFadeInEnd - textFadeInStart)));
      } else if (scrollY > textFadeOutStart) {
        // 텍스트 페이드 아웃 구간: 투명도 1 -> 0
        overlayTextOpacity = 1 - Math.max(0, Math.min(1, (scrollY - textFadeOutStart) / (textFadeOutEnd - textFadeOutStart)));
      } else {
        // 중간 구간: 투명도 1
        overlayTextOpacity = 1;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="fullscreen">
  <Canvas>
    <CopenhagenScene scrollY={scrollY} url="/daejeon.glb" {startY}/>
  </Canvas>
  <!-- 검은색 반투명 오버레이 -->
  <div class="overlay" style="opacity: {overlayOpacity};"></div>
  <div class="overlay-text" style="opacity: {overlayTextOpacity};">{text}</div>
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
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    z-index: 1; /* 3D 씬 위에 오도록 설정 */
    pointer-events: none; /* 오버레이가 마우스 이벤트를 가로채지 않도록 */
    transition: opacity 0.0s ease-out; /* 부드러운 전환 효과 */
    text-align: center;
  }
  .overlay-text {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; /* 3D 씬 위에 오도록 설정 */
    pointer-events: none; /* 오버레이가 마우스 이벤트를 가로채지 않도록 */
    transition: opacity 0.0s ease-out; /* 부드러운 전환 효과 */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 18vh; /* 화면 하단에서 약간 위로 */
    color: white;
    font-size: 2em;
    text-align: center;
  }
</style>
