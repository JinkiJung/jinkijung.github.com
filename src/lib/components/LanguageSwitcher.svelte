<script>
  import { language } from '../stores.js';

  function setLanguage(lang) {
    language.set(lang);
  }
</script>

<div class="language-switcher">
  <button class:active={$language === 'en'} on:click={() => setLanguage('en')}>EN</button>
  <span class="separator">/</span>
  <button class:active={$language === 'ko'} on:click={() => setLanguage('ko')}>한국어</button>
</div>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
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
</style>
