using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    // customise table name "BasketItems" (plural form)
    [Table("BasketItems")]
    public class BasketItem
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        
        // navigation properties: 1-to-1 relationship to the Product entity
        public int ProductId { get; set; }
        public Product Product { get; set; }

        // many-to-1 relationship to the Basket entity
        public int BasketId { get; set; }
        public Basket Basket { get; set; }
    }
}