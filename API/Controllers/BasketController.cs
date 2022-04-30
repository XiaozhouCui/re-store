using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
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
        // Task<ActionResult<Basket>> means return a basket object to client
        public async Task<ActionResult<Basket>> GetBasket()
        {
            // use cookie "buyerId" to search Baskets table, then get the basket, its items and product info
            var basket = await _context.Baskets
                .Include(i => i.Items) // basket 1-to-many basketItem
                .ThenInclude(p => p.Product) // basketItem 1-to-1 product
                .FirstOrDefaultAsync(x => x.BuyerId == Request.Cookies["buyerId"]);

            if (basket == null) return NotFound();

            return basket;
        }

        [HttpPost]
        // Task<ActionResult> means not return anything but ActionResult
        public async Task<ActionResult> AddItemToBasket(int productId, int quantity)
        {
            // get basket
            // create basket
            // get product
            // add item
            // save changes
            return StatusCode(201);
        }

        [HttpDelete]
        // Task<ActionResult> means not return anything but ActionResult
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // get basket
            // remove item or reduce quantity
            // save changes
            return Ok();
        }
    }
}