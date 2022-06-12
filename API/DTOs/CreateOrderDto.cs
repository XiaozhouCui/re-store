using API.Entities.OrderAggregate;

namespace API.DTOs
{
    public class CreateOrderDto
    {
        public bool SaveAddress { get; set; } // if user want to save address for order
        public ShippingAddress ShippingAddress { get; set; }
    }
}