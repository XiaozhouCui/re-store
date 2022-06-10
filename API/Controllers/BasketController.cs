using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController : BaseApiController
    {
        // inject StoreContext (DbContext) and initialise field from parameter
        private readonly StoreContext _context;
        public BasketController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet(Name = "GetBasket")] // api/Basket ("GetBasket" is route name, not route)
        // "Task<ActionResult<BasketDto>>" means return a BasketDto object to client
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetrieveBasket(GetBuyerId());
            if (basket == null) return NotFound();
            // MapBasketToDto is an extension method for Basket
            return basket.MapBasketToDto();
        }

        [HttpPost] // api/Basket?productId=3&quantity=2
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            // get basket || create basket
            var basket = await RetrieveBasket(GetBuyerId());
            if (basket == null) basket = CreateBasket();
            // get product
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return BadRequest(new ProblemDetails { Title = "Product Not Found" });
            // add item
            basket.AddItem(product, quantity);
            // save changes
            // "_context.SaveChangesAsync()" returns the number of changes made to db
            var result = await _context.SaveChangesAsync() > 0;
            // return 201 with a "Location" header (location: http://localhost:5000/api/Basket)
            if (result) return CreatedAtRoute("GetBasket", basket.MapBasketToDto());
            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        [HttpDelete]
        // "Task<ActionResult>" means not return anything but ActionResult (e.g. 200 OK)
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // get basket
            var basket = await RetrieveBasket(GetBuyerId());
            if (basket == null) return NotFound();
            // remove item or reduce quantity
            basket.RemoveItem(productId, quantity);
            // save changes
            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();
            return BadRequest(new ProblemDetails { Title = "Problem removing item from the basket" });
        }

        // re-usable local method to retireve basket (can return null)
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

        // get buyerId
        private string GetBuyerId()
        {
            // get username, if no username then get buyerId from cookies, no still falsy then return null
            return User.Identity?.Name ?? Request.Cookies["buyerId"];
        }

        private Basket CreateBasket()
        {
            // no basket means new buyer, need to create a buyer ID if not exist
            var buyerId = User.Identity?.Name;
            if (string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();
                // set cookie: force user to accept cookies from a website or not accept cookie, cookie expires after 30 days
                var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };
                // add cookie to response
                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }
            // create basket instance, only need BuyerId, others like Id and Items are auto generated
            var basket = new Basket { BuyerId = buyerId };
            // persist to db
            _context.Baskets.Add(basket);
            // return basket instance
            return basket;
        }
    }
}