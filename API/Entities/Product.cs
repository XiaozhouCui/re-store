namespace API.Entities
{
    public class Product
    {
        public int Id { get; set; } // integer named "Id" is the EF naming conovention for primary key
        public string Name { get; set; }
        public string Description { get; set; }
        public long Price { get; set; } // type "long" (not "decimal") for Stripe and SQLite
        public string PictureUrl { get; set; }
        public string Type { get; set; }
        public string Brand { get; set; }
        public int QuantityInStock { get; set; }
    }
}