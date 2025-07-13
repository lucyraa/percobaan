const petImage = document.getElementById("petImage");
const happyBar = document.getElementById("happyBar");
const hungryBar = document.getElementById("hungryBar");
const accessoryOverlay = document.getElementById("accessoryOverlay");
const playToolOverlay = document.getElementById("playToolOverlay");

let happy = 80;
let hungry = 20;
let ekspresiTimeout = null;

const ekspresiGajah = {
    normal: "bear 1.png",
    love: "bear love.png",
    sad: "bear sad.png"
};

const itemData = {
    hair: [
        { name: "Long", price: 30, image: "long beruang.png" },
        { name: "Curly", price: 30, image: "curly beruang.png" },
        { name: "Short", price: 30, image: "short beruang.png" }
    ],
    accessories: [
        { name: "Syal", price: 30, image: "syal beruang.png" }, // Pastikan nama file benar
        { name: "Hat", price: 30, image: "hat beruang.png" },
        { name: "Neclace", price: 30, image: "kalung beruang.png" }
    ],
    playTools: [
        { name: "Racket", price: 30, image: "racket.png" },
        { name: "Basket", price: 30, image: "basket.png" },
        { name: "Fishing Gear", price: 30, image: "pancingan.png" }
    ]
};

function updateBars() {
    happyBar.style.width = happy + "%";
    hungryBar.style.width = hungry + "%";
    if (happy <= 20 && hungry <= 20) {
        showExpression("sad");
    } else if (!ekspresiTimeout) {
        showExpression("normal");
    }
}

function showExpression(type, duration = 0) {
    if (ekspresiTimeout) {
        clearTimeout(ekspresiTimeout);
        ekspresiTimeout = null;
    }

    const terpasang = JSON.parse(localStorage.getItem("itemTerpasang")) || {};
    let gambarFinal = ekspresiGajah[type];

    if (terpasang.hair) {
        const itemRambut = itemData.hair.find(i => i.name === terpasang.hair);
        if (itemRambut) {
            // Ganti gambar final berdasarkan ekspresi
            if (type === 'love') {
                // Asumsi nama file: "panjang kucing seneng.png"
                gambarFinal = itemRambut.image.replace('.png', ' seneng.png');
            } else if (type === 'sad') {
                // Asumsi nama file: "panjang kucing sedih.png"
                gambarFinal = itemRambut.image.replace('.png', ' sedih.png');
            } else {
                 // Jika normal, gunakan gambar rambut standar
                 gambarFinal = itemRambut.image;
            }
        }
    }
    
    petImage.src = gambarFinal;

    if (type === "love") {
        ekspresiTimeout = setTimeout(() => {
            ekspresiTimeout = null;
            if (happy <= 20 && hungry <= 20) {
                showExpression("sad");
            } else {
                showExpression("normal");
            }
        }, duration);
    }
    tampilkanItemTerpasang();
}

function tampilkanItemTerpasang() {
    const terpasang = JSON.parse(localStorage.getItem("itemTerpasang")) || {};
    accessoryOverlay.classList.add("hidden");
    playToolOverlay.classList.add("hidden");

    const findItemImage = (tipe, nama) => {
        const item = itemData[tipe].find(i => i.name === nama);
        return item ? item.image : null;
    };

    if (terpasang.accessories) {
        const accessoryImage = findItemImage('accessories', terpasang.accessories);
        if (accessoryImage) {
            accessoryOverlay.src = accessoryImage;
            accessoryOverlay.classList.remove("hidden");
        }
    }
    if (terpasang.playTools) {
        const playToolImage = findItemImage('playTools', terpasang.playTools);
        if (playToolImage) {
            playToolOverlay.src = playToolImage;
            playToolOverlay.classList.remove("hidden");
        }
    }
}

// *** FUNGSI INI DIMODIFIKASI AGAR SEMUA IKUT GERAK ***
function bounceOnce() {
    showExpression("love", 1500);

    // Kumpulkan semua elemen yang harus bergerak (gajah dan aksesorisnya)
    const elementsToBounce = [petImage, accessoryOverlay, playToolOverlay];

    // Terapkan animasi ke semua elemen
    elementsToBounce.forEach(el => {
        el.classList.remove("animate-bounce");
        void el.offsetWidth; // Trik untuk me-reset animasi
        el.classList.add("animate-bounce");
    });

    // Hapus animasi dari semua elemen setelah selesai
    setTimeout(() => {
        elementsToBounce.forEach(el => {
            el.classList.remove("animate-bounce");
        });
    }, 1500);
}


petImage.addEventListener("click", () => {
    if (hungry <= 20 && happy <= 20) return;
    happy = Math.min(happy + 10, 100);
    updateBars();
    bounceOnce();
});

function feedPet() {
    hungry = Math.min(hungry + 20, 100);
    updateBars();
    bounceOnce();
}

setInterval(() => {
    hungry = Math.max(hungry - 10, 0);
    happy = Math.max(happy - 5, 0);
    updateBars();
}, 10000);

function petPet() {
    const hint = document.getElementById("petHint");
    hint.style.opacity = "0";
    setTimeout(() => {
        hint.style.opacity = "1";
    }, 1500);
}

function lepasItem(tipe) {
    const terpasang = JSON.parse(localStorage.getItem("itemTerpasang")) || {};
    delete terpasang[tipe]; 
    localStorage.setItem("itemTerpasang", JSON.stringify(terpasang));
    showExpression("normal");
    const modalId = `${tipe}Modal`;
    document.getElementById(modalId).classList.add('hidden');
}

function handleItemAction(itemName, itemPrice, itemType, sudahDibeli) {
    const modalId = `${itemType}Modal`;
    const modal = document.getElementById(modalId);
    if (sudahDibeli) {
        pakaiItem(itemName, itemType);
        showExpression("normal"); 
        modal.classList.add('hidden');
    } else {
        if (coins >= itemPrice) {
            coins -= itemPrice;
            localStorage.setItem("coins", coins);
            updateCoinDisplay();
            let koleksi = JSON.parse(localStorage.getItem("koleksiItem")) || {};
            if (!koleksi[itemType]) {
                koleksi[itemType] = [];
            }
            if (!koleksi[itemType].includes(itemName)) {
                koleksi[itemType].push(itemName);
                localStorage.setItem("koleksiItem", JSON.stringify(koleksi));
            }
            pakaiItem(itemName, itemType);
            bounceOnce();
            alert(`${itemName} berhasil dibeli dan dipakai!`);
            modal.classList.add('hidden');
        } else {
            alert("Koin kamu tidak cukup!");
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const modals = {
        hair: document.getElementById('hairModal'),
        accessories: document.getElementById('accessoriesModal'),
        playTools: document.getElementById('playToolsModal')
    };

    document.getElementById('openHairModal').addEventListener('click', () => modals.hair.classList.remove('hidden'));
    document.getElementById('openAccessoriesModal').addEventListener('click', () => modals.accessories.classList.remove('hidden'));
    document.getElementById('openPlayToolsModal').addEventListener('click', () => modals.playTools.classList.remove('hidden'));
    
    document.getElementById('closeHairModal').addEventListener('click', () => modals.hair.classList.add('hidden'));
    document.getElementById('closeAccessoriesModal').addEventListener('click', () => modals.accessories.classList.add('hidden'));
    document.getElementById('closePlayToolsModal').addEventListener('click', () => modals.playTools.classList.add('hidden'));

    function generateItems(tipe) {
        const container = document.getElementById(`${tipe}Items`);
        const items = itemData[tipe];
        const koleksi = JSON.parse(localStorage.getItem("koleksiItem")) || {};
        const koleksiTipe = koleksi[tipe] || [];
        
        container.innerHTML = "";

        container.innerHTML += `
            <div class="bg-[#2c2560] border-2 border-dashed border-gray-500 rounded-xl p-4 flex flex-col justify-between">
                <div>
                    <p class="text-white font-semibold text-lg mb-2">Normal</p>
                    <p class="text-xs text-gray-400">Kembali ke tampilan awal</p>
                </div>
                <button onclick="lepasItem('${tipe}')" class="mt-4 bg-gray-600 hover:bg-gray-700 w-full px-4 py-2 rounded-full text-white font-semibold">
                    Pakai
                </button>
            </div>
        `;

        items.forEach(item => {
            const sudahDibeli = koleksiTipe.includes(item.name);
            const buttonText = sudahDibeli ? 'Pakai' : 'Beli';
            const buttonClass = sudahDibeli 
                ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                : 'bg-gradient-to-r from-purple-400 to-pink-400';

            const itemHTML = `
                <div class="bg-[#1a1046] rounded-xl p-4 flex flex-col justify-between">
                    <div>
                        <p class="text-yellow-300 text-lg mb-2">${item.name}</p>
                        <div class="flex justify-center gap-1 mb-4">
                            <img src="coin.png" class="w-5 h-5" />
                            <span class="text-yellow-400 text-sm">${item.price}</span>
                        </div>
                    </div>
                    <button onclick="handleItemAction('${item.name}', ${item.price}, '${tipe}', ${sudahDibeli})" 
                            class="${buttonClass} w-full mt-4 px-4 py-2 rounded-full text-white font-semibold">
                        ${buttonText}
                    </button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
    }

    generateItems("hair");
    generateItems("accessories");
    generateItems("playTools");
    showExpression("normal");
});