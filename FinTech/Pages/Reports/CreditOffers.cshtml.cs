using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Reports
{
    /// <summary>
    /// Kredi Teklifleri sayfası için PageModel.
    /// Kullanıcının profiline göre hazırlanmış kişiye özel 
    /// kredi fırsatlarını görüntülediği sayfa.
    /// 
    /// Veri Kaynağı: /data/credit_offers_data.json (CMS/Statik)
    /// 
    /// Özellikler:
    /// - Kredi türüne göre filtreleme
    /// - Faiz oranı/tutar sıralama
    /// - Öne çıkan teklif gösterimi
    /// - Başvuru yönlendirmesi
    /// </summary>
    public class CreditOffersModel : PageModel
    {
        /// <summary>
        /// Sayfa GET isteği handler'ı.
        /// Sunucu taraflı herhangi bir işlem yapılmıyor.
        /// Tüm veriler client-side JSON'dan yükleniyor.
        /// </summary>
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // Kredi teklif verileri client-side JSON'dan yükleniyor.
        }
    }
}

