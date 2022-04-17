using System.Collections.Generic;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly StoreContext _context;
        public ProductsController(StoreContext context)
        {
            _context = context;
        }

        // Get a list of products
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }
        // Get product by ID
        [HttpGet("{id}")] // api/products/3
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            return await _context.Products.FindAsync(id);
        }
    }
}