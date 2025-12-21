using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Reports
{
    /// <summary>
    /// Rapor Detayları ana sayfası için PageModel.
    /// Bu sayfa kullanıcının finansal raporlarına, kredi tekliflerine ve 
    /// faturalarına erişim sağlayan merkezi bir hub görevi görür.
    /// 
    /// Veri Kaynağı: JSON dosyalarından JavaScript ile yüklenir (CMS yaklaşımı).
    /// - /data/reports_data.json
    /// - /data/credit_offers_data.json
    /// - /data/invoices_data.json
    /// </summary>
    public class ReportCenterModel : PageModel
    {
        /// <summary>
        /// Sayfa GET isteği handler'ı.
        /// Sunucu taraflı herhangi bir işlem yapılmıyor.
        /// Tüm veriler client-side JSON'dan yükleniyor.
        /// </summary>
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // Veriler client-side JSON'dan yükleniyor.
        }
    }
}

