using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace API.Services
{
    // 
    // Summary:
    //     PaymentService does not access database, so it's not a controller. It will 
    //     be injected into PaymentController to interact with Stripe
    public class PaymentService
    {
        // get config values (Stripe keys) using DI
        private readonly IConfiguration _config;
        public PaymentService(IConfiguration config)
        {
            _config = config;
        }

        // PaymentIntent and ClientSecret will make Stripe payment compatible in most countries
        // PaymentIntent from Stripe.net package
        public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket)
        {
            // get Stripe secret key from appsettings.json
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var service = new PaymentIntentService();
            var intent = new PaymentIntent();
            var subtotal = basket.Items.Sum(item => item.Quantity * item.Product.Price);
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            // check if there is already a PaymentIntentId in basket
            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                // if no PaymentIntentId, create a new PaymentIntent
                var options = new PaymentIntentCreateOptions
                {
                    Amount = subtotal + deliveryFee,
                    Currency = "usd",
                    // make "card" the only payment method supported
                    PaymentMethodTypes = new List<string> { "card" }
                };
                intent = await service.CreateAsync(options);
            }
            else
            {
                // if PaymentIntentId already exists in basket, update the amount in PaymentIntent
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = subtotal + deliveryFee,
                };
                await service.UpdateAsync(basket.PaymentIntentId, options);
            }

            return intent;
        }
    }
}