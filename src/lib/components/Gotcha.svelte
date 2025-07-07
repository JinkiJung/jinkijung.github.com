<script>
  import { fade } from 'svelte/transition';
  import { data } from '../stores.js';

  let playData;
  $: playData = $data.playData;

  // 각 등급별 가중치 설정 (숫자가 클수록 확률이 높음)
  const rarityWeights = {
    common: 15,
    rare: 5,
    super_rare: 1,
  };

  // --- 상태 변수 ---
  let currentView = 'gacha'; // 'gacha' 또는 'fact'
  let selectedFact = null;
  let showResult = false; // 결과 화면 표시 여부

  // --- 함수 ---
  /**
   * 가중치에 따라 랜덤으로 Fun Fact를 뽑는 함수
   */
  function pullGacha() {
    // 1. 가중치에 따라 아이템이 채워진 '뽑기 통'을 만듭니다.
    const gachaPool = [];
    playData.funFacts.forEach(fact => {
      const weight = rarityWeights[fact.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        gachaPool.push(fact);
      }
    });

    // 2. 뽑기 통에서 랜덤으로 하나를 선택합니다.
    const randomIndex = Math.floor(Math.random() * gachaPool.length);
    selectedFact = gachaPool[randomIndex];

    // 3. 뷰를 전환합니다.
    currentView = 'fact';
    showResult = true; // Svelte의 transition을 위해 필요
  }

  /**
   * 가챠 페이지로 돌아가는 함수
   */
  function returnToGacha() {
    showResult = false;
  }
</script>

<svelte:head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap');
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden; /* 스크롤 방지 */
      background-color: #000;
      color: white;
    }
  </style>
</svelte:head>

<main>
  <!-- 가챠 페이지 -->
  {#if currentView === 'gacha'}
    <div class="gacha-page" on:click={pullGacha} role="button" tabindex="0">
      <div class="gfx-container">
        <!-- 연산량이 낮은 SVG와 CSS를 이용한 그래픽 효과 -->
        <svg class="gfx" viewBox="0 0 200 200">
          <circle class="ring ring1" cx="100" cy="100" r="90" />
          <circle class="ring ring2" cx="100" cy="100" r="70" />
          <circle class="ring ring3" cx="100" cy="100" r="50" />
        </svg>
      </div>
      <div class="text-content">
        <h1>{playData.title}</h1>
        <p>{playData.subtitle}</p>
      </div>
    </div>
  {/if}

  <!-- Fun Fact 결과 페이지 -->
  {#if showResult}
    <div 
      class="fact-page rarity-{selectedFact.rarity}"
      style="background-image: url({selectedFact.image});" 
      on:click={returnToGacha}
      transition:fade={{ duration: 500 }}
      on:outroend={() => currentView = 'gacha'}
      role="button" 
      tabindex="0"
    >
      <div class="overlay"></div>
      <div class="fact-text-content">
        <p class="fact-text">{selectedFact.text}</p>
        <span class="rarity-badge">{selectedFact.rarity.replace('_', ' ').toUpperCase()}</span>
      </div>
    </div>
  {/if}
</main>

<style>
  :root {
    --color-common: #9ca3af; /* gray-400 */
    --color-rare: #3b82f6;   /* blue-500 */
    --color-super_rare: #f59e0b; /* amber-500 */
  }

  main {
    width: 100vw;
    height: 100vh;
  }

  .gacha-page, .fact-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-align: center;
  }

  /* --- 가챠 페이지 스타일 --- */
  .gacha-page {
    background-color: #000;
  }

  .gfx-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gfx {
    width: 80vmin;
    height: 80vmin;
    max-width: 600px;
    max-height: 600px;
    animation: rotate-slow 20s linear infinite;
  }

  .ring {
    fill: none;
    stroke-width: 2;
    stroke-dasharray: 10 10;
  }
  .ring1 {
    stroke: #00f;
    animation: rotate-fast 5s linear infinite;
  }
  .ring2 {
    stroke: #0f0;
    stroke-dasharray: 20 5;
    animation: rotate-fast 7s linear infinite reverse;
  }
  .ring3 {
    stroke: #f00;
    stroke-dasharray: 5 5;
    animation: rotate-fast 6s linear infinite;
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes rotate-fast {
    from { transform-origin: 50% 50%; transform: rotate(0deg); }
    to { transform-origin: 50% 50%; transform: rotate(360deg); }
  }
  
  .gacha-page .text-content {
    z-index: 10;
    font-family: 'Orbitron', sans-serif;
  }

  .gacha-page h1 {
    font-size: clamp(1.5rem, 5vw, 3rem);
    text-shadow: 0 0 10px #fff, 0 0 20px #00f;
  }
  .gacha-page p {
    color: #aaa;
    margin-top: 1rem;
    font-size: clamp(0.9rem, 2vw, 1.2rem);
  }

  /* --- Fun Fact 페이지 스타일 --- */
  .fact-page {
    background-size: cover;
    background-position: center;
    box-sizing: border-box; /* padding/border가 크기에 포함되도록 */
  }

  /* 등급별 테두리 색상 */
  .rarity-common { border: 10px solid var(--color-common); }
  .rarity-rare { border: 10px solid var(--color-rare); }
  .rarity-super_rare { border: 10px solid var(--color-super_rare); animation: pulse-border 2s infinite; }

  /* 초희귀 등급 테두리 깜빡임 효과 */
  @keyframes pulse-border {
    0% { box-shadow: 0 0 20px 0px var(--color-super_rare); }
    50% { box-shadow: 0 0 30px 10px var(--color-super_rare); }
    100% { box-shadow: 0 0 20px 0px var(--color-super_rare); }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* 어두운 오버레이 */
    z-index: 1;
  }

  .fact-text-content {
    position: relative;
    z-index: 2;
    padding: 2rem;
    font-family: 'Noto Sans KR', sans-serif;
  }

  .fact-text {
    font-size: clamp(1.8rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1.4;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
    margin: 0;
  }
  
  .rarity-badge {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
    color: white;
  }

  .rarity-common .rarity-badge { background-color: var(--color-common); }
  .rarity-rare .rarity-badge { background-color: var(--color-rare); }
  .rarity-super_rare .rarity-badge { background-color: var(--color-super_rare); }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .gacha-page h1 {
      font-size: clamp(1.2rem, 8vw, 2.5rem);
    }
    .gacha-page p {
      font-size: clamp(0.8rem, 3vw, 1rem);
    }
    .fact-text {
      font-size: clamp(1.5rem, 8vw, 3rem);
    }
    .rarity-badge {
      font-size: 0.8rem;
      padding: 0.4rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .gacha-page h1 {
      font-size: clamp(1rem, 10vw, 2rem);
    }
    .gacha-page p {
      font-size: clamp(0.7rem, 4vw, 0.9rem);
    }
    .fact-text {
      font-size: clamp(1.2rem, 10vw, 2.5rem);
    }
  }
</style>