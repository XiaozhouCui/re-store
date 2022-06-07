using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.RequestHelpers;
using Microsoft.AspNetCore.Http;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        // extend Microsoft.AspNetCore.Http.HttpResponse by adding a new method "AddPaginationHeader"
        public static void AddPaginationHeader(this HttpResponse response, MetaData metaData)
        {
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            // include metadata in the "Paginatin" header of response: {"currentPage":1,"totalPages":3,"pageSize":6,"totalCount":18}
            response.Headers.Add("Pagination", JsonSerializer.Serialize(metaData, options));
            // Make CORS header "Pagination" available on client side
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}