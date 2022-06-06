namespace API.RequestHelpers
{
    // derive from PaginationParams, then the PaginationParams will have all the below properties
    public class ProductParams : PaginationParams
    {
        public string OrderBy { get; set; }
        public string SearchTerm { get; set; }
        public string Types { get; set; }
        public string Brands { get; set; }
    }
}