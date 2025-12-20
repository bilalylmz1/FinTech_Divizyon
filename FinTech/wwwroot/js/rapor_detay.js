/**
 * Rapor Detay Sayfası JavaScript
 * snake_case isimlendirme kuralı kullanılmaktadır
 */

(function() {
    'use strict';
    
    // DOM Elements - Cache
    var $report_loading = $('#report_loading');
    var $report_content = $('#report_content');
    var $report_error = $('#report_error');
    var $report_error_message = $('#report_error_message');
    var $report_summary = $('#report_summary');
    var $credit_details_table = $('#credit_details_table');
    
    var $print_btn = $('#print_report_btn');
    var $download_btn = $('#download_report_btn');
    var $retry_btn = $('#retry_report_btn');
    
    /**
     * Sayfa yüklendiğinde çalışır
     */
    function init() {
        // Event listeners
        $print_btn.on('click', handle_print);
        $download_btn.on('click', handle_download);
        $retry_btn.on('click', function() {
            load_report_detail();
        });
        
        // Rapor detayını yükle
        if (typeof report_id !== 'undefined' && report_id > 0) {
            load_report_detail();
        } else {
            show_error('Rapor ID bulunamadı.');
        }
    }
    
    /**
     * Rapor detayını API'den yükler
     */
    function load_report_detail() {
        show_loading();
        
        api_client.get_report_detail(report_id)
            .done(function(response) {
                if (response && response.data && response.data.value) {
                    render_report_detail(response.data.value);
                    show_content();
                } else {
                    show_error('Rapor detayı bulunamadı.');
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
        $report_loading.show();
        $report_content.hide();
        $report_error.hide();
    }
    
    /**
     * İçerik görünümünü gösterir
     */
    function show_content() {
        $report_loading.hide();
        $report_content.show();
        $report_error.hide();
    }
    
    /**
     * Hata durumunu gösterir
     */
    function show_error(message) {
        $report_loading.hide();
        $report_content.hide();
        $report_error_message.html(message);
        $report_error.show();
    }
    
    /**
     * Rapor detayını render eder
     */
    function render_report_detail(data) {
        render_summary(data);
        render_credit_details(data);
    }
    
    /**
     * Özet kartları render eder
     */
    function render_summary(data) {
        var html = '';
        
        // Kredi Notu Kartı
        html += '<div class="summary_card summary_card--primary">';
        html += '    <div class="summary_card__icon">';
        html += '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
        html += '            <path d="M12 20V10"></path>';
        html += '            <path d="M18 20V4"></path>';
        html += '            <path d="M6 20v-4"></path>';
        html += '        </svg>';
        html += '    </div>';
        html += '    <div class="summary_card__content">';
        html += '        <span class="summary_card__value">' + (data.bkKrediNotu || '-') + '</span>';
        html += '        <span class="summary_card__label">Kredi Notu</span>';
        html += '    </div>';
        html += '</div>';
        
        // Toplam Limit Kartı
        html += '<div class="summary_card">';
        html += '    <div class="summary_card__icon">';
        html += '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
        html += '            <line x1="12" y1="1" x2="12" y2="23"></line>';
        html += '            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>';
        html += '        </svg>';
        html += '    </div>';
        html += '    <div class="summary_card__content">';
        html += '        <span class="summary_card__value">' + format_currency(data.bkToplamLimit) + '</span>';
        html += '        <span class="summary_card__label">Toplam Limit</span>';
        html += '    </div>';
        html += '</div>';
        
        // Toplam Risk Kartı
        html += '<div class="summary_card">';
        html += '    <div class="summary_card__icon">';
        html += '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
        html += '            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>';
        html += '            <line x1="12" y1="9" x2="12" y2="13"></line>';
        html += '            <line x1="12" y1="17" x2="12.01" y2="17"></line>';
        html += '        </svg>';
        html += '    </div>';
        html += '    <div class="summary_card__content">';
        html += '        <span class="summary_card__value">' + format_currency(data.bkToplamRisk) + '</span>';
        html += '        <span class="summary_card__label">Toplam Risk</span>';
        html += '    </div>';
        html += '</div>';
        
        // Finans Kuruluşu Sayısı
        html += '<div class="summary_card">';
        html += '    <div class="summary_card__icon">';
        html += '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
        html += '            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>';
        html += '            <polyline points="9 22 9 12 15 12 15 22"></polyline>';
        html += '        </svg>';
        html += '    </div>';
        html += '    <div class="summary_card__content">';
        html += '        <span class="summary_card__value">' + (data.bkBildirimdeBulunanFinansKurulusuSayisi || '0') + '</span>';
        html += '        <span class="summary_card__label">Finans Kuruluşu</span>';
        html += '    </div>';
        html += '</div>';
        
        $report_summary.html(html);
    }
    
    /**
     * Kredi detayları tablosunu render eder
     */
    function render_credit_details(data) {
        if (!data.bireyselDetails || data.bireyselDetails.length === 0) {
            $credit_details_table.html('<p class="text_body_sm">Kredi detayı bulunamadı.</p>');
            return;
        }
        
        var html = '<table class="data_table">';
        html += '<thead>';
        html += '    <tr>';
        html += '        <th>Sıra</th>';
        html += '        <th>Kurum</th>';
        html += '        <th>Kredi Türü</th>';
        html += '        <th>Açılış Tarihi</th>';
        html += '        <th>Limit</th>';
        html += '        <th>Bakiye</th>';
        html += '        <th>Durum</th>';
        html += '    </tr>';
        html += '</thead>';
        html += '<tbody>';
        
        data.bireyselDetails.forEach(function(detail) {
            var acilis_tarihi = format_api_date(detail.bkAcilisTarihi);
            var is_delayed = parseInt(detail.bkGecikmedekiBakiye) > 0;
            var status_class = is_delayed ? 'status_badge--danger' : 'status_badge--success';
            var status_text = is_delayed ? 'Gecikmeli' : 'Normal';
            
            html += '<tr>';
            html += '    <td>' + detail.bkSiraNo + '</td>';
            html += '    <td><strong>' + detail.bkKurumRumuzu + '</strong></td>';
            html += '    <td>' + get_kredi_turu(detail.bkKrediTuru) + '</td>';
            html += '    <td>' + acilis_tarihi + '</td>';
            html += '    <td>' + format_currency(detail.bkKrediTutariLimiti) + '</td>';
            html += '    <td>' + format_currency(detail.bkToplamBakiye) + '</td>';
            html += '    <td><span class="status_badge ' + status_class + '">' + status_text + '</span></td>';
            html += '</tr>';
        });
        
        html += '</tbody>';
        html += '</table>';
        
        $credit_details_table.html(html);
    }
    
    /**
     * Yazdır işlemi
     */
    function handle_print() {
        window.print();
    }
    
    /**
     * İndir işlemi
     */
    function handle_download() {
        var $btn = $download_btn;
        var original_text = $btn.html();
        
        $btn.prop('disabled', true).html('<span class="btn__spinner"></span> İndiriliyor...');
        
        setTimeout(function() {
            $btn.prop('disabled', false).html(original_text);
            if (typeof FinTech !== 'undefined' && FinTech.show_notification) {
                FinTech.show_notification('PDF indirme özelliği yakında eklenecek.', 'info');
            } else {
                alert('PDF indirme özelliği yakında eklenecek.');
            }
        }, 1000);
    }
    
    /**
     * Para formatı
     */
    function format_currency(amount) {
        if (!amount || amount === '0' || amount === 0) return '0 ₺';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(parseFloat(amount));
    }
    
    /**
     * API tarih formatını düzenler (YYYYMMDD -> DD.MM.YYYY)
     */
    function format_api_date(date_str) {
        if (!date_str || date_str.length !== 8) return '-';
        return date_str.substring(6, 8) + '.' + date_str.substring(4, 6) + '.' + date_str.substring(0, 4);
    }
    
    /**
     * Kredi türü kodunu açıklamaya çevirir
     */
    function get_kredi_turu(kod) {
        var turler = {
            '23': 'Kredi Kartı',
            '26': 'Bireysel Kredi',
            '01': 'Tüketici Kredisi',
            '02': 'Konut Kredisi',
            '03': 'Taşıt Kredisi'
        };
        return turler[kod] || 'Kredi (' + kod + ')';
    }
    
    // Sayfa yüklendiğinde init çalıştır
    $(document).ready(function() {
        init();
    });
    
})();

