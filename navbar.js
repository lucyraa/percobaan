document.addEventListener("DOMContentLoaded", function () {
  const koleksi = JSON.parse(localStorage.getItem("koleksiPet") || "[]");
  const navbar = document.getElementById("navbarMenu");
  const currentPage = window.location.pathname;

  function isActive(pageName) {
    return currentPage.includes(pageName)
      ? 'text-[#F9C0FF] border-b-2 border-[#F9C0FF] pb-1 font-semibold'
      : 'hover:text-white pb-1 font-semibold';
  }

  if (navbar) {
    navbar.innerHTML = `
      <a href="index.html" class="${isActive('index')}">Home</a>
      <a href="gacha.html" class="${isActive('gacha')}">Gacha</a>
      <a href="about.html" class="${isActive('about')}">About</a>
      ${koleksi.length > 0 ? `<a href="collection.html" class="${isActive('collection')}">Collection</a>` : ''}
    `;
  }
});
