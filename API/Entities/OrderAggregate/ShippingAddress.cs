using Microsoft.EntityFrameworkCore;

namespace API.Entities.OrderAggregate
{
    // this entity is owned by Order table
    [Owned]
    public class ShippingAddress : Address
    {
        
    }
}