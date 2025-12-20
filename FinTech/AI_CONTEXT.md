# AI Context - Web Şube 2.0 İnteraktif Kredi Projesi

## Proje Tipi
- **Framework:** C# Razor Pages (.NET 8+)
- **Styling:** SCSS (Özel Tasarım - Bootstrap/Tailwind YASAK)
- **JavaScript:** jQuery
- **API Test Ortamı:** WebSube-API (Next.js)

---

## Kritik Kurallar

### 1. İsimlendirme Kuralları
| Alan | Format | Örnek |
|------|--------|-------|
| CSS Class / ID | snake_case | `.credit_amount_input` |
| JS Değişkenleri | snake_case | `let total_interest = 0;` |
| JS Fonksiyonları | snake_case | `function calculate_payment()` |
| Resim Dosyaları | snake_case | `bank_logo_white.png` |
| Razor Dosyaları | PascalCase | `ApplicationForm.cshtml` |
| C# Property | PascalCase | `public decimal LoanAmount` |

### 2. BEM Metodolojisi (snake_case)
```
Blok: .loan_card
Eleman: .loan_card__header (iki alt çizgi)
Durum: .loan_card--approved (iki tire)
```

### 3. Yasaklar
- ❌ Bootstrap, Tailwind veya herhangi bir CSS framework
- ❌ `!important` kullanımı
- ❌ HTML etiketine doğrudan stil (`div { }`)
- ❌ 3 seviyeden fazla nesting
- ❌ `.cshtml` içinde veritabanı sorgusu
- ❌ `float` veya `double` ile para hesaplama (decimal kullan)
- ❌ `@Html.Raw()` ile kullanıcı verisi basma
- ❌ Canlıda `console.log` veya `debugger`

---

## Dosya Yapısı

```
FinTech/
├── Pages/                      # Razor Sayfaları
│   ├── Shared/                 # Layout, Partial View
│   │   ├── _Layout.cshtml
│   │   └── _ValidationScriptsPartial.cshtml
│   ├── Index.cshtml            # Ana sayfa
│   ├── Login.cshtml            # Giriş
│   ├── Dashboard.cshtml        # Panel
│   ├── KrediBasvuru.cshtml     # Kredi başvuru
│   └── Profil.cshtml           # Profil yönetimi
├── Styles/                     # SCSS Dosyaları
│   ├── abstracts/              # _variables.scss, _mixins.scss
│   ├── base/                   # _reset.scss, _typography.scss
│   ├── components/             # _buttons.scss, _forms.scss, _cards.scss
│   ├── pages/                  # Sayfaya özel stiller
│   └── main.scss               # Ana import dosyası
├── wwwroot/
│   ├── css/                    # Derlenmiş CSS
│   ├── js/                     # JavaScript dosyaları
│   └── img/                    # Görseller
└── Program.cs
```

---

## API Endpoint'leri

WebSube-API test ortamı endpoint'leri:

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/ep/tckn-gsm` | POST | TCKN ve GSM doğrulama |
| `/api/ep/kvkk-text/{id}` | GET | KVKK metni getirme |
| `/api/ep/kvkk-onay` | POST | KVKK onay |
| `/api/ep/generate-otp` | POST | OTP üretme |
| `/api/ep/send-otp-sms` | POST | SMS gönderme |
| `/api/ep/verify-otp` | POST | OTP doğrulama |
| `/api/ep/customer-address/{customerId}` | GET | Müşteri adresi |
| `/api/ep/customer-job-info/{customerId}` | GET | İş bilgisi |
| `/api/ep/customer-job-profile` | POST | İş profili kaydet |
| `/api/ep/customer-finance-assets/{customerId}` | GET | Finansal varlıklar |

---

## Kullanıcı Akışı (Flow)

```
1. TCKN/GSM Girişi → 2. KVKK Onay → 3. OTP Doğrulama → 
4. Dashboard → 5. Raporlar/Profil İşlemleri
```

---

## Referans Veriler

### Sektör ID'leri (sektor_id.json)
| ID | Sektör |
|----|--------|
| 1 | Kamu Çalışanıyım |
| 2 | Özel Sektör Çalışanıyım |
| 3 | İşyerim var / Ortağım |
| 4 | Emekliyim |
| 5 | Emekliyim ve Çalışıyorum |
| 6 | Çiftçiyim |
| 7 | Çalışmıyorum |
| 8 | Freelancer Olarak Çalışıyorum |

### Meslek ID'leri (job_id.json)
70+ meslek tanımı mevcut. Örnek: Doktor(5), Mühendis(46), Öğretmen(95)

---

## jQuery Standartları

### Selector Caching
```javascript
// DOĞRU
var $apply_btn = $('#apply_btn');
$apply_btn.prop('disabled', true);

// YANLIŞ - Her seferinde DOM taraması
$('#apply_btn').prop('disabled', true);
$('#apply_btn').on('click', fn);
```

### Event Delegation
```javascript
$(document).on('click', '.dynamic_option', function() {
    // Dinamik elementler için
});
```

### Double Submit Prevention
```javascript
$('#loan_form').on('submit', function() {
    var $btn = $(this).find('#submit_btn');
    $btn.prop('disabled', true).text('İşleniyor...');
});
```

---

## Notlar
- Tüm mantık `.cshtml.cs` (PageModel) içinde olmalı
- Para değerleri için `decimal` tipi zorunlu
- Log'larda TCKN/Telefon maskelenmeli: `12*******90`
- Input masking: `10000` → `10.000 ₺`

