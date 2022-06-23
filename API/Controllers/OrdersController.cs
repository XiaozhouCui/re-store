using API.Entities.OrderAggregate;

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
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            return await _context.Orders
                .ProjectOrderToOrderDto() // custom extension method of Order
                .Where(x => x.BuyerId == User.Identity.Name) // logged in user's name is buyerId
                .ToListAsync();
        }

        // get single order by Id, "GetOrder" is the name of route
        [HttpGet("{id}", Name = "GetOrder")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            return await _context.Orders
                .ProjectOrderToOrderDto()
                .Where(x => x.BuyerId == User.Identity.Name && x.Id == id) // check both buyerId and orderId
                .FirstOrDefaultAsync(); // can be null
        }

        // create a new order
        [HttpPost]
        // pass in orderDto and return order Id (integer)
        public async Task<ActionResult<int>> CreateOrder(CreateOrderDto orderDto)
        {
            // get the basket
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name) // custom extionsion method for Basket query
                .FirstOrDefaultAsync(); // execute the query, basket can be null

            if (basket == null) return BadRequest(new ProblemDetails { Title = "Could not locate basket" });

            // build a list of order items
            var items = new List<OrderItem>();
            // loop through basket and push to the items list
            foreach (var item in basket.Items)
            {
                // for each basket item, get product details from db
                var productItem = await _context.Products.FindAsync(item.ProductId);

                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = productItem.Id,
                    Name = productItem.Name,
                    PictureUrl = productItem.PictureUrl
                };

                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Quantity = item.Quantity // quantity in the basket
                };

                // push the orderItem to the items array
                items.Add(orderItem);

                // reduce product quantity in stock
                productItem.QuantityInStock -= item.Quantity;
            }

            // work out price
            var subtotal = items.Sum(item => item.Price * item.Quantity);
            var deliveryFee = subtotal > 10000 ? 0 : 500; // $5 delivery fee for orders under $100

            // create new order
            var order = new Order
            {
                OrderItems = items,
                BuyerId = User.Identity.Name,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                DeliveryFee = deliveryFee,
                PaymentIntentId = basket.PaymentIntentId
            };

            // track the order into db context
            _context.Orders.Add(order);
            // remove basket from db context
            _context.Baskets.Remove(basket);

            // check if user ticked checkbox "save address"
            if (orderDto.SaveAddress)
            {
                // get user without UserManager
                var user = await _context.Users
                    .Include(a => a.Address) // eager loading
                    .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

                // map to UserAddress
                var address = new UserAddress
                {
                    FullName = orderDto.ShippingAddress.FullName,
                    Address1 = orderDto.ShippingAddress.Address1,
                    Address2 = orderDto.ShippingAddress.Address2,
                    City = orderDto.ShippingAddress.City,
                    State = orderDto.ShippingAddress.State,
                    Zip = orderDto.ShippingAddress.Zip,
                    Country = orderDto.ShippingAddress.Country
                };
                // update user's address using order's address
                user.Address = address;
            }

            // persist to db
            var result = await _context.SaveChangesAsync() > 0;

            // send back 201 with order Id, the new order can be accessed via route "/GetOrder" (get order by id)
            if (result) return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);

            // if failed, return 400
            return BadRequest("Problem creating order");
        }
    }
}