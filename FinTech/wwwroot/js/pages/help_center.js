/**
 * Yardım & Destek Merkezi JavaScript
 * ===================================
 * Bu dosya, Yardım sayfasındaki:
 * - Popüler soruların yüklenmesi
 * - Arama fonksiyonelliği
 * işlevlerini yönetir.
 * 
 * Veri Kaynağı: /data/faq_data.json (CMS/Statik)
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $popular_list = $('#popular_questions_list');
    var $search_input = $('#help_search_input');
    var $search_btn = $('#help_search_btn');

    // Veri deposu
    var faq_data = null;

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * JSON verilerini yükler
     */
    function load_faq_data() {
        $.ajax({
            url: '/data/faq_data.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                faq_data = data;
                render_popular_questions();
            },
            error: function(xhr, status, error) {
                console.error('FAQ verileri yüklenemedi:', error);
                show_error_message();
            }
        });
    }

    /**
     * Popüler soruları listeler
     */
    function render_popular_questions() {
        if (!faq_data || !faq_data.questions) return;

        // Popüler olanları filtrele (is_popular: true)
        var popular_items = faq_data.questions.filter(function(q) {
            return q.is_popular === true;
        });

        // Maksimum 5 soru göster
        popular_items = popular_items.slice(0, 5);

        // HTML oluştur
        var html = '';
        popular_items.forEach(function(item) {
            html += create_popular_item_html(item);
        });

        $popular_list.html(html);

        // Click event binding
        bind_popular_item_events();
    }

    /**
     * Tek bir popüler soru için HTML oluşturur
     * @param {Object} item - Soru objesi
     * @returns {string} HTML string
     */
    function create_popular_item_html(item) {
        return '<li class="popular_questions__item" data-id="' + item.id + '">' +
                   '<span class="popular_questions__item_icon">' +
                       '<i class="fa-solid fa-question"></i>' +
                   '</span>' +
                   '<span class="popular_questions__item_text">' + escape_html(item.question) + '</span>' +
               '</li>';
    }

    /**
     * Popüler soru tıklama olaylarını bağlar
     */
    function bind_popular_item_events() {
        $(document).off('click', '.popular_questions__item');
        $(document).on('click', '.popular_questions__item', function() {
            var question_id = $(this).data('id');
            // SSS sayfasına yönlendir ve ilgili soruyu aç
            window.location.href = '/Help/Faq?q=' + question_id;
        });
    }

    /**
     * Arama işlemini gerçekleştirir
     */
    function perform_search() {
        var search_term = $search_input.val().trim();
        
        if (search_term.length === 0) {
            return;
        }

        // SSS sayfasına arama terimiyle yönlendir
        window.location.href = '/Help/Faq?search=' + encodeURIComponent(search_term);
    }

    /**
     * Hata mesajı gösterir
     */
    function show_error_message() {
        $popular_list.html(
            '<li class="popular_questions__item">' +
                '<span class="popular_questions__item_icon" style="background: rgba(220, 53, 69, 0.1); color: #DC3545;">' +
                    '<i class="fa-solid fa-exclamation"></i>' +
                '</span>' +
                '<span class="popular_questions__item_text" style="color: #DC3545;">Veriler yüklenirken bir hata oluştu</span>' +
            '</li>'
        );
    }

    /**
     * HTML özel karakterlerini escape eder (XSS koruması)
     * @param {string} text - Ham metin
     * @returns {string} Güvenli metin
     */
    function escape_html(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Arama butonu tıklama
    $search_btn.on('click', function() {
        perform_search();
    });

    // Enter tuşu ile arama
    $search_input.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            perform_search();
        }
    });

    // ============================================
    // BAŞLATMA (Initialization)
    // ============================================

    // Sayfa yüklendiğinde verileri getir
    load_faq_data();
});

