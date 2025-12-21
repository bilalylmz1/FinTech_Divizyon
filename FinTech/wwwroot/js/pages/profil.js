/**
 * Profil & Hesap Ayarları Sayfası JavaScript
 * 
 * Bu dosya profil sayfasındaki form işlemlerini,
 * düzenleme modlarını ve toast bildirimlerini yönetir.
 * 
 * Geliştirme Standartları:
 * - snake_case isimlendirme
 * - jQuery selector caching
 * - Event delegation
 * - Double submit prevention
 */

// ============================================
// SELECTOR CACHING (DOM elementlerini önbelleğe al)
// ============================================

var $address_card = $('#address_card');
var $address_view_mode = $('#address_view_mode');
var $address_edit_mode = $('#address_edit_mode');
var $address_footer = $('#address_footer');
var $address_edit_btn = $('#address_edit_btn');
var $address_save_btn = $('#address_save_btn');
var $address_form = $('#address_form');

var $work_card = $('#work_card');
var $work_view_mode = $('#work_view_mode');
var $work_edit_mode = $('#work_edit_mode');
var $work_footer = $('#work_footer');
var $work_edit_btn = $('#work_edit_btn');
var $work_save_btn = $('#work_save_btn');
var $work_form = $('#work_form');

var $toast = $('#toast');
var $toast_title = $('#toast_title');
var $toast_message = $('#toast_message');

// Form başlangıç değerlerini sakla (iptal için)
var initial_address_values = {};
var initial_work_values = {};

// ============================================
// SAYFA YÜKLENDİĞİNDE
// ============================================

$(document).ready(function() {
    // Başlangıç değerlerini kaydet
    save_initial_values();
    
    // Para birimi formatlaması için input mask
    setup_currency_mask();
    
    // Telefon formatlaması
    setup_phone_mask();
});

/**
 * Form alanlarının başlangıç değerlerini kaydeder
 * İptal butonuna basıldığında bu değerlere dönülür
 */
function save_initial_values() {
    // Adres formu değerleri
    initial_address_values = {
        city: $('#city').val(),
        district: $('#district').val(),
        address_detail: $('#address_detail').val(),
        email: $('#email').val(),
        alt_phone: $('#alt_phone').val()
    };
    
    // Meslek formu değerleri
    initial_work_values = {
        profession: $('#profession').val(),
        work_status: $('#work_status').val(),
        company: $('#company').val(),
        income: $('#income').val(),
        sector: $('#sector').val(),
        work_duration: $('#work_duration').val()
    };
}

// ============================================
// DÜZENLEME MODU FONKSİYONLARI
// ============================================

/**
 * Kart düzenleme modunu açar/kapatır
 * @param {string} card_type - 'address' veya 'work'
 */
function toggle_edit_mode(card_type) {
    if (card_type === 'address') {
        $address_view_mode.hide();
        $address_edit_mode.fadeIn(200);
        $address_footer.fadeIn(200);
        $address_edit_btn.hide();
        
        // İlk input'a focus
        setTimeout(function() {
            $('#city').focus();
        }, 250);
    } else if (card_type === 'work') {
        $work_view_mode.hide();
        $work_edit_mode.fadeIn(200);
        $work_footer.fadeIn(200);
        $work_edit_btn.hide();
        
        setTimeout(function() {
            $('#profession').focus();
        }, 250);
    }
}

/**
 * Düzenleme modunu iptal eder ve eski değerlere döner
 * @param {string} card_type - 'address' veya 'work'
 */
function cancel_edit(card_type) {
    if (card_type === 'address') {
        // Eski değerlere dön
        $('#city').val(initial_address_values.city);
        $('#district').val(initial_address_values.district);
        $('#address_detail').val(initial_address_values.address_detail);
        $('#email').val(initial_address_values.email);
        $('#alt_phone').val(initial_address_values.alt_phone);
        
        // Hata mesajlarını temizle
        clear_errors($address_form);
        
        // Görünüm moduna dön
        $address_edit_mode.hide();
        $address_footer.hide();
        $address_view_mode.fadeIn(200);
        $address_edit_btn.fadeIn(200);
    } else if (card_type === 'work') {
        // Eski değerlere dön
        $('#profession').val(initial_work_values.profession);
        $('#work_status').val(initial_work_values.work_status);
        $('#company').val(initial_work_values.company);
        $('#income').val(initial_work_values.income);
        $('#sector').val(initial_work_values.sector);
        $('#work_duration').val(initial_work_values.work_duration);
        
        clear_errors($work_form);
        
        $work_edit_mode.hide();
        $work_footer.hide();
        $work_view_mode.fadeIn(200);
        $work_edit_btn.fadeIn(200);
    }
}

/**
 * Görünüm moduna geri döner (kaydetme sonrası)
 * @param {string} card_type - 'address' veya 'work'
 */
function switch_to_view_mode(card_type) {
    if (card_type === 'address') {
        // Yeni değerleri görüntüleme alanına aktar
        update_address_display();
        
        // Yeni değerleri başlangıç değeri olarak kaydet
        save_initial_values();
        
        $address_edit_mode.hide();
        $address_footer.hide();
        $address_view_mode.fadeIn(200);
        $address_edit_btn.fadeIn(200);
    } else if (card_type === 'work') {
        update_work_display();
        save_initial_values();
        
        $work_edit_mode.hide();
        $work_footer.hide();
        $work_view_mode.fadeIn(200);
        $work_edit_btn.fadeIn(200);
    }
}

// ============================================
// KAYDETME FONKSİYONLARI
// ============================================

/**
 * Adres bilgilerini kaydeder
 */
function save_address() {
    // Form validasyonu
    if (!validate_address_form()) {
        return;
    }
    
    // Double submit prevention
    var $btn = $address_save_btn;
    if ($btn.hasClass('profil_btn--loading')) {
        return;
    }
    
    $btn.addClass('profil_btn--loading').prop('disabled', true);
    
    // Form verilerini topla
    var data = {
        city: $('#city').val(),
        district: $('#district').val(),
        addressDetail: $('#address_detail').val(),
        email: $('#email').val(),
        altPhone: $('#alt_phone').val()
    };
    
    // API'ye gönder
    $.ajax({
        url: '/Profile?handler=UpdateAddress',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(response) {
            if (response.success) {
                show_toast('success', 'Başarılı', response.message);
                switch_to_view_mode('address');
            } else {
                show_toast('error', 'Hata', response.message);
            }
        },
        error: function(xhr, status, error) {
            show_toast('error', 'Hata', 'Bir hata oluştu, lütfen tekrar deneyin');
            console.error('Adres kaydetme hatası:', error);
        },
        complete: function() {
            $btn.removeClass('profil_btn--loading').prop('disabled', false);
        }
    });
}

/**
 * Meslek ve gelir bilgilerini kaydeder
 */
function save_work() {
    // Form validasyonu
    if (!validate_work_form()) {
        return;
    }
    
    // Double submit prevention
    var $btn = $work_save_btn;
    if ($btn.hasClass('profil_btn--loading')) {
        return;
    }
    
    $btn.addClass('profil_btn--loading').prop('disabled', true);
    
    // Gelir değerini sayıya çevir (nokta ve virgül temizle)
    var income_raw = $('#income').val().replace(/\./g, '').replace(',', '.');
    
    var data = {
        profession: $('#profession').val(),
        workStatus: $('#work_status').val(),
        company: $('#company').val(),
        income: parseFloat(income_raw) || 0,
        sector: $('#sector').val(),
        workDuration: $('#work_duration').val()
    };
    
    $.ajax({
        url: '/Profile?handler=UpdateWork',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(response) {
            if (response.success) {
                show_toast('success', 'Başarılı', response.message);
                switch_to_view_mode('work');
            } else {
                show_toast('error', 'Hata', response.message);
            }
        },
        error: function(xhr, status, error) {
            show_toast('error', 'Hata', 'Bir hata oluştu, lütfen tekrar deneyin');
            console.error('Meslek kaydetme hatası:', error);
        },
        complete: function() {
            $btn.removeClass('profil_btn--loading').prop('disabled', false);
        }
    });
}

// ============================================
// GÖRÜNTÜLEME GÜNCELLEME
// ============================================

/**
 * Adres görüntüleme alanını günceller
 */
function update_address_display() {
    var city_text = $('#city option:selected').text();
    var district_text = $('#district option:selected').text();
    
    $('#display_city').text(city_text || '-');
    $('#display_district').text(district_text || '-');
    $('#display_address').text($('#address_detail').val() || '-');
    $('#display_email').text($('#email').val() || '-');
    $('#display_alt_phone').text($('#alt_phone').val() || '-');
}

/**
 * Meslek görüntüleme alanını günceller
 */
function update_work_display() {
    var profession_text = $('#profession option:selected').text();
    var work_status_text = $('#work_status option:selected').text();
    var sector_text = $('#sector option:selected').text();
    var duration_text = $('#work_duration option:selected').text();
    
    $('#display_profession').text(profession_text || '-');
    $('#display_work_status').text(work_status_text || '-');
    $('#display_company').text($('#company').val() || '-');
    $('#display_income').text($('#income').val() ? $('#income').val() + ' ₺' : '-');
    $('#display_sector').text(sector_text || '-');
    $('#display_work_duration').text(duration_text || '-');
}

// ============================================
// VALİDASYON FONKSİYONLARI
// ============================================

/**
 * Adres formunu doğrular
 * @returns {boolean} Form geçerli mi
 */
function validate_address_form() {
    var is_valid = true;
    clear_errors($address_form);
    
    // İl kontrolü
    if (!$('#city').val()) {
        show_field_error($('#city'), 'İl seçimi zorunludur');
        is_valid = false;
    }
    
    // İlçe kontrolü
    if (!$('#district').val()) {
        show_field_error($('#district'), 'İlçe seçimi zorunludur');
        is_valid = false;
    }
    
    // Adres detayı kontrolü
    if (!$('#address_detail').val().trim()) {
        show_field_error($('#address_detail'), 'Adres detayı zorunludur');
        is_valid = false;
    }
    
    // E-posta kontrolü
    var email = $('#email').val();
    if (!email) {
        show_field_error($('#email'), 'E-posta zorunludur');
        is_valid = false;
    } else if (!is_valid_email(email)) {
        show_field_error($('#email'), 'Geçerli bir e-posta adresi giriniz');
        is_valid = false;
    }
    
    return is_valid;
}

/**
 * Meslek formunu doğrular
 * @returns {boolean} Form geçerli mi
 */
function validate_work_form() {
    var is_valid = true;
    clear_errors($work_form);
    
    // Meslek kontrolü
    if (!$('#profession').val()) {
        show_field_error($('#profession'), 'Meslek seçimi zorunludur');
        is_valid = false;
    }
    
    // Çalışma durumu kontrolü
    if (!$('#work_status').val()) {
        show_field_error($('#work_status'), 'Çalışma durumu zorunludur');
        is_valid = false;
    }
    
    // Gelir kontrolü
    var income = $('#income').val().replace(/\./g, '');
    if (!income || parseFloat(income) <= 0) {
        show_field_error($('#income'), 'Geçerli bir gelir giriniz');
        is_valid = false;
    }
    
    return is_valid;
}

/**
 * E-posta formatını kontrol eder
 * @param {string} email - E-posta adresi
 * @returns {boolean} Geçerli mi
 */
function is_valid_email(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Alan hatası gösterir
 * @param {jQuery} $field - Input elementi
 * @param {string} message - Hata mesajı
 */
function show_field_error($field, message) {
    var $wrapper = $field.closest('.profil_input__wrapper');
    var $parent = $wrapper.length ? $wrapper : $field;
    
    $parent.addClass('profil_input__field--error');
    $field.addClass('profil_input__field--error');
    
    // Hata mesajı ekle
    var $error = $('<span class="profil_input__error"><i class="fa-solid fa-circle-exclamation"></i> ' + message + '</span>');
    $field.closest('.profil_input').append($error);
}

/**
 * Form hatalarını temizler
 * @param {jQuery} $form - Form elementi
 */
function clear_errors($form) {
    $form.find('.profil_input__field--error').removeClass('profil_input__field--error');
    $form.find('.profil_input__error').remove();
}

// ============================================
// INPUT MASKELEME
// ============================================

/**
 * Para birimi formatlaması ayarlar
 * 45000 -> 45.000
 */
function setup_currency_mask() {
    $(document).on('input', '#income', function() {
        var value = $(this).val();
        
        // Sadece rakamları al
        value = value.replace(/[^\d]/g, '');
        
        // Binlik ayracı ekle
        if (value) {
            value = parseInt(value, 10).toLocaleString('tr-TR');
        }
        
        $(this).val(value);
    });
}

/**
 * Telefon formatlaması ayarlar
 * 5321234567 -> 0 (532) 123 45 67
 */
function setup_phone_mask() {
    $(document).on('input', '#alt_phone', function() {
        var value = $(this).val();
        
        // Sadece rakamları al
        var digits = value.replace(/[^\d]/g, '');
        
        // Formatla
        var formatted = '';
        if (digits.length > 0) {
            formatted = '0';
            if (digits.length > 1) {
                formatted += ' (' + digits.substring(1, 4);
            }
            if (digits.length > 4) {
                formatted += ') ' + digits.substring(4, 7);
            }
            if (digits.length > 7) {
                formatted += ' ' + digits.substring(7, 9);
            }
            if (digits.length > 9) {
                formatted += ' ' + digits.substring(9, 11);
            }
        }
        
        $(this).val(formatted);
    });
}

// ============================================
// TOAST BİLDİRİMLERİ
// ============================================

/**
 * Toast bildirimi gösterir
 * @param {string} type - 'success' veya 'error'
 * @param {string} title - Başlık
 * @param {string} message - Mesaj
 */
function show_toast(type, title, message) {
    // Önceki class'ları temizle
    $toast.removeClass('profil_toast--success profil_toast--error');
    
    // Yeni tip ekle
    $toast.addClass('profil_toast--' + type);
    
    // İkonu güncelle
    var icon_class = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    $toast.find('.profil_toast__icon').removeClass('fa-circle-check fa-circle-exclamation').addClass(icon_class);
    
    // İçeriği güncelle
    $toast_title.text(title);
    $toast_message.text(message);
    
    // Göster
    $toast.addClass('profil_toast--visible');
    
    // 4 saniye sonra gizle
    setTimeout(function() {
        hide_toast();
    }, 4000);
}

/**
 * Toast bildirimini gizler
 */
function hide_toast() {
    $toast.removeClass('profil_toast--visible');
}

