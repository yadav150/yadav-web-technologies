(function () {
  const popup = document.querySelector('.follow-popup');
  if (!popup) return;

  const STORAGE_KEY = 'ywt-follow-dismissed';
  if (localStorage.getItem(STORAGE_KEY) === '1') return;

  const show = () => popup.classList.add('is-visible');
  const hide = (remember) => {
    popup.classList.remove('is-visible');
    if (remember) localStorage.setItem(STORAGE_KEY, '1');
  };

  setTimeout(show, 6000);

  popup.querySelectorAll('[data-popup-close]').forEach((el) => {
    el.addEventListener('click', () => hide(true));
  });

  popup.querySelectorAll('[data-popup-action]').forEach((el) => {
    el.addEventListener('click', () => hide(true));
  });
})();
