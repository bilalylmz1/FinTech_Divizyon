/**
 * Kredi Teklifleri Sayfası JavaScript
 * ====================================
 * Bu dosya, Kredi Teklifleri sayfasındaki:
 * - Öne çıkan teklif gösterimi
 * - Teklif kartları render
 * - Filtreleme ve sıralama
 * işlevlerini yönetir.
 * 
 * Veri Kaynağı: /data/credit_offers_data.json (CMS/Statik)
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $featured_offer = $('#featured_offer');
    var $offers_grid = $('#offers_grid');
    var $offers_loading = $('#offers_loading');
    var $offers_empty = $('#offers_empty');
    var $type_filter = $('#offer_type_filter');
    var $sort_filter = $('#offer_sort');
    var $reset_filter = $('#offers_reset_filter');

    // State (Durum Yönetimi)
    var offers_data = null;
    var current_type = 'all';
    var sort_by = 'recommended';

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * JSON verilerini yükler
     */
    function load_offers_data() {
        show_loading(true);

        $.ajax({
            url: '/data/credit_offers_data.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                offers_data = data;
                render_featured_offer();
                render_offers();
                show_loading(false);
            },
            error: function(xhr, status, error) {
                console.error('Kredi teklif verileri yüklenemedi:', error);
                show_loading(false);
                show_error_state();
            }
        });
    }

    /**
     * Öne çıkan teklifi render eder
     */
    function render_featured_offer() {
        if (!offers_data || !offers_data.featured_offer) {
            $featured_offer.hide();
            return;
        }

        var offer = offers_data.featured_offer;
        
        var html = '<div class="featured_offer_card">' +
                       '<span class="featured_offer__badge">' +
                           '<i class="fa-solid fa-star"></i> ' + offer.badge +
                       '</span>' +
                       '<div class="featured_offer__content">' +
                           '<div class="featured_offer__bank">' + escape_html(offer.bank_name) + '</div>' +
                           '<h2 class="featured_offer__title">' + escape_html(offer.title) + '</h2>' +
                           '<div class="featured_offer__details">' +
                               '<div class="featured_offer__detail">' +
                                   '<span class="featured_offer__detail_label">Maksimum Tutar</span>' +
                                   '<span class="featured_offer__detail_value">' + format_currency(offer.max_amount) + '</span>' +
                               '</div>' +
                               '<div class="featured_offer__detail">' +
                                   '<span class="featured_offer__detail_label">Vade</span>' +
                                   '<span class="featured_offer__detail_value">' + offer.max_term + ' Ay</span>' +
                               '</div>' +
                               '<div class="featured_offer__detail">' +
                                   '<span class="featured_offer__detail_label">Aylık Taksit</span>' +
                                   '<span class="featured_offer__detail_value">' + format_currency(offer.monthly_payment) + '</span>' +
                               '</div>' +
                           '</div>' +
                       '</div>' +
                       '<div class="featured_offer__action">' +
                           '<div class="featured_offer__rate">' +
                               '<span class="featured_offer__rate_label">Aylık Faiz</span>' +
                               '<span class="featured_offer__rate_value">%' + offer.interest_rate.toFixed(2).replace('.', ',') + '</span>' +
                           '</div>' +
                           '<a href="#" class="featured_offer__button">' +
                               '<i class="fa-solid fa-paper-plane"></i> Hemen Başvur' +
                           '</a>' +
                       '</div>' +
                   '</div>';

        $featured_offer.html(html).show();
    }

    /**
     * Teklif kartlarını render eder
     */
    function render_offers() {
        if (!offers_data || !offers_data.offers) return;

        // Filtreleme ve sıralama
        var filtered = filter_and_sort_offers();

        // Boş durum kontrolü
        if (filtered.length === 0) {
            $offers_grid.hide();
            $offers_empty.show();
            return;
        }

        $offers_empty.hide();
        $offers_grid.show();

        // HTML oluştur
        var html = '';
        filtered.forEach(function(offer) {
            html += create_offer_card_html(offer);
        });

        $offers_grid.html(html);
    }

    /**
     * Teklifleri filtreler ve sıralar
     * @returns {Array} Filtrelenmiş teklif listesi
     */
    function filter_and_sort_offers() {
        var offers = offers_data.offers.slice(); // Kopyasını al

        // Tür filtresi
        if (current_type !== 'all') {
            offers = offers.filter(function(o) {
                return o.type === current_type;
            });
        }

        // Sadece aktif teklifleri göster
        offers = offers.filter(function(o) {
            return o.is_active === true;
        });

        // Sıralama
        offers.sort(function(a, b) {
            switch (sort_by) {
                case 'rate_asc':
                    return a.interest_rate - b.interest_rate;
                case 'rate_desc':
                    return b.interest_rate - a.interest_rate;
                case 'amount_desc':
                    return b.max_amount - a.max_amount;
                case 'recommended':
                default:
                    // Önce badge'li olanlar, sonra faiz oranına göre
                    if (a.badge && !b.badge) return -1;
                    if (!a.badge && b.badge) return 1;
                    return a.interest_rate - b.interest_rate;
            }
        });

        return offers;
    }

    /**
     * Tek bir teklif kartı için HTML oluşturur
     * @param {Object} offer - Teklif objesi
     * @returns {string} HTML string
     */
    function create_offer_card_html(offer) {
        // Badge HTML
        var badge_html = '';
        if (offer.badge) {
            badge_html = '<span class="offer_card__badge offer_card__badge--' + offer.badge + '">' + 
                         offer.badge_label + '</span>';
        }

        // Features HTML
        var features_html = '';
        if (offer.features && offer.features.length > 0) {
            offer.features.forEach(function(feature) {
                features_html += '<div class="offer_card__feature">' +
                                    '<i class="fa-solid fa-check"></i>' +
                                    '<span>' + escape_html(feature) + '</span>' +
                                '</div>';
            });
        }

        return '<div class="offer_card" data-id="' + offer.id + '">' +
                   '<div class="offer_card__header">' +
                       '<div class="offer_card__bank_info">' +
                           '<div class="offer_card__bank_logo">' +
                               '<i class="' + offer.bank_icon + '"></i>' +
                           '</div>' +
                           '<div>' +
                               '<h4 class="offer_card__bank_name">' + escape_html(offer.bank_name) + '</h4>' +
                               '<span class="offer_card__type">' + escape_html(offer.type_label) + '</span>' +
                           '</div>' +
                       '</div>' +
                       badge_html +
                   '</div>' +
                   '<div class="offer_card__body">' +
                       '<h3 class="offer_card__title">' + escape_html(offer.title) + '</h3>' +
                       '<div class="offer_card__features">' + features_html + '</div>' +
                   '</div>' +
                   '<div class="offer_card__stats">' +
                       '<div class="offer_card__stat">' +
                           '<div class="offer_card__stat_label">Faiz Oranı</div>' +
                           '<div class="offer_card__stat_value offer_card__stat_value--highlight">%' + 
                               offer.interest_rate.toFixed(2).replace('.', ',') + '</div>' +
                       '</div>' +
                       '<div class="offer_card__stat">' +
                           '<div class="offer_card__stat_label">Maks. Tutar</div>' +
                           '<div class="offer_card__stat_value">' + format_currency_short(offer.max_amount) + '</div>' +
                       '</div>' +
                       '<div class="offer_card__stat">' +
                           '<div class="offer_card__stat_label">Vade</div>' +
                           '<div class="offer_card__stat_value">' + offer.max_term + ' Ay</div>' +
                       '</div>' +
                   '</div>' +
                   '<div class="offer_card__footer">' +
                       '<a href="#" class="offer_card__button offer_card__button--primary">Başvur</a>' +
                       '<a href="#" class="offer_card__button offer_card__button--outline">Detay</a>' +
                   '</div>' +
               '</div>';
    }

    /**
     * Para birimini formatlar (tam)
     */
    function format_currency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Para birimini formatlar (kısa)
     */
    function format_currency_short(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1).replace('.', ',') + ' M ₺';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + ' B ₺';
        }
        return amount + ' ₺';
    }

    /**
     * Loading durumunu gösterir/gizler
     */
    function show_loading(show) {
        if (show) {
            $offers_loading.show();
            $offers_grid.hide();
            $featured_offer.hide();
        } else {
            $offers_loading.hide();
        }
    }

    /**
     * Hata durumunu gösterir
     */
    function show_error_state() {
        $offers_grid.html(
            '<div class="offers_empty" style="grid-column: span 2;">' +
                '<div class="offers_empty__icon" style="background: rgba(220, 53, 69, 0.1);">' +
                    '<i class="fa-solid fa-exclamation-triangle" style="color: #DC3545;"></i>' +
                '</div>' +
                '<h3 class="offers_empty__title">Bağlantı Hatası</h3>' +
                '<p class="offers_empty__text">Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>' +
                '<button class="offers_empty__button" onclick="location.reload();">' +
                    '<i class="fa-solid fa-arrow-rotate-right"></i> Yenile' +
                '</button>' +
            '</div>'
        ).show();
    }

    /**
     * Filtreleri sıfırlar
     */
    function reset_filters() {
        current_type = 'all';
        sort_by = 'recommended';
        $type_filter.val('all');
        $sort_filter.val('recommended');
        render_offers();
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

    // Tür filtresi değişimi
    $type_filter.on('change', function() {
        current_type = $(this).val();
        render_offers();
    });

    // Sıralama değişimi
    $sort_filter.on('change', function() {
        sort_by = $(this).val();
        render_offers();
    });

    // Filtre sıfırlama
    $reset_filter.on('click', function() {
        reset_filters();
    });

    // Başvur butonu tıklama (Event Delegation)
    $(document).on('click', '.offer_card__button--primary, .featured_offer__button', function(e) {
        e.preventDefault();
        // TODO: Başvuru sayfasına yönlendirme
        alert('Kredi başvuru sayfasına yönlendiriliyorsunuz...');
    });

    // Detay butonu tıklama
    $(document).on('click', '.offer_card__button--outline', function(e) {
        e.preventDefault();
        var offer_id = $(this).closest('.offer_card').data('id');
        // TODO: Teklif detay modalı veya sayfası
        alert('Teklif detayı görüntüleniyor: #' + offer_id);
    });

    // ============================================
    // BAŞLATMA (Initialization)
    // ============================================

    // Sayfa yüklendiğinde verileri getir
    load_offers_data();
});

