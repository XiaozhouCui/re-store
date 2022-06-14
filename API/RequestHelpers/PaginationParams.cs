namespace API.RequestHelpers
{
    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1; // default PageNumber is 1
        private int _pageSize = 6; // default page size is 6

        // getter and setter for page size
        public int PageSize
        {
            get => _pageSize;
            // should not be greater than MaxPageSize (50)
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
    }
}