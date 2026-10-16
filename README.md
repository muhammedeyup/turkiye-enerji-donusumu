# Türkiye Elektrik Üretimi — Scrollytelling Veri Hikâyesi

Bu proje, Türkiye'nin elektrik üretim karışımının zaman içindeki değişimini anlatan tek sayfalık, etkileşimli bir scrollytelling sitesidir. Depo; kaynak ve işlenmiş veriyi, analiz notebook'unu, yayına hazır siteyi ve proje belgelerini bir arada içerir.

## Depo yapısı

```text
proje-adi/
├── README.md
├── requirements.txt
├── teslim.txt
├── data/
│   ├── raw/                 # Kaynak veriler
│   └── processed/           # Notebook'tan üretilen JSON
├── notebooks/
│   └── analiz.ipynb
├── site/
│   ├── index.html
│   ├── veri-hikayesi.html
│   ├── css/                 # Hikâye sayfası stil kaynağı
│   ├── js/                  # Hikâye etkileşim kodu
│   ├── assets/              # Üretim derlemesi varlıkları
│   └── data/                # Sitenin kullandığı özet JSON
└── docs/
    ├── storyboard.pdf
    ├── lighthouse/
    ├── linkedin/
    └── tasarim/
```

## Yerelde çalıştırma

Hazır üretim sitesi statik dosyalardan oluşur; Node.js kurulumu veya paket yüklemesi gerekmez. Python 3 kuruluysa:

1. Depo kök klasöründe terminal/PowerShell açın.
2. Şunu çalıştırın: `py -m http.server 8000 --directory site`
3. Tarayıcıda `http://localhost:8000/` adresini açın.
4. Hikâye sayfası için `http://localhost:8000/veri-hikayesi.html` adresine gidin.
5. Sunucuyu durdurmak için terminalde `Ctrl+C` tuşlarına basın.

`py` komutu yoksa aynı klasörde `python -m http.server 8000 --directory site` deneyin. Hikâye grafiklerinin CDN kütüphaneleri ve web yazı tiplerinin yüklenmesi için internet bağlantısı gerekir.

### Notebook'u ve site verisini yeniden üretme

Python ortamında `pip install -r requirements.txt` komutuyla notebook bağımlılıklarını kurun. Jupyter üzerinden `notebooks/analiz.ipynb` dosyasını açıp **Restart & Run All** çalıştırın. Notebook `data/raw/` içindeki iki CSV'yi okur; JSON çıktısını `data/processed/` klasörüne ve sitenin kullandığı `site/data/` klasörüne yazar.

## Veri ve kaynak

- Kaynak veri: [Our World in Data — Electricity Mix](https://ourworldindata.org/grapher/electricity-mix), kaynak seriler Ember ve Energy Institute tarafından sağlanır.
- Ham dosyalar `data/raw/`, sitede kullanılan işlenmiş JSON `data/processed/` ve `site/data/` içindedir. Notebook bu çıktıları ham CSV dosyalarından yeniden üretir.
- Sitedeki yöntem bölümünde erişim tarihi ve lisans bilgisi belirtilmiştir. OWID tarafından üretilen türetilmiş veriler için CC BY 4.0 beyanı bulunur; katkı veren üçüncü taraf kaynakların koşulları ayrıca geçerli olabilir.

## Teknolojiler ve kod kaynakları

Analiz Python 3, Pandas ve Jupyter Notebook ile; site HTML, CSS ve JavaScript ile hazırlanmıştır. Arayüzde Chart.js 4.4, chartjs-plugin-annotation ve Scrollama.js kullanılır. Kütüphaneler hikâye sayfasında CDN üzerinden yüklenir. Kaynak bağlantıları ve kullanım bilgileri sitenin yöntem bölümünde yer alır.

## Canlı bağlantılar

- Hikâye: https://eyupcatan1.netlify.app/veri-hikayesi.html
- Portfolyo: https://eyupcatan1.netlify.app/
- GitHub: https://github.com/eyupcatan/turkiye-enerji-donusumu

Netlify dağıtımında yayın klasörü `site/` olmalıdır.

## Yapay zekâ kullanım beyanı

Google Antigravity kod altyapısı, grafik entegrasyonu ve duyarlı CSS geliştirmesinde kullanılmıştır. ChatGPT/Codex yönerge uyumu ve hata ayıklama desteği sağlamış, bazı site metinleri ve stilleri düzenlenmiştir. Veri yorumlarının ve teslim anlatısının öğrenci tarafından kaynak verilerle doğrulanması gerekir. Ayrıntılı beyan site içindeki yöntem bölümündedir.

## Lighthouse

Yerel üretim derlemesinde mobil Lighthouse Performans sonucu ana sayfada 99, hikâye sayfasında 100 ölçülmüştür. Bu ölçümler canlı dağıtım sonucu değildir; güncel dosyalar yayımlandıktan sonra canlı URL yeniden denetlenmelidir.