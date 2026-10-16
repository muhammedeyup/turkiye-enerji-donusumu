/**
 * ==============================================================================
 * TÜRKİYE ELEKTRİK ÜRETİMİNDE ENERJİ DÖNÜŞÜMÜ & KÜRESEL KARŞILAŞTIRMA
 * Scrollytelling & İnteraktif Veri Görselleştirme Motoru (veri-script.js)
 * Yazar: Muhammet Eyüp Çatan | Büyük Veri Analistliği
 * Veri Kaynağı: Our World in Data (1965-2025)
 * ==============================================================================
 */

// Global Değişkenler & Grafik Örnekleri
let allData = [];
let turkeyData = [];
let chartScrollyInstance = null;
let _chartRankedInstance = null;
let _chartStackedInstance = null;
let _chartDonutInstance = null;
let chartComparisonInstance = null;
let scrollerInstance = null;

// Aktif Filtre Durumları (İnteraktif Karşılaştırma Grafiği İçin)
let selectedCountry = 'Germany';
let selectedSource = 'Renewable'; // 'Renewable', 'Wind', 'Solar', 'Coal', 'Gas', 'Hydropower'
let startYearVal = 1965;
let endYearVal = 2025;

// Renk Körlüğü Dostu (Okabe-Ito / Wong) Enerji Paleti
const ENERGY_COLORS = {
  coal: '#4a5568',          // Kömür (Antrasit / Gri)
  gas: '#d55e00',           // Doğalgaz (Kiremit / Turuncu)
  hydro: '#0072b2',         // Hidroelektrik (Derin Mavi)
  wind: '#009e73',          // Rüzgâr (Deniz Yeşili / Turkuaz)
  solar: '#e69f00',         // Güneş (Altın Sarısı / Kehribar)
  fossil: '#d55e00',        // Toplam Fosil
  renewable: '#009e73',     // Toplam Yenilenebilir
  turkeyAccent: '#54D6FF',  // Türkiye Vurgusu (Neon Cam Göbeği)
  compareAccent: '#f59e0b'  // Karşılaştırma Ülkesi Vurgusu (Kehribar)
};

// 17 Seri İçin Türkçe Ülke İsimleri Haritası
const COUNTRY_TR_NAMES = {
  Turkey: 'Türkiye',
  Germany: 'Almanya',
  'United States': 'Amerika Birleşik Devletleri',
  China: 'Çin',
  France: 'Fransa',
  Spain: 'İspanya',
  'United Kingdom': 'Birleşik Krallık',
  Poland: 'Polonya',
  Italy: 'İtalya',
  Greece: 'Yunanistan',
  Denmark: 'Danimarka',
  Netherlands: 'Hollanda',
  Portugal: 'Portekiz',
  India: 'Hindistan',
  Japan: 'Japonya',
  Brazil: 'Brezilya',
  World: 'Dünya Ortalaması'
};

// Türkçe Sayı Formatlayıcılar (Intl.NumberFormat: binlik ayracı nokta, ondalık ayracı virgül)
const nfTr = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const nfTrInt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

/**
 * 1. ASENKRON VERİ ÇEKME FONKSİYONU (Fetch API)
 * 'data/islenmis_enerji_verisi.json' dosyasını dinamik olarak okur.
 */
async function loadEnergyData() {
  const filePaths = [
    'data/islenmis_enerji_verisi.json',
    '/data/islenmis_enerji_verisi.json',
    './data/islenmis_enerji_verisi.json',
    'public/data/islenmis_enerji_verisi.json'
  ];
  let rawJson = null;

  for (const path of filePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        rawJson = await res.json();
        break;
      }
    } catch {
      // Bir sonraki dosya yolunu dene
    }
  }

  if (!rawJson || !Array.isArray(rawJson)) {
    throw new Error('islenmis_enerji_verisi.json dosyası yüklenemedi!');
  }

  allData = rawJson;
  turkeyData = allData.filter(d => d.Code === 'TUR' || d.Entity === 'Turkey');
  console.log(`✓ Başarıyla ${allData.length} kayıt okundu. Türkiye verisi: ${turkeyData.length} yıl (1965-2025).`);
  return allData;
}

/**
 * 2. KULLANICI HAREKET TERCİHİ KONTROLÜ (prefers-reduced-motion)
 */
function isReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * ==============================================================================
 * 3. GÖRSELLEŞTİRME 01: SCROLLYTELLING ZAMAN SERİSİ ÇİZGİ / ALAN GRAFİĞİ
 * ==============================================================================
 */
function initScrollyChart() {
  const canvas = document.getElementById('scrollyChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const years = turkeyData.map(d => d.Year);

  // Başlangıç (Adım 1): Sadece 1965-1985 arası ve Hidroelektrik + Kömür
  const initYears = years.filter(y => y <= 1985);
  const initData = turkeyData.filter(d => d.Year <= 1985);

  chartScrollyInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: initYears,
      datasets: [
        {
          label: 'Hidroelektrik',
          data: initData.map(d => d.Hydropower),
          borderColor: ENERGY_COLORS.hydro,
          backgroundColor: 'rgba(0, 114, 178, 0.08)',
          borderWidth: 3.5,
          pointRadius: 2.5,
          pointHoverRadius: 6,
          pointBackgroundColor: ENERGY_COLORS.hydro,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür',
          data: initData.map(d => d.Coal),
          borderColor: ENERGY_COLORS.coal,
          backgroundColor: 'rgba(74, 85, 104, 0.08)',
          borderWidth: 3.5,
          pointRadius: 2.5,
          pointHoverRadius: 6,
          pointBackgroundColor: ENERGY_COLORS.coal,
          tension: 0.25,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: isReducedMotion() ? 0 : 700,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: window.innerWidth <= 768 ? 6 : 8,
            padding: window.innerWidth <= 768 ? 6 : 14,
            color: '#cbd5e1',
            font: { family: "'Space Grotesk', sans-serif", size: window.innerWidth <= 768 ? 9.5 : 11, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          borderColor: 'rgba(84, 214, 255, 0.3)',
          borderWidth: 1,
          titleColor: '#54D6FF',
          titleFont: { family: "'JetBrains Mono', monospace", size: 12, weight: 'bold' },
          bodyColor: '#f1f5f9',
          bodyFont: { family: "'Space Grotesk', sans-serif", size: 11 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(ctxVal) {
              return ` ${ctxVal.dataset.label}: ${nfTr.format(ctxVal.parsed.y)} TWh`;
            }
          }
        },
        annotation: {
          annotations: {
            entry1985: {
              type: 'line',
              xMin: 1985,
              xMax: 1985,
              borderColor: 'rgba(84, 214, 255, 0.6)',
              borderWidth: 1.5,
              borderDash: [4, 4],
              label: {
                display: true,
                content: '1985: Kömür Girişi (15,0 TWh)',
                position: 'start',
                backgroundColor: 'rgba(11, 14, 23, 0.88)',
                color: '#54D6FF',
                font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
                padding: 5,
                borderRadius: 4
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: window.innerWidth > 768,
            text: 'Yıl',
            color: '#94a3b8',
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748b',
            font: { family: "'JetBrains Mono', monospace", size: window.innerWidth <= 768 ? 9 : 10 },
            maxTicksLimit: window.innerWidth <= 768 ? 6 : 12
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: window.innerWidth > 768,
            text: 'Elektrik Üretimi (TWh)',
            color: '#94a3b8',
            font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 'bold' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748b',
            font: { family: "'JetBrains Mono', monospace", size: window.innerWidth <= 768 ? 9 : 10 },
            callback: value => `${nfTrInt.format(value)} TWh`
          }
        }
      }
    }
  });
}

/**
 * Scrolly Grafik Konteyneri İçin Güvenli ResizeObserver Mekanizması
 */
let scrollyResizeObserver = null;
function setupScrollyChartResizeObserver() {
  const container = document.querySelector('.scrolly-figure .chart-canvas-container');
  if (!container || typeof ResizeObserver === 'undefined') return;

  if (scrollyResizeObserver) {
    scrollyResizeObserver.disconnect();
  }

  let resizeTimer = null;
  scrollyResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width > 0 && chartScrollyInstance) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!chartScrollyInstance) return;
          const isMobile = window.innerWidth <= 768;
          if (chartScrollyInstance.options.plugins?.legend?.labels) {
            chartScrollyInstance.options.plugins.legend.labels.padding = isMobile ? 6 : 14;
            chartScrollyInstance.options.plugins.legend.labels.boxWidth = isMobile ? 6 : 8;
            chartScrollyInstance.options.plugins.legend.labels.font.size = isMobile ? 9.5 : 11;
          }
          if (chartScrollyInstance.options.scales?.x) {
            if (chartScrollyInstance.options.scales.x.title) {
              chartScrollyInstance.options.scales.x.title.display = !isMobile;
            }
            if (chartScrollyInstance.options.scales.x.ticks) {
              chartScrollyInstance.options.scales.x.ticks.maxTicksLimit = isMobile ? 6 : 12;
              chartScrollyInstance.options.scales.x.ticks.font.size = isMobile ? 9 : 10;
            }
          }
          if (chartScrollyInstance.options.scales?.y) {
            if (chartScrollyInstance.options.scales.y.title) {
              chartScrollyInstance.options.scales.y.title.display = !isMobile;
            }
            if (chartScrollyInstance.options.scales.y.ticks) {
              chartScrollyInstance.options.scales.y.ticks.font.size = isMobile ? 9 : 10;
            }
          }
          chartScrollyInstance.resize();
        }, 50);
      }
    }
  });

  scrollyResizeObserver.observe(container);
}

/**
 * Scrollytelling Adım Güncelleyici (onStepEnter)
 * 6 Adımın grafik dönüşümleri ve Chart.js Annotation Plugin işaretleyicileri
 */
function updateScrollyChartStep(stepIndex) {
  if (!chartScrollyInstance) return;

  const titleEl = document.getElementById('scrollyChartTitle');
  const badgeEl = document.getElementById('scrollyStepBadge');
  const figcaptionEl = document.getElementById('scrollyFigcaption');

  if (badgeEl) badgeEl.textContent = `Adım ${stepIndex + 1} / 6`;

  // Annotation eklentisi güvenliği
  if (!chartScrollyInstance.options.plugins.annotation) {
    chartScrollyInstance.options.plugins.annotation = { annotations: {} };
  }

  switch (stepIndex) {
    case 0:
      // ADIM 1 (1965-1985: Barajlar ve Kömürün İlk Yılları)
      if (titleEl) titleEl.textContent = '1985’te kömür ve hidroelektrik üretimi birbirine yaklaştı';
      if (figcaptionEl) figcaptionEl.textContent = 'Seçilmiş beş kaynak içindeki pay: kömür %55,4, hidroelektrik %44,4. Kaynak: OWID (Ember ve Energy Institute); birim: TWh.';

      const d1 = turkeyData.filter(d => d.Year <= 1985);
      chartScrollyInstance.data.labels = d1.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Hidroelektrik',
          data: d1.map(d => d.Hydropower),
          borderColor: ENERGY_COLORS.hydro,
          borderWidth: 3.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür',
          data: d1.map(d => d.Coal),
          borderColor: ENERGY_COLORS.coal,
          borderWidth: 3.5,
          tension: 0.25,
          fill: false
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        point1985: {
          type: 'point',
          xValue: 1985,
          yValue: 15.03,
          backgroundColor: ENERGY_COLORS.coal,
          borderColor: '#ffffff',
          borderWidth: 2,
          radius: 5
        },
        label1985: {
          type: 'label',
          xValue: 1985,
          yValue: 15.03,
          yAdjust: -18,
          backgroundColor: 'rgba(11, 14, 23, 0.92)',
          content: ['1985: Kömür Girişi', '15,0 TWh (%55,4)'],
          color: '#54D6FF',
          font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
          padding: 4,
          borderRadius: 4
        }
      };
      break;

    case 1:
      // ADIM 2 (1985-2000: Doğalgaz Devrimi)
      if (titleEl) titleEl.textContent = '2000’de doğal gaz üretimi kömürü geçti';
      if (figcaptionEl) figcaptionEl.textContent = 'Doğal gaz 46,5 TWh üreterek kömürü (38,2 TWh) geçti; beş kaynak içindeki payı %40,2 oldu. Kaynak: OWID (Ember ve Energy Institute); birim: TWh.';

      const d2 = turkeyData.filter(d => d.Year <= 2005);
      chartScrollyInstance.data.labels = d2.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Doğalgaz (Kırılma Noktası)',
          data: d2.map(d => d.Gas),
          borderColor: ENERGY_COLORS.gas,
          borderWidth: 4.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür',
          data: d2.map(d => d.Coal),
          borderColor: ENERGY_COLORS.coal,
          borderWidth: 2.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Hidroelektrik',
          data: d2.map(d => d.Hydropower),
          borderColor: ENERGY_COLORS.hydro,
          borderWidth: 2.5,
          tension: 0.25,
          fill: false
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        point2000: {
          type: 'point',
          xValue: 2000,
          yValue: 46.54,
          backgroundColor: ENERGY_COLORS.gas,
          borderColor: '#ffffff',
          borderWidth: 2,
          radius: 6
        },
        label2000: {
          type: 'label',
          xValue: 2000,
          yValue: 46.54,
          xAdjust: -30,
          yAdjust: -24,
          backgroundColor: 'rgba(11, 14, 23, 0.92)',
          content: ['2000: Gaz Kömürü Geçti', '46,5 TWh (%40,2)'],
          color: '#f59e0b',
          font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
          padding: 5,
          borderRadius: 4
        }
      };
      break;

    case 2:
      // ADIM 3 (2000-2014: Artan Talep & Fosil Yakıt Hakimiyeti)
      if (titleEl) titleEl.textContent = 'Fosil üretim 2014’te beş kaynak içinde %80’e ulaştı';
      if (figcaptionEl) figcaptionEl.textContent = '2014 fosil üretimi 196,8 TWh oldu (kömür 76,3 + gaz 120,6); beş kaynak içindeki payı %80,0’dı. Kaynak: OWID (Ember ve Energy Institute); birim: TWh.';

      const d3 = turkeyData.filter(d => d.Year <= 2014);
      chartScrollyInstance.data.labels = d3.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Doğalgaz (Zirve 120,6 TWh)',
          data: d3.map(d => d.Gas),
          borderColor: ENERGY_COLORS.gas,
          borderWidth: 4.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür (Zirve 76,3 TWh)',
          data: d3.map(d => d.Coal),
          borderColor: ENERGY_COLORS.coal,
          borderWidth: 4,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Hidroelektrik (Soldurulmuş)',
          data: d3.map(d => d.Hydropower),
          borderColor: 'rgba(0, 114, 178, 0.35)',
          borderWidth: 1.5,
          tension: 0.25,
          fill: false
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        line2014: {
          type: 'line',
          xMin: 2014,
          xMax: 2014,
          borderColor: 'rgba(239, 68, 68, 0.7)',
          borderWidth: 2,
          borderDash: [5, 4],
          label: {
            display: true,
            content: ['2014: Fosil Zirvesi (%80,0)', 'Gaz: 120,6 TWh • Kömür: 76,3 TWh'],
            position: 'start',
            backgroundColor: 'rgba(11, 14, 23, 0.95)',
            color: '#ef4444',
            font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
            padding: 5,
            borderRadius: 4
          }
        }
      };
      break;

    case 3:
      // ADIM 4 (2006-2020: Rüzgâr Enerjisi Sahneye Çıkıyor)
      if (titleEl) titleEl.textContent = 'Rüzgâr üretimi 2008–2020 arasında yaklaşık 29 kat arttı';
      if (figcaptionEl) figcaptionEl.textContent = 'Rüzgâr üretimi 0,85 TWh’den 24,6 TWh’ye çıktı. Kaynak: OWID (Ember ve Energy Institute); birim: TWh. Dönemsel birliktelik tek başına nedensellik göstermez.';

      chartScrollyInstance.data.labels = turkeyData.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Rüzgâr (2020: 24,6 TWh)',
          data: turkeyData.map(d => d.Wind),
          borderColor: ENERGY_COLORS.wind,
          borderWidth: 4.5,
          pointRadius: 2.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür',
          data: turkeyData.map(d => d.Coal),
          borderColor: 'rgba(74, 85, 104, 0.45)',
          borderWidth: 2,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Doğalgaz',
          data: turkeyData.map(d => d.Gas),
          borderColor: 'rgba(213, 94, 0, 0.45)',
          borderWidth: 2,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Hidroelektrik',
          data: turkeyData.map(d => d.Hydropower),
          borderColor: 'rgba(0, 114, 178, 0.45)',
          borderWidth: 2,
          tension: 0.25,
          fill: false
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        pointWind2020: {
          type: 'point',
          xValue: 2020,
          yValue: 24.61,
          backgroundColor: ENERGY_COLORS.wind,
          borderColor: '#ffffff',
          borderWidth: 2,
          radius: 6
        },
        labelWind2020: {
          type: 'label',
          xValue: 2020,
          yValue: 24.61,
          xAdjust: -35,
          yAdjust: -24,
          backgroundColor: 'rgba(11, 14, 23, 0.92)',
          content: ['2020: Rüzgâr 24,6 TWh', '(12 Yılda 29x Artış)'],
          color: '#009e73',
          font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
          padding: 4,
          borderRadius: 4
        }
      };
      break;

    case 4:
      // ADIM 5 (2014-2025: Güneş Enerjisinde Dikey Patlama)
      if (titleEl) titleEl.textContent = 'Güneş üretimi 2014–2025 arasında 37,3 TWh’ye çıktı';
      if (figcaptionEl) figcaptionEl.textContent = '2025 güneş üretimi 37,3 TWh, rüzgâr üretimi 39,4 TWh oldu. Kaynak: OWID (Ember ve Energy Institute); birim: TWh.';

      chartScrollyInstance.data.labels = turkeyData.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Güneş (2025: 37,3 TWh Rekoru)',
          data: turkeyData.map(d => d.Solar),
          borderColor: ENERGY_COLORS.solar,
          borderWidth: 5,
          pointRadius: 2.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Rüzgâr (2025: 39,4 TWh)',
          data: turkeyData.map(d => d.Wind),
          borderColor: ENERGY_COLORS.wind,
          borderWidth: 3.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Hidroelektrik',
          data: turkeyData.map(d => d.Hydropower),
          borderColor: 'rgba(0, 114, 178, 0.4)',
          borderWidth: 2,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Kömür',
          data: turkeyData.map(d => d.Coal),
          borderColor: 'rgba(74, 85, 104, 0.35)',
          borderWidth: 1.5,
          tension: 0.25,
          fill: false
        },
        {
          label: 'Doğalgaz',
          data: turkeyData.map(d => d.Gas),
          borderColor: 'rgba(213, 94, 0, 0.35)',
          borderWidth: 1.5,
          tension: 0.25,
          fill: false
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        pointSolar2025: {
          type: 'point',
          xValue: 2025,
          yValue: 37.25,
          backgroundColor: ENERGY_COLORS.solar,
          borderColor: '#ffffff',
          borderWidth: 2,
          radius: 6
        },
        labelSolar2025: {
          type: 'label',
          xValue: 2025,
          yValue: 37.25,
          xAdjust: -35,
          yAdjust: -24,
          backgroundColor: 'rgba(11, 14, 23, 0.92)',
          content: ['2025: Güneş 37,3 TWh', '10 Yılda Dikey Zirve'],
          color: '#e69f00',
          font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
          padding: 4,
          borderRadius: 4
        }
      };
      break;

    case 5:
      // ADIM 6 (Büyük Resim: Fosil Yakıtlar vs Yenilenebilir Enerji)
      if (titleEl) titleEl.textContent = '2025’te seçilmiş beş kaynağın %59,9’u fosil üretimdi';
      if (figcaptionEl) figcaptionEl.textContent = '2025: Seçilmiş beş kaynak içinde fosil %59,9; hidro+rüzgâr+güneş %40,1. Kaynak: OWID (Ember ve Energy Institute); birim: TWh.';

      chartScrollyInstance.data.labels = turkeyData.map(d => d.Year);
      chartScrollyInstance.data.datasets = [
        {
          label: 'Toplam Fosil Yakıtlar (Kömür + Gaz)',
          data: turkeyData.map(d => Number((d.Coal + d.Gas).toFixed(1))),
          borderColor: ENERGY_COLORS.fossil,
          backgroundColor: 'rgba(213, 94, 0, 0.12)',
          borderWidth: 4,
          tension: 0.25,
          fill: true
        },
        {
          label: 'Hidro + Rüzgâr + Güneş (seçilmiş kaynaklar)',
          data: turkeyData.map(d => Number((d.Hydropower + d.Wind + d.Solar).toFixed(1))),
          borderColor: ENERGY_COLORS.renewable,
          backgroundColor: 'rgba(0, 158, 115, 0.14)',
          borderWidth: 4,
          tension: 0.25,
          fill: true
        }
      ];

      chartScrollyInstance.options.plugins.annotation.annotations = {
        drought2021: {
          type: 'line',
          xMin: 2021,
          xMax: 2021,
          borderColor: 'rgba(245, 158, 11, 0.8)',
          borderWidth: 1.5,
          borderDash: [4, 4],
          label: {
            display: true,
            content: '2021: Kuraklık & Gaz Sıçraması',
            position: 'start',
            backgroundColor: 'rgba(11, 14, 23, 0.92)',
            color: '#f59e0b',
            font: { family: "'JetBrains Mono', monospace", size: 9, weight: 'bold' },
            padding: 4
          }
        },
        gap2025: {
          type: 'label',
          xValue: 2025,
          yValue: 199.76,
          xAdjust: -35,
          yAdjust: -18,
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          content: ['5 kaynak içinde fosil %59,9', 'Hidro + rüzgâr + güneş %40,1'],
          color: '#54D6FF',
          font: { family: "'JetBrains Mono', monospace", size: 10, weight: 'bold' },
          padding: 5,
          borderRadius: 4
        }
      };
      break;

    default:
      break;
  }

  chartScrollyInstance.update();
}

/**
 * ==============================================================================
 * 4. GÖRSELLEŞTİRME 02: SIRALANMIŞ YATAY ÇUBUK GRAFİK (Horizontal Bar Chart)
 * 2024 yılında seçilen tüm ülkeler ve Dünya'nın rüzgâr + güneş payı sıralaması
 * Payda: 5 Seçilmiş Kaynak Toplamı (Kömür + Gaz + Hidro + Rüzgâr + Güneş)
 * ==============================================================================
 */
function initRankedBarsChart() {
  const canvas = document.getElementById('chartRankedBars');
  if (!canvas || !allData || allData.length === 0) return;

  const ctx = canvas.getContext('2d');
  const data2024 = allData.filter(d => d.Year === 2024);

  const rankedItems = data2024.map(d => {
    const wind = d.Wind || 0;
    const solar = d.Solar || 0;
    const windSolar = wind + solar;
    const fiveTotal = (d.Coal || 0) + (d.Gas || 0) + (d.Hydropower || 0) + wind + solar;
    const share = fiveTotal > 0 ? (windSolar / fiveTotal) * 100 : 0;
    const isTurkey = d.Entity === 'Turkey';
    const isWorld = d.Entity === 'World';

    let color = 'rgba(121, 128, 138, 0.7)'; // Diğer ülkeler (Nötr / gri)
    let borderColor = 'rgba(255, 255, 255, 0.2)';
    if (isTurkey) {
      color = '#54D6FF'; // Türkiye (Neon Camgöbeği)
      borderColor = '#ffffff';
    } else if (isWorld) {
      color = '#e69f00'; // Dünya Ortalaması (Kehribar)
      borderColor = '#ffd166';
    }

    return {
      entity: d.Entity,
      nameTr: COUNTRY_TR_NAMES[d.Entity] || d.Entity,
      windSolar: Number(windSolar.toFixed(2)),
      fiveTotal: Number(fiveTotal.toFixed(2)),
      share: Number(share.toFixed(1)),
      color,
      borderColor,
      isTurkey,
      isWorld
    };
  });

  // Pay oranına göre büyükten küçüğe sırala
  rankedItems.sort((a, b) => b.share - a.share);

  if (_chartRankedInstance) {
    _chartRankedInstance.destroy();
  }

  _chartRankedInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rankedItems.map(item => item.nameTr),
      datasets: [
        {
          label: '2024 Rüzgâr + Güneş Payı (%)',
          data: rankedItems.map(item => item.share),
          backgroundColor: rankedItems.map(item => item.color),
          borderColor: rankedItems.map(item => item.borderColor),
          borderWidth: rankedItems.map(item => (item.isTurkey || item.isWorld ? 2 : 1)),
          borderRadius: 6,
          barThickness: 13
        }
      ]
    },
    options: {
      indexAxis: 'y', // Yatay Çubuk
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          titleFont: { family: "'Space Grotesk', sans-serif", size: 12, weight: 'bold' },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          callbacks: {
            label: function(ctxVal) {
              const item = rankedItems[ctxVal.dataIndex];
              return [
                ` Rüzgâr+Güneş Payı: %${nfTr.format(item.share)} (5 Kaynak İçi)`,
                ` Üretim: ${nfTr.format(item.windSolar)} TWh / 5 Kaynak: ${nfTr.format(item.fiveTotal)} TWh`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Rüzgâr + Güneş Payı (% - Payda: 5 Kaynak Toplamı)',
            color: '#94a3b8',
            font: { family: "'Space Grotesk', sans-serif", size: 11 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748b',
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: val => `%${val}`
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            color: ctxVal => {
              const item = rankedItems[ctxVal.index];
              if (item?.isTurkey) return '#54D6FF';
              if (item?.isWorld) return '#e69f00';
              return '#cbd5e1';
            },
            font: ctxVal => {
              const item = rankedItems[ctxVal.index];
              return {
                family: "'Space Grotesk', sans-serif",
                size: 11,
                weight: item?.isTurkey || item?.isWorld ? 'bold' : 'normal'
              };
            }
          }
        }
      }
    }
  });
}

/**
 * ==============================================================================
 * 5. GÖRSELLEŞTİRME 03: YIĞILMIŞ ÇUBUK GRAFİK (Stacked Bar Chart)
 * 1990, 2000, 2010 ve 2025: Fosil vs Yenilenebilir Dönüşümü
 * ==============================================================================
 */
function initStackedBarsChart() {
  const canvas = document.getElementById('chartStackedBars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const targetYears = [1990, 2000, 2010, 2025];
  const yearRecords = targetYears.map(y => turkeyData.find(d => d.Year === y) || {});

  const fossilData = yearRecords.map(d => Number(((d.Coal || 0) + (d.Gas || 0)).toFixed(1)));
  const renewableData = yearRecords.map(d => Number(((d.Hydropower || 0) + (d.Wind || 0) + (d.Solar || 0)).toFixed(1)));

  _chartStackedInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: targetYears.map(String),
      datasets: [
        {
          label: 'Fosil Yakıtlar (Kömür + Gaz)',
          data: fossilData,
          backgroundColor: ENERGY_COLORS.fossil,
          borderRadius: 4
        },
        {
          label: 'Yenilenebilir Enerji (Hidro + Rüzgâr + Güneş)',
          data: renewableData,
          backgroundColor: ENERGY_COLORS.renewable,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
            padding: 12,
            color: '#cbd5e1',
            font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          titleFont: { family: "'JetBrains Mono', monospace", size: 12, weight: 'bold' },
          bodyFont: { family: "'Space Grotesk', sans-serif", size: 11 },
          callbacks: {
            label: function(ctxVal) {
              const val = ctxVal.parsed.y;
              return ` ${ctxVal.dataset.label}: ${nfTr.format(val)} TWh`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#cbd5e1', font: { family: "'JetBrains Mono', monospace", size: 11, weight: 'bold' } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Toplam Üretim (TWh)',
            color: '#94a3b8',
            font: { family: "'Space Grotesk', sans-serif", size: 11 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
        }
      }
    }
  });
}

/**
 * ==============================================================================
 * 6. GÖRSELLEŞTİRME 04: 2025 PARÇA-BÜTÜN HALKA GRAFİĞİ (Doughnut Chart)
 * 2025 Türkiye Elektrik Karması: Fosil (%59,9) vs Yenilenebilir (%40,1)
 * ==============================================================================
 */
function initDonutChart() {
  const canvas = document.getElementById('chartDonut2025');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const d2025 = turkeyData.find(d => d.Year === 2025) || turkeyData[turkeyData.length - 1];

  const fossilVal = Number((d2025.Coal + d2025.Gas).toFixed(1)); // 199.8 TWh
  const renewVal = Number((d2025.Hydropower + d2025.Wind + d2025.Solar).toFixed(1)); // 133.9 TWh
  const total = fossilVal + renewVal; // 333.7 TWh

  _chartDonutInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Fosil Yakıtlar (Kömür + Gaz)',
        'Yenilenebilir Enerji (Hidro + Rüzgâr + Güneş)'
      ],
      datasets: [
        {
          data: [fossilVal, renewVal],
          backgroundColor: [ENERGY_COLORS.fossil, ENERGY_COLORS.renewable],
          borderColor: '#0b0e17',
          borderWidth: 3,
          hoverOffset: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            padding: 12,
            color: '#cbd5e1',
            font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          titleFont: { family: "'Space Grotesk', sans-serif", size: 12, weight: 'bold' },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          callbacks: {
            label: function(ctxVal) {
              const val = ctxVal.parsed;
              const pct = nfTr.format((val / total) * 100);
              return ` ${ctxVal.label}: ${nfTr.format(val)} TWh (%${pct})`;
            }
          }
        }
      }
    }
  });
}

/**
 * ==============================================================================
 * 7. GÖRSELLEŞTİRME 05: OKUYUCU ETKİLEŞİMLİ KARŞILAŞTIRMA GRAFİĞİ (Interactive Chart)
 * Ülke seçimi, enerji kaynağı ve zaman kaydırıcıları ile dinamik çizim
 * ==============================================================================
 */
function getSourceValue(record, sourceKey) {
  if (!record) return null;
  switch (sourceKey) {
    case 'Coal': return record.Coal !== null && record.Coal !== undefined ? record.Coal : null;
    case 'Gas': return record.Gas !== null && record.Gas !== undefined ? record.Gas : null;
    case 'Hydropower': return record.Hydropower !== null && record.Hydropower !== undefined ? record.Hydropower : null;
    case 'Wind': return record.Wind !== null && record.Wind !== undefined ? record.Wind : null;
    case 'Solar': return record.Solar !== null && record.Solar !== undefined ? record.Solar : null;
    case 'Renewable': {
      const h = record.Hydropower;
      const w = record.Wind;
      const s = record.Solar;
      if (h === null && w === null && s === null) return null;
      return Number(((h || 0) + (w || 0) + (s || 0)).toFixed(1));
    }
    case 'Fossil': {
      const c = record.Coal;
      const g = record.Gas;
      if (c === null && g === null) return null;
      return Number(((c || 0) + (g || 0)).toFixed(1));
    }
    default: return null;
  }
}

function getSourceLabel(sourceKey) {
  const map = {
    'Renewable': 'Hidro + Rüzgâr + Güneş',
    'Wind': 'Rüzgâr Enerjisi',
    'Solar': 'Güneş Enerjisi',
    'Coal': 'Kömür',
    'Gas': 'Doğalgaz',
    'Hydropower': 'Hidroelektrik'
  };
  return map[sourceKey] || sourceKey;
}

function updateComparisonChart() {
  if (!chartComparisonInstance) return;

  const compareCountryData = allData.filter(d => d.Entity === selectedCountry);
  const years = [];
  for (let y = startYearVal; y <= endYearVal; y++) {
    years.push(y);
  }

  const turkeyValues = years.map(y => {
    const rec = turkeyData.find(d => d.Year === y);
    return getSourceValue(rec, selectedSource);
  });

  const compareValues = years.map(y => {
    const rec = compareCountryData.find(d => d.Year === y);
    return getSourceValue(rec, selectedSource);
  });

  chartComparisonInstance.data.labels = years;
  chartComparisonInstance.data.datasets = [
    {
      label: `Türkiye • ${getSourceLabel(selectedSource)}`,
      data: turkeyValues,
      borderColor: ENERGY_COLORS.turkeyAccent,
      backgroundColor: 'rgba(84, 214, 255, 0.08)',
      borderWidth: 3.5,
      pointRadius: 2,
      pointHoverRadius: 6,
      tension: 0.25,
      spanGaps: false,
      fill: false
    },
    {
      label: `${COUNTRY_TR_NAMES[selectedCountry] || selectedCountry} • ${getSourceLabel(selectedSource)}`,
      data: compareValues,
      borderColor: ENERGY_COLORS.compareAccent,
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      borderWidth: 2.5,
      borderDash: [6, 4], // Kesikli çizgi
      pointRadius: 2,
      pointHoverRadius: 6,
      tension: 0.25,
      spanGaps: false,
      fill: false
    }
  ];

  chartComparisonInstance.update();
}

function initComparisonChart() {
  const canvas = document.getElementById('chartComparison');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  chartComparisonInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: isReducedMotion() ? 0 : 500
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 14,
            color: '#cbd5e1',
            font: { family: "'Space Grotesk', sans-serif", size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 14, 23, 0.95)',
          titleFont: { family: "'JetBrains Mono', monospace", size: 12, weight: 'bold' },
          bodyFont: { family: "'Space Grotesk', sans-serif", size: 11 },
          callbacks: {
            label: function(ctxVal) {
              return ` ${ctxVal.dataset.label}: ${nfTr.format(ctxVal.parsed.y)} TWh`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Yıl',
            color: '#94a3b8',
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Üretim (TWh)',
            color: '#94a3b8',
            font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 'bold' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748b',
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: value => `${nfTrInt.format(value)} TWh`
          }
        }
      }
    }
  });

  // İlk çizim
  updateComparisonChart();

  // Kontrol Dinleyicileri
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) {
    countrySelect.addEventListener('change', e => {
      selectedCountry = e.target.value;
      updateComparisonChart();
    });
  }

  const sourceBtns = document.querySelectorAll('.btn-source');
  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      selectedSource = btn.getAttribute('data-source');
      updateComparisonChart();
    });
  });

  const startSlider = document.getElementById('startYear');
  const endSlider = document.getElementById('endYear');
  const rangeDisplay = document.getElementById('yearRangeDisplay');

  function handleYearRangeChange() {
    let s = parseInt(startSlider.value, 10);
    let e = parseInt(endSlider.value, 10);
    if (s >= e) {
      s = e - 1;
      startSlider.value = s;
    }
    startYearVal = s;
    endYearVal = e;
    if (rangeDisplay) {
      rangeDisplay.textContent = `${s} – ${e}`;
    }
    updateComparisonChart();
  }

  if (startSlider && endSlider) {
    startSlider.addEventListener('input', handleYearRangeChange);
    endSlider.addEventListener('input', handleYearRangeChange);
  }
}

/**
 * ==============================================================================
 * 8. SCROLLAMA KURULUMU & ADIM YÖNETİMİ
 * ==============================================================================
 */
function getScrollamaOffset() {
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  return isMobile ? 0.65 : 0.5;
}

function updateActiveStepOnScroll() {
  const steps = document.querySelectorAll('.scrolly-article .step');
  if (!steps || !steps.length) return;

  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  const triggerY = window.innerHeight * (isMobile ? 0.65 : 0.5);

  let bestStepIndex = -1;
  let minDistance = Infinity;

  steps.forEach((step, idx) => {
    const rect = step.getBoundingClientRect();
    // A step is eligible when its top has reached the trigger line and bottom is still visible
    if (rect.top <= triggerY + 50 && rect.bottom >= (isMobile ? 60 : 40)) {
      const dist = Math.abs(rect.top - triggerY);
      if (dist < minDistance) {
        minDistance = dist;
        bestStepIndex = idx;
      }
    }
  });

  if (bestStepIndex !== -1) {
    const currentActive = document.querySelector('.scrolly-article .step.is-active');
    const targetStep = steps[bestStepIndex];
    if (currentActive !== targetStep) {
      steps.forEach(s => s.classList.remove('is-active'));
      targetStep.classList.add('is-active');
      updateScrollyChartStep(bestStepIndex);
    }
  }
}

function initScrollamaEngine() {
  window.addEventListener('scroll', updateActiveStepOnScroll, { passive: true });

  if (typeof scrollama === 'undefined') {
    console.warn('Scrollama kütüphanesi henüz yüklenmedi, IntersectionObserver yedekleniyor.');
    initIntersectionObserverFallback();
    return;
  }

  scrollerInstance = scrollama();

  scrollerInstance
    .setup({
      step: '.scrolly-article .step',
      offset: getScrollamaOffset(),
      debug: false
    })
    .onStepEnter(response => {
      const steps = document.querySelectorAll('.scrolly-article .step');
      steps.forEach(s => s.classList.remove('is-active'));
      response.element.classList.add('is-active');

      updateScrollyChartStep(response.index);
    });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (scrollerInstance) scrollerInstance.resize();
    }, 100);
  });
}

function initIntersectionObserverFallback() {
  const steps = document.querySelectorAll('.scrolly-article .step');
  const isMobile = window.innerWidth <= 768;
  const rootMargin = isMobile ? '-35% 0px -35% 0px' : '-30% 0px -30% 0px';
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.forEach(s => s.classList.remove('is-active'));
        entry.target.classList.add('is-active');
        const stepNum = parseInt(entry.target.getAttribute('data-step') || '1', 10);
        updateScrollyChartStep(stepNum - 1);
      }
    });
  }, {
    root: null,
    rootMargin: rootMargin,
    threshold: 0.1
  });

  steps.forEach(el => observer.observe(el));
}

function initExplorationChartsWhenVisible() {
  const exploration = document.getElementById('exploration');
  if (!exploration) return;

  let initialized = false;
  const initialize = () => {
    if (initialized) return;
    initialized = true;
    initRankedBarsChart();
    initStackedBarsChart();
    initDonutChart();
    initComparisonChart();
  };

  if (!('IntersectionObserver' in window)) {
    initialize();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      initialize();
      observer.disconnect();
    }
  }, { rootMargin: '350px 0px' });
  observer.observe(exploration);
}

/**
 * ==============================================================================
 * 9. UYGULAMA GİRİŞ NOKTASI (DOMContentLoaded)
 * ==============================================================================
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadEnergyData();
    initScrollyChart();
    setupScrollyChartResizeObserver();
    initScrollamaEngine();
    initExplorationChartsWhenVisible();
    console.log('✓ Tüm veri görselleştirme bileşenleri ve eklentileri başarıyla başlatıldı.');
  } catch (error) {
    console.error('Hata: Uygulama başlatılamadı:', error);
  }
});
