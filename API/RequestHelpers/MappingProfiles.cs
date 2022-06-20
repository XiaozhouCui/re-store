using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.RequestHelpers
{
    // extend AutoMapper's Profile class
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateProductDto, Product>();
        }
    }
}