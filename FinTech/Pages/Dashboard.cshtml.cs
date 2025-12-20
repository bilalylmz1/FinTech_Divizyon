using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages;

/// <summary>
/// Dashboard sayfası PageModel sınıfı.
/// Kullanıcının ana panel ekranını yönetir.
/// </summary>
public class DashboardModel : PageModel
{
    private readonly ILogger<DashboardModel> _logger;

    /// <summary>
    /// Kullanıcı adı (şimdilik statik, ileride session'dan alınacak)
    /// </summary>
    public string UserName { get; set; } = "Mustafa Gümüş";
    
    /// <summary>
    /// Kullanıcı tipi
    /// </summary>
    public string UserType { get; set; } = "Bireysel";
    
    /// <summary>
    /// Kredi güven skoru durumu
    /// Değerler: zayif, riskli, kritik, hassas, guvenli, mukemmel
    /// </summary>
    public string CreditStatus { get; set; } = "hassas";
    
    /// <summary>
    /// Kredi güven skoru yüzdesi (0-100)
    /// </summary>
    public int CreditScorePercentage { get; set; } = 65;
    
    /// <summary>
    /// Rapor tarihi
    /// </summary>
    public DateTime ReportDate { get; set; } = DateTime.Now;

    public DashboardModel(ILogger<DashboardModel> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Sayfa yüklendiğinde çalışır (GET request)
    /// </summary>
    public void OnGet()
    {
        // Log: Dashboard sayfası görüntülendi
        // Not: TCKN/Telefon gibi hassas bilgiler maskelenmeli
        _logger.LogInformation("Dashboard sayfası görüntülendi. Tarih: {Date}", DateTime.Now);
        
        // TODO: Session'dan kullanıcı bilgilerini al
        // TODO: API'den kredi güven skorunu çek
        // TODO: Kampanyaları API'den çek
    }
    
    /// <summary>
    /// Teklifleri getir butonu için POST handler
    /// </summary>
    public IActionResult OnPostGetOffers()
    {
        _logger.LogInformation("Teklifler istendi.");
        
        // TODO: API'den teklifleri çek
        
        return RedirectToPage("/Index"); // Geçici olarak Index'e yönlendir
    }
}

