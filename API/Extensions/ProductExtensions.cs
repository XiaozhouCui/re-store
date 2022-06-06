using System.Linq;
using API.Entities;
using Microsoft.Extensions.Logging.Configuration;

namespace API.Extensions
{
    public static class ProductExtensions
    {
        // define custom method Sort for IQuerable, so that query in ProductsController can use query.Sort()
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy)
        {
            if (string.IsNullOrWhiteSpace(orderBy)) return query.OrderBy(p => p.Name);

            query = orderBy switch
            {
                "price" => query.OrderBy(p => p.Price),
                "priceDesc" => query.OrderByDescending(p => p.Price),
                // default case "_": order by name (alphabetical)
                _ => query.OrderBy(p => p.Name)
            };

            return query;
        }

        // define custom method Search for IQuerable, so that query in ProductsController can use query.Search()
        public static IQueryable<Product> Search(this IQueryable<Product> query, string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return query;

            var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

            return query.Where(p => p.Name.ToLower().Contains(lowerCaseSearchTerm));
        }
    }
}