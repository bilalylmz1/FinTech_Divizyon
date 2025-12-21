/**
 * Login Sayfası JavaScript
 * İnteraktif Kredi - Giriş Akışı
 * 
 * Akış Şeması:
 * 1. GSM Girişi
 * 2. KVKK Kontrolü (onay yoksa modal göster)
 * 3. OTP Gönderimi
 * 4. OTP Doğrulama
 * 5. Dashboard'a yönlendirme
 */

$(document).ready(function () {
    'use strict';

    // ============================================
    // SELECTOR CACHING (Performans için zorunlu)
    // ============================================

    var $login_form = $('#login_form');
    var $gsm_input = $('#gsm_input');
    var $gsm_input_box = $('#gsm_input_box');
    var $gsm_error = $('#gsm_error');
    var $submit_btn = $('#submit_btn');
    var $remember_checkbox = $('#remember_checkbox');
    var $remember_me = $('#remember_me');

    // OTP Modal
    var $otp_modal_backdrop = $('#otp_modal_backdrop');
    var $otp_input = $('#otp_input');
    var $otp_timer = $('#otp_timer');
    var $otp_submit_btn = $('#otp_submit_btn');
    var $otp_resend = $('#otp_resend');
    var $masked_phone = $('#masked_phone');

    // KVKK Modal
    var $kvkk_modal_backdrop = $('#kvkk_modal_backdrop');
    var $kvkk_checkbox = $('#kvkk_checkbox');
    var $kvkk_consent = $('#kvkk_consent');
    var $kvkk_accept_btn = $('#kvkk_accept_btn');

    // State Variables
    var otp_timer_interval = null;
    var otp_remaining_seconds = 180;
    var otp_attempt_count = 0;
    var max_otp_attempts = 3;
    var is_form_submitting = false;
    var kvkk_approved = false;

    // ============================================
    // TELEFON NUMARASI MASKELEME
    // Format: 5XX XXX XX XX
    // ============================================

    function format_phone_number(value) {
        // Sadece rakamları al
        var digits = value.replace(/\D/g, '');

        // Maksimum 10 rakam
        digits = digits.substring(0, 10);

        // Format uygula: 5XX XXX XX XX
        var formatted = '';

        if (digits.length > 0) {
            formatted = digits.substring(0, 3);
        }
        if (digits.length > 3) {
            formatted += ' ' + digits.substring(3, 6);
        }
        if (digits.length > 6) {
            formatted += ' ' + digits.substring(6, 8);
        }
        if (digits.length > 8) {
            formatted += ' ' + digits.substring(8, 10);
        }

        return formatted;
    }

    // Telefon input maskeleme
    $gsm_input.on('input', function () {
        var cursor_pos = this.selectionStart;
        var old_length = this.value.length;

        this.value = format_phone_number(this.value);

        // Cursor pozisyonunu ayarla
        var new_length = this.value.length;
        var new_pos = cursor_pos + (new_length - old_length);
        this.setSelectionRange(new_pos, new_pos);

        // Hata durumunu temizle
        clear_gsm_error();
    });

    // ============================================
    // TELEFON NUMARASI VALİDASYONU
    // ============================================

    function validate_phone_number(phone) {
        // Rakamları al
        var digits = phone.replace(/\D/g, '');

        // 10 haneli olmalı ve 5 ile başlamalı
        if (digits.length !== 10) {
            return { valid: false, message: '*GSM numarası 10 haneli olmalıdır' };
        }

        if (!digits.startsWith('5')) {
            return { valid: false, message: '*GSM numarası 5 ile başlamalıdır' };
        }

        return { valid: true, message: '' };
    }

    function show_gsm_error(message) {
        $gsm_input_box.addClass('input_box--error');
        $gsm_error.text(message).show();
    }

    function clear_gsm_error() {
        $gsm_input_box.removeClass('input_box--error');
        $gsm_error.hide();
    }

    // ============================================
    // CHECKBOX TOGGLE
    // ============================================

    // Event Delegation kullanarak checkbox toggle
    $(document).on('click', '.checkbox_box', function () {
        var $checkbox = $(this);
        var checkbox_id = $checkbox.attr('id');
        var $input = null;

        // İlgili hidden input'u bul
        if (checkbox_id === 'remember_checkbox') {
            $input = $remember_me;
        } else if (checkbox_id === 'kvkk_checkbox') {
            $input = $kvkk_consent;
        }

        if ($input) {
            var is_checked = $input.prop('checked');
            $input.prop('checked', !is_checked);
            $checkbox.toggleClass('checkbox_box--checked', !is_checked);

            // KVKK checkbox için buton durumunu güncelle
            if (checkbox_id === 'kvkk_checkbox') {
                $kvkk_accept_btn.prop('disabled', is_checked);
            }
        }
    });

    // ============================================
    // FORM SUBMIT - DOUBLE SUBMIT PREVENTION
    // ============================================

    $login_form.on('submit', function (e) {
        e.preventDefault();

        // Double submit prevention
        if (is_form_submitting) {
            return false;
        }

        // Validasyon
        var phone = $gsm_input.val();
        var validation = validate_phone_number(phone);

        if (!validation.valid) {
            show_gsm_error(validation.message);
            return false;
        }

        // Butonu kilitle
        is_form_submitting = true;
        $submit_btn.prop('disabled', true).find('.btn_primary__text').text('İşleniyor...');

        // KVKK kontrolü - Onay yoksa KVKK modalını göster
        if (!kvkk_approved) {
            show_kvkk_modal();
            return false;
        }

        // OTP gönder
        send_otp(phone);
    });

    // ============================================
    // KVKK MODAL
    // ============================================

    function show_kvkk_modal() {
        $kvkk_modal_backdrop.addClass('modal_backdrop--active');

        // Butonu resetle
        is_form_submitting = false;
        $submit_btn.prop('disabled', false).find('.btn_primary__text').text('Giriş Yap');
    }

    function hide_kvkk_modal() {
        $kvkk_modal_backdrop.removeClass('modal_backdrop--active');
    }

    // ============================================
    // OTP GÖNDERİMİ
    // ============================================

    function send_otp(phone) {
        // Maskelenmiş telefon numarasını göster
        var masked = mask_phone_number(phone);
        $masked_phone.text(masked);

        // AJAX ile Backend StartLogin handler'ını çağır
        $.ajax({
            url: '/Auth/Login?handler=StartLogin',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val()
            },
            data: JSON.stringify({ phone: phone }),
            success: function (response) {
                if (response.success) {
                    // Başarılı - OTP modalını göster
                    show_otp_modal();

                    // Butonu resetle
                    is_form_submitting = false;
                    $submit_btn.prop('disabled', false).find('.btn_primary__text').text('Giriş Yap');
                } else if (response.error === 'kvkk_required') {
                    // KVKK onayı gerekiyor - Modal göster
                    show_kvkk_modal();
                    // Butonu resetlemiyoruz, çünkü KVKK'dan sonra devam edecek veya kullanıcı iptal edecek
                } else {
                    // Diğer hatalar
                    alert(response.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
                    is_form_submitting = false;
                    $submit_btn.prop('disabled', false).find('.btn_primary__text').text('Giriş Yap');
                }
            },
            error: function () {
                alert('Sunucu ile iletişim hatası.');
                is_form_submitting = false;
                $submit_btn.prop('disabled', false).find('.btn_primary__text').text('Giriş Yap');
            }
        });
    }

    function mask_phone_number(phone) {
        var digits = phone.replace(/\D/g, '');
        // Format: 0 (5XX) XXX XX XX - ilk 3 ve son 2 hane görünür
        return '0 (5' + digits.substring(1, 2) + 'X) XXX XX ' + digits.substring(8, 10);
    }

    // KVKK Onayla butonu
    $kvkk_accept_btn.on('click', function () {
        if ($kvkk_consent.prop('checked')) {
            var phone = $gsm_input.val();

            // Backend KVKK Onay Handler'ı
            $.ajax({
                url: '/Auth/Login?handler=ApproveKvkk',
                type: 'POST',
                contentType: 'application/json',
                headers: {
                    "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val()
                },
                data: JSON.stringify({ phone: phone }),
                success: function (response) {
                    if (response.success) {
                        kvkk_approved = true;
                        hide_kvkk_modal();

                        // Formu tekrar submit etmeye gerek yok, doğrudan kaldığı yerden devam ediyoruz:
                        send_otp(phone);
                    } else {
                        alert(response.message || 'Onay işlemi başarısız.');
                    }
                },
                error: function () {
                    alert('Sunucu hatası.');
                }
            });
        }
    });

    // ============================================
    // OTP MODAL
    // ============================================

    function show_otp_modal() {
        $otp_modal_backdrop.addClass('modal_backdrop--active');
        $otp_input.val('').focus();
        start_otp_timer();
    }

    function hide_otp_modal() {
        $otp_modal_backdrop.removeClass('modal_backdrop--active');
        stop_otp_timer();
    }

    // OTP Timer
    function start_otp_timer() {
        otp_remaining_seconds = 180;
        update_timer_display();

        stop_otp_timer(); // Önceki interval varsa temizle

        otp_timer_interval = setInterval(function () {
            otp_remaining_seconds--;
            update_timer_display();

            if (otp_remaining_seconds <= 0) {
                stop_otp_timer();
                $otp_resend.removeClass('otp_modal__resend--disabled');
            }
        }, 1000);

        $otp_resend.addClass('otp_modal__resend--disabled');
    }

    function stop_otp_timer() {
        if (otp_timer_interval) {
            clearInterval(otp_timer_interval);
            otp_timer_interval = null;
        }
    }

    function update_timer_display() {
        $otp_timer.text(otp_remaining_seconds);
    }

    // OTP Input - Sadece rakam
    $otp_input.on('input', function () {
        this.value = this.value.replace(/\D/g, '').substring(0, 6);
    });

    // OTP Doğrulama
    $otp_submit_btn.on('click', function () {
        var otp_code = $otp_input.val();
        var phone = $gsm_input.val();

        if (otp_code.length !== 6) {
            alert('Lütfen 6 haneli SMS şifresini giriniz.');
            return;
        }

        // Butonu kilitle
        var $btn = $(this);
        $btn.prop('disabled', true).find('span').text('Doğrulanıyor...');

        // Backend VerifyOtp Handler'ı
        $.ajax({
            url: '/Auth/Login?handler=VerifyOtp',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val()
            },
            data: JSON.stringify({ phone: phone, code: otp_code }),
            success: function (response) {
                if (response.success) {
                    // Başarılı - Yönlendir
                    window.location.href = response.redirectUrl;
                } else {
                    // Hatalı
                    otp_attempt_count++;

                    if (otp_attempt_count >= max_otp_attempts) {
                        // Maksimum deneme aşıldı
                        alert('Maksimum deneme sayısına ulaştınız. Ek Güvenlik: CAPTCHA veya Destek Yönlendiriliyor...');
                        // Gerçek senaryoda burada window.location.href = '/Support' yapılabilir.
                        hide_otp_modal();
                    } else {
                        alert('Hatalı şifre. Kalan deneme: ' + (max_otp_attempts - otp_attempt_count));
                    }

                    $btn.prop('disabled', false).find('span').text('Devam Et');
                    $otp_input.val('').focus();
                }
            },
            error: function () {
                alert('Doğrulama sırasında hata oluştu.');
                $btn.prop('disabled', false).find('span').text('Devam Et');
            }
        });
    });

    // OTP Yeniden Gönder
    $otp_resend.on('click', function () {
        if (!$(this).hasClass('otp_modal__resend--disabled')) {
            var phone = $gsm_input.val();
            // StartLogin'i tekrar çağırarak OTP gönderiyoruz (SendOtp logic StartLogin içinde)
            send_otp(phone);

            // Timer ve inputları resetle
            otp_attempt_count = 0;
            $otp_input.val('');
            start_otp_timer();
        }
    });

    // ============================================
    // MODAL KAPATMA (Backdrop tıklama)
    // ============================================

    $(document).on('click', '.modal_backdrop', function (e) {
        if (e.target === this) {
            // Backdrop'a tıklandıysa kapat
            // Not: OTP modalı kapatılmamalı, sadece KVKK
            if ($(this).attr('id') === 'kvkk_modal_backdrop') {
                hide_kvkk_modal();
            }
        }
    });

    // ============================================
    // GOOGLE GİRİŞ (Placeholder)
    // ============================================

    $('#google_login_btn').on('click', function () {
        // TODO: Google OAuth entegrasyonu
        alert('Google ile giriş özelliği yakında aktif olacak.');
    });

    // ============================================
    // SAYFA YÜKLENDİĞİNDE
    // ============================================

    // Focus ilk input'a
    $gsm_input.focus();

    // LocalStorage'dan "Beni Hatırla" kontrolü
    var saved_phone = localStorage.getItem('ik_saved_phone');
    if (saved_phone) {
        $gsm_input.val(format_phone_number(saved_phone));
        $remember_me.prop('checked', true);
        $remember_checkbox.addClass('checkbox_box--checked');
    }
});

