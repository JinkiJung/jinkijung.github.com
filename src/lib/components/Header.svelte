<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  // 아이콘에 연결될 링크 (실제 주소로 변경해주세요)
  const socialLinks = {
    mail: 'mailto:your.jinki.jung@gmail.com',
    github: 'https://github.com/jinkijung',
    linkedin: 'https://linkedin.com/in/jinkijung',
    gscholar: 'https://scholar.google.co.kr/citations?user=inzigzUAAAAJ&hl=en'
  };

  const iconSize = 10;
  let menuOpen = false; // State for mobile menu visibility

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<header>
  <div class="nav-container">
    <!-- 왼쪽 정렬 영역 -->
    <div class="left-nav">
      <!-- Hamburger menu for mobile -->
      <button class="hamburger" on:click={toggleMenu} aria-label="Toggle menu">
        <div class="bar" class:open={menuOpen}></div>
        <div class="bar" class:open={menuOpen}></div>
        <div class="bar" class:open={menuOpen}></div>
      </button>

      <LanguageSwitcher />

      <!-- Main Navigation -->
      <nav class:mobile-open={menuOpen}>
        <a href="{base}/" class:active={$page.url.pathname === base + '/'}>Home</a>
        <a href="{base}/develop" class:active={$page.url.pathname === base + '/develop'}>Develop</a>
        <a href="{base}/write" class:active={$page.url.pathname === base + '/write'}>Write</a>
        <a href="{base}/research" class:active={$page.url.pathname === base + '/research'}>Research</a>
        <a href="{base}/play" class:active={$page.url.pathname === base + '/play'}>Play</a>
      </nav>
    </div>

    <!-- 오른쪽 정렬 영역 -->
    <div class="right-nav">
      <a href={socialLinks.mail} class="social-icon" aria-label="메일 보내기">
        <!-- Mail SVG Icon -->
        <svg width={iconSize} height={iconSize} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
      </a>
      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="GitHub 프로필">
        <!-- GitHub SVG Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/>
        </svg>
      </a>
      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="LinkedIn 프로필">
        <!-- LinkedIn SVG Icon -->
         <svg width={iconSize} height={iconSize} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>
      </a>
      <a href={socialLinks.gscholar} target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Google scholar">
        <!-- LinkedIn SVG Icon -->
         <svg width={iconSize} height={iconSize} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M390.9 298.5c0 0 0 .1 .1 .1c9.2 19.4 14.4 41.1 14.4 64C405.3 445.1 338.5 512 256 512s-149.3-66.9-149.3-149.3c0-22.9 5.2-44.6 14.4-64h0c1.7-3.6 3.6-7.2 5.6-10.7c4.4-7.6 9.4-14.7 15-21.3c27.4-32.6 68.5-53.3 114.4-53.3c33.6 0 64.6 11.1 89.6 29.9c9.1 6.9 17.4 14.7 24.8 23.5c5.6 6.6 10.6 13.8 15 21.3c2 3.4 3.8 7 5.5 10.5zm26.4-18.8c-30.1-58.4-91-98.4-161.3-98.4s-131.2 40-161.3 98.4L0 202.7 256 0 512 202.7l-94.7 77.1z"/></svg>
      </a>
      
    </div>
  </div>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    /* 블러 효과 추가 */
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    padding: 0 2rem; /* 좌우 패딩 증가 */
    z-index: 1000;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* 네비게이션 전체를 감싸는 컨테이너 */
  .nav-container {
    display: flex;
    justify-content: space-between; /* 왼쪽과 오른쪽 요소를 양 끝으로 분리 */
    align-items: center;
    height: 4rem; /* 64px */
    max-width: 1280px; /* 최대 너비 설정 */
    margin: 0 auto;
  }

  /* 왼쪽 영역 (언어 선택 + 메뉴) */
  .left-nav {
    display: flex;
    align-items: center;
    gap: 2.5rem; /* 언어 선택기와 메뉴 사이 간격 */
  }

  .lang-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lang-selector a {
    color: #9ca3af; /* gray-400 */
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .lang-selector a:hover {
    color: white;
  }
  
  .lang-selector a.active {
    color: white;
    font-weight: 600;
  }

  .lang-selector span {
    color: #4b5563; /* gray-600 */
  }

  nav {
    display: flex;
    gap: 2rem; /* 메뉴 아이템 사이 간격 */
  }

  nav a {
    color: #d1d5db; /* gray-300 */
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
    padding: 0.25rem 0;
  }

  nav a:hover {
    color: white;
  }
  
  /* 활성화된 메뉴 스타일 */
  .active a {
    color: white;
    font-weight: 600;
  }
  
  /* 활성화된 메뉴 하단에 밑줄 효과 */
  .active a::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: white;
    bottom: -4px;
    left: 0;
  }

  /* 오른쪽 영역 (소셜 아이콘) */
  .right-nav {
    display: flex;
    align-items: center;
    gap: 1.25rem; /* 아이콘 사이 간격 */
  }

  .social-icon {
    color: white;
    transition: color 0.3s ease, transform 0.2s ease;
  }
  .social-icon svg {
    width: 1.2rem; /* 24px */
    height: 1.2rem;
  }
  .social-icon:hover {
    color: #9ca3af; /* gray-400 */
    transform: scale(1.1);
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 1rem;
    }

    .left-nav {
      gap: 1.5rem;
    }

    nav {
      display: none; /* 기본적으로 숨김 */
      flex-direction: column;
      position: absolute;
      top: 4rem; /* 헤더 높이만큼 아래로 */
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.95); /* 배경색 */
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 0;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      z-index: 999;
    }

    nav.mobile-open {
      display: flex; /* 햄버거 메뉴 클릭 시 보임 */
    }

    nav a {
      padding: 0.8rem 2rem;
      width: 100%;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    nav a:last-child {
      border-bottom: none;
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 24px;
      height: 20px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 1001; /* 메뉴보다 위에 */
    }

    .hamburger .bar {
      width: 100%;
      height: 2px;
      background-color: white;
      transition: all 0.3s ease-in-out;
    }

    .hamburger .bar:nth-child(1).open {
      transform: translateY(6.5px) rotate(45deg);
    }

    .hamburger .bar:nth-child(2).open {
      opacity: 0;
    }

    .hamburger .bar:nth-child(3).open {
      transform: translateY(-6.5px) rotate(-45deg);
    }

    .right-nav {
      gap: 0.8rem;
    }

    .social-icon svg {
      width: 1rem;
      height: 1rem;
    }
  }
</style>