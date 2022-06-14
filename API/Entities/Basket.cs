using System.Collections.Generic;
using System.Linq;

namespace API.Entities
{
    public class Basket
    {
        public int Id { get; set; }
        public string BuyerId { get; set; }

        // always initialise a new list when a basket is created, can be an empty List (1-to-many-or-0)
        public List<BasketItem> Items { get; set; } = new List<BasketItem>();

        // Client need to create a PaymentIntent before making payment
        public string PaymentIntentId { get; set; }

        // ClientSecret will be passed back to the client, so that client can use it to make payment to Stripe
        public string ClientSecret { get; set; }

        // method for adding item
        public void AddItem(Product product, int quantity)
        {
            // check if the item-to-add is already in the List
            if (Items.All(item => item.ProductId != product.Id))
            {
                // if product not in the list, add the BasketItem object
                Items.Add(new BasketItem { Product = product, Quantity = quantity });
            }

            // adjust the quantity if the item is already in the basket
            var existingItem = Items.FirstOrDefault(item => item.ProductId == product.Id);
            if (existingItem != null) existingItem.Quantity += quantity;
        }

        // method for removing item
        public void RemoveItem(int productId, int quantity)
        {
            var item = Items.FirstOrDefault(item => item.ProductId == productId);
            if (item == null) return;
            item.Quantity -= quantity;
            if (item.Quantity == 0) Items.Remove(item);
        }
    }
}