const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.panel')];

function showPanel(id, pushHash = true) {
  panels.forEach(p => p.classList.toggle('is-active', p.id === id));
  tabs.forEach(t => t.classList.toggle('is-active', t.dataset.target === id));
  if (pushHash) history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

tabs.forEach(t => t.addEventListener('click', () => showPanel(t.dataset.target)));
document.querySelectorAll('.jump').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.target)));

const initial = location.hash.replace('#','');
if (initial && document.getElementById(initial)) showPanel(initial, false);

const networkBadge = document.getElementById('networkBadge');
function updateNetwork() {
  const on = navigator.onLine;
  networkBadge.textContent = on ? '● online' : '● offline';
  networkBadge.className = `status ${on ? 'status--ok' : 'status--off'}`;
}
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

const KEY = 'pescara-weekend-checks-v1';
const FOOD_KEY = 'pescara-food-quest-v1';
function loadObject(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }
function saveChecks(selector, attr, key) {
  const state = {};
  document.querySelectorAll(selector).forEach(el => state[el.dataset[attr]] = el.checked);
  localStorage.setItem(key, JSON.stringify(state));
}
const checkState = loadObject(KEY);
document.querySelectorAll('input[data-key]').forEach(el => {
  el.checked = !!checkState[el.dataset.key];
  el.addEventListener('change', () => saveChecks('input[data-key]', 'key', KEY));
});
const foodState = loadObject(FOOD_KEY);
document.querySelectorAll('input[data-food]').forEach(el => {
  el.checked = !!foodState[el.dataset.food];
  el.addEventListener('change', () => saveChecks('input[data-food]', 'food', FOOD_KEY));
});
document.getElementById('resetChecklist')?.addEventListener('click', () => {
  localStorage.removeItem(KEY);
  document.querySelectorAll('input[data-key]').forEach(el => el.checked = false);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('../sw.js', { scope: '../', updateViaCache: 'none' });
      document.getElementById('cacheStatus').textContent = 'Offline cache aktywny · plan zapisany lokalnie.';
      reg.update().catch(()=>{});
    } catch (err) {
      document.getElementById('cacheStatus').textContent = 'Tryb offline wymaga uruchomienia aplikacji przez HTTPS/GitHub Pages.';
    }
  });
}
