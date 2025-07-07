<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { data } from '../stores.js';

  let spectrumData;
  $: spectrumData = $data.homePageData.spectrum;

  // 이미지와 텍스트의 표시 여부를 제어하는 변수
  let imageVisible = false;
  let textVisible = false;
  let arrowVisible = false;
  let isScrolledDown = false;

  // 컴포넌트가 마운트되면 이미지 페이드인을 시작
  onMount(() => {
    imageVisible = true;

    setTimeout(() => {
        arrowVisible = true;
    }, 2800);

    const handleScroll = () => {
      // window.scrollY는 현재 수직 스크롤 위치를 나타냅니다.
      isScrolledDown = window.scrollY > 80;
    };

    console.log(data);
    // ✨ 3. window에 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll);

    // ✨ 4. 컴포넌트가 파괴될 때(unmount) 이벤트 리스너를 제거하여 메모리 누수 방지
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  // 이미지의 페이드인(intro)이 끝났을 때 호출될 함수
  function onImageIntroEnd() {
    // 텍스트 페이드인 시작
    textVisible = true;
  }
</script>

<div class="_container">
  
  {#if imageVisible}
    <div 
      class="image-wrapper" 
      transition:fade={{ duration: 1000 }}
      on:introend={onImageIntroEnd}
    >
      <img
        src="./spectrum.png"
        alt="A black dog"
      />

      {#if textVisible}
      <div class="text-content">
        <h1 class="overlay-text" transition:fade={{ duration: 1000 }}>
            {spectrumData.title}
        </h1>
        <h3 
            class="sub-overlay-text" 
            transition:fade={{ duration: 1000, delay: 500 }}
          >
            {spectrumData.subtitle}
          </h3>
      </div>
        
      {/if}
    </div>
  {/if}

    {#if arrowVisible}
    <div class="scroll-indicator"
    class:hidden={isScrolledDown}
    class:pulsating={!isScrolledDown}
    transition:fade={{ duration: 1000 }}>
        <span>{data.scrollText}</span>
      <svg
        class="arrow"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        
        <path d="m19 12-7 7-7-7" />
      </svg>
      
    </div>
  {/if}
</div>

<style>
  h1{
      font-size: 3.2rem;
      margin: 0;
      background: linear-gradient(45deg, #fff, #888);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  ._container {
    background-color: black;
    min-height: 100vh;
    /* Flexbox를 이용한 중앙 정렬 */
    display: flex;
    justify-content: center; /* 가로 중앙 정렬 */
    align-items: center;    /* 세로 중앙 정렬 */

    /* 겹치는 텍스트의 기준점 */
    position: relative;
    overflow: hidden; /* 이미지가 넘칠 경우를 대비 */
  }

  .image-wrapper {
    /* 자식 요소(.overlay-text)의 position:absolute 기준이 되도록 설정 */
    position: relative; 
    min-width: 100%;
    /* 내부 이미지 크기에 맞게 wrapper 크기가 조절되도록 설정 */
    /* flex container 안에서는 이 설정만으로도 충분합니다. */
    display: inline-flex; 
    
    /* 이미지와 wrapper 사이에 불필요한 공백 제거 */
    vertical-align: middle;
    padding-top: 10rem;
  }

  .image-wrapper img {
    /* 이미지가 wrapper 밖으로 나가지 않도록 함 */
    max-width: 100%;
    height: auto;
    /* 부모 flex 컨테이너가 이미지를 중앙 정렬하므로, 여기서는 특별한 정렬 불필요 */
  }

  /* ✨ 3. 텍스트 스타일 수정 */
  .text-content {
    position: absolute;

    /* 이제 right 속성은 .image-wrapper의 오른쪽 엣지를 기준으로 합니다. */
    /* 이미지 오른쪽 끝에서 20px 안쪽에 위치 */
    right: 30px;
    
    /* 세로 중앙 정렬은 동일하게 유지 */
    top: calc(50% - 200px);
    transform: translateY(-50%);

    /* 텍스트가 길어질 경우를 대비 */
    white-space: nowrap; /* 줄바꿈 방지 (선택 사항) */
  }

  .overlay-text {
    color: white;
    text-align: right;
  }

  .sub-overlay-text {

    color: white;
    font-size: 1.2rem;
    font-weight: normal;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
    margin: 0;
    margin-top: 8px; /* h1과의 상단 간격 */
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    color: white;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    opacity: 0.7;

    transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
    animation: bounce 2s infinite;
  }

    
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .scroll-indicator.hidden {
    opacity: 0;
    visibility: hidden; /* opacity가 0이어도 영역을 차지하는 것을 방지 */
    pointer-events: none; /* 보이지 않을 때 클릭되지 않도록 함 */
  }

  /* 전역 스타일을 적용하여 body의 마진/패딩을 제거합니다. */
  :global(body) {
    margin: 0;
    padding: 0;
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .image-wrapper {
      padding-top: 5rem; /* 모바일에서 패딩 조정 */
    }

    .text-content {
      right: 15px; /* 모바일에서 오른쪽 여백 조정 */
      top: 50%; /* 모바일에서 중앙 정렬 */
      transform: translateY(-50%);
      text-align: center; /* 텍스트 중앙 정렬 */
      width: 100%; /* 너비 100%로 설정 */
      left: 0;
      padding: 0 15px;
      box-sizing: border-box;
      white-space: normal; /* 줄바꿈 허용 */
    }

    h1 {
      font-size: 2rem; /* 모바일에서 h1 크기 조정 */
    }

    .sub-overlay-text {
      font-size: 1rem; /* 모바일에서 subtitle 크기 조정 */
    }

    .scroll-indicator {
      bottom: 1rem;
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.5rem;
    }

    .sub-overlay-text {
      font-size: 0.9rem;
    }
  }
</style>
