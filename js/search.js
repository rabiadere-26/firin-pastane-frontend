

const searchicon = document.getElementById('searchicon')
const search = document.getElementById('search')



searchicon.addEventListener('click',()=>{
    search.classList.toggle('active')
})

document.addEventListener("DOMContentLoaded", () => {
    // Navbar içindeki arama input alanını hedef alıyoruz
    const searchInput = document.querySelector(".search input");
    
    if (!searchInput) return;

    // Kullanıcı her harf yazdığında veya sildiğinde çalışır
    searchInput.addEventListener("input", (e) => {
        const arananKelime = e.target.value.toLowerCase().trim();
        const urunKartlari = document.querySelectorAll(".card");

        urunKartlari.forEach(card => {
            // Kartın içindeki h3 etiketinden ürün adını alıyoruz
            const urunAdi = card.querySelector("h3").textContent.toLowerCase();
            // Tablo düzeninin bozulmaması için kartın en yakın üst 'td' elementini buluyoruz
            const tabloHucresi = card.closest("td");

            if (urunAdi.includes(arananKelime)) {
                if (tabloHucresi) tabloHucresi.style.display = ""; // Eşleşiyorsa hücreyi göster
                card.style.display = "";
            } else {
                if (tabloHucresi) tabloHucresi.style.display = "none"; // Eşleşmiyorsa hücreyi gizle
            }
        });
    });
});