<script>
  import { language } from '../stores.js';

  function setLanguage(event) {
    language.set(event.target.value);
  }
</script>

<div class="language-switcher">
  <div class="desktop-switcher">
    <button class:active={$language === 'en'} on:click={() => language.set('en')}>EN</button>
    <span class="separator">/</span>
    <button class:active={$language === 'ko'} on:click={() => language.set('ko')}>KO</button>
  </div>
  <div class="mobile-switcher">
    <select on:change={setLanguage} value={$language}>
      <option value="en">EN</option>
      <option value="ko">KO</option>
    </select>
  </div>
</div>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .desktop-switcher {
    display: flex;
    align-items: center;
  }

  .mobile-switcher {
    display: none; /* 기본적으로 숨김 */
  }

  button {
    background: none;
    border: none;
    color: #9ca3af; /* gray-400 */
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s ease-in-out;
  }
  button:hover {
    color: #fff;
  }
  button.active {
    color: #fff;
    font-weight: 600;
  }
  .separator {
    color: #4b5563; /* gray-600 */
  }

  select {
    background-color: #1f2937; /* gray-800 */
    color: #fff;
    border: 1px solid #4b5563; /* gray-600 */
    border-radius: 5px;
    padding: 0.4rem 1.5rem 0.4rem 0.8rem; /* 오른쪽 패딩을 늘려 화살표 공간 확보 */
    font-size: 0.9rem;
    cursor: pointer;
    -webkit-appearance: none; /* 기본 select 스타일 제거 */
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2C197.3L159.3%2C69.6c-3.7-3.7-9.8-3.7-13.5%2C0L1.3%2C197.3c-3.7%2C3.7-3.7%2C9.8%2C0%2C13.5l13.5%2C13.5c3.7%2C3.7%2C9.8%2C3.7%2C13.5%2C0l114.2-114.2l114.2%2C114.2c3.7%2C3.7%2C9.8%2C3.7%2C13.5%2C0l13.5-13.5C290.7%2C207.1%2C290.7%2C201%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E'); /* 커스텀 화살표 */
    background-repeat: no-repeat;
    background-position: right 0.7em top 50%;
    background-size: 0.65em auto;
    width: auto; /* 너비를 내용에 맞게 조절 */
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .desktop-switcher {
      display: none;
    }
    .mobile-switcher {
      display: block;
    }
  }
</style>