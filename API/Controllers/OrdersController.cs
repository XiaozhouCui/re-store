using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize] // protect order controller from anonymous users
    public class OrdersController : BaseApiController
    {
        private readonly StoreContext _context;
        public OrdersController(StoreContext context)
        {
            _context = context;
        }

        // get a list of orders for a logged in user
        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.OrderItems) // include items into order
                .Where(x => x.BuyerId == User.Identity.Name) // logged in user's name is buyerId
                .ToListAsync();
        }

        // get single order by Id
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Where(x => x.BuyerId == User.Identity.Name && x.Id == id) // check both buyerId and orderId
                .FirstOrDefaultAsync(); // can be null
        }
    }
}