(function () {
  const btn = document.querySelector('.go-top');
  if (!btn) return;

  const onScroll = () => {
    if (window.scrollY > 500) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
