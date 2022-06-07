using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Extensions;
using API.RequestHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;
        public ProductsController(StoreContext context)
        {
            _context = context;
        }

        // Get a paginated list of products
        [HttpGet]
        public async Task<ActionResult<PagedList<Product>>> GetProducts(ProductParams productParams)
        {
            // return await _context.Products.ToListAsync(); // directly query db
            // process data before querying db
            var query = _context.Products
                .Sort(productParams.OrderBy) // .Sort() comes from custom extionsion ProductExtensions.cs
                .Search(productParams.SearchTerm) // custom extionsion
                .Filter(productParams.Brands, productParams.Types) // custom extionsion
                .AsQueryable(); // convert query into IQueryable

            // execute the query against database to get paged list of products
            // PageNumber and PageSize: pagination params from helper class PaginationParams
            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            // include meta data in the "Paginatin" header of response
            Response.Headers.Add("Pagination", JsonSerializer.Serialize(products.MetaData));

            return products;
        }
        // Get product by ID
        [HttpGet("{id}")] // api/products/3
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            return product;
        }
    }
}