# 🎨 Tasarım Kararları Notu (Design Decisions)
**Proje:** Türkiye'nin Elektrik Üretiminde Enerji Dönüşümü (1965 – 2025)  
**Öğrenci:** Muhammet Eyüp Çatan — Büyük Veri Analistliği Programı | **Tarih:** Ekim 2026  

---

### 1. Renk Sistemi ve Renk Körü Dostu (Color-Blind Friendly) Palet
- **Arka Plan & Kontrast:** Zemin için derin uzay tonu (`#07090e`), kart yüzeyleri için koyu lacivert (`#0b0e17`) ve vurgular için neon camgöbeği (`#54D6FF`) seçilmiştir. WCAG AA için kontrast hedeflenmiştir; gerçek oranlar ve erişilebilirlik sonucu Lighthouse/kontrast denetimiyle teslim öncesi doğrulanmalıdır.
- **Okabe-Ito Bilimsel Paleti:** Renk körlüğü olan kullanıcıların eğrileri rahatça ayırt edebilmesi için uluslararası kabul gören Okabe-Ito paleti kullanılmıştır:
  - **Kömür (`#79808a`):** Nötr gri, karbon ve fosil çağrışımı.
  - **Doğal Gaz (`#d55e00`):** Kiremit-turuncu, yanma alevi ve metan temsili.
  - **Hidroelektrik (`#0072b2`):** Derin mavi, su ve baraj gölleri.
  - **Rüzgâr (`#009e73`):** Canlı zümrüt yeşili, temiz hava ve çevre.
  - **Güneş (`#e69f00`):** Sıcak altın sarısı, güneş ışıması.

### 2. Tipografi Hiyerarşisi
- **Başlık ve gövde:** `Space Grotesk` (Google Fonts); gövde metni en az 16 px ve yaklaşık 1.5 satır aralığındadır.
- **Sayılar ve metrikler:** `JetBrains Mono`. Arayüz iki yazı tipi ailesiyle sınırlıdır. Monospace yapısı sayesinde `121,4 TWh` gibi değerlerin dikey hizasını korur; titreşimi engeller.

### 3. Grafik Türü Seçimleri ve Gerekçeleri
Akademik rubrik şartı (en az 3 tür) doğrultusunda **4 farklı grafik türü** seçilmiştir:
1. **Çizgi / Alan Grafiği (`scrollyChart`):** 1965–2025 zaman serisinde 5 kaynağın gelişimini, kırılma ve kesişim noktalarını gösterir. 6. adımda kümülatif fosil alanını hissettirmek için alan grafiğine (`fill: true`) dönüşür.
2. **Sıralanmış Yatay Çubuk Grafik (`chartRankedBars`):** 2024 yılı itibarıyla seçilen tüm ülkeler (16 ülke) ve Dünya ortalamasının rüzgâr ve güneş elektrik payı sıralamasını verir (5 seçilmiş kaynak paydasında Türkiye %19,4 ile Dünya ortalamasının [%17,6] önündedir); yatay eksen ülke etiketlerinin rahat okunmasını sağlar.
3. **Yığılmış Çubuk Grafik (`chartStackedBars`):** 1990, 2000, 2010 ve 2025 yıllarında toplam üretim sepetinin bileşimsel dönüşümünü (Fosil vs. Yenilenebilir) sergiler.
4. **Halka / Dilim Grafik (`chartDonut2025`):** 2025 yılında seçilmiş beş kaynak içindeki fosil (%59,9) ve hidro+rüzgâr+güneş (%40,1) oranını yalın ve dramatik biçimde sunar.

### 4. Düzen, Etkileşim ve Erişilebilirlik
- **İki Sütunlu Yapışkan Grid:** Masaüstünde sol sütunda kayan metin kartları (`scrollama.js`), sağ sütunda ekrana sabitlenen (`position: sticky`) dinamik canvas. Mobilde 360 px uyumlu dikey akış.
- **Okuyucu Etkileşimi:** Ülke seçimi (`<select>`), kaynak buton grubu ve zaman aralığı kaydırıcıları ile kullanıcıya kendi karşılaştırmasını yapma imkânı tanınmıştır.
- **Erişilebilirlik:** `prefers-reduced-motion` desteği, semantik HTML etiketleri (`figure`, `figcaption`), klavye odaklanması ve görünür açıklama notları (Chart.js annotations).
