using Microsoft.AspNetCore.Identity;

namespace ReactApp2.Server.Models
{
    public class User : IdentityUser
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }
    }
}
