using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        // use _userManager to interact with db
        private readonly UserManager<User> _userManager;
        public AccountController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        // .net will presume loginDto is in the body of POST request
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login(LoginDto loginDto)
        {
            // search username in db
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            // if no user or wrong password, return Unauthorized
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized();
            }
            return user;
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            // handle validation errors
            if (!result.Succeeded)
            {
                // loop over various errors: duplicate username, password too simple etc.
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem();
            }
            // if successful, add new user to "Member" rol
            await _userManager.AddToRoleAsync(user, "Member");

            return StatusCode(201);
        }
    }
}