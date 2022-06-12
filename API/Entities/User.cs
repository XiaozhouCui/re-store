using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    // <int> to override the type of Id of IdentityUser (default type was string)
    public class User : IdentityUser<int>
    {
        // other properties are inherited from IdentityUser (e.g. Identity)
        public UserAddress Address { get; set; }
    }
}