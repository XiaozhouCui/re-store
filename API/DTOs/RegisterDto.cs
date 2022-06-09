namespace API.DTOs
{
    // derive from LoginDto, so that Username and Password props will be included
    public class RegisterDto : LoginDto
    {
        public string Email { get; set; }
    }
}