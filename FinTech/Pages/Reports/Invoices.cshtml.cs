using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Reports
{
    /// <summary>
    /// Faturalar sayfası için PageModel.
    /// Kullanıcının ödeme geçmişini ve bekleyen faturalarını 
    /// görüntülediği sayfa.
    /// 
    /// Veri Kaynağı: /data/invoices_data.json (CMS/Statik)
    /// 
    /// Özellikler:
    /// - Durum filtreleme (Ödendi, Bekliyor, Gecikmiş)
    /// - Tarih aralığı filtreleme
    /// - Arama fonksiyonu
    /// - PDF indirme
    /// - Sayfalama
    /// </summary>
    public class InvoicesModel : PageModel
    {
        /// <summary>
        /// Sayfa GET isteği handler'ı.
        /// Sunucu taraflı herhangi bir işlem yapılmıyor.
        /// Tüm veriler client-side JSON'dan yükleniyor.
        /// </summary>
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // Fatura verileri client-side JSON'dan yükleniyor.
        }
    }
}

