using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
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
            var basket = await RetrieveBasket();
            if (basket == null) return NotFound();
            return MapBasketToDto(basket);
        }

        [HttpPost] // api/Basket?productId=3&quantity=2
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            // get basket || create basket
            var basket = await RetrieveBasket();
            if (basket == null) basket = CreateBasket();
            // get product
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return BadRequest(new ProblemDetails{Title = "Product Not Found"});
            // add item
            basket.AddItem(product, quantity);
            // save changes
            // "_context.SaveChangesAsync()" returns the number of changes made to db
            var result = await _context.SaveChangesAsync() > 0;
            // return 201 with a "Location" header (location: http://localhost:5000/api/Basket)
            if (result) return CreatedAtRoute("GetBasket", MapBasketToDto(basket));
            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        [HttpDelete]
        // "Task<ActionResult>" means not return anything but ActionResult (e.g. 200 OK)
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // get basket
            var basket = await RetrieveBasket();
            if (basket == null) return NotFound();
            // remove item or reduce quantity
            basket.RemoveItem(productId, quantity);
            // save changes
            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();
            return BadRequest(new ProblemDetails { Title = "Problem removing item from the basket" });
        }

        // re-usable local method to retireve basket (can return null)
        private async Task<Basket> RetrieveBasket()
        {
            // use cookie "buyerId" to search Baskets table, then get the basket, its items and product info
            return await _context.Baskets
                .Include(i => i.Items) // basket 1-to-many basketItem
                .ThenInclude(p => p.Product) // basketItem 1-to-1 product
                .FirstOrDefaultAsync(x => x.BuyerId == Request.Cookies["buyerId"]); // return null if no basket found
        }

        private Basket CreateBasket()
        {
            // no basket means new buyer, need to create a buyer ID
            var buyerId = Guid.NewGuid().ToString();
            // set cookie: force user to accept cookies from a website or not accept cookie, cookie expires after 30 days
            var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };
            // add cookie to response
            Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            // create basket instance, only need BuyerId, others like Id and Items are auto generated
            var basket = new Basket { BuyerId = buyerId };
            // persist to db
            _context.Baskets.Add(basket);
            // return basket instance
            return basket;
        }

        private BasketDto MapBasketToDto(Basket basket)
        {
            return new BasketDto
            {
                Id = basket.Id,
                BuyerId = basket.BuyerId,
                Items = basket.Items.Select(item => new BasketItemDto
                {
                    ProductId = item.ProductId,
                    Name = item.Product.Name,
                    Price = item.Product.Price,
                    PictureUrl = item.Product.PictureUrl,
                    Type = item.Product.Type,
                    Brand = item.Product.Brand,
                    Quantity = item.Quantity
                }).ToList()
            };
        }
    }
}