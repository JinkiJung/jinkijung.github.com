<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  export let scrollPercent: number;

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let questionObj: THREE.Mesh;
  let animationId: number;

  function update3DByScroll(percent: number) {
    if (!questionObj) return;
    //*
    // 0~60%: 설계도 복잡도 증가
    if (percent < 60) {
      // 예시: 와이어프레임 점점 복잡하게
      (questionObj.material as THREE.MeshStandardMaterial).wireframe = true;
      questionObj.material.opacity = 0.5 + percent / 120;
      questionObj.rotation.y = percent * 0.05;
    }
    // 60~70%: 완성된 모델, 회전, 마우스 인터랙션
    else if (percent < 70) {
      (questionObj.material as THREE.MeshStandardMaterial).wireframe = false;
      questionObj.material.opacity = 1;
      questionObj.rotation.y += 0.01;
    }
    // 70~80%: 멀어지거나 투명도 감소
    else if (percent < 80) {
      questionObj.position.z = -((percent - 70) * 2);
      questionObj.material.opacity = 1 - (percent - 70) / 10;
    }
    // 80~100%: 거의 안 보임
    else {
      questionObj.material.opacity = 0.05;
    }
    //*/
  }

  onMount(() => {
    // 기본 Three.js 세팅
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 질문 오브젝트(예: 구체)
    questionObj = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshStandardMaterial({ color: 0x00bfff, transparent: true, opacity: 0.8, wireframe: true })
    );
    scene.add(questionObj);

    // 빛
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    scene.add(new THREE.PointLight(0xffffff, 1, 10));

    function animate() {
      update3DByScroll(scrollPercent);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  });

  $: update3DByScroll(scrollPercent);
</script>

<style>
  .three-bg {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    z-index: 1;
    pointer-events: none;
  }
</style>

<div class="three-bg" bind:this={container}></div>