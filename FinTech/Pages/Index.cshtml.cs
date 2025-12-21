using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

namespace FinTech.Pages
{
    // [Authorize] // Entegrasyon tamamlandığında açılabilir
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
