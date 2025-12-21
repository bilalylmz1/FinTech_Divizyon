/**
 * Faturalar Sayfası JavaScript
 * =============================
 * Bu dosya, Faturalar sayfasındaki:
 * - Fatura tablosu ve kart render
 * - Durum ve tarih filtreleme
 * - Arama fonksiyonu
 * - Sayfalama
 * işlevlerini yönetir.
 * 
 * Veri Kaynağı: /data/invoices_data.json (CMS/Statik)
 */

$(document).ready(function() {
    'use strict';

    // ============================================
    // DOM Element Önbellekleme (Selector Caching)
    // ============================================
    var $invoice_table_body = $('#invoice_table_body');
    var $invoice_cards = $('#invoice_cards');
    var $invoice_table_wrapper = $('#invoice_table_wrapper');
    var $invoice_loading = $('#invoice_loading');
    var $invoice_empty = $('#invoice_empty');
    var $invoice_count = $('#invoice_count');
    var $search_input = $('#invoice_search_input');
    var $search_clear = $('#invoice_search_clear');
    var $status_filter = $('#invoice_status_filter');
    var $date_filter = $('#invoice_date_filter');
    var $reset_filter = $('#invoice_reset_filter');
    var $pagination = $('#invoice_pagination');
    var $pagination_info = $('#pagination_info');
    var $prev_page = $('#prev_page');
    var $next_page = $('#next_page');

    // Summary elements
    var $total_invoices = $('#total_invoices');
    var $paid_invoices = $('#paid_invoices');
    var $pending_invoices_count = $('#pending_invoices_count');
    var $pending_amount = $('#pending_amount');

    // State (Durum Yönetimi)
    var invoices_data = null;
    var current_status = 'all';
    var current_date_range = 'all';
    var search_term = '';
    var current_page = 1;
    var items_per_page = 10;
    var debounce_timer = null;

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================

    /**
     * JSON verilerini yükler
     */
    function load_invoices_data() {
        show_loading(true);

        $.ajax({
            url: '/data/invoices_data.json',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                invoices_data = data;
                update_summary();
                render_invoices();
                show_loading(false);
            },
            error: function(xhr, status, error) {
                console.error('Fatura verileri yüklenemedi:', error);
                show_loading(false);
                show_error_state();
            }
        });
    }

    /**
     * Özet kartlarını günceller
     */
    function update_summary() {
        if (!invoices_data || !invoices_data.summary) return;

        var summary = invoices_data.summary;
        
        $total_invoices.text(summary.total);
        $paid_invoices.text(summary.paid);
        $pending_invoices_count.text(summary.pending + summary.overdue);
        $pending_amount.text(format_currency(summary.pending_amount));
    }

    /**
     * Faturaları render eder
     */
    function render_invoices() {
        if (!invoices_data || !invoices_data.invoices) return;

        // Filtreleme
        var filtered = filter_invoices();

        // Sayaç güncelle
        update_count(filtered.length);

        // Boş durum kontrolü
        if (filtered.length === 0) {
            $invoice_table_wrapper.hide();
            $invoice_cards.hide();
            $pagination.hide();
            $invoice_empty.show();
            return;
        }

        $invoice_empty.hide();

        // Sayfalama
        var total_pages = Math.ceil(filtered.length / items_per_page);
        var start_index = (current_page - 1) * items_per_page;
        var end_index = start_index + items_per_page;
        var paginated = filtered.slice(start_index, end_index);

        // Tablo HTML oluştur
        var table_html = '';
        var cards_html = '';
        
        paginated.forEach(function(invoice) {
            table_html += create_table_row_html(invoice);
            cards_html += create_card_html(invoice);
        });

        $invoice_table_body.html(table_html);
        $invoice_cards.html(cards_html);
        $invoice_table_wrapper.show();
        $invoice_cards.show();

        // Sayfalama güncelle
        update_pagination(total_pages);
    }

    /**
     * Faturaları filtreler
     * @returns {Array} Filtrelenmiş fatura listesi
     */
    function filter_invoices() {
        var invoices = invoices_data.invoices.slice(); // Kopyasını al

        // Durum filtresi
        if (current_status !== 'all') {
            invoices = invoices.filter(function(inv) {
                return inv.status === current_status;
            });
        }

        // Tarih aralığı filtresi
        if (current_date_range !== 'all') {
            var now = new Date();
            var filter_date = new Date();

            switch (current_date_range) {
                case 'this_month':
                    filter_date.setDate(1);
                    break;
                case 'last_month':
                    filter_date.setMonth(filter_date.getMonth() - 1);
                    break;
                case 'last_3_months':
                    filter_date.setMonth(filter_date.getMonth() - 3);
                    break;
                case 'last_6_months':
                    filter_date.setMonth(filter_date.getMonth() - 6);
                    break;
            }

            invoices = invoices.filter(function(inv) {
                var inv_date = new Date(inv.date);
                return inv_date >= filter_date;
            });
        }

        // Arama filtresi
        if (search_term.length > 0) {
            var term = search_term.toLowerCase();
            invoices = invoices.filter(function(inv) {
                return inv.invoice_no.toLowerCase().indexOf(term) !== -1 ||
                       inv.description.toLowerCase().indexOf(term) !== -1;
            });
        }

        // Tarihe göre sırala (en yeni önce)
        invoices.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        return invoices;
    }

    /**
     * Tablo satırı HTML'i oluşturur
     */
    function create_table_row_html(invoice) {
        var status_class = 'invoice_table__status--' + invoice.status;
        var status_text = get_status_text(invoice.status);
        var status_icon = get_status_icon(invoice.status);

        var actions_html = '<button class="invoice_table__action_btn" title="PDF İndir"><i class="fa-solid fa-download"></i></button>';
        
        if (invoice.status === 'pending' || invoice.status === 'overdue') {
            actions_html = '<button class="invoice_table__action_btn invoice_table__action_btn--pay" title="Öde"><i class="fa-solid fa-credit-card"></i></button>' + actions_html;
        }

        return '<tr class="invoice_table__tr" data-id="' + invoice.id + '">' +
                   '<td class="invoice_table__td">' +
                       '<span class="invoice_table__number">' + invoice.invoice_no + '</span>' +
                   '</td>' +
                   '<td class="invoice_table__td">' +
                       '<span class="invoice_table__desc" title="' + escape_html(invoice.description) + '">' + 
                           escape_html(invoice.description) + '</span>' +
                   '</td>' +
                   '<td class="invoice_table__td">' + format_date(invoice.date) + '</td>' +
                   '<td class="invoice_table__td">' + format_date(invoice.due_date) + '</td>' +
                   '<td class="invoice_table__td">' +
                       '<span class="invoice_table__amount">' + format_currency(invoice.amount) + '</span>' +
                   '</td>' +
                   '<td class="invoice_table__td">' +
                       '<span class="invoice_table__status ' + status_class + '">' +
                           '<i class="' + status_icon + '"></i> ' + status_text +
                       '</span>' +
                   '</td>' +
                   '<td class="invoice_table__td">' +
                       '<div class="invoice_table__actions">' + actions_html + '</div>' +
                   '</td>' +
               '</tr>';
    }

    /**
     * Mobil kart HTML'i oluşturur
     */
    function create_card_html(invoice) {
        var status_class = 'invoice_card__status--' + invoice.status;
        var status_text = get_status_text(invoice.status);
        var status_icon = get_status_icon(invoice.status);

        var pay_btn = '';
        if (invoice.status === 'pending' || invoice.status === 'overdue') {
            pay_btn = '<button class="invoice_card__action_btn invoice_card__action_btn--pay">' +
                          '<i class="fa-solid fa-credit-card"></i> Öde' +
                      '</button>';
        }

        return '<div class="invoice_card" data-id="' + invoice.id + '">' +
                   '<div class="invoice_card__header">' +
                       '<div>' +
                           '<h4 class="invoice_card__number">' + invoice.invoice_no + '</h4>' +
                           '<span class="invoice_card__desc">' + escape_html(invoice.description) + '</span>' +
                       '</div>' +
                       '<span class="invoice_card__status ' + status_class + '">' +
                           '<i class="' + status_icon + '"></i> ' + status_text +
                       '</span>' +
                   '</div>' +
                   '<div class="invoice_card__details">' +
                       '<div class="invoice_card__detail">' +
                           '<div class="invoice_card__detail_label">Tarih</div>' +
                           '<div class="invoice_card__detail_value">' + format_date(invoice.date) + '</div>' +
                       '</div>' +
                       '<div class="invoice_card__detail">' +
                           '<div class="invoice_card__detail_label">Vade</div>' +
                           '<div class="invoice_card__detail_value">' + format_date(invoice.due_date) + '</div>' +
                       '</div>' +
                       '<div class="invoice_card__detail">' +
                           '<div class="invoice_card__detail_label">Tutar</div>' +
                           '<div class="invoice_card__detail_value invoice_card__detail_value--amount">' + 
                               format_currency(invoice.amount) + '</div>' +
                       '</div>' +
                   '</div>' +
                   '<div class="invoice_card__actions">' +
                       pay_btn +
                       '<button class="invoice_card__action_btn invoice_card__action_btn--outline">' +
                           '<i class="fa-solid fa-download"></i> İndir' +
                       '</button>' +
                   '</div>' +
               '</div>';
    }

    /**
     * Durum metnini döndürür
     */
    function get_status_text(status) {
        var texts = {
            'paid': 'Ödendi',
            'pending': 'Bekliyor',
            'overdue': 'Gecikmiş'
        };
        return texts[status] || status;
    }

    /**
     * Durum ikonunu döndürür
     */
    function get_status_icon(status) {
        var icons = {
            'paid': 'fa-solid fa-check',
            'pending': 'fa-solid fa-clock',
            'overdue': 'fa-solid fa-exclamation'
        };
        return icons[status] || 'fa-solid fa-circle';
    }

    /**
     * Sayaç metnini günceller
     */
    function update_count(count) {
        var total = invoices_data.invoices.length;
        
        if (search_term.length > 0 || current_status !== 'all' || current_date_range !== 'all') {
            $invoice_count.text(count + ' / ' + total + ' fatura gösteriliyor');
        } else {
            $invoice_count.text('Toplam ' + total + ' fatura');
        }
    }

    /**
     * Sayfalamayı günceller
     */
    function update_pagination(total_pages) {
        if (total_pages <= 1) {
            $pagination.hide();
            return;
        }

        $pagination.show();
        $pagination_info.text('Sayfa ' + current_page + ' / ' + total_pages);
        
        $prev_page.prop('disabled', current_page === 1);
        $next_page.prop('disabled', current_page === total_pages);
    }

    /**
     * Para birimini formatlar
     */
    function format_currency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
            $invoice_loading.show();
            $invoice_table_wrapper.hide();
            $invoice_cards.hide();
        } else {
            $invoice_loading.hide();
        }
    }

    /**
     * Hata durumunu gösterir
     */
    function show_error_state() {
        $invoice_empty.html(
            '<div class="invoice_empty__icon" style="background: rgba(220, 53, 69, 0.1);">' +
                '<i class="fa-solid fa-exclamation-triangle" style="color: #DC3545;"></i>' +
            '</div>' +
            '<h3 class="invoice_empty__title">Bağlantı Hatası</h3>' +
            '<p class="invoice_empty__text">Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>' +
            '<button class="invoice_empty__button" onclick="location.reload();">' +
                '<i class="fa-solid fa-arrow-rotate-right"></i> Yenile' +
            '</button>'
        ).show();
    }

    /**
     * Arama temizle butonunu göster/gizle
     */
    function toggle_clear_button() {
        if ($search_input.val().length > 0) {
            $search_clear.addClass('invoice_search__clear--visible');
        } else {
            $search_clear.removeClass('invoice_search__clear--visible');
        }
    }

    /**
     * Filtreleri sıfırlar
     */
    function reset_filters() {
        current_status = 'all';
        current_date_range = 'all';
        search_term = '';
        current_page = 1;
        
        $status_filter.val('all');
        $date_filter.val('all');
        $search_input.val('');
        toggle_clear_button();
        
        render_invoices();
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

    // Durum filtresi değişimi
    $status_filter.on('change', function() {
        current_status = $(this).val();
        current_page = 1;
        render_invoices();
    });

    // Tarih filtresi değişimi
    $date_filter.on('change', function() {
        current_date_range = $(this).val();
        current_page = 1;
        render_invoices();
    });

    // Arama input (debounce ile)
    $search_input.on('input', function() {
        toggle_clear_button();

        // Debounce - 300ms bekle
        clearTimeout(debounce_timer);
        debounce_timer = setTimeout(function() {
            search_term = $search_input.val().trim();
            current_page = 1;
            render_invoices();
        }, 300);
    });

    // Arama temizle butonu
    $search_clear.on('click', function() {
        $search_input.val('');
        search_term = '';
        toggle_clear_button();
        current_page = 1;
        render_invoices();
    });

    // Filtre sıfırlama
    $reset_filter.on('click', function() {
        reset_filters();
    });

    // Sayfalama - Önceki
    $prev_page.on('click', function() {
        if (current_page > 1) {
            current_page--;
            render_invoices();
        }
    });

    // Sayfalama - Sonraki
    $next_page.on('click', function() {
        var filtered = filter_invoices();
        var total_pages = Math.ceil(filtered.length / items_per_page);
        
        if (current_page < total_pages) {
            current_page++;
            render_invoices();
        }
    });

    // Ödeme butonu tıklama (Event Delegation)
    $(document).on('click', '.invoice_table__action_btn--pay, .invoice_card__action_btn--pay', function(e) {
        e.preventDefault();
        var invoice_id = $(this).closest('[data-id]').data('id');
        // TODO: Ödeme sayfasına yönlendirme
        alert('Ödeme sayfasına yönlendiriliyorsunuz... (Fatura #' + invoice_id + ')');
    });

    // İndirme butonu tıklama
    $(document).on('click', '.invoice_table__action_btn:not(.invoice_table__action_btn--pay), .invoice_card__action_btn--outline', function(e) {
        e.preventDefault();
        var invoice_id = $(this).closest('[data-id]').data('id');
        // TODO: PDF indirme işlemi
        alert('Fatura PDF olarak indiriliyor... (Fatura #' + invoice_id + ')');
    });

    // ============================================
    // BAŞLATMA (Initialization)
    // ============================================

    // Sayfa yüklendiğinde verileri getir
    load_invoices_data();
});

