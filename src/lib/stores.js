import { writable, derived } from 'svelte/store';
import { icons } from '../resources/data';
import { en } from '../resources/data_en';
import { ko } from '../resources/data_ko';

// 'en' 또는 'ko' 값을 가질 수 있으며, 기본값은 'en'입니다.
export const language = writable('en');

export const data = derived(language, ($language) => {
  const langData = $language === 'en' ? en : ko;
  return { ...langData, icons };
});