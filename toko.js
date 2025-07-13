document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbarMenu");
  const currentPage = window.location.pathname;

  // Ambil koleksi terbaru
  const koleksi = JSON.parse(localStorage.getItem("koleksiPet") || "[]");

  // Fungsi bikin class aktif
  const navClass = (page) =>
    currentPage.includes(page)
      ? "text-[#F9C0FF] border-b-2 border-[#F9C0FF] pb-1 font-semibold"
      : "hover:text-white pb-1 font-semibold text-gray-300";

  // Reset isi navbar
  navbar.innerHTML = `
    <a href="index.html" class="${navClass('index')}">Shop</a>
    <a href="gacha.html" class="${navClass('gacha')}">Gacha</a>
    <a href="about.html" class="${navClass('about')}">About</a>
    ${koleksi.length > 0 ? `<a href="collection.html" class="${navClass('collection')}">Collection</a>` : ""}
  `;
});

// Fungsi untuk beli hewan
function beliHewan(nama) {
  let koleksi = JSON.parse(localStorage.getItem("koleksiPet") || "[]");
  if (!koleksi.includes(nama)) {
    koleksi.push(nama);
    localStorage.setItem("koleksiPet", JSON.stringify(koleksi));
    location.reload(); // Refresh untuk munculin Collection setelah beli
  }
}


function beliHewan(halamanTujuan, nama, harga) {
    if (coins >= harga) {
        coins -= harga;
        localStorage.setItem("coins", coins);
        updateCoinDisplay();

        const koleksi = JSON.parse(localStorage.getItem("koleksiPet") || "[]");
        if (!koleksi.includes(nama)) {
            koleksi.push(nama);
            localStorage.setItem("koleksiPet", JSON.stringify(koleksi));
        }

        window.location.href = halamanTujuan;
    } else {
        alert("Koin kamu tidak cukup!");
    }
    return false;
}


