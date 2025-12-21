using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages.Profile
{
    /// <summary>
    /// Profil ve Hesap Ayarları sayfası için PageModel.
    /// Kullanıcının adres, iletişim, meslek ve gelir bilgilerini yönetir.
    /// </summary>
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Sayfa ilk yüklendiğinde çağrılır.
        /// Kullanıcı bilgilerini API'den alıp sayfaya aktarır.
        /// </summary>
        public void OnGet()
        {
            // TODO: UserService üzerinden kullanıcı bilgilerini çek
            // Şimdilik statik veriler kullanılıyor
            _logger.LogInformation("Profil sayfası yüklendi");
        }

        /// <summary>
        /// Adres bilgileri güncellendiğinde çağrılır.
        /// </summary>
        /// <param name="model">Güncellenecek adres bilgileri</param>
        /// <returns>JSON sonucu</returns>
        public IActionResult OnPostUpdateAddress([FromBody] AddressModel model)
        {
            if (!ModelState.IsValid)
            {
                return new JsonResult(new { success = false, message = "Geçersiz veri" });
            }

            try
            {
                // TODO: API'ye adres güncelleme isteği gönder
                _logger.LogInformation("Adres bilgileri güncellendi: {City}, {District}", model.City, model.District);
                
                return new JsonResult(new { success = true, message = "Adres bilgileriniz başarıyla güncellendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Adres güncellenirken hata oluştu");
                return new JsonResult(new { success = false, message = "Bir hata oluştu, lütfen tekrar deneyin" });
            }
        }

        /// <summary>
        /// Meslek ve gelir bilgileri güncellendiğinde çağrılır.
        /// </summary>
        /// <param name="model">Güncellenecek meslek bilgileri</param>
        /// <returns>JSON sonucu</returns>
        public IActionResult OnPostUpdateWork([FromBody] WorkModel model)
        {
            if (!ModelState.IsValid)
            {
                return new JsonResult(new { success = false, message = "Geçersiz veri" });
            }

            try
            {
                // TODO: API'ye meslek/gelir güncelleme isteği gönder
                // ÖNEMLİ: Gelir bilgisi loglanırken maskelenmeli (KVKK uyumu)
                _logger.LogInformation("Meslek bilgileri güncellendi: {Profession}, {WorkStatus}", model.Profession, model.WorkStatus);
                
                return new JsonResult(new { success = true, message = "Meslek ve gelir bilgileriniz başarıyla güncellendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Meslek bilgileri güncellenirken hata oluştu");
                return new JsonResult(new { success = false, message = "Bir hata oluştu, lütfen tekrar deneyin" });
            }
        }
    }

    /// <summary>
    /// Adres bilgileri modeli
    /// </summary>
    public class AddressModel
    {
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string AddressDetail { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AltPhone { get; set; }
    }

    /// <summary>
    /// Meslek ve gelir bilgileri modeli
    /// </summary>
    public class WorkModel
    {
        public string Profession { get; set; } = string.Empty;
        public string WorkStatus { get; set; } = string.Empty;
        public string? Company { get; set; }
        public decimal Income { get; set; }
        public string? Sector { get; set; }
        public string? WorkDuration { get; set; }
    }
}

