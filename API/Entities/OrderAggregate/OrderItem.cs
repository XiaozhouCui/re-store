namespace API.Entities.OrderAggregate
{
    public class OrderItem
    {
        public int Id { get; set; }
        public ProductItemOrdered ItemOrdered { get; set; } // owned property
        public long Price { get; set; }
        public int Quantity { get; set; }
    }
}