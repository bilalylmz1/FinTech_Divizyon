/**
 * Raporlar Sayfası JavaScript
 * snake_case isimlendirme kuralı kullanılmaktadır
 */

(function() {
    'use strict';
    
    // DOM Elements - Cache
    var $reports_loading = $('#reports_loading');
    var $reports_list = $('#reports_list');
    var $reports_error = $('#reports_error');
    var $reports_error_message = $('#reports_error_message');
    var $reports_empty = $('#reports_empty');
    var $reports_count = $('#reports_count');
    var $refresh_btn = $('#refresh_reports_btn');
    var $retry_btn = $('#retry_reports_btn');
    
    var $invoices_loading = $('#invoices_loading');
    var $invoices_list = $('#invoices_list');
    
    var $offers_loading = $('#offers_loading');
    var $offers_list = $('#offers_list');
    
    /**
     * Sayfa yüklendiğinde çalışır
     */
    function init() {
        // Event listeners
        $refresh_btn.on('click', function() {
            load_reports();
        });
        
        $retry_btn.on('click', function() {
            load_reports();
        });
        
        // İlk yükleme
        load_reports();
        load_invoices();
        load_offers();
    }
    
    /**
     * Raporları API'den yükler
     */
    function load_reports() {
        show_loading();
        
        api_client.get_report_list()
            .done(function(response) {
                if (response && response.data && Array.isArray(response.data.value)) {
                    var reports = response.data.value;
                    if (reports.length > 0) {
                        render_reports(reports);
                        update_count(reports.length);
                        show_list();
                    } else {
                        show_empty();
                    }
                } else {
                    show_error('Rapor listesi formatı geçersiz.');
                }
            })
            .fail(function(xhr) {
                var error_msg = api_client.parse_error(xhr);
                show_error(error_msg);
            });
    }
    
    /**
     * Loading durumunu gösterir
     */
    function show_loading() {
        $reports_loading.show();
        $reports_list.hide();
        $reports_error.hide();
        $reports_empty.hide();
    }
    
    /**
     * Liste görünümünü gösterir
     */
    function show_list() {
        $reports_loading.hide();
        $reports_list.show();
        $reports_error.hide();
        $reports_empty.hide();
    }
    
    /**
     * Hata durumunu gösterir
     */
    function show_error(message) {
        $reports_loading.hide();
        $reports_list.hide();
        $reports_error_message.html(message);
        $reports_error.show();
        $reports_empty.hide();
    }
    
    /**
     * Boş durumu gösterir
     */
    function show_empty() {
        $reports_loading.hide();
        $reports_list.hide();
        $reports_error.hide();
        $reports_empty.show();
        update_count(0);
    }
    
    /**
     * Rapor sayısını günceller
     */
    function update_count(count) {
        $reports_count.text(count + ' rapor');
    }
    
    /**
     * Raporları render eder
     * @param {Array} reports - Rapor listesi
     */
    function render_reports(reports) {
        var html = '';
        
        reports.forEach(function(report, index) {
            var report_date = report.reportDate || '-';
            var status_class = get_status_class(index);
            var status_text = get_status_text(index);
            
            html += '<div class="report_card" data-report-id="' + report.reportId + '">';
            html += '    <div class="report_card__header">';
            html += '        <div class="report_card__icon">';
            html += '            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
            html += '                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>';
            html += '                <polyline points="14 2 14 8 20 8"></polyline>';
            html += '            </svg>';
            html += '        </div>';
            html += '        <span class="report_card__status ' + status_class + '">' + status_text + '</span>';
            html += '    </div>';
            html += '    <div class="report_card__body">';
            html += '        <h3 class="report_card__title">Kredi Güven Raporu</h3>';
            html += '        <p class="report_card__id">Rapor #' + report.reportId + '</p>';
            html += '        <div class="report_card__meta">';
            html += '            <span class="report_card__date">';
            html += '                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
            html += '                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>';
            html += '                    <line x1="16" y1="2" x2="16" y2="6"></line>';
            html += '                    <line x1="8" y1="2" x2="8" y2="6"></line>';
            html += '                    <line x1="3" y1="10" x2="21" y2="10"></line>';
            html += '                </svg>';
            html += '                ' + escape_html(report_date);
            html += '            </span>';
            html += '        </div>';
            html += '    </div>';
            html += '    <div class="report_card__footer">';
            html += '        <a href="/RaporDetay/' + report.reportId + '" class="btn btn_primary btn--small btn--full">';
            html += '            Raporu Görüntüle';
            html += '        </a>';
            html += '    </div>';
            html += '</div>';
        });
        
        $reports_list.html(html);
    }
    
    /**
     * Durum sınıfını döndürür
     */
    function get_status_class(index) {
        var classes = ['report_card__status--hassas', 'report_card__status--guvenli', 'report_card__status--kritik'];
        return classes[index % classes.length];
    }
    
    /**
     * Durum metnini döndürür
     */
    function get_status_text(index) {
        var statuses = ['Hassas', 'Güvenli', 'Kritik'];
        return statuses[index % statuses.length];
    }
    
    /**
     * Faturaları yükler (Statik veri)
     */
    function load_invoices() {
        setTimeout(function() {
            var invoices = get_static_invoices();
            render_invoices(invoices);
            $invoices_loading.hide();
            $invoices_list.show();
        }, 600);
    }
    
    /**
     * Faturaları render eder
     */
    function render_invoices(invoices) {
        var html = '';
        
        invoices.forEach(function(invoice) {
            var status_class = invoice.status === 'Ödendi' ? 'invoice_card__status--paid' : 'invoice_card__status--pending';
            
            html += '<div class="invoice_card">';
            html += '    <div class="invoice_card__header">';
            html += '        <h4 class="invoice_card__company">' + escape_html(invoice.company) + '</h4>';
            html += '        <span class="invoice_card__status ' + status_class + '">' + invoice.status + '</span>';
            html += '    </div>';
            html += '    <div class="invoice_card__body">';
            html += '        <div class="invoice_card__row">';
            html += '            <span class="invoice_card__label">Fatura No:</span>';
            html += '            <span class="invoice_card__value">' + invoice.number + '</span>';
            html += '        </div>';
            html += '        <div class="invoice_card__row">';
            html += '            <span class="invoice_card__label">Tutar:</span>';
            html += '            <span class="invoice_card__value invoice_card__value--amount">' + format_currency(invoice.amount) + '</span>';
            html += '        </div>';
            html += '        <div class="invoice_card__row">';
            html += '            <span class="invoice_card__label">Vade:</span>';
            html += '            <span class="invoice_card__value">' + invoice.dueDate + '</span>';
            html += '        </div>';
            html += '    </div>';
            html += '</div>';
        });
        
        $invoices_list.html(html);
    }
    
    /**
     * Kredi tekliflerini yükler (Statik veri)
     */
    function load_offers() {
        setTimeout(function() {
            var offers = get_static_offers();
            render_offers(offers);
            $offers_loading.hide();
            $offers_list.show();
        }, 800);
    }
    
    /**
     * Kredi tekliflerini render eder
     */
    function render_offers(offers) {
        var html = '';
        
        offers.forEach(function(offer) {
            html += '<div class="offer_card">';
            html += '    <div class="offer_card__header">';
            html += '        <h4 class="offer_card__title">' + escape_html(offer.name) + '</h4>';
            html += '    </div>';
            html += '    <div class="offer_card__body">';
            html += '        <div class="offer_card__amount">' + format_currency(offer.maxAmount) + '</div>';
            html += '        <p class="offer_card__label">Maksimum Kredi Tutarı</p>';
            html += '        <div class="offer_card__details">';
            html += '            <div class="offer_card__detail">';
            html += '                <span class="offer_card__detail_value">' + offer.interestRate + '%</span>';
            html += '                <span class="offer_card__detail_label">Faiz Oranı</span>';
            html += '            </div>';
            html += '            <div class="offer_card__detail">';
            html += '                <span class="offer_card__detail_value">' + offer.maxTerm + ' Ay</span>';
            html += '                <span class="offer_card__detail_label">Maks. Vade</span>';
            html += '            </div>';
            html += '        </div>';
            html += '    </div>';
            html += '    <div class="offer_card__footer">';
            html += '        <button class="btn btn_primary btn--full offer_apply_btn" data-offer-id="' + offer.id + '">';
            html += '            Hemen Başvur';
            html += '            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
            html += '                <line x1="5" y1="12" x2="19" y2="12"></line>';
            html += '                <polyline points="12 5 19 12 12 19"></polyline>';
            html += '            </svg>';
            html += '        </button>';
            html += '    </div>';
            html += '</div>';
        });
        
        $offers_list.html(html);
        
        // Başvur butonları event listener
        $('.offer_apply_btn').on('click', function() {
            var offer_id = $(this).data('offer-id');
            handle_offer_apply(offer_id);
        });
    }
    
    /**
     * Teklif başvurusunu işler
     */
    function handle_offer_apply(offer_id) {
        if (typeof FinTech !== 'undefined' && FinTech.show_notification) {
            FinTech.show_notification('Kredi başvurunuz alındı. En kısa sürede size dönüş yapılacaktır.', 'success');
        } else {
            alert('Kredi başvurunuz alındı. En kısa sürede size dönüş yapılacaktır.');
        }
    }
    
    /**
     * Statik fatura verileri
     */
    function get_static_invoices() {
        return [
            { company: 'Türk Telekom', number: 'TT-2024-001', amount: 245.50, dueDate: '15.01.2025', status: 'Ödendi' },
            { company: 'ISKI', number: 'ISK-2024-012', amount: 187.30, dueDate: '20.01.2025', status: 'Bekliyor' },
            { company: 'IGDAS', number: 'IGD-2024-008', amount: 312.75, dueDate: '25.01.2025', status: 'Bekliyor' }
        ];
    }
    
    /**
     * Statik kredi teklifi verileri
     */
    function get_static_offers() {
        return [
            { id: 1, name: 'İhtiyaç Kredisi', maxAmount: 500000, interestRate: 2.89, maxTerm: 36, isPersonalized: true },
            { id: 2, name: 'Konut Kredisi', maxAmount: 2000000, interestRate: 1.79, maxTerm: 120, isPersonalized: false },
            { id: 3, name: 'Taşıt Kredisi', maxAmount: 750000, interestRate: 2.49, maxTerm: 48, isPersonalized: true }
        ];
    }
    
    /**
     * Para formatı
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
     * XSS koruması için HTML escape
     */
    function escape_html(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Sayfa yüklendiğinde init çalıştır
    $(document).ready(function() {
        init();
    });
    
})();

