using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Help
{
    /// <summary>
    /// SSS / Rehber sayfası için PageModel.
    /// SSS verileri JSON dosyasından JavaScript ile yüklenir (CMS yaklaşımı).
    /// </summary>
    public class FaqModel : PageModel
    {
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // SSS verileri client-side JSON'dan yükleniyor.
        }
    }
}

