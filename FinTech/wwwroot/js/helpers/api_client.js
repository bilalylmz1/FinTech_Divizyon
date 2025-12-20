/**
 * API Client Helper
 * WebSube-API endpoint'lerine istek yapmak için yardımcı fonksiyonlar
 * snake_case isimlendirme kuralı kullanılmaktadır
 */

var api_client = {
    base_url: 'http://localhost:3000/api/ep',
    
    /**
     * GET isteği yapar
     * @param {string} endpoint - API endpoint yolu
     * @param {Object} params - Query parametreleri
     * @returns {Promise} jQuery AJAX promise
     */
    get: function(endpoint, params) {
        var url = this.base_url + endpoint;
        
        if (params) {
            var query_string = $.param(params);
            if (query_string) {
                url += '?' + query_string;
            }
        }
        
        return $.ajax({
            url: url,
            method: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            timeout: 15000
        });
    },
    
    /**
     * POST isteği yapar
     * @param {string} endpoint - API endpoint yolu
     * @param {Object} data - Gönderilecek veri
     * @returns {Promise} jQuery AJAX promise
     */
    post: function(endpoint, data) {
        return $.ajax({
            url: this.base_url + endpoint,
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            timeout: 15000
        });
    },
    
    /**
     * Rapor listesini getirir
     * @returns {Promise} jQuery AJAX promise
     */
    get_report_list: function() {
        return this.get('/dummy-report-list');
    },
    
    /**
     * Rapor detayını getirir
     * @param {number} report_id - Rapor ID
     * @returns {Promise} jQuery AJAX promise
     */
    get_report_detail: function(report_id) {
        return this.get('/report-detail', { reportId: report_id });
    },
    
    /**
     * Hata mesajını parse eder
     * @param {Object} xhr - jQuery XHR objesi
     * @returns {string} Hata mesajı
     */
    parse_error: function(xhr) {
        if (xhr.responseJSON && xhr.responseJSON.error) {
            return xhr.responseJSON.error;
        }
        if (xhr.responseJSON && xhr.responseJSON.message) {
            return xhr.responseJSON.message;
        }
        if (xhr.status === 0) {
            return 'API sunucusuna bağlanılamıyor. WebSube-API\'nin çalıştığından emin olun (http://localhost:3000)';
        }
        if (xhr.status === 404) {
            return 'İstenen kaynak bulunamadı.';
        }
        if (xhr.status === 500) {
            return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        }
        if (xhr.statusText === 'timeout') {
            return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        }
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
};

