// ==========================================
// DATA LOCAL STORAGE
// ==========================================

let inventory =
    JSON.parse(localStorage.getItem("inventaris")) || [];


// ==========================================
// SAAT APLIKASI DIBUKA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    renderAll();

    setupDarkMode();

    registerServiceWorker();

});


// ==========================================
// MENAMPILKAN HALAMAN
// ==========================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId)
        .classList.add("active-page");


    document.querySelectorAll(".nav-btn")
        .forEach(btn => btn.classList.remove("active"));


    const buttons = document.querySelectorAll(".nav-btn");

    if (pageId === "dashboard") {
        buttons[0]?.classList.add("active");
    }

    if (pageId === "form") {
        buttons[1]?.classList.add("active");
    }

    if (pageId === "inventory") {
        buttons[2]?.classList.add("active");
    }

    if (pageId === "backup") {
        buttons[3]?.classList.add("active");
    }


    // Tutup sidebar HP
    document.querySelector(".sidebar")
        ?.classList.remove("open");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// SIDEBAR MOBILE
// ==========================================

function toggleSidebar() {

    document.querySelector(".sidebar")
        .classList.toggle("open");

}


// ==========================================
// FORM TAMBAH / EDIT
// ==========================================

document.getElementById("inventoryForm")
    .addEventListener("submit", function(e) {

        e.preventDefault();


        const id =
            document.getElementById("editId").value;

        const nama =
            document.getElementById("namaBarang").value.trim();

        const kode =
            document.getElementById("kodeInventaris")
                .value.trim();

        const ruangan =
            document.getElementById("namaRuangan").value;

        const jumlah =
            Number(
                document.getElementById("jumlahBarang").value
            );

        const kondisi =
            document.querySelector(
                'input[name="kondisi"]:checked'
            )?.value;


        if (!nama || !kode || !ruangan || !jumlah || !kondisi) {

            alert("Semua data harus diisi!");

            return;
        }


        // CEK KODE DUPLIKAT
        const duplicate = inventory.find(item =>
            item.kode.toLowerCase() === kode.toLowerCase()
            && item.id !== id
        );


        if (duplicate) {

            alert("Kode inventaris sudah digunakan!");

            return;
        }


        if (id) {

            // EDIT DATA

            const index =
                inventory.findIndex(item =>
                    item.id === id
                );


            if (index !== -1) {

                inventory[index] = {

                    ...inventory[index],

                    nama,
                    kode,
                    ruangan,
                    jumlah,
                    kondisi

                };

            }

            alert("Data berhasil diperbarui!");

        } else {

            // TAMBAH DATA

            const newItem = {

                id: Date.now().toString(),

                nama,
                kode,
                ruangan,
                jumlah,
                kondisi,

                createdAt:
                    new Date().toLocaleString("id-ID")

            };


            inventory.push(newItem);


            alert("Data berhasil ditambahkan!");

        }


        saveData();

        resetForm();

        showPage("inventory");

    });


// ==========================================
// SIMPAN LOCAL STORAGE
// ==========================================

function saveData() {

    localStorage.setItem(
        "inventaris",
        JSON.stringify(inventory)
    );

    renderAll();

}


// ==========================================
// RENDER SEMUA
// ==========================================

function renderAll() {

    updateStatistics();

    renderDashboard();

    renderInventory();

    updateRoomFilters();

}


// ==========================================
// STATISTIK
// ==========================================

function updateStatistics() {

    let total = 0;

    let baik = 0;

    let ringan = 0;

    let berat = 0;


    inventory.forEach(item => {

        total += Number(item.jumlah);


        if (item.kondisi === "Baik") {
            baik += Number(item.jumlah);
        }

        if (item.kondisi === "Rusak Ringan") {
            ringan += Number(item.jumlah);
        }

        if (item.kondisi === "Rusak Berat") {
            berat += Number(item.jumlah);
        }

    });


    document.getElementById("totalBarang")
        .textContent = total;

    document.getElementById("barangBaik")
        .textContent = baik;

    document.getElementById("rusakRingan")
        .textContent = ringan;

    document.getElementById("rusakBerat")
        .textContent = berat;

}


// ==========================================
// DASHBOARD TABLE
// ==========================================

function renderDashboard() {

    const table =
        document.getElementById("dashboardTable");


    if (!inventory.length) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:40px;">
                    📦 Belum ada data inventaris.
                </td>
            </tr>
        `;

        return;
    }


    const recent =
        [...inventory].reverse().slice(0, 5);


    table.innerHTML =
        recent.map(item => `

        <tr>

            <td>
                <strong>${escapeHTML(item.nama)}</strong>
            </td>

            <td>${escapeHTML(item.kode)}</td>

            <td>${escapeHTML(item.ruangan)}</td>

            <td>${item.jumlah}</td>

            <td>
                ${conditionBadge(item.kondisi)}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editItem('${item.id}')">
                    ✏️
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteItem('${item.id}')">
                    🗑️
                </button>

            </td>

        </tr>

    `).join("");

}


// ==========================================
// RENDER INVENTORY
// ==========================================

function renderInventory() {

    const container =
        document.getElementById("inventoryCards");


    if (!container) return;


    const search =
        document.getElementById("searchInput")
            ?.value.toLowerCase() || "";


    const room =
        document.getElementById("filterRoom")
            ?.value || "";


    const condition =
        document.getElementById("filterCondition")
            ?.value || "";


    const filtered =
        inventory.filter(item => {

            const matchSearch =
                item.nama.toLowerCase()
                    .includes(search)
                ||
                item.kode.toLowerCase()
                    .includes(search);


            const matchRoom =
                !room || item.ruangan === room;


            const matchCondition =
                !condition ||
                item.kondisi === condition;


            return (
                matchSearch &&
                matchRoom &&
                matchCondition
            );

        });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="section-card"
                 style="grid-column:1/-1;text-align:center">

                <div style="font-size:50px">
                    📦
                </div>

                <h2>Data tidak ditemukan</h2>

                <p style="color:#888;margin-top:8px">
                    Coba ubah kata pencarian atau filter.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(item => `

        <div class="inventory-card">

            <div class="inventory-top">

                <div class="item-icon">
                    ${getItemIcon(item.nama)}
                </div>

                ${conditionBadge(item.kondisi)}

            </div>


            <h3>
                ${escapeHTML(item.nama)}
            </h3>

            <span class="code">
                ${escapeHTML(item.kode)}
            </span>


            <div class="inventory-info">

                <div>

                    <span class="info-label">
                        RUANGAN
                    </span>

                    <span class="info-value">
                        🏫 ${escapeHTML(item.ruangan)}
                    </span>

                </div>


                <div>

                    <span class="info-label">
                        JUMLAH
                    </span>

                    <span class="info-value">
                        ${item.jumlah} unit
                    </span>

                </div>

            </div>


            <div class="card-actions">

                <button
                    class="edit-btn"
                    onclick="editItem('${item.id}')">

                    ✏️ Edit

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteItem('${item.id}')">

                    🗑️ Hapus

                </button>

            </div>

        </div>

    `).join("");

}


// ==========================================
// BADGE KONDISI
// ==========================================

function conditionBadge(condition) {

    if (condition === "Baik") {

        return `
            <span class="badge badge-good">
                ✓ Baik
            </span>
        `;

    }


    if (condition === "Rusak Ringan") {

        return `
            <span class="badge badge-warning">
                ! Rusak Ringan
            </span>
        `;

    }


    return `
        <span class="badge badge-danger">
            × Rusak Berat
        </span>
    `;

}


// ==========================================
// ICON BARANG
// ==========================================

function getItemIcon(name) {

    const text =
        name.toLowerCase();


    if (
        text.includes("komputer") ||
        text.includes("laptop")
    ) {
        return "💻";
    }


    if (
        text.includes("printer")
    ) {
        return "🖨️";
    }


    if (
        text.includes("proyektor")
    ) {
        return "📽️";
    }


    if (
        text.includes("kursi")
    ) {
        return "🪑";
    }


    if (
        text.includes("meja")
    ) {
        return "🗄️";
    }


    if (
        text.includes("buku")
    ) {
        return "📚";
    }


    return "📦";

}


// ==========================================
// EDIT DATA
// ==========================================

function editItem(id) {

    const item =
        inventory.find(item =>
            item.id === id
        );


    if (!item) return;


    document.getElementById("editId")
        .value = item.id;


    document.getElementById("namaBarang")
        .value = item.nama;


    document.getElementById("kodeInventaris")
        .value = item.kode;


    document.getElementById("namaRuangan")
        .value = item.ruangan;


    document.getElementById("jumlahBarang")
        .value = item.jumlah;


    document.querySelectorAll(
        'input[name="kondisi"]'
    ).forEach(radio => {

        radio.checked =
            radio.value === item.kondisi;

    });


    document.getElementById("formTitle")
        .textContent = "Edit Inventaris";


    document.getElementById("submitText")
        .textContent = "Perbarui Data";


    showPage("form");

}


// ==========================================
// HAPUS DATA
// ==========================================

function deleteItem(id) {

    const item =
        inventory.find(item =>
            item.id === id
        );


    if (!item) return;


    const yakin = confirm(
        "Apakah Anda yakin ingin menghapus data ini?"
    );


    if (!yakin) return;


    inventory =
        inventory.filter(item =>
            item.id !== id
        );


    saveData();


    alert("Data berhasil dihapus.");

}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    document.getElementById("inventoryForm")
        .reset();


    document.getElementById("editId")
        .value = "";


    document.getElementById("formTitle")
        .textContent = "Tambah Inventaris";


    document.getElementById("submitText")
        .textContent = "Simpan Data";

}


// ==========================================
// FILTER RUANGAN
// ==========================================

function updateRoomFilters() {

    const rooms =
        [...new Set(
            inventory.map(item =>
                item.ruangan
            )
        )];


    const filter =
        document.getElementById("filterRoom");


    const header =
        document.getElementById("roomHeader");


    const currentFilter =
        filter?.value || "";


    const currentHeader =
        header?.value || "";


    if (filter) {

        filter.innerHTML =
            `<option value="">
                Semua Ruangan
            </option>`;


        rooms.forEach(room => {

            filter.innerHTML += `
                <option value="${escapeHTML(room)}">
                    ${escapeHTML(room)}
                </option>
            `;

        });


        filter.value = currentFilter;

    }


    if (header) {

        header.innerHTML =
            `<option value="">
                Semua Ruangan
            </option>`;


        rooms.forEach(room => {

            header.innerHTML += `
                <option value="${escapeHTML(room)}">
                    ${escapeHTML(room)}
                </option>
            `;

        });


        header.value = currentHeader;

    }

}


function filterRoom() {

    const value =
        document.getElementById("roomHeader").value;


    document.getElementById("filterRoom").value =
        value;


    showPage("inventory");

    renderInventory();

}


// ==========================================
// EXPORT DATA
// ==========================================

function exportData() {

    if (!inventory.length) {

        alert("Belum ada data untuk diexport.");

        return;
    }


    const data =
        JSON.stringify(inventory, null, 2);


    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "backup-inventaris.json";


    link.click();


    URL.revokeObjectURL(url);

}


// ==========================================
// IMPORT DATA
// ==========================================

function importData() {

    const file =
        document.getElementById("importFile")
            .files[0];


    if (!file) {

        alert("Pilih file JSON terlebih dahulu.");

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            const data =
                JSON.parse(e.target.result);


            if (!Array.isArray(data)) {

                throw new Error();

            }


            inventory = data;


            saveData();


            alert("Data berhasil diimport!");

        }

        catch {

            alert(
                "File tidak valid!"
            );

        }

    };


    reader.readAsText(file);

}


// ==========================================
// HAPUS SEMUA
// ==========================================

function deleteAllData() {

    if (!inventory.length) {

        alert("Tidak ada data.");

        return;
    }


    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus SEMUA data inventaris?"
        );


    if (!yakin) return;


    inventory = [];


    localStorage.removeItem("inventaris");


    renderAll();


    alert("Semua data berhasil dihapus.");

}


// ==========================================
// DARK MODE
// ==========================================

function setupDarkMode() {

    const toggle =
        document.getElementById("darkMode");


    const dark =
        localStorage.getItem("darkMode");


    if (dark === "true") {

        document.body.classList.add("dark");

        toggle.checked = true;

    }


    toggle.addEventListener("change", () => {

        document.body.classList.toggle(
            "dark",
            toggle.checked
        );


        localStorage.setItem(
            "darkMode",
            toggle.checked
        );

    });

}


// ==========================================
// SERVICE WORKER
// ==========================================

function registerServiceWorker() {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker
            .register("service-worker.js")
            .then(() => {

                console.log(
                    "Service Worker aktif."
                );

            })
            .catch(error => {

                console.log(
                    "Service Worker gagal:",
                    error
                );

            });

    }

}


// ==========================================
// KEAMANAN TAMPILAN
// ==========================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}