<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { GLTF } from '@threlte/extras';
	import { OrthographicCamera } from 'three';
  import { onMount } from 'svelte';

  // Props로 회전 각도 받기
  export let rotationY = 0;
  
  let modelScale = { x: 10, y: 10, z: 10 };
  let modelPosition = { x: 0, y: 0, z: 0 };

  // 카메라 설정
  let cameraPosition = { x: 0, y: 0, z: 1 }; // 카메라 위치 초기값
  const fov = 90; // 시야각
  const aspect = window.innerWidth / window.innerHeight; // 화면 비율
  const near = 0.1; // 가까운 클리핑 평면
  const far = 10000; // 먼 클리핑 평면

  // rotationY가 변경될 때마다 콘솔에 출력
  $: {
    const degrees = (rotationY * 180 / Math.PI).toFixed(2);
    console.log(`Rotation Y: ${degrees}°`);
  }
</script>

<T.OrthographicCamera 
  makeDefault
  position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
  fov={fov}
  aspect={aspect}
  near={near}
  far={far}
>
  <OrbitControls 
    enableZoom={true}
    autoRotate={false} 
    enablePan={false}
    maxDistance={1000}
    minDistance={100}
  />
</T.OrthographicCamera>

<T.Group 
  rotation.y={rotationY}
  scale.x={modelScale.x}
  scale.y={modelScale.y}
  scale.z={modelScale.z}
  position.x={modelPosition.x}
  position.y={modelPosition.y}
  position.z={modelPosition.z}
>
  <GLTF 
    url="/Jinki.glb"
    onLoad={({ nodes }) => {
      console.log('Model loaded:', nodes);
    }}
  />
</T.Group>

<T.DirectionalLight position.x={3} position.y={3} position.z={3} intensity={2} />
<T.AmbientLight intensity={0.5} />

<!-- 카메라 위치 조정 UI -->
<div class="camera-controls">
  <div class="control-group">
    <label>Camera X: {cameraPosition.x.toFixed(2)}</label>
    <input 
      type="range" 
      min="-1000" 
      max="1000" 
      step="10" 
      bind:value={cameraPosition.x}
    />
  </div>
  <div class="control-group">
    <label>Camera Y: {cameraPosition.y.toFixed(2)}</label>
    <input 
      type="range" 
      min="-1000" 
      max="1000" 
      step="10" 
      bind:value={cameraPosition.y}
    />
  </div>
  <div class="control-group">
    <label>Camera Z: {cameraPosition.z.toFixed(2)}</label>
    <input 
      type="range" 
      min="100" 
      max="1000" 
      step="10" 
      bind:value={cameraPosition.z}
    />
  </div>
</div>

<style>
  .camera-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 8px;
    color: white;
    pointer-events: auto;
  }

  .control-group {
    margin: 10px 0;
  }

  label {
    display: block;
    margin-bottom: 5px;
  }

  input[type="range"] {
    width: 200px;
  }

  :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
</style> 