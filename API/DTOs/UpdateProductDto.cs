using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace API.DTOs
{
    public class UpdateProductDto
    {
        public int Id { get; set; }

        [Required] // validation
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [Range(100, Double.PositiveInfinity)] // price must not be less than $1.00
        public long Price { get; set; }

        public IFormFile File { get; set; } // for uploading file from browser (optional)

        [Required]
        public string Type { get; set; }

        [Required]
        public string Brand { get; set; }

        [Required]
        [Range(0, 200)] // quantity must be between 0 and 200
        public int QuantityInStock { get; set; }
    }
}