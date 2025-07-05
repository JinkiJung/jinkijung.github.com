<script lang="ts">
  import { Canvas } from '@threlte/core'
  import RotatingCube from './RotatingCube.svelte'
  import { onMount } from 'svelte';

  let rotationY = 0;
  let backgroundColor = '#000000';

  // 회전 각도 업데이트
  function handleWheel(event: WheelEvent) {
    const scrollDelta = event.deltaY;
    rotationY += scrollDelta * 0.01;
  }

  // 배경색 업데이트
  function handleScroll() {
    // 현재 스크롤 위치 계산
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const maxScroll = windowHeight-100; // 첫 번째 섹션의 높이만큼 스크롤하면 완전히 흰색이 되도록

    // 스크롤 위치에 따라 배경색 계산 (0~1 사이의 값)
    const progress = Math.min(scrollPosition / maxScroll, 1);
    
    // RGB 값을 계산 (검은색 #000000에서 흰색 #FFFFFF로)
    const r = Math.round(progress * 255);
    const g = Math.round(progress * 255);
    const b = Math.round(progress * 255);
    
    // 배경색 업데이트
    backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }

  onMount(() => {
    // 윈도우에 이벤트 리스너 등록
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="canvas-container" style="background-color: {backgroundColor}">
  <Canvas>
    <RotatingCube {rotationY} />
  </Canvas>
</div>

<style>
  .canvas-container {
    width: 100%;
    height: 100%;
    pointer-events: none; /* 마우스 이벤트를 통과시켜 페이지 스크롤이 가능하도록 함 */
    transition: background-color 0.1s ease-out; /* 부드러운 색상 전환을 위한 트랜지션 */
  }

  :global(canvas) {
    width: 100% !important;
    height: 100% !important;
    pointer-events: none; /* canvas의 마우스 이벤트도 통과시킴 */
  }
</style> 