/**
 * Site JavaScript - Web Şube 2.0 İnteraktif Kredi
 * jQuery kullanarak snake_case isimlendirme ile yazılmıştır
 * 
 * AI_CONTEXT.md kurallarına uygun olarak:
 * - snake_case fonksiyon/değişken isimleri
 * - Selector caching
 * - Event delegation
 * - Double submit prevention
 */

$(document).ready(function() {
    'use strict';
    
    // ============================================
    // Global Ayarlar
    // ============================================
    
    var config = {
        animation_duration: 300,
        debounce_delay: 250,
        api_timeout: 30000,
        sidebar_collapsed_key: 'sidebar_collapsed'
    };
    
    // ============================================
    // Utility Functions (Yardımcı Fonksiyonlar)
    // ============================================
    
    /**
     * Para formatı - Input masking
     * Örnek: 10000 → "10.000 ₺"
     * @param {number} amount - Formatlanacak miktar
     * @returns {string} Formatlanmış para değeri
     */
    function format_currency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return amount.toLocaleString('tr-TR') + ' ₺';
    }
    
    /**
     * TCKN maskeleme
     * Örnek: 12345678901 → "12*******01"
     * @param {string} tckn - Maskelenecek TCKN
     * @returns {string} Maskelenmiş TCKN
     */
    function mask_tckn(tckn) {
        if (!tckn || tckn.length !== 11) return tckn;
        return tckn.substring(0, 2) + '*******' + tckn.substring(9);
    }
    
    /**
     * Telefon maskeleme
     * Örnek: 5551234567 → "555***4567"
     * @param {string} phone - Maskelenecek telefon
     * @returns {string} Maskelenmiş telefon
     */
    function mask_phone(phone) {
        if (!phone || phone.length < 10) return phone;
        var cleaned = phone.replace(/\D/g, '');
        return cleaned.substring(0, 3) + '***' + cleaned.substring(6);
    }
    
    /**
     * Debounce fonksiyonu - Input olayları için
     * @param {Function} func - Çalıştırılacak fonksiyon
     * @param {number} wait - Bekleme süresi (ms)
     * @returns {Function} Debounced fonksiyon
     */
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait || config.debounce_delay);
        };
    }
    
    /**
     * Tarih formatla
     * @param {Date|string} date - Formatlanacak tarih
     * @returns {string} dd.MM.yyyy formatında tarih
     */
    function format_date(date) {
        var d = new Date(date);
        var day = String(d.getDate()).padStart(2, '0');
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var year = d.getFullYear();
        return day + '.' + month + '.' + year;
    }
    
    // ============================================
    // Sidebar Navigation with Collapse Animation
    // ============================================
    
    var $sidebar = $('#sidebar');
    var $sidebar_toggle = $('#sidebar_toggle');
    var $sidebar_collapse_toggle = $('#sidebar_collapse_toggle');
    var $sidebar_close = $('#sidebar_close');
    var $sidebar_overlay = $('#sidebar_overlay');
    var $main_wrapper = $('#main_wrapper');
    
    /**
     * Sidebar collapsed durumunu localStorage'dan al
     */
    function get_sidebar_collapsed_state() {
        return localStorage.getItem(config.sidebar_collapsed_key) === 'true';
    }
    
    /**
     * Sidebar collapsed durumunu localStorage'a kaydet
     */
    function set_sidebar_collapsed_state(collapsed) {
        localStorage.setItem(config.sidebar_collapsed_key, collapsed);
    }
    
    /**
     * Sidebar'ı daralt (collapse)
     */
    function collapse_sidebar() {
        $sidebar.addClass('sidebar--collapsed');
        $main_wrapper.addClass('main_wrapper--expanded');
        set_sidebar_collapsed_state(true);
    }
    
    /**
     * Sidebar'ı genişlet (expand)
     */
    function expand_sidebar() {
        $sidebar.removeClass('sidebar--collapsed');
        $main_wrapper.removeClass('main_wrapper--expanded');
        set_sidebar_collapsed_state(false);
    }
    
    /**
     * Sidebar collapse/expand toggle
     */
    function toggle_sidebar_collapse() {
        if ($sidebar.hasClass('sidebar--collapsed')) {
            expand_sidebar();
        } else {
            collapse_sidebar();
        }
    }
    
    /**
     * Sidebar'ı aç (Mobile)
     */
    function open_sidebar() {
        $sidebar.addClass('sidebar--open');
        $sidebar_overlay.addClass('sidebar__overlay--visible');
        $('body').css('overflow', 'hidden');
    }
    
    /**
     * Sidebar'ı kapat (Mobile)
     */
    function close_sidebar() {
        $sidebar.removeClass('sidebar--open');
        $sidebar_overlay.removeClass('sidebar__overlay--visible');
        $('body').css('overflow', '');
    }
    
    /**
     * Sidebar toggle (Mobile)
     */
    function toggle_sidebar() {
        if ($sidebar.hasClass('sidebar--open')) {
            close_sidebar();
        } else {
            open_sidebar();
        }
    }
    
    // Sayfa yüklendiğinde sidebar durumunu kontrol et (sadece desktop için)
    function init_sidebar_state() {
        var is_collapsed = get_sidebar_collapsed_state();
        
        if ($(window).width() > 991) {
            if (is_collapsed) {
                // Class'ları ekle (transition olmadan - CSS'de initial class bunu sağlıyor)
                $sidebar.addClass('sidebar--collapsed');
                $main_wrapper.addClass('main_wrapper--expanded');
            }
        }
        
        // Kısa bir delay sonra initial class'ı kaldır
        // Bu sayede transition'lar artık çalışabilir
        setTimeout(function() {
            $('html').removeClass('sidebar-collapsed-initial');
        }, 50);
    }
    
    // Başlangıç durumunu ayarla
    init_sidebar_state();
    
    // Desktop: Collapse/Expand toggle
    $sidebar_collapse_toggle.on('click', function(e) {
        e.preventDefault();
        toggle_sidebar_collapse();
    });
    
    // Mobile: Sidebar toggle
    $sidebar_toggle.on('click', toggle_sidebar);
    $sidebar_close.on('click', close_sidebar);
    $sidebar_overlay.on('click', close_sidebar);
    
    // ESC tuşu ile sidebar'ı kapat (Mobile)
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            close_sidebar();
        }
    });
    
    // Pencere boyutu değiştiğinde sidebar'ı kontrol et
    $(window).on('resize', debounce(function() {
        if ($(window).width() > 991) {
            // Desktop modunda overlay'i kapat
            close_sidebar();
            // Collapsed state'i uygula
            if (get_sidebar_collapsed_state()) {
                collapse_sidebar();
            }
        } else {
            // Mobile modda collapsed state'i kaldır
            $sidebar.removeClass('sidebar--collapsed');
            $main_wrapper.removeClass('main_wrapper--expanded');
        }
    }, 100));
    
    // ============================================
    // Form Validation
    // ============================================
    
    /**
     * TCKN doğrulama algoritması
     * @param {string} tckn - Doğrulanacak TCKN
     * @returns {boolean} Geçerli mi?
     */
    function validate_tckn(tckn) {
        if (!tckn || tckn.length !== 11) return false;
        if (tckn[0] === '0') return false;
        
        var digits = tckn.split('').map(Number);
        
        // 10. hane kontrolü
        var odd_sum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var even_sum = digits[1] + digits[3] + digits[5] + digits[7];
        var check_10 = ((odd_sum * 7) - even_sum) % 10;
        if (check_10 !== digits[9]) return false;
        
        // 11. hane kontrolü
        var total = 0;
        for (var i = 0; i < 10; i++) {
            total += digits[i];
        }
        if (total % 10 !== digits[10]) return false;
        
        return true;
    }
    
    /**
     * Telefon numarası doğrulama
     * @param {string} phone - Doğrulanacak telefon
     * @returns {boolean} Geçerli mi?
     */
    function validate_phone(phone) {
        var cleaned = phone.replace(/\D/g, '');
        // Türkiye telefon numarası: 5XX XXX XX XX (10 hane)
        return /^5[0-9]{9}$/.test(cleaned);
    }
    
    /**
     * Email doğrulama
     * @param {string} email - Doğrulanacak email
     * @returns {boolean} Geçerli mi?
     */
    function validate_email(email) {
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // ============================================
    // Input Masking
    // ============================================
    
    /**
     * Para input maskeleme
     * Binlik ayracı ekler
     */
    $(document).on('input', '.input_currency', function() {
        var $input = $(this);
        var value = $input.val().replace(/\D/g, '');
        var formatted = parseInt(value, 10).toLocaleString('tr-TR');
        
        if (value === '' || isNaN(parseInt(value, 10))) {
            formatted = '';
        }
        
        $input.val(formatted);
    });
    
    /**
     * TCKN input maskeleme (sadece rakam, max 11)
     */
    $(document).on('input', '.input_tckn', function() {
        var $input = $(this);
        var value = $input.val().replace(/\D/g, '').substring(0, 11);
        $input.val(value);
    });
    
    /**
     * Telefon input maskeleme
     */
    $(document).on('input', '.input_phone', function() {
        var $input = $(this);
        var value = $input.val().replace(/\D/g, '').substring(0, 10);
        $input.val(value);
    });
    
    // ============================================
    // Button States
    // ============================================
    
    /**
     * Buton loading state'e al
     * @param {jQuery} $btn - jQuery button elementi
     * @param {string} text - Loading text (opsiyonel)
     */
    function set_button_loading($btn, text) {
        var loading_text = text || 'İşleniyor...';
        $btn.data('original-text', $btn.text());
        $btn.prop('disabled', true);
        $btn.addClass('btn--loading');
        $btn.html('<span class="btn__spinner"></span> ' + loading_text);
    }
    
    /**
     * Buton loading state'den çıkar
     * @param {jQuery} $btn - jQuery button elementi
     */
    function reset_button_loading($btn) {
        var original_text = $btn.data('original-text');
        $btn.prop('disabled', false);
        $btn.removeClass('btn--loading');
        $btn.text(original_text);
    }
    
    // Double submit prevention
    $(document).on('submit', 'form', function(e) {
        var $form = $(this);
        var $submit_btn = $form.find('[type="submit"]');
        
        if ($form.data('submitting')) {
            e.preventDefault();
            return false;
        }
        
        $form.data('submitting', true);
        set_button_loading($submit_btn, 'Gönderiliyor...');
        
        // Form submit sonrası reset (AJAX olmayan formlar için)
        setTimeout(function() {
            $form.data('submitting', false);
            reset_button_loading($submit_btn);
        }, 5000);
    });
    
    // ============================================
    // Notifications / Toasts
    // ============================================
    
    /**
     * Bildirim göster
     * @param {string} message - Bildirim mesajı
     * @param {string} type - Bildirim tipi (success, error, warning, info)
     * @param {number} duration - Görünme süresi (ms)
     */
    function show_notification(message, type, duration) {
        type = type || 'info';
        duration = duration || 5000;
        
        var icon_svg = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        
        var $notification = $('<div class="notification_toast notification_toast--' + type + '">' +
            '<div class="notification_toast__icon">' + icon_svg[type] + '</div>' +
            '<div class="notification_toast__message">' + message + '</div>' +
            '<button class="notification_toast__close">&times;</button>' +
        '</div>');
        
        // Container yoksa oluştur
        if ($('.notification_container').length === 0) {
            $('body').append('<div class="notification_container"></div>');
        }
        
        $('.notification_container').append($notification);
        
        // Animasyon ile göster
        setTimeout(function() {
            $notification.addClass('notification_toast--visible');
        }, 10);
        
        // Otomatik kapat
        setTimeout(function() {
            close_notification($notification);
        }, duration);
        
        // Manuel kapat
        $notification.find('.notification_toast__close').on('click', function() {
            close_notification($notification);
        });
    }
    
    /**
     * Bildirimi kapat
     * @param {jQuery} $notification - Kapatılacak bildirim elementi
     */
    function close_notification($notification) {
        $notification.removeClass('notification_toast--visible');
        setTimeout(function() {
            $notification.remove();
        }, config.animation_duration);
    }
    
    // ============================================
    // API Helper Functions
    // ============================================
    
    /**
     * API isteği gönder
     * @param {string} url - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - İstek datası
     * @returns {Promise} jQuery AJAX promise
     */
    function api_request(url, method, data) {
        return $.ajax({
            url: url,
            method: method || 'GET',
            data: data ? JSON.stringify(data) : null,
            contentType: 'application/json',
            timeout: config.api_timeout,
            beforeSend: function(xhr) {
                // Token varsa header'a ekle
                var token = sessionStorage.getItem('auth_token');
                if (token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                }
            }
        });
    }
    
    // ============================================
    // Expose Global Functions
    // ============================================
    
    // Global scope'a ekle (diğer sayfalarda kullanmak için)
    window.FinTech = {
        format_currency: format_currency,
        mask_tckn: mask_tckn,
        mask_phone: mask_phone,
        format_date: format_date,
        validate_tckn: validate_tckn,
        validate_phone: validate_phone,
        validate_email: validate_email,
        set_button_loading: set_button_loading,
        reset_button_loading: reset_button_loading,
        show_notification: show_notification,
        api_request: api_request,
        debounce: debounce,
        // Sidebar functions
        open_sidebar: open_sidebar,
        close_sidebar: close_sidebar,
        toggle_sidebar: toggle_sidebar,
        collapse_sidebar: collapse_sidebar,
        expand_sidebar: expand_sidebar,
        toggle_sidebar_collapse: toggle_sidebar_collapse
    };
    
});
