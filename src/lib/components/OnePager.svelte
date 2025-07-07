<script>
  import { onMount } from 'svelte';
  import { data } from '../stores.js';

  let onePagerData;
  $: onePagerData = $data.homePageData.onePager;

  // 스크롤에 따라 요소가 나타나는 효과를 위한 변수
  let visible = false;
  onMount(() => {
    // 페이지가 로드되면 애니메이션 시작
    visible = true;
  });
</script>

<svelte:head>
  <title>{onePagerData.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    body, html {
      margin: 0;
      padding: 0;
      background-color: #000000;
      color: #f3f4f6; /* gray-100 */
      font-family: 'Noto Sans KR', sans-serif;
    }
  </style>
</svelte:head>

<div class="page-container">
  <!-- 왼쪽 이미지 영역 -->
  <div class="image-section" class:visible>
    <img width="100%" src="/jinki.jung.jpg" alt="Jinki Jung's profile" />
  </div>

  <!-- 오른쪽 텍스트 영역 -->
  <div class="text-section" class:visible>
    <div class="content-wrapper">
      <!-- 1. 헤드라인: 당신의 정체성 -->
      <h1 class="headline">
        {@html onePagerData.headline}
      </h1>

      <!-- 2. 소개: 당신의 스토리와 철학 -->
      <p class="bio">
        {onePagerData.bio}
      </p>

      <!-- 3. 핵심 역량: 당신이 할 수 있는 것 -->
      <div class="competencies">
        {#each onePagerData.competencies as competency}
          <div class="competency-group">
            <h3 class="group-title">{competency.title}</h3>
            <p>{competency.text}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .page-container {
    display: flex;
    height: 100vh;
    background-color: #000000;
    overflow: hidden; /* 스크롤 방지 */
  }

  /* 왼쪽 이미지 섹션 스타일 */
  .image-section {
    width: 30%; /* 너비 비율 조정 */
    height: 100%;
    opacity: 0;
    transform: translateX(-20px);
    display: flex;
    transition: opacity 1s ease-out, transform 1s ease-out;
    align-items: center;
  }
  .image-section img {
    width: 100%;
    padding: 20px;
    object-fit: cover; /* 이미지가 영역을 꽉 채우도록 설정 */
  }
  
  /* 오른쪽 텍스트 섹션 스타일 */
  .text-section {
    width: 70%; /* 너비 비율 조정 */
    height: 100%;
    display: flex;
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: center; /* 수평 중앙 정렬 */
    padding: 2rem;
    box-sizing: border-box;
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s; /* 0.3초 딜레이 */
  }
  
  /* 페이지 로딩 시 나타나는 효과 */
  .visible {
    opacity: 1;
    transform: translateX(0);
  }
  
  .content-wrapper {
    max-width: 700px;
    width: 100%;
  }

  .headline {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.3;
    color: #ffffff;
    margin: 0 0 2rem 0;
  }

  .bio {
    font-size: 1.1rem; /* 18px */
    line-height: 1.8;
    color: #d1d5db; /* gray-300 */
    margin-bottom: 3rem;
  }
  
  .competencies {
    margin-bottom: 3rem;
  }

  .competency-group {
    margin-bottom: 1.5rem;
  }

  .group-title {
    font-size: 1rem;
    font-weight: 500;
    color: #9ca3af; /* gray-400 */
    border-bottom: 1px solid #374151; /* gray-700 */
    padding-bottom: 0.5rem;
    margin: 0 0 0.75rem 0;
    letter-spacing: 0.05em;
  }

  .competency-group p {
    font-size: 1.05rem;
    color: #e5e7eb; /* gray-200 */
    line-height: 1.6;
    margin: 0;
  }

  .contact-links {
    display: flex;
    gap: 1rem;
  }

  .link-button {
    color: #f3f4f6;
    background-color: transparent;
    border: 1px solid #4b5563; /* gray-600 */
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.3s, color 0.3s;
  }

  .link-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  /* 모바일 화면 대응 */
  @media (max-width: 768px) {
    .page-container {
      flex-direction: column;
    }
    .image-section, .text-section {
      width: 100%;
    }
    .image-section {
      height: 40vh;
    }
    .text-section {
      height: 60vh;
      padding: 1rem;
      align-items: flex-start;
      overflow-y: auto;
    }
    .headline {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .bio {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .competency-group {
      margin-bottom: 1rem;
    }
    .group-title {
      font-size: 0.9rem;
      padding-bottom: 0.25rem;
      margin-bottom: 0.5rem;
    }
    .competency-group p {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .text-section {
      padding: 0.5rem;
    }
    .headline {
      font-size: 1.2rem;
    }
    .bio {
      font-size: 0.8rem;
    }
  }
</style>