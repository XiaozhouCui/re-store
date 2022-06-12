using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    // Role derived from IdentityRole, override type of Id from string to integer with <int>
    public class Role : IdentityRole<int>
    {
        
    }
}