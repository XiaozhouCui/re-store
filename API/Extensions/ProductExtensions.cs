using System.Collections.Generic;
using System.Linq;
using API.Entities;

namespace API.Extensions
{
    public static class ProductExtensions
    {
        // define custom method Sort for IQuerable, so that query in ProductsController can use query.Sort()
        // "this" means extending query IQueryable<Product>
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy)
        {
            // orderBy is a query parameter: api/Products?orderBy=price
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
            // searchTerm is a query parameter: api/Products?searchTerm=blue
            if (string.IsNullOrEmpty(searchTerm)) return query;

            var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

            return query.Where(p => p.Name.ToLower().Contains(lowerCaseSearchTerm));
        }

        // extension for filtering typesand brands
        public static IQueryable<Product> Filter(this IQueryable<Product> query, string brands, string types)
        {
            var brandList = new List<string>();
            var typeList = new List<string>();

            // brands is a comma delimited query string: api/Products?brands=react,netcore
            if (!string.IsNullOrEmpty(brands))
                brandList.AddRange(brands.ToLower().Split(",").ToList());

            // types is a comma delimited query string: api/Products?types=hats,boots
            if (!string.IsNullOrEmpty(types))
                typeList.AddRange(types.ToLower().Split(",").ToList());

            // filter for all brands that matches the brand list (do nothing if brandList is empty)
            query = query.Where(p => brandList.Count == 0 || brandList.Contains(p.Brand.ToLower()));

            // filter for all types that matches the type list (do nothing if typeList is empty)
            query = query.Where(p => typeList.Count == 0 || typeList.Contains(p.Type.ToLower()));

            return query;
        }
    }
}