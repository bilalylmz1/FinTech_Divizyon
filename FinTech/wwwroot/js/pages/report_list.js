/**
 * Rapor Listesi Sayfası JavaScript
 * =================================
 * Bu dosya, Rapor Listesi sayfasındaki:
 * - Accordion (açılır-kapanır) işlevselliği
 * - Kategori filtreleme
 * - Anlık arama
 * - Sıralama
 * işlevlerini yönetir.
 * 
 * Veri Kaynağı: /data/reports_data.json (CMS/Statik)
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $category_list = $('#report_category_list');
    var $mobile_category = $('#report_mobile_category');
    var $report_list = $('#report_list');
    var $report_loading = $('#report_loading');
    var $report_empty = $('#report_empty');
    var $report_count = $('#report_count');
    var $search_input = $('#report_search_input');
    var $search_clear = $('#report_search_clear');
    var $sort_select = $('#report_sort');
    var $reset_search = $('#report_reset_search');
    var $sidebar_total = $('#sidebar_total_reports');
    var $sidebar_update = $('#sidebar_last_update');

    // State (Durum Yönetimi)
    var reports_data = null;
    var current_category = 'all';
    var search_term = '';
    var sort_by = 'date_desc';
    var debounce_timer = null;

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * JSON verilerini yükler
     */
    function load_reports_data() {
        show_loading(true);

        $.ajax({
            url: '/data/reports_data.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                reports_data = data;
                render_categories();
                render_reports();
                update_sidebar_summary();
                show_loading(false);
            },
            error: function(xhr, status, error) {
                console.error('Rapor verileri yüklenemedi:', error);
                show_loading(false);
                show_error_state();
            }
        });
    }

    /**
     * Kategorileri sidebar ve mobil select'e render eder
     */
    function render_categories() {
        if (!reports_data || !reports_data.categories) return;

        // "Tümü" seçeneği
        var sidebar_html = '<li class="report_sidebar__item">' +
            '<a href="#" class="report_sidebar__link report_sidebar__link--active" data-category="all">' +
                '<i class="fa-solid fa-list"></i>' +
                '<span>Tümü</span>' +
                '<span class="report_sidebar__count">' + reports_data.reports.length + '</span>' +
            '</a></li>';

        var mobile_html = '';

        // Kategorileri döngüyle ekle
        reports_data.categories.forEach(function(cat) {
            var count = reports_data.reports.filter(function(r) {
                return r.category_id === cat.id;
            }).length;

            sidebar_html += '<li class="report_sidebar__item">' +
                '<a href="#" class="report_sidebar__link" data-category="' + cat.id + '">' +
                    '<i class="' + cat.icon + '"></i>' +
                    '<span>' + escape_html(cat.name) + '</span>' +
                    '<span class="report_sidebar__count">' + count + '</span>' +
                '</a></li>';

            mobile_html += '<option value="' + cat.id + '">' + escape_html(cat.name) + ' (' + count + ')</option>';
        });

        $category_list.html(sidebar_html);
        $mobile_category.append(mobile_html);
    }

    /**
     * Filtrelenmiş raporları render eder
     */
    function render_reports() {
        if (!reports_data || !reports_data.reports) return;

        // Filtreleme ve sıralama
        var filtered = filter_and_sort_reports();

        // Sayaç güncelle
        update_count(filtered.length);

        // Boş durum kontrolü
        if (filtered.length === 0) {
            $report_list.hide();
            $report_empty.show();
            return;
        }

        $report_empty.hide();
        $report_list.show();

        // HTML oluştur
        var html = '';
        filtered.forEach(function(report) {
            html += create_report_item_html(report);
        });

        $report_list.html(html);
    }

    /**
     * Raporları filtreler ve sıralar
     * @returns {Array} Filtrelenmiş rapor listesi
     */
    function filter_and_sort_reports() {
        var reports = reports_data.reports.slice(); // Kopyasını al

        // Kategori filtresi
        if (current_category !== 'all') {
            reports = reports.filter(function(r) {
                return r.category_id === current_category;
            });
        }

        // Arama filtresi
        if (search_term.length > 0) {
            var term = search_term.toLowerCase();
            reports = reports.filter(function(r) {
                return r.title.toLowerCase().indexOf(term) !== -1 ||
                       r.description.toLowerCase().indexOf(term) !== -1;
            });
        }

        // Sıralama
        reports.sort(function(a, b) {
            switch (sort_by) {
                case 'date_asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date_desc':
                    return new Date(b.date) - new Date(a.date);
                case 'name_asc':
                    return a.title.localeCompare(b.title, 'tr');
                case 'name_desc':
                    return b.title.localeCompare(a.title, 'tr');
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        return reports;
    }

    /**
     * Tek bir rapor item için HTML oluşturur
     * @param {Object} report - Rapor objesi
     * @returns {string} HTML string
     */
    function create_report_item_html(report) {
        var icon_class = 'report_item__icon--' + report.icon_type;
        var category = get_category_name(report.category_id);
        
        // Özet değerlerini hazırla
        var summary_html = '';
        if (report.summary) {
            var keys = Object.keys(report.summary);
            keys.forEach(function(key) {
                if (key !== 'status') {
                    var value = report.summary[key];
                    var value_class = '';
                    
                    // Durum bazlı renklendirme
                    if (report.summary.status === 'İyi' || report.summary.status === 'Pozitif') {
                        value_class = 'report_detail_box__value--success';
                    } else if (report.summary.status === 'Dikkat') {
                        value_class = 'report_detail_box__value--warning';
                    }
                    
                    summary_html += '<div class="report_detail_box">' +
                        '<div class="report_detail_box__label">' + format_key(key) + '</div>' +
                        '<div class="report_detail_box__value ' + value_class + '">' + value + '</div>' +
                    '</div>';
                }
            });
        }

        return '<div class="report_item" data-id="' + report.id + '">' +
                   '<div class="report_item__header">' +
                       '<div class="report_item__icon ' + icon_class + '">' +
                           '<i class="' + get_report_icon(report.icon_type) + '"></i>' +
                       '</div>' +
                       '<div class="report_item__info">' +
                           '<h3 class="report_item__title">' + escape_html(report.title) + '</h3>' +
                           '<div class="report_item__meta">' +
                               '<span class="report_item__date"><i class="fa-solid fa-calendar"></i> ' + format_date(report.date) + '</span>' +
                               '<span class="report_item__category">' + category + '</span>' +
                           '</div>' +
                       '</div>' +
                       '<div class="report_item__actions">' +
                           (report.is_downloadable ? '<button class="report_item__download" title="PDF İndir"><i class="fa-solid fa-download"></i></button>' : '') +
                           '<span class="report_item__expand_icon"><i class="fa-solid fa-chevron-down"></i></span>' +
                       '</div>' +
                   '</div>' +
                   '<div class="report_item__body">' +
                       '<div class="report_item__detail">' +
                           '<div class="report_item__detail_grid">' + summary_html + '</div>' +
                           '<p class="report_item__detail_description">' + escape_html(report.description) + '</p>' +
                           '<div class="report_item__detail_actions">' +
                               '<a href="#" class="report_detail_btn report_detail_btn--primary"><i class="fa-solid fa-eye"></i> Detaylı Görüntüle</a>' +
                               '<a href="#" class="report_detail_btn report_detail_btn--outline"><i class="fa-solid fa-share"></i> Paylaş</a>' +
                           '</div>' +
                       '</div>' +
                   '</div>' +
               '</div>';
    }

    /**
     * Rapor tipine göre ikon döndürür
     */
    function get_report_icon(type) {
        var icons = {
            'score': 'fa-solid fa-gauge-high',
            'analysis': 'fa-solid fa-chart-line',
            'history': 'fa-solid fa-clock-rotate-left',
            'monthly': 'fa-solid fa-calendar-days'
        };
        return icons[type] || 'fa-solid fa-file';
    }

    /**
     * Kategori ID'sinden isim döndürür
     */
    function get_category_name(category_id) {
        if (!reports_data || !reports_data.categories) return '';
        
        var category = reports_data.categories.find(function(c) {
            return c.id === category_id;
        });
        
        return category ? category.name : '';
    }

    /**
     * Anahtar ismini formatlar
     */
    function format_key(key) {
        var keys = {
            'score': 'Skor',
            'change': 'Değişim',
            'income': 'Gelir',
            'expense': 'Gider',
            'total_applications': 'Toplam Başvuru',
            'approved': 'Onaylanan',
            'on_time': 'Zamanında',
            'late': 'Gecikmeli',
            'top_category': 'En Yüksek',
            'percentage': 'Oran'
        };
        return keys[key] || key;
    }

    /**
     * Sayaç metnini günceller
     */
    function update_count(count) {
        var total = reports_data.reports.length;
        
        if (search_term.length > 0 || current_category !== 'all') {
            $report_count.text(count + ' / ' + total + ' rapor gösteriliyor');
        } else {
            $report_count.text('Toplam ' + total + ' rapor');
        }
    }

    /**
     * Sidebar özet bilgilerini günceller
     */
    function update_sidebar_summary() {
        if (!reports_data) return;
        
        $sidebar_total.text(reports_data.reports.length);
        $sidebar_update.text(format_date(reports_data.last_update));
    }

    /**
     * Tarihi formatlar
     */
    function format_date(date_str) {
        if (!date_str) return '-';
        
        var date = new Date(date_str);
        var options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('tr-TR', options);
    }

    /**
     * Loading durumunu gösterir/gizler
     */
    function show_loading(show) {
        if (show) {
            $report_loading.show();
            $report_list.hide();
        } else {
            $report_loading.hide();
        }
    }

    /**
     * Hata durumunu gösterir
     */
    function show_error_state() {
        $report_list.html(
            '<div class="report_empty">' +
                '<div class="report_empty__icon" style="background: rgba(220, 53, 69, 0.1);">' +
                    '<i class="fa-solid fa-exclamation-triangle" style="color: #DC3545;"></i>' +
                '</div>' +
                '<h3 class="report_empty__title">Bağlantı Hatası</h3>' +
                '<p class="report_empty__text">Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>' +
                '<button class="report_empty__button" onclick="location.reload();">' +
                    '<i class="fa-solid fa-arrow-rotate-right"></i> Yenile' +
                '</button>' +
            '</div>'
        ).show();
    }

    /**
     * Accordion toggle işlemi
     */
    function toggle_accordion($item) {
        var is_expanded = $item.hasClass('report_item--expanded');

        // Diğer açık olanları kapat
        $('.report_item--expanded').removeClass('report_item--expanded');

        // Tıklananı aç/kapat
        if (!is_expanded) {
            $item.addClass('report_item--expanded');
        }
    }

    /**
     * Kategori seçimini günceller
     */
    function select_category(category_id) {
        current_category = category_id;

        // Sidebar aktif durumu
        $('.report_sidebar__link').removeClass('report_sidebar__link--active');
        $('.report_sidebar__link[data-category="' + category_id + '"]').addClass('report_sidebar__link--active');

        // Mobil select güncelle
        $mobile_category.val(category_id);

        // Raporları yeniden render et
        render_reports();
    }

    /**
     * Arama temizle butonunu göster/gizle
     */
    function toggle_clear_button() {
        if ($search_input.val().length > 0) {
            $search_clear.addClass('report_search__clear--visible');
        } else {
            $search_clear.removeClass('report_search__clear--visible');
        }
    }

    /**
     * Aramayı sıfırlar
     */
    function reset_search() {
        $search_input.val('');
        search_term = '';
        toggle_clear_button();
        render_reports();
    }

    /**
     * HTML özel karakterlerini escape eder (XSS koruması)
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
    $(document).on('click', '.report_item__header', function(e) {
        // Download butonuna tıklandıysa accordion'u açma
        if ($(e.target).closest('.report_item__download').length) {
            return;
        }
        
        var $item = $(this).closest('.report_item');
        toggle_accordion($item);
    });

    // İndirme butonu tıklama
    $(document).on('click', '.report_item__download', function(e) {
        e.stopPropagation();
        // TODO: PDF indirme işlemi
        alert('Rapor PDF olarak indiriliyor...');
    });

    // Sidebar kategori tıklama
    $(document).on('click', '.report_sidebar__link', function(e) {
        e.preventDefault();
        var category = $(this).data('category');
        select_category(category);
    });

    // Mobil kategori değişimi
    $mobile_category.on('change', function() {
        var category = $(this).val();
        select_category(category);
    });

    // Sıralama değişimi
    $sort_select.on('change', function() {
        sort_by = $(this).val();
        render_reports();
    });

    // Arama input (debounce ile)
    $search_input.on('input', function() {
        toggle_clear_button();

        // Debounce - 300ms bekle
        clearTimeout(debounce_timer);
        debounce_timer = setTimeout(function() {
            search_term = $search_input.val().trim();
            render_reports();
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
    load_reports_data();
});

