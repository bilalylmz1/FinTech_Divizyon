using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Reports
{
    /// <summary>
    /// Rapor Listesi sayfası için PageModel.
    /// Kullanıcının kredi skorları, finansal analizler ve 
    /// detaylı raporlarını görüntülediği sayfa.
    /// 
    /// Veri Kaynağı: /data/reports_data.json (CMS/Statik)
    /// 
    /// Özellikler:
    /// - Kategoriye göre filtreleme
    /// - Arama fonksiyonu
    /// - Tarih/isim sıralama
    /// - PDF indirme
    /// </summary>
    public class ReportListModel : PageModel
    {
        /// <summary>
        /// Sayfa GET isteği handler'ı.
        /// Sunucu taraflı herhangi bir işlem yapılmıyor.
        /// Tüm veriler client-side JSON'dan yükleniyor.
        /// </summary>
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // Rapor verileri client-side JSON'dan yükleniyor.
        }
    }
}

