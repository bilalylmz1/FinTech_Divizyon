/**
 * Rapor Detayları Merkezi JavaScript
 * ===================================
 * Bu dosya, Rapor Detayları ana sayfasındaki:
 * - İstatistik verilerinin yüklenmesi
 * - Son aktivitelerin gösterilmesi
 * işlevlerini yönetir.
 * 
 * Veri Kaynakları:
 * - /data/reports_data.json
 * - /data/credit_offers_data.json
 * - /data/invoices_data.json
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $total_reports = $('#total_reports');
    var $active_offers = $('#active_offers');
    var $pending_invoices = $('#pending_invoices');
    var $report_list_count = $('#report_list_count');
    var $report_list_date = $('#report_list_date');
    var $credit_offers_count = $('#credit_offers_count');
    var $new_offers_badge = $('#new_offers_badge');
    var $invoices_count = $('#invoices_count');
    var $pending_badge = $('#pending_badge');
    var $recent_activities_list = $('#recent_activities_list');

    // Veri depoları
    var reports_data = null;
    var offers_data = null;
    var invoices_data = null;

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * Tüm verileri paralel olarak yükler
     */
    function load_all_data() {
        show_loading();

        // Paralel AJAX istekleri
        $.when(
            $.ajax({ url: '/data/reports_data.json', type: 'GET', dataType: 'json' }),
            $.ajax({ url: '/data/credit_offers_data.json', type: 'GET', dataType: 'json' }),
            $.ajax({ url: '/data/invoices_data.json', type: 'GET', dataType: 'json' })
        ).done(function(reports_response, offers_response, invoices_response) {
            // AJAX .done() her response için [data, status, xhr] array döndürür
            reports_data = reports_response[0];
            offers_data = offers_response[0];
            invoices_data = invoices_response[0];

            update_hero_stats();
            update_card_meta();
            render_recent_activities();
        }).fail(function(xhr, status, error) {
            console.error('Veriler yüklenemedi:', error);
            show_error_state();
        });
    }

    /**
     * Hero bölümündeki istatistikleri günceller
     */
    function update_hero_stats() {
        // Toplam rapor sayısı
        if (reports_data && reports_data.reports) {
            $total_reports.text(reports_data.reports.length);
        }

        // Aktif teklif sayısı
        if (offers_data && offers_data.offers) {
            var active_count = offers_data.offers.filter(function(o) {
                return o.is_active === true;
            }).length;
            $active_offers.text(active_count);
        }

        // Bekleyen fatura sayısı
        if (invoices_data && invoices_data.summary) {
            $pending_invoices.text(invoices_data.summary.pending);
        }
    }

    /**
     * Kategori kartlarındaki meta bilgileri günceller
     */
    function update_card_meta() {
        // Rapor Listesi kartı
        if (reports_data && reports_data.reports) {
            $report_list_count.html('<i class="fa-solid fa-file"></i> ' + reports_data.reports.length + ' rapor');
            
            // Son güncelleme tarihi
            var last_update = format_date(reports_data.last_update);
            $report_list_date.html('<i class="fa-solid fa-clock"></i> ' + last_update);
        }

        // Kredi Teklifleri kartı
        if (offers_data && offers_data.offers) {
            var offer_count = offers_data.offers.length;
            $credit_offers_count.html('<i class="fa-solid fa-tag"></i> ' + offer_count + ' teklif');

            // Yeni teklif varsa badge göster
            var new_offers = offers_data.offers.filter(function(o) {
                return o.badge === 'new';
            });
            if (new_offers.length > 0) {
                $new_offers_badge.show();
            }
        }

        // Faturalar kartı
        if (invoices_data && invoices_data.summary) {
            $invoices_count.html('<i class="fa-solid fa-receipt"></i> ' + invoices_data.summary.total + ' fatura');

            // Bekleyen varsa badge göster
            if (invoices_data.summary.pending > 0 || invoices_data.summary.overdue > 0) {
                $pending_badge.show();
            }
        }
    }

    /**
     * Son aktiviteleri render eder
     */
    function render_recent_activities() {
        var activities = [];

        // Raporlardan aktivite ekle
        if (reports_data && reports_data.reports) {
            reports_data.reports.slice(0, 2).forEach(function(report) {
                activities.push({
                    type: 'report',
                    title: report.title,
                    date: report.date,
                    status: 'new',
                    icon: 'report'
                });
            });
        }

        // Faturalardan aktivite ekle
        if (invoices_data && invoices_data.invoices) {
            invoices_data.invoices.slice(0, 2).forEach(function(invoice) {
                activities.push({
                    type: 'invoice',
                    title: invoice.description,
                    date: invoice.date,
                    status: invoice.status,
                    icon: invoice.status === 'paid' ? 'payment' : 'invoice'
                });
            });
        }

        // Tarihe göre sırala (en yeni önce)
        activities.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        // İlk 5 aktiviteyi göster
        activities = activities.slice(0, 5);

        if (activities.length === 0) {
            show_empty_activities();
            return;
        }

        // HTML oluştur
        var html = '';
        activities.forEach(function(activity) {
            html += create_activity_html(activity);
        });

        $recent_activities_list.html(html);
    }

    /**
     * Tek bir aktivite için HTML oluşturur
     * @param {Object} activity - Aktivite objesi
     * @returns {string} HTML string
     */
    function create_activity_html(activity) {
        var icon_class = 'activity_item__icon--' + activity.icon;
        var icon = get_activity_icon(activity.icon);
        var status_class = 'activity_item__status--' + activity.status;
        var status_text = get_status_text(activity.status);

        return '<div class="activity_item">' +
                   '<div class="activity_item__icon ' + icon_class + '">' +
                       '<i class="' + icon + '"></i>' +
                   '</div>' +
                   '<div class="activity_item__content">' +
                       '<h4 class="activity_item__title">' + escape_html(activity.title) + '</h4>' +
                       '<span class="activity_item__date">' + format_date(activity.date) + '</span>' +
                   '</div>' +
                   '<span class="activity_item__status ' + status_class + '">' + status_text + '</span>' +
               '</div>';
    }

    /**
     * Aktivite tipine göre ikon döndürür
     * @param {string} type - Aktivite tipi
     * @returns {string} Font Awesome ikon class'ı
     */
    function get_activity_icon(type) {
        var icons = {
            'report': 'fa-solid fa-file-lines',
            'offer': 'fa-solid fa-hand-holding-dollar',
            'invoice': 'fa-solid fa-receipt',
            'payment': 'fa-solid fa-circle-check'
        };
        return icons[type] || 'fa-solid fa-circle';
    }

    /**
     * Durum koduna göre metin döndürür
     * @param {string} status - Durum kodu
     * @returns {string} Durum metni
     */
    function get_status_text(status) {
        var texts = {
            'new': 'Yeni',
            'pending': 'Bekliyor',
            'paid': 'Ödendi',
            'completed': 'Tamamlandı'
        };
        return texts[status] || status;
    }

    /**
     * Tarihi formatlar
     * @param {string} date_str - ISO tarih string'i
     * @returns {string} Formatlanmış tarih
     */
    function format_date(date_str) {
        if (!date_str) return '-';
        
        var date = new Date(date_str);
        var options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('tr-TR', options);
    }

    /**
     * Yükleme durumunu gösterir
     */
    function show_loading() {
        $recent_activities_list.html(
            '<div class="activities_loading">' +
                '<div class="activities_loading__spinner"></div>' +
            '</div>'
        );
    }

    /**
     * Hata durumunu gösterir
     */
    function show_error_state() {
        $recent_activities_list.html(
            '<div class="activities_empty">' +
                '<div class="activities_empty__icon"><i class="fa-solid fa-exclamation-triangle"></i></div>' +
                '<p class="activities_empty__text">Veriler yüklenirken bir hata oluştu</p>' +
            '</div>'
        );
    }

    /**
     * Boş aktivite durumunu gösterir
     */
    function show_empty_activities() {
        $recent_activities_list.html(
            '<div class="activities_empty">' +
                '<div class="activities_empty__icon"><i class="fa-solid fa-clock"></i></div>' +
                '<p class="activities_empty__text">Henüz aktivite bulunmuyor</p>' +
            '</div>'
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
    // BAŞLATMA (Initialization)
    // ============================================

    // Sayfa yüklendiğinde verileri getir
    load_all_data();
});

