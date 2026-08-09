import { writeStorage } from '../utils/storage.js';
export const themes = ['pink', 'blue', 'emerald', 'cinema'];
export function applyTheme(name) {
  document.documentElement.dataset.theme = name;
  writeStorage('prism-theme', name);
}
export function nextTheme(current) {
  return themes[(themes.indexOf(current) + 1) % themes.length];
}
