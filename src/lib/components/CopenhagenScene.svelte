<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { GLTF, OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import type { MeshStandardMaterial } from 'three';

  export let scrollY = 0;
  let rotation_y: 0;
  let _position: number[] = [-30, 2, 20];
  let material: MeshStandardMaterial;
  //let camera: T.PerspectiveCamera;
  const { camera, scene } = useThrelte()

  $: if (typeof scrollY === 'number' && camera && material) {
    rotation_y = scrollY*2;
    camera.update(currentCamera => {
      const radius = 30;
      const angle = Math.PI + ((scrollY + 300) / 3000) * Math.PI; 
      currentCamera.position.set( radius * Math.cos(angle), 10, -radius * Math.sin(angle));
      currentCamera.lookAt(0, 0, 0);
      return currentCamera;
    });

  }

</script>

<T.PerspectiveCamera makeDefault position={[-10, 2, 0]} fov={50} on:create={({ ref }) => ref.lookAt(0, 0, 0)}>
  <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={1.2} />
<T.HemisphereLight skyColor={"#ffffff"} groundColor={"#444444"} intensity={0.8} />
<T.DirectionalLight position={[0, 10, 5]} intensity={1.5}/>
<T.DirectionalLight position={[-8, -10, -5]} intensity={0.1} />

<GLTF
  url="/copenhagen.glb"
  on:create={({ gltf }) => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;
    gltf.scene.scale.set(scale, scale, scale);
    gltf.scene.position.sub(center.multiplyScalar(scale));
  }}
>
  <T.Group rotation={{y: rotation_y}}>
    <T.Mesh>
      <T.MeshStandardMaterial bind:this={material} transparent />
    </T.Mesh>
  </T.Group>
</GLTF>