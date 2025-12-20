using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Auth
{
    /// <summary>
    /// Login sayfası PageModel
    /// Akış: GSM Girişi -> KVKK Kontrolü -> OTP Doğrulama -> Dashboard
    /// </summary>
    public class LoginModel : PageModel
    {
        /// <summary>
        /// Telefon numarası (GSM)
        /// </summary>
        [BindProperty]
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Beni hatırla seçeneği
        /// </summary>
        [BindProperty]
        public bool RememberMe { get; set; }

        /// <summary>
        /// KVKK onayı
        /// </summary>
        [BindProperty]
        public bool KvkkConsent { get; set; }

        /// <summary>
        /// Sayfa GET isteği
        /// </summary>
        public void OnGet()
        {
            // Sayfa ilk yüklendiğinde yapılacak işlemler
        }

        /// <summary>
        /// Form POST isteği - Backend API ile entegre edilecek
        /// </summary>
        public IActionResult OnPost()
        {
            // Bu metod şimdilik boş
            // API entegrasyonunda doldurulacak
            return Page();
        }
    }
}

