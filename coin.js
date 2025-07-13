// =======================
// INISIALISASI DATA AWAL
// =======================
if (!localStorage.getItem("coins")) {
    localStorage.setItem("coins", "6000");
}
if (!localStorage.getItem("koleksiItem")) {
    localStorage.setItem("koleksiItem", JSON.stringify({}));
}
if (!localStorage.getItem("itemTerpasang")) {
    localStorage.setItem("itemTerpasang", JSON.stringify({}));
}

let coins = parseInt(localStorage.getItem("coins")) || 0;

// ============================
// FUNGSI UNTUK LOADING SCREEN
// ============================
function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
        overlay.classList.add('flex', 'flex-col');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex', 'flex-col');
    }
}

// ============================
// CONNECT KE PLUG WALLET
// ============================
async function handleConnection() {
    const btn = document.getElementById("connectBtn");

    if (!window.ic || !window.ic.plug) {
        alert("Plug Wallet tidak ditemukan. Harap install ekstensinya.");
        window.open('https://plugwallet.ooo/', '_blank');
        return;
    }

    btn.disabled = true;
    showLoading("Menghubungkan ke Wallet...");

    try {
        await window.ic.plug.requestConnect({
            whitelist: [],
            host: "https://mainnet.dfinity.network",
        });

        if (await window.ic.plug.isConnected()) {
            const principalId = await window.ic.plug.getPrincipal();
            sessionStorage.setItem('plugConnected', 'true');
            sessionStorage.setItem('principalId', principalId.toText());
            window.location.href = 'shop.html'; // ✅ redirect ke shop setelah berhasil konek
        } else {
            throw new Error("Koneksi tidak berhasil diverifikasi.");
        }
    } catch (error) {
        alert("Koneksi gagal. Pastikan Anda menyetujui permintaan dari Plug Wallet.");
    } finally {
        hideLoading();
        btn.disabled = false;
    }
}

// ============================
// TAMPILKAN PRINCIPAL ID
// ============================
function displayPrincipalId() {
    const principalId = sessionStorage.getItem('principalId');
    const displayElement = document.getElementById('principalIdDisplay');
    const mobileDisplayElement = document.getElementById('mobilePrincipalIdDisplay');

    if (principalId && displayElement) {
        const shortId = `${principalId.slice(0, 5)}...${principalId.slice(-3)}`;
        displayElement.textContent = shortId;
        displayElement.parentElement.classList.remove('hidden');
    }

    if (principalId && mobileDisplayElement) {
        mobileDisplayElement.textContent = principalId;
        mobileDisplayElement.parentElement.classList.remove('hidden');
    }
}

// ============================
// TAMPILKAN JUMLAH COIN
// ============================
function updateCoinDisplay() {
    const coinSpan = document.getElementById("coinDisplay");
    if (coinSpan) {
        coinSpan.textContent = coins.toLocaleString("id-ID");
    }
}

// ============================
// TAMPILKAN MODAL TOP UP
// ============================
function showTopUpModal() {
    const topUpModal = document.getElementById("topUpModal");
    if (topUpModal) {
        topUpModal.classList.remove('hidden');
    } else {
        alert("Fitur Top Up tidak tersedia di halaman ini.");
    }
}

function closeTopUpModal() {
    const topUpModal = document.getElementById("topUpModal");
    if (topUpModal) {
        topUpModal.classList.add('hidden');
    }
}

// ============================
// FUNGSI TOP UP DENGAN ICP
// ============================
async function topUp(amount) {
    const ALAMAT_PENERIMA_ANDA = 'etxmz-m6pfj-ols34-3oatd-obisr-ywiok-6dssr-gf5jo-5ln6f-rak52-iae';

    closeTopUpModal();
    showLoading("Memverifikasi koneksi wallet...");

    try {
        console.log("🔍 Memulai top up:", amount);

        if (!(await window.ic.plug.isConnected())) {
            console.log("🔌 Wallet tidak terkoneksi, mencoba koneksi ulang...");
            await window.ic.plug.requestConnect({ whitelist: [] });

            if (!(await window.ic.plug.isConnected())) {
                throw new Error("❌ Gagal menghubungkan wallet.");
            }
        }

        const priceInICP = amount * 0.001; // Sesuaikan rate kamu
        const priceInE8s = BigInt(Math.floor(priceInICP * 100_000_000));

        showLoading("Menunggu persetujuan di Plug Wallet...");
        const result = await window.ic.plug.requestTransfer({
            to: ALAMAT_PENERIMA_ANDA,
            amount: priceInE8s,
        });

        console.log("✅ Hasil transfer:", result);

        if (result && result.height) {
            coins += amount;
            localStorage.setItem("coins", String(coins));
            updateCoinDisplay();
            hideLoading();
            alert(`🎉 Berhasil! Kamu mendapatkan ${amount} coin.`);
        } else {
            throw new Error("⚠️ Transaksi dibatalkan atau tidak valid.");
        }

    } catch (error) {
        console.error("🚨 Error saat top up:", error);
        hideLoading();
        alert(`❌ Transaksi gagal: ${error.message}`);
    }
}

// ============================
// TOMBOL WALLET DI HALAMAN
// ============================
function initializeWalletButton() {
    const walletBtn = document.getElementById('walletBtn');
    const mobileWalletBtn = document.querySelector("button[onclick*='connectPlugMobile']");

    if (!walletBtn) return;
    const isConnected = sessionStorage.getItem('plugConnected') === 'true';

    if (isConnected) {
        walletBtn.textContent = "Top Up";
        walletBtn.onclick = showTopUpModal;

        if (mobileWalletBtn) {
            mobileWalletBtn.textContent = "Top Up";
            mobileWalletBtn.onclick = () => {
                showTopUpModal();
                document.getElementById('mobile-menu').classList.add('hidden');
            };
        }
    } else {
        const redirectToConnect = () => { window.location.href = 'index.html'; }; // ✅ Ganti ke index.html
        walletBtn.textContent = "Connect Wallet";
        walletBtn.onclick = redirectToConnect;

        if (mobileWalletBtn) {
            mobileWalletBtn.textContent = "Connect Wallet";
            mobileWalletBtn.onclick = redirectToConnect;
        }
    }
}

// ============================
// INISIALISASI SAAT PAGE LOAD
// ============================
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;
    if (sessionStorage.getItem('plugConnected') !== 'true' && !currentPage.includes('index.html')) {
        window.location.href = 'index.html'; // ✅ Redirect ke index kalau belum connect
        return;
    }
    updateCoinDisplay();
    initializeWalletButton();
    displayPrincipalId();
});

// ============================
// PASANG ITEM
// ============================
function pakaiItem(namaItem, tipe) {
    let itemTerpasang = JSON.parse(localStorage.getItem("itemTerpasang")) || {};
    itemTerpasang[tipe] = namaItem;
    localStorage.setItem("itemTerpasang", JSON.stringify(itemTerpasang));
}
