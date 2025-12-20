using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinTech.Pages;

public class RaporDetayModel : PageModel
{
    public int ReportId { get; set; }

    public void OnGet(int id)
    {
        ReportId = id;
        // API çağrısı frontend JavaScript tarafından yapılacak
    }
}

