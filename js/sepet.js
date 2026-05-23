document.addEventListener("DOMContentLoaded", () => {

    // =========================================================================
    // SEPET PANELİ HTML
    // =========================================================================
    
    const sepetPanelHtml = `
        <div id="sepet-sidebar" style="position: fixed; top: 0; right: -360px; width: 320px; height: 100vh; background: #073043; color: white; box-shadow: -5px 0 15px rgba(0,0,0,0.5); transition: right 0.3s ease; z-index: 9999; padding: 20px; display: flex; flex-direction: column; font-family: sans-serif; border-left: 2px solid #e07a5f;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 15px;">
                <h3 style="margin: 0; font-size: 20px;">Sepetiniz</h3>
                <span id="sepet-sidebar-kapat" style="cursor: pointer; font-size: 28px; font-weight: bold; color: #e07a5f;">&times;</span>
            </div>
            <div id="sepet-urun-listesi" style="flex: 1; overflow-y: auto; margin-top: 20px; padding-right: 5px;"></div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 10px;">
                <h4 style="margin: 0 0 15px 0; display: flex; justify-content: space-between; font-size: 18px;">
                    <span>Toplam:</span> <span id="sepet-toplam-tutar" style="color: #e07a5f;">0 TL</span>
                </h4>
                <button id="alısveris-tamamla-btn" style="width: 100%; height:%90 background: #e07a5f; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 5px; font-weight: bold; font-size: 14px;">Alışverişi Tamamla</button>
                <button id="sepeti-bosalt-btn" style="width: 100%; height:%90 background: #e07a5f; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 5px; font-weight: bold; font-size: 14px;">Sepeti Temizle</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", sepetPanelHtml);

    // Navbar'daki mevcut sepet ikonunun yanına kırmızı bildirim sayacı
    const sepetIkonu = document.querySelector(".sepet");
    if (sepetIkonu) {
        sepetIkonu.style.cursor = "pointer";
        sepetIkonu.insertAdjacentHTML("afterend", `
            <span id="sepet-sayac-badge" style="position: absolute; top: 20px; right: 15px; background: #e07a5f; color: white; border-radius: 50%; padding: 4px 6px; font-size: 10px; font-weight: bold;;">0</span>
        `);
    }

    // =========================================================================
    //  ELEMENTLERİ SEÇME
    // =========================================================================
    const sepetSidebar = document.getElementById("sepet-sidebar");
    const sepetKapatBtn = document.getElementById("sepet-sidebar-kapat");
    const sepetUrunListesi = document.getElementById("sepet-urun-listesi");
    const sepetToplamTutar = document.getElementById("sepet-toplam-tutar");
    const sepetSayacBadge = document.getElementById("sepet-sayac-badge");
    const alısverisTamamlaBtn = document.getElementById("alısveris-tamamla-btn")
    const sepetiBosaltBtn = document.getElementById("sepeti-bosalt-btn");

    // =========================================================================
    // LOCALSTORAGE VE VERİ YÜKLEME
    // =========================================================================
    // Tarayıcı hafızasında kayıtlı sepet varsa çek, yoksa boş bir liste başlat
    let sepet = JSON.parse(localStorage.getItem("tulpar_sepet_hafiza")) || [];

    // Sayfa ilk yüklendiğinde hafızadaki ürünleri sepete çiz
    arayuzuGuncelle();

    // =========================================================================
    // OLAY DİNLEYİCİLERİ (EVENT LISTENERS)
    // =========================================================================
    
    // Sepet ikonuna veya kırmızı sayaca tıklandığında paneli aç
    if (sepetIkonu) sepetIkonu.addEventListener("click", () => sepetSidebar.style.right = "0");
    if (sepetSayacBadge) sepetSayacBadge.addEventListener("click", () => sepetSidebar.style.right = "0");
    
    // Paneldeki (X) butonuna basınca paneli kapat
    sepetKapatBtn.addEventListener("click", () => sepetSidebar.style.right = "-360px");

    // Sayfadaki tüm "Sepete Ekle" butonlarını bulup tıklama olayı bağla
    const sepeteEkleButonlari = document.querySelectorAll(".card button");
    sepeteEkleButonlari.forEach(buton => {
        buton.addEventListener("click", (e) => {
            const kart = e.target.closest(".card");
            
            // Kart içindeki ürün başlığını, fiyatını ve görsel yolunu al
            const ad = kart.querySelector("h3").textContent;
            const fiyatText = kart.querySelector(".fiyat").textContent;
            const fiyat = parseInt(fiyatText.replace(/[^0-9]/g, "")); // "30 TL" metnini sayısal 30 yapar
            const gorsel = kart.querySelector("img").src;

            sepeteEkle(ad, fiyat, gorsel);
            sepetSidebar.style.right = "0"; // Ürün eklenince sepet paneli otomatik açılsın
        });
    });

    // =========================================================================
    // SEPET FONKSİYONLARI (İŞ MANTIĞI)
    // =========================================================================
    
    // Ürünü listeye ekleyen fonksiyon
    function sepeteEkle(ad, fiyat, gorsel) {
        const varOlanUrun = sepet.find(item => item.ad === ad);

        if (varOlanUrun) {
            varOlanUrun.adet += 1; // Ürün listede zaten varsa adetini artır
        } else {
            sepet.push({ ad, fiyat, gorsel, adet: 1 }); // Yoksa yeni nesne olarak listeye ekle
        }
        hafizayaKaydet();
    }

    // Değişiklikleri tarayıcı hafızasına yazan ve arayüzü yenileyen fonksiyon
    function hafizayaKaydet() {
        localStorage.setItem("tulpar_sepet_hafiza", JSON.stringify(sepet));
        arayuzuGuncelle();
    }

    // Sepet panelinin içini silip güncel elemanları HTML olarak basan fonksiyon
    function arayuzuGuncelle() {
        sepetUrunListesi.innerHTML = ""; // İçeriği sıfırla
        let toplamFiyat = 0;
        let toplamAdet = 0;

        sepet.forEach(item => {
            toplamFiyat += item.fiyat * item.adet;
            toplamAdet += item.adet;

            const urunSatiriHtml = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${item.gorsel}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1; margin-left: 12px; font-size: 14px;">
                        <div style="font-weight: bold; color: #fff;">${item.ad}</div>
                        <div style="color: #b3b3b3; margin-top: 4px;">${item.fiyat} TL &times; ${item.adet}</div>
                    </div>
                    <button onclick="sepettenUrunSil('${item.ad}')" style="background: none; border: none; color: #e07a5f; cursor: pointer; font-size: 20px; font-weight: bold; padding: 0 5px;">&times;</button>
                </div>
            `;
            sepetUrunListesi.insertAdjacentHTML("beforeend", urunSatiriHtml);
        });

        // Sayaç badge değerini ve alt toplam tutarını ekrana yazdır
        if (sepetSayacBadge) sepetSayacBadge.textContent = toplamAdet;
        sepetToplamTutar.textContent = `${toplamFiyat} TL`;
    }

    // =========================================================================
    // TEMİZLİK VE GLOBAL SİLME FONKSİYONLARI
    // =========================================================================
    
    // Sepetteki dinamik HTML butonlarının erişebilmesi için silme fonksiyonunu window nesnesine bağla
    window.sepettenUrunSil = function(ad) {
        sepet = sepet.filter(item => item.ad !== ad); // Seçilen ürün hariç diğerlerini filtrele
        hafizayaKaydet();
    };

    // "Sepeti Temizle" butonuna tıklandığında sepet dizisini sıfırla
    sepetiBosaltBtn.addEventListener("click", () => {
        if (sepet.length > 0 && confirm("Sepetinizdeki tüm ürünleri silmek istediğinize emin misiniz?")) {
            sepet = [];
            hafizayaKaydet();
        }
    });

    alısverisTamamlaBtn.addEventListener("click", () => {
        if (sepet.length > 0 && confirm("Alışverişinizi tamamlamak istediğinize emin misiniz?")) {
            sepet = [];
            hafizayaKaydet();
        }
    });
});