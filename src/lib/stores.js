import { writable } from 'svelte/store';

// 'en' 또는 'ko' 값을 가질 수 있으며, 기본값은 'en'입니다.
export const language = writable('en');
