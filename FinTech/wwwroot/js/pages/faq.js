/**
 * SSS / Rehber Sayfası JavaScript
 * ================================
 * Bu dosya, SSS sayfasındaki:
 * - Accordion (açılır-kapanır) işlevselliği
 * - Kategori filtreleme
 * - Anlık arama
 * - URL parametreleri ile soru açma
 * işlevlerini yönetir.
 * 
 * Veri Kaynağı: /data/faq_data.json (CMS/Statik)
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $category_list = $('#faq_category_list');
    var $mobile_category = $('#faq_mobile_category');
    var $faq_list = $('#faq_list');
    var $faq_loading = $('#faq_loading');
    var $faq_empty = $('#faq_empty');
    var $faq_count = $('#faq_count');
    var $search_input = $('#faq_search_input');
    var $search_clear = $('#faq_search_clear');
    var $reset_search = $('#faq_reset_search');

    // State (Durum Yönetimi)
    var faq_data = null;
    var current_category = 'all';
    var search_term = '';
    var debounce_timer = null;

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * JSON verilerini yükler
     */
    function load_faq_data() {
        show_loading(true);

        $.ajax({
            url: '/data/faq_data.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                faq_data = data;
                render_categories();
                render_questions();
                check_url_parameters();
                show_loading(false);
            },
            error: function(xhr, status, error) {
                console.error('FAQ verileri yüklenemedi:', error);
                show_loading(false);
                show_error_state();
            }
        });
    }

    /**
     * Kategorileri sidebar ve mobil select'e render eder
     */
    function render_categories() {
        if (!faq_data || !faq_data.categories) return;

        // "Tümü" seçeneği
        var sidebar_html = '<li class="faq_sidebar__item">' +
            '<a href="#" class="faq_sidebar__link faq_sidebar__link--active" data-category="all">' +
                '<i class="fa-solid fa-list"></i>' +
                '<span>Tümü</span>' +
                '<span class="faq_sidebar__count">' + faq_data.questions.length + '</span>' +
            '</a></li>';

        var mobile_html = '';

        // Kategorileri döngüyle ekle
        faq_data.categories.forEach(function(cat) {
            var count = faq_data.questions.filter(function(q) {
                return q.category_id === cat.id;
            }).length;

            sidebar_html += '<li class="faq_sidebar__item">' +
                '<a href="#" class="faq_sidebar__link" data-category="' + cat.id + '">' +
                    '<i class="' + cat.icon + '"></i>' +
                    '<span>' + escape_html(cat.name) + '</span>' +
                    '<span class="faq_sidebar__count">' + count + '</span>' +
                '</a></li>';

            mobile_html += '<option value="' + cat.id + '">' + escape_html(cat.name) + ' (' + count + ')</option>';
        });

        $category_list.html(sidebar_html);
        $mobile_category.append(mobile_html);
    }

    /**
     * Filtrelenmiş soruları render eder
     */
    function render_questions() {
        if (!faq_data || !faq_data.questions) return;

        // Filtreleme
        var filtered = filter_questions();

        // Sayaç güncelle
        update_count(filtered.length);

        // Boş durum kontrolü
        if (filtered.length === 0) {
            $faq_list.hide();
            $faq_empty.show();
            return;
        }

        $faq_empty.hide();
        $faq_list.show();

        // HTML oluştur
        var html = '';
        filtered.forEach(function(item) {
            html += create_faq_item_html(item);
        });

        $faq_list.html(html);
    }

    /**
     * Soruları kategori ve arama terimine göre filtreler
     * @returns {Array} Filtrelenmiş soru listesi
     */
    function filter_questions() {
        var questions = faq_data.questions;

        // Kategori filtresi
        if (current_category !== 'all') {
            questions = questions.filter(function(q) {
                return q.category_id === current_category;
            });
        }

        // Arama filtresi
        if (search_term.length > 0) {
            var term = search_term.toLowerCase();
            questions = questions.filter(function(q) {
                var in_question = q.question.toLowerCase().indexOf(term) !== -1;
                var in_answer = q.answer.toLowerCase().indexOf(term) !== -1;
                var in_tags = q.tags.some(function(tag) {
                    return tag.toLowerCase().indexOf(term) !== -1;
                });
                return in_question || in_answer || in_tags;
            });
        }

        return questions;
    }

    /**
     * Tek bir SSS item için HTML oluşturur
     * @param {Object} item - Soru objesi
     * @returns {string} HTML string
     */
    function create_faq_item_html(item) {
        var question_text = item.question;
        
        // Arama terimi varsa vurgula
        if (search_term.length > 0) {
            question_text = highlight_text(question_text, search_term);
        }

        var tags_html = '';
        if (item.tags && item.tags.length > 0) {
            tags_html = '<div class="faq_item__tags">';
            item.tags.forEach(function(tag) {
                tags_html += '<span class="faq_item__tag">' + escape_html(tag) + '</span>';
            });
            tags_html += '</div>';
        }

        return '<div class="faq_item" data-id="' + item.id + '">' +
                   '<div class="faq_item__header">' +
                       '<h3 class="faq_item__question">' + question_text + '</h3>' +
                       '<span class="faq_item__icon">' +
                           '<i class="fa-solid fa-chevron-down"></i>' +
                       '</span>' +
                   '</div>' +
                   '<div class="faq_item__body">' +
                       '<div class="faq_item__answer">' +
                           item.answer +
                           tags_html +
                       '</div>' +
                   '</div>' +
               '</div>';
    }

    /**
     * Metinde arama terimini vurgular
     * @param {string} text - Orijinal metin
     * @param {string} term - Aranacak terim
     * @returns {string} Vurgulanmış metin
     */
    function highlight_text(text, term) {
        if (!term) return escape_html(text);
        
        var escaped_term = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + escaped_term + ')', 'gi');
        
        return escape_html(text).replace(regex, '<span class="search_highlight">$1</span>');
    }

    /**
     * Sayaç metnini günceller
     * @param {number} count - Görüntülenen soru sayısı
     */
    function update_count(count) {
        var total = faq_data.questions.length;
        
        if (search_term.length > 0 || current_category !== 'all') {
            $faq_count.text(count + ' / ' + total + ' soru gösteriliyor');
        } else {
            $faq_count.text('Toplam ' + total + ' soru');
        }
    }

    /**
     * Loading durumunu gösterir/gizler
     * @param {boolean} show - Göster/Gizle
     */
    function show_loading(show) {
        if (show) {
            $faq_loading.show();
            $faq_list.hide();
        } else {
            $faq_loading.hide();
        }
    }

    /**
     * Hata durumunu gösterir
     */
    function show_error_state() {
        $faq_list.html(
            '<div class="faq_empty">' +
                '<div class="faq_empty__icon" style="background: rgba(220, 53, 69, 0.1);">' +
                    '<i class="fa-solid fa-exclamation-triangle" style="color: #DC3545;"></i>' +
                '</div>' +
                '<h3 class="faq_empty__title">Bağlantı Hatası</h3>' +
                '<p class="faq_empty__text">Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>' +
                '<button class="faq_empty__button" onclick="location.reload();">' +
                    '<i class="fa-solid fa-arrow-rotate-right"></i> Yenile' +
                '</button>' +
            '</div>'
        ).show();
    }

    /**
     * URL parametrelerini kontrol eder ve ilgili işlemleri yapar
     */
    function check_url_parameters() {
        var url_params = new URLSearchParams(window.location.search);
        
        // Belirli bir soru açılacak mı?
        var question_id = url_params.get('q');
        if (question_id) {
            expand_question(parseInt(question_id));
        }

        // Arama terimi var mı?
        var search_param = url_params.get('search');
        if (search_param) {
            $search_input.val(search_param);
            search_term = search_param;
            toggle_clear_button();
            render_questions();
        }
    }

    /**
     * Belirli bir soruyu açar
     * @param {number} question_id - Soru ID'si
     */
    function expand_question(question_id) {
        setTimeout(function() {
            var $target = $('.faq_item[data-id="' + question_id + '"]');
            if ($target.length) {
                $target.addClass('faq_item--expanded');
                
                // Scroll to question
                $('html, body').animate({
                    scrollTop: $target.offset().top - 100
                }, 500);
            }
        }, 100);
    }

    /**
     * Accordion toggle işlemi
     * @param {jQuery} $item - Tıklanan FAQ item
     */
    function toggle_accordion($item) {
        var is_expanded = $item.hasClass('faq_item--expanded');

        // Diğer açık olanları kapat
        $('.faq_item--expanded').removeClass('faq_item--expanded');

        // Tıklananı aç/kapat
        if (!is_expanded) {
            $item.addClass('faq_item--expanded');
        }
    }

    /**
     * Kategori seçimini günceller
     * @param {string} category_id - Kategori ID
     */
    function select_category(category_id) {
        current_category = category_id;

        // Sidebar aktif durumu
        $('.faq_sidebar__link').removeClass('faq_sidebar__link--active');
        $('.faq_sidebar__link[data-category="' + category_id + '"]').addClass('faq_sidebar__link--active');

        // Mobil select güncelle
        $mobile_category.val(category_id);

        // Soruları yeniden render et
        render_questions();
    }

    /**
     * Arama temizle butonunu göster/gizle
     */
    function toggle_clear_button() {
        if ($search_input.val().length > 0) {
            $search_clear.addClass('faq_search__clear--visible');
        } else {
            $search_clear.removeClass('faq_search__clear--visible');
        }
    }

    /**
     * Aramayı sıfırlar
     */
    function reset_search() {
        $search_input.val('');
        search_term = '';
        toggle_clear_button();
        render_questions();
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

    // Accordion tıklama (Event Delegation)
    $(document).on('click', '.faq_item__header', function() {
        var $item = $(this).closest('.faq_item');
        toggle_accordion($item);
    });

    // Sidebar kategori tıklama
    $(document).on('click', '.faq_sidebar__link', function(e) {
        e.preventDefault();
        var category = $(this).data('category');
        select_category(category);
    });

    // Mobil kategori değişimi
    $mobile_category.on('change', function() {
        var category = $(this).val();
        select_category(category);
    });

    // Arama input (debounce ile)
    $search_input.on('input', function() {
        toggle_clear_button();

        // Debounce - 300ms bekle
        clearTimeout(debounce_timer);
        debounce_timer = setTimeout(function() {
            search_term = $search_input.val().trim();
            render_questions();
        }, 300);
    });

    // Arama temizle butonu
    $search_clear.on('click', function() {
        reset_search();
    });

    // "Aramayı Temizle" butonu (boş durumda)
    $reset_search.on('click', function() {
        reset_search();
        select_category('all');
    });

    // ============================================
    // BAŞLATMA (Initialization)
    // ============================================

    // Sayfa yüklendiğinde verileri getir
    load_faq_data();
});

