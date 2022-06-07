using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers
{
    // use generic type for paged list, can be paginated Products
    public class PagedList<T> : List<T>
    {
        // constructor
        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            MetaData = new MetaData
            {
                TotalCount = count,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                // (int): cast to integer, (double): cast to double
                TotalPages = (int)Math.Ceiling(count / (double)pageSize) // rounded up for total pages
            };
            // include items in page list
            AddRange(items);
        }

        // pagination metadata will be included in the response header
        public MetaData MetaData { get; set; }

        // static method to convert query into paged list
        public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
        {
            // exec query against db to get total number of items
            var count = await query.CountAsync();
            // exec query against db to get items
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            // return the page list containing meta data and items
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}