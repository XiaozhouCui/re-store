namespace API.Entities
{
    public class BasketItem
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        
        // navigation properties: 1-to-1 relationship to Product
        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}