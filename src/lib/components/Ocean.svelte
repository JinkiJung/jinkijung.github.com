<script>
  import { T, useTask } from '@threlte/core';
  import { ShaderMaterial, DoubleSide, Color } from 'three';

  // GLSL (OpenGL Shading Language) 코드
  // Vertex Shader: 정점의 위치를 계산하여 파도의 모양을 만듭니다.
  const vertexShader = `
    // uniform: JavaScript에서 GPU로 넘겨주는 데이터
    uniform float u_time;
    uniform float u_big_waves_elevation;
    uniform float u_big_waves_frequency;
    uniform float u_big_waves_speed;

    // varying: Vertex Shader에서 Fragment Shader로 데이터를 전달하는 변수
    varying float v_elevation;

    void main() {
      // 원본 정점 위치를 가져옵니다.
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      // 큰 파도 만들기: x, z 좌표와 시간을 이용해 sin 값을 계산합니다.
      float elevation = sin(modelPosition.x * u_big_waves_frequency + u_time * u_big_waves_speed) * u_big_waves_elevation;
      
      // 작은 파도 추가하기: 다른 방향과 속도로 sin 값을 더해 물결을 더 자연스럽게 만듭니다.
      elevation += sin(modelPosition.z * u_big_waves_frequency * 1.5 + u_time * u_big_waves_speed * 0.8) * u_big_waves_elevation * 0.5;

      // 계산된 높이(elevation)를 y 좌표에 적용합니다.
      modelPosition.y += elevation;

      // 계산된 높이 값을 Fragment Shader로 전달합니다.
      v_elevation = elevation;

      // 최종 정점 위치를 계산하여 gl_Position에 할당합니다.
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `;

  // Fragment Shader: 각 픽셀의 색상을 계산합니다.
  const fragmentShader = `
    uniform vec3 u_deep_color;
    uniform vec3 u_shallow_color;
    uniform float u_color_offset;
    uniform float u_color_multiplier;

    varying float v_elevation;

    void main() {
      // 높이(v_elevation)에 따라 0과 1 사이의 값으로 정규화하여 색상을 섞을 비율을 계산합니다.
      float mix_strength = (v_elevation + u_color_offset) * u_color_multiplier;
      
      // mix 함수를 사용해 깊은 물 색상과 얕은 물 색상을 섞습니다.
      vec3 color = mix(u_deep_color, u_shallow_color, mix_strength);

      // 최종 색상을 gl_FragColor에 할당합니다.
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // 셰이더에 전달할 uniform 데이터
  // 이 값들을 조절하여 파도의 모양과 색상을 바꿀 수 있습니다.
  const uniforms = {
    u_time: { value: 0.0 },
    // 파도 모양 관련
    u_big_waves_elevation: { value: 0.1 }, // 파도 높이
    u_big_waves_frequency: { value: 2.0 }, // 파도 빈도 (숫자가 클수록 촘촘해짐)
    u_big_waves_speed: { value: 0.75 }, // 파도 속도
    // 색상 관련
    u_deep_color: { value: new Color('#002366') }, // 깊은 물 색상 (사파이어 블루)
    u_shallow_color: { value: new Color('#87ceeb') }, // 얕은 물 색상 (스카이 블루)
    u_color_offset: { value: 0.25 }, // 색상 변화 시작점
    u_color_multiplier: { value: 2.0 } // 색상 변화 강도
  };

  // ShaderMaterial 인스턴스 생성
  const oceanMaterial = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    side: DoubleSide // 양면이 모두 보이도록 설정
  });

  // useTask 훅: 매 프레임마다 실행되는 로직 (애니메이션)
  useTask((delta) => {
    // 시간(u_time) 값을 계속 업데이트하여 파도가 움직이게 합니다.
    uniforms.u_time.value += delta * 0.5;
  });
</script>

<!-- Threlte 컴포넌트 마크업 -->
<T.Mesh 
  material={oceanMaterial} 
  rotation.x={-Math.PI / 2}
>
  <!-- 
    평면 지오메트리를 생성합니다. 
    가로, 세로 길이는 10이고, 각 방향으로 128개의 세그먼트를 가집니다.
    세그먼트 수가 많을수록 파도가 더 부드럽고 디테일하게 표현됩니다.
  -->
  <T.PlaneGeometry args={[15, 15, 128, 128]} />
</T.Mesh>