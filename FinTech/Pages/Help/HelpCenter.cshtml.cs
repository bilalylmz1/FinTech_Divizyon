using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Help
{
    /// <summary>
    /// Yardım & Destek Merkezi sayfası için PageModel.
    /// SSS verileri JSON dosyasından JavaScript ile yüklenir (CMS yaklaşımı).
    /// </summary>
    public class HelpCenterModel : PageModel
    {
        public void OnGet()
        {
            // Sayfa yüklenirken herhangi bir sunucu taraflı işlem yapılmıyor.
            // SSS verileri client-side JSON'dan yükleniyor.
        }
    }
}

