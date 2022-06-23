using AutoMapper;

namespace API.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        private readonly ImageService _imageService;
        public ProductsController(StoreContext context, IMapper mapper, ImageService imageService)
        {
            _imageService = imageService;
            _mapper = mapper;
            _context = context;
        }

        // Get a paged list of products
        // Attribute [FromQuery] tells API controller to get parameters from query string
        [HttpGet]
        public async Task<ActionResult<PagedList<Product>>> GetProducts([FromQuery] ProductParams productParams)
        {
            // return await _context.Products.ToListAsync(); // directly query db
            // process query before executing it against db
            var query = _context.Products
                .Sort(productParams.OrderBy) // .Sort() comes from custom extionsion ProductExtensions.cs
                .Search(productParams.SearchTerm) // .Search(): custom extionsion method for IQueryable
                .Filter(productParams.Brands, productParams.Types) // .Filter(): custom extionsion method for IQueryable
                .AsQueryable(); // convert into IQueryable

            // execute the query against database to get paged list of products
            // PageNumber and PageSize: pagination params from helper class PaginationParams
            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            // Custom extension: "AddPaginationHeader" is a custom method for HttpResponse, defined in HttpExtensions.cs
            Response.AddPaginationHeader(products.MetaData);

            return products;
        }

        // Get product by ID
        [HttpGet("{id}", Name = "GetProduct")] // api/products/3
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            return product;
        }

        // get filter options for client to select and filter products
        [HttpGet("filters")]
        // IActionResult will have all HTTP responses, e.g. NotFound(), OK()
        public async Task<IActionResult> GetFilters()
        {
            // get lists of unique brands and types from Products table
            var brands = await _context.Products.Select(p => p.Brand).Distinct().ToListAsync();
            // e.g. "types": ["Boards","Boots","Gloves","Hats"]
            var types = await _context.Products.Select(p => p.Type).Distinct().ToListAsync();
            // return an anonymous object
            return Ok(new { brands, types });
        }

        // only admin user can add a new product
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto)
        {
            // map ProductDto to Product
            var product = _mapper.Map<Product>(productDto);

            // save the uploaded image to Cloudinary
            if (productDto.File != null)
            {
                var imageResult = await _imageService.AddImageAsync(productDto.File);

                if (imageResult.Error != null) return BadRequest(new ProblemDetails { Title = imageResult.Error.Message });

                product.PictureUrl = imageResult.SecureUrl.ToString(); // image URL with https
                product.PublicId = imageResult.PublicId;
            }

            _context.Products.Add(product);

            var result = await _context.SaveChangesAsync() > 0;

            // after creating a new resource, return the resource route (api/products/{id}) to client
            if (result) return CreatedAtRoute("GetProduct", new { Id = product.Id }, product);
            // if failed, return 400
            return BadRequest(new ProblemDetails { Title = "Problem creating new product" });
        }

        // only admin user can update a product
        [Authorize(Roles = "Admin")]
        [HttpPut] // no "{id}" required, Id is laready included in UpdateProductDto
        public async Task<ActionResult<Product>> UpdateProduct([FromForm]UpdateProductDto productDto)
        {
            // find product by Id from DTO
            var product = await _context.Products.FindAsync(productDto.Id);

            if (product == null) return NotFound();

            // EF will track changes in productDto and save it to product
            _mapper.Map(productDto, product);

            // Add new image to and remove old one from Cloudinary
            if (productDto.File != null)
            {
                var imageResult = await _imageService.AddImageAsync(productDto.File);

                if (imageResult.Error != null) return BadRequest(new ProblemDetails { Title = imageResult.Error.Message });

                // delete the existing image from Cloudinary
                if (!string.IsNullOrEmpty(product.PublicId)) await _imageService.DeleteImageAsync(product.PublicId);

                product.PictureUrl = imageResult.SecureUrl.ToString(); // image URL with https
                product.PublicId = imageResult.PublicId; // update the PublicId in Products table
            }

            var result = await _context.SaveChangesAsync() > 0;

            // return the updated product back to client
            if (result) return Ok(product);

            return BadRequest(new ProblemDetails { Title = "Problem updating product" });
        }

        // only admin user can delete a product
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            // delete the existing image from Cloudinary
            if (!string.IsNullOrEmpty(product.PublicId)) await _imageService.DeleteImageAsync(product.PublicId);

            _context.Products.Remove(product); // need to save changes to persist to DB

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem deleting product" });
        }
    }
}