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

        [HttpGet]
        // "Task<ActionResult<Basket>>" means return a basket object to client
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetrieveBasket();
            if (basket == null) return NotFound();
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

        [HttpPost] // api/basket?productId=3&quantity=2
        // "Task<ActionResult>" means not return anything but ActionResult
        public async Task<ActionResult> AddItemToBasket(int productId, int quantity)
        {
            // get basket || create basket
            var basket = await RetrieveBasket();
            if (basket == null) basket = CreateBasket();
            // get product
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return NotFound();
            // add item
            basket.AddItem(product, quantity);
            // save changes
            // "_context.SaveChangesAsync()" returns the number of changes made to db
            var result = await _context.SaveChangesAsync() > 0;
            if (result) return StatusCode(201);
            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // get basket
            // remove item or reduce quantity
            // save changes
            return Ok();
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
    }
}