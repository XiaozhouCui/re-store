using Microsoft.EntityFrameworkCore;

namespace API.Entities.OrderAggregate
{
    // ProductItemOrdered is a snapshot of items when they are ordered, no change
    // owned by OrderItem table
    [Owned]
    public class ProductItemOrdered
    {
        // below properties will be saved inside orders
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string PictureUrl { get; set; }
    }
}