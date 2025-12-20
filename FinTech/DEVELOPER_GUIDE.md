# Geliştirici Kılavuzu - Web Şube 2.0 İnteraktif Kredi

## İçindekiler
1. [Proje Hakkında](#proje-hakkında)
2. [Teknoloji Yığını](#teknoloji-yığını)
3. [Klasör Yapısı](#klasör-yapısı)
4. [İsimlendirme Kuralları](#isimlendirme-kuralları)
5. [SCSS Mimarisi](#scss-mimarisi)
6. [JavaScript/jQuery Standartları](#javascriptjquery-standartları)
7. [Razor Pages Kuralları](#razor-pages-kuralları)
8. [API Entegrasyonu](#api-entegrasyonu)
9. [Güvenlik Standartları](#güvenlik-standartları)
10. [Performans Optimizasyonu](#performans-optimizasyonu)
11. [Kalite Kontrol Listesi](#kalite-kontrol-listesi)

---

## Proje Hakkında

**Web Şube 2.0 (İnteraktif Şube)** projesi, kullanıcıların kredi başvurusu yapabildiği, profil bilgilerini yönetebildiği ve finansal raporlarını görüntüleyebildiği interaktif bir dijital bankacılık deneyimi sunmayı hedeflemektedir.

### Hedefler
- Kullanıcı dostu, modern ve akıcı bir arayüz
- Güvenli kredi başvuru süreci
- İnteraktif form deneyimi (micro-interactions)
- Yüksek performans ve SEO puanı

### Kullanıcı Akışı
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  TCKN/GSM   │───▶│  KVKK Onay  │───▶│    OTP      │
│   Girişi    │    │             │    │  Doğrulama  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Profil    │◀───│  Dashboard  │◀───│   Raporlar  │
│  Yönetimi   │    │  (Ana Ekran)│    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## Teknoloji Yığını

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| .NET Core | 8+ | Backend Framework |
| C# Razor Pages | - | Sayfa Yapısı |
| SCSS | - | Stil Yönetimi |
| jQuery | 3.x | DOM Manipülasyonu |

### Kullanılmayacak Teknolojiler
- ❌ Bootstrap
- ❌ Tailwind CSS
- ❌ Herhangi bir CSS Framework

**Not:** Tüm stiller özel olarak SCSS ile yazılacaktır.

---

## Klasör Yapısı

```
FinTech/
│
├── Pages/                          # Razor Sayfaları (.cshtml)
│   ├── Shared/                     # Paylaşılan bileşenler
│   │   ├── _Layout.cshtml          # Ana layout
│   │   ├── _Layout.cshtml.css      # Layout-specific CSS
│   │   ├── _ValidationScriptsPartial.cshtml
│   │   ├── _Header.cshtml          # Header partial
│   │   ├── _Footer.cshtml          # Footer partial
│   │   └── _Sidebar.cshtml         # Sidebar partial
│   │
│   ├── Index.cshtml                # Ana sayfa
│   ├── Index.cshtml.cs             # Ana sayfa model
│   ├── Login.cshtml                # Giriş sayfası
│   ├── Login.cshtml.cs
│   ├── Dashboard.cshtml            # Panel
│   ├── Dashboard.cshtml.cs
│   ├── KrediBasvuru.cshtml         # Kredi başvuru
│   ├── KrediBasvuru.cshtml.cs
│   ├── Profil.cshtml               # Profil yönetimi
│   ├── Profil.cshtml.cs
│   ├── Raporlar.cshtml             # Raporlar
│   └── Raporlar.cshtml.cs
│
├── Styles/                         # SCSS Dosyaları (Derlenmemiş)
│   ├── abstracts/                  # Değişkenler, Mixinler (Çıktı üretmez)
│   │   ├── _variables.scss         # Renk, font, spacing değişkenleri
│   │   └── _mixins.scss            # Tekrar kullanılabilir mixin'ler
│   │
│   ├── base/                       # Temel stiller
│   │   ├── _reset.scss             # CSS Reset
│   │   └── _typography.scss        # Tipografi ayarları
│   │
│   ├── components/                 # Bileşen stilleri
│   │   ├── _buttons.scss           # Buton varyasyonları
│   │   ├── _forms.scss             # Form elemanları
│   │   ├── _cards.scss             # Kart bileşenleri
│   │   ├── _modals.scss            # Modal/Dialog
│   │   └── _navigation.scss        # Navigasyon
│   │
│   ├── pages/                      # Sayfaya özel stiller
│   │   ├── _login.scss
│   │   ├── _dashboard.scss
│   │   ├── _kredi_basvuru.scss
│   │   └── _profil.scss
│   │
│   └── main.scss                   # Tüm importların yapıldığı dosya
│
├── wwwroot/                        # Statik dosyalar (Client'a giden)
│   ├── css/                        # Derlenmiş ve minify edilmiş CSS
│   │   └── site.css
│   ├── js/                         # JavaScript dosyaları
│   │   ├── site.js                 # Ana JS
│   │   └── helpers/
│   │       ├── form_helpers.js     # Form yardımcıları
│   │       ├── input_masks.js      # Input maskeleme
│   │       └── api_client.js       # API çağrıları
│   ├── img/                        # Görseller
│   └── lib/                        # 3. parti kütüphaneler
│       └── jquery/
│
├── appsettings.json                # Uygulama ayarları
├── appsettings.Development.json    # Development ayarları
├── Program.cs                      # Uygulama giriş noktası
├── AI_CONTEXT.md                   # AI için context dosyası
└── DEVELOPER_GUIDE.md              # Bu dosya
```

---

## İsimlendirme Kuralları

### Frontend (HTML/CSS/JS) - snake_case

```scss
// CSS Class İsimlendirme
.credit_form { }
.credit_form__input { }
.credit_form__button { }
.credit_form--disabled { }
```

```javascript
// JavaScript Değişken ve Fonksiyonlar
let total_amount = 0;
let monthly_payment = 0;

function calculate_interest() { }
function validate_tckn() { }
function format_currency(value) { }
```

### Backend (C#) - PascalCase

```csharp
// Model Property'leri
public class LoanApplication
{
    public decimal LoanAmount { get; set; }
    public int InstallmentCount { get; set; }
    public decimal InterestRate { get; set; }
}

// PageModel
public class KrediBasvuruModel : PageModel
{
    public async Task<IActionResult> OnPostAsync() { }
}
```

### Dosya İsimlendirme

| Dosya Tipi | Format | Örnek |
|------------|--------|-------|
| Razor Pages | PascalCase | `KrediBasvuru.cshtml` |
| SCSS Dosyaları | snake_case | `_kredi_basvuru.scss` |
| JavaScript | snake_case | `form_helpers.js` |
| Görseller | snake_case | `bank_logo_dark.png` |

---

## SCSS Mimarisi

### BEM Metodolojisi (snake_case Uyarlaması)

```scss
// Block (Blok)
.loan_card { }

// Element (Eleman) - İki alt çizgi
.loan_card__header { }
.loan_card__body { }
.loan_card__footer { }

// Modifier (Durum) - İki tire
.loan_card--approved { }
.loan_card--pending { }
.loan_card--rejected { }
```

### Örnek Buton Bileşeni

```scss
// Styles/components/_buttons.scss

.btn_primary {
    background-color: $brand_color;
    color: $white;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: darken($brand_color, 10%);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    // Varyasyon
    &--full_width {
        width: 100%;
        display: block;
    }

    &--loading {
        position: relative;
        color: transparent;
        
        &::after {
            content: '';
            position: absolute;
            // loading spinner stilleri
        }
    }
}
```

### Yasaklar

```scss
// ❌ YANLIŞ - HTML etiketine doğrudan stil
div {
    padding: 20px;
}

// ✅ DOĞRU - Class kullan
.container {
    padding: 20px;
}

// ❌ YANLIŞ - !important kullanımı
.form_input {
    border-color: red !important;
}

// ✅ DOĞRU - Specificity ile çöz
.form_input.form_input--error {
    border-color: red;
}

// ❌ YANLIŞ - 3+ seviye nesting
.card {
    .header {
        .title {
            .icon {
                // Çok derin
            }
        }
    }
}

// ✅ DOĞRU - BEM ile düz yapı
.card { }
.card__header { }
.card__title { }
.card__icon { }
```

---

## JavaScript/jQuery Standartları

### Selector Caching (Zorunlu)

```javascript
// ❌ YANLIŞ - Her seferinde DOM taraması
$('#submit_btn').prop('disabled', true);
$('#submit_btn').text('Gönderiliyor...');
$('#submit_btn').addClass('btn--loading');

// ✅ DOĞRU - Bir kez seç, değişkende tut
var $submit_btn = $('#submit_btn');
$submit_btn.prop('disabled', true);
$submit_btn.text('Gönderiliyor...');
$submit_btn.addClass('btn--loading');
```

### Event Delegation

```javascript
// ❌ YANLIŞ - Dinamik elementler çalışmaz
$('.installment_option').on('click', function() {
    select_installment($(this));
});

// ✅ DOĞRU - Event delegation
$(document).on('click', '.installment_option', function() {
    select_installment($(this));
});
```

### Double Submit Prevention (Form Güvenliği)

```javascript
$('#loan_form').on('submit', function(e) {
    var $form = $(this);
    var $submit_btn = $form.find('[type="submit"]');
    
    // Zaten gönderiliyorsa engelle
    if ($form.data('submitting')) {
        e.preventDefault();
        return false;
    }
    
    // Gönderim başladı
    $form.data('submitting', true);
    $submit_btn
        .prop('disabled', true)
        .text('İşleniyor...')
        .addClass('btn--loading');
});
```

### Input Masking (Para Formatı)

```javascript
function format_currency(input) {
    var $input = $(input);
    var value = $input.val().replace(/\D/g, '');
    
    if (value) {
        value = parseInt(value, 10);
        $input.val(value.toLocaleString('tr-TR') + ' ₺');
    }
}

// Kullanım
$(document).on('input', '.form_input--currency', function() {
    format_currency(this);
});
```

---

## Razor Pages Kuralları

### Logic Ayrımı

```csharp
// ❌ YANLIŞ - View içinde veritabanı sorgusu
@{
    var customers = _dbContext.Customers.ToList(); // YASAK!
}

// ✅ DOĞRU - PageModel içinde
public class DashboardModel : PageModel
{
    private readonly ICustomerService _customerService;
    
    public List<Customer> Customers { get; set; }
    
    public async Task OnGetAsync()
    {
        Customers = await _customerService.GetAllAsync();
    }
}
```

### Tag Helpers Kullanımı

```html
<!-- Input için -->
<input asp-for="LoanAmount" class="form_input form_input--currency" />

<!-- Validation için -->
<span asp-validation-for="LoanAmount" class="form_message form_message--error"></span>

<!-- Form için -->
<form asp-page-handler="Submit" method="post">
    @Html.AntiForgeryToken()
    <!-- form içeriği -->
</form>
```

---

## API Entegrasyonu

### API Endpoint'leri

| Endpoint | Method | Açıklama | Request Body |
|----------|--------|----------|--------------|
| `/api/ep/tckn-gsm` | POST | TCKN/GSM doğrulama | `{ tckn, gsm }` |
| `/api/ep/kvkk-text/{id}` | GET | KVKK metni | - |
| `/api/ep/kvkk-onay` | POST | KVKK onay | `{ kvkkId, approved }` |
| `/api/ep/generate-otp` | POST | OTP üret | `{ gsm }` |
| `/api/ep/send-otp-sms` | POST | SMS gönder | `{ gsm }` |
| `/api/ep/verify-otp` | POST | OTP doğrula | `{ gsm, otpCode }` |
| `/api/ep/customer-address/{id}` | GET | Adres bilgisi | - |
| `/api/ep/customer-job-info/{id}` | GET | İş bilgisi | - |
| `/api/ep/customer-job-profile` | POST | İş profili kaydet | `{ customerId, jobGroupId, ... }` |

### API Client Örneği (JavaScript)

```javascript
// wwwroot/js/helpers/api_client.js

var api_client = {
    base_url: '/api/ep',
    
    post: function(endpoint, data) {
        return $.ajax({
            url: this.base_url + endpoint,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    },
    
    get: function(endpoint) {
        return $.ajax({
            url: this.base_url + endpoint,
            method: 'GET'
        });
    },
    
    verify_tckn_gsm: function(tckn, gsm) {
        return this.post('/tckn-gsm', { tckn: tckn, gsm: gsm });
    },
    
    verify_otp: function(gsm, otp_code) {
        return this.post('/verify-otp', { gsm: gsm, otpCode: otp_code });
    }
};
```

---

## Güvenlik Standartları

### Veri Tipleri (Kritik)

```csharp
// ❌ YANLIŞ - Kesinlik kaybı riski
public float LoanAmount { get; set; }
public double InterestRate { get; set; }

// ✅ DOĞRU - Parasal değerler için decimal
public decimal LoanAmount { get; set; }
public decimal InterestRate { get; set; }
```

### Veri Maskeleme (Logging)

```csharp
// ❌ YANLIŞ - Plain text loglama
_logger.LogInformation($"TCKN: {customer.Tckn}, Tel: {customer.Phone}");

// ✅ DOĞRU - Maskelenmiş loglama
_logger.LogInformation($"TCKN: {MaskTckn(customer.Tckn)}, Tel: {MaskPhone(customer.Phone)}");
// Çıktı: "TCKN: 12*******90, Tel: 555***2233"
```

### XSS Koruması

```html
<!-- ❌ YANLIŞ - XSS açığı -->
@Html.Raw(Model.UserInput)

<!-- ✅ DOĞRU - Otomatik encoding -->
@Model.UserInput
```

---

## Performans Optimizasyonu

### Lazy Loading Stratejisi

```html
<!-- ❌ YANLIŞ - Her sayfada yükleme -->
<!-- _Layout.cshtml içinde -->
<script src="~/js/chart_library.js"></script>

<!-- ✅ DOĞRU - Sadece gerekli sayfada -->
@section Scripts {
    <script src="~/js/chart_library.js"></script>
}
```

### jQuery Selector Optimizasyonu

```javascript
// ❌ YANLIŞ - Genel selector
$('.form_input').each(function() {
    $(this).addClass('loaded');
});

// ✅ DOĞRU - Context ile
var $form = $('#loan_form');
$form.find('.form_input').addClass('loaded');
```

---

## Kalite Kontrol Listesi

Code Review öncesi kontrol edilmesi gereken maddeler:

### İsimlendirme
- [ ] CSS class'larında snake_case kullanıldı mı?
- [ ] JavaScript değişkenlerinde snake_case kullanıldı mı?
- [ ] C# property'lerinde PascalCase kullanıldı mı?

### Performans
- [ ] jQuery selector'lar cache'lendi mi?
- [ ] Sayfa-specific script'ler _Layout yerine ilgili sayfada mı?

### Güvenlik
- [ ] Para hesaplamalarında decimal kullanıldı mı?
- [ ] TCKN/Telefon log'larda maskelendi mi?
- [ ] @Html.Raw() kullanılmadı mı?

### UX
- [ ] Form submit'te buton kilitleniyor mu?
- [ ] Input masking uygulandı mı?
- [ ] Error/Success mesajları gösteriliyor mu?

### Mimari
- [ ] .cshtml içinde SQL sorgusu yok mu?
- [ ] Tüm logic PageModel'de mi?

### Clean Code
- [ ] console.log temizlendi mi?
- [ ] debugger statement'ları kaldırıldı mı?
- [ ] Yorum satırları anlaşılır mı?

---

## Referans Veriler

### Sektör Listesi (sektor_id.json)

| ID | Sektör Adı |
|----|------------|
| 1 | Kamu Çalışanıyım |
| 2 | Özel Sektör Çalışanıyım |
| 3 | İşyerim var / Ortağım |
| 4 | Emekliyim |
| 5 | Emekliyim ve Çalışıyorum |
| 6 | Çiftçiyim |
| 7 | Çalışmıyorum |
| 8 | Freelancer Olarak Çalışıyorum |

### Meslek Listesi (job_id.json)

Toplam 70+ meslek tanımlı. Sık kullanılanlar:

| ID | Meslek |
|----|--------|
| 5 | Doktor |
| 46 | Mühendis |
| 95 | Öğretmen |
| 97 | Memur |
| 56 | Bankacı/Finansçı |
| 87 | İşletme Sahibi |
| 22 | Avukat |

---

## Destek ve İletişim

Sorularınız için geliştirme ekibine başvurun.

**Son Güncelleme:** 20 Aralık 2025

