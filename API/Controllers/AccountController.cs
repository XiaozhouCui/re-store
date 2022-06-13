using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        // use _userManager to interact with db
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly StoreContext _context;
        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        {
            _context = context;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        // .net will presume loginDto is in the body of POST request
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // search username in db
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            // if no user or wrong password, return Unauthorized
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized();
            }

            // on login, try to get user's basket from DB, can be null
            var userBasket = await RetrieveBasket(loginDto.Username);
            // also on login, try to get the anonymous basket using client's cookie
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]);

            // if there is an anonymous basket before login, replace the user's basket with the anonymous one, because it's newer
            if (anonBasket != null)
            {
                // delete the user's basket if exist
                if (userBasket != null) _context.Baskets.Remove(userBasket);
                // transfer the anonymous basket to the user
                anonBasket.BuyerId = user.UserName;
                // remove cookie from client browser
                Response.Cookies.Delete("buyerId");
                // persist to db
                await _context.SaveChangesAsync();
            }

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
            };
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

        [Authorize] // protect below API
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            // User.Identity.Name: get name claim from token
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            // retrieve basket from db
            var userBasket = await RetrieveBasket(User.Identity.Name);

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto()
            };
        }

        [Authorize] // protect below API
        [HttpGet("savedAddress")] // GET api/account/savedAddress
        public async Task<ActionResult<UserAddress>> GetSavedAddress()
        {
            // retrieve the previously saved address from db
            return await _userManager.Users
                .Where(x => x.UserName == User.Identity.Name)
                .Select(user => user.Address)
                .FirstOrDefaultAsync();
        }

        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            if (string.IsNullOrEmpty(buyerId))
            {
                // delete cookie from response if no buyerId passed in
                Response.Cookies.Delete("buyerId");
                // no buyerId then no basket returned
                return null;
            }
            // use cookie "buyerId" to search Baskets table, then get the basket, its items and product info
            return await _context.Baskets
                .Include(i => i.Items) // basket 1-to-many basketItem
                .ThenInclude(p => p.Product) // basketItem 1-to-1 product
                .FirstOrDefaultAsync(x => x.BuyerId == buyerId); // return null if no basket found
        }
    }
}