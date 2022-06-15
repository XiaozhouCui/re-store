using System.IO;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace API.Controllers
{
    public class PaymentController : BaseApiController
    {
        private readonly PaymentService _paymentService;
        private readonly StoreContext _context;
        private readonly IConfiguration _config;
        public PaymentController(PaymentService paymentService, StoreContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
            _paymentService = paymentService;
        }

        [Authorize] // protected, will have User.Identity
        [HttpPost] // create a payment intent when clicking "checkout" button
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {
            // get basket of logged in user
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name)
                .FirstOrDefaultAsync();

            if (basket == null) return NotFound();

            var intent = await _paymentService.CreateOrUpdatePaymentIntent(basket);

            if (intent == null) return BadRequest(new ProblemDetails { Title = "Problem creating payment intent" });

            // new intent will have PaymentIntentId and ClientSecret, assign them to the basket
            basket.PaymentIntentId = basket.PaymentIntentId ?? intent.Id;
            basket.ClientSecret = basket.ClientSecret ?? intent.ClientSecret;

            _context.Update(basket);

            // persist basket changes to db
            var result = await _context.SaveChangesAsync() > 0;

            if (!result) return BadRequest(new ProblemDetails { Title = "Problem updating basket with intent" });

            // return the busket DTO to client, no need to return PaymentIntent
            return basket.MapBasketToDto();
        }

        // this route is to handle webhook request from Stripe, no auth required
        // this is used to update order status after successful payment
        [HttpPost("webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            // read the request from Stripe
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            // use Stripe's EventUtility to get event
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _config["StripeSettings:WhSecret"]);

            // get the charge event (containing PaymentIntentId) and cast to Stripe.Charge object
            var charge = (Charge)stripeEvent.Data.Object; // (Charge) is to cast to Charge object

            // get the order in DB using PaymentIntentId from charge event
            var order = await _context.Orders.FirstOrDefaultAsync(x => x.PaymentIntentId == charge.PaymentIntentId);

            // if payment is successful, update the order in DB
            if (charge.Status == "succeeded") order.OrderStatus = OrderStatus.PaymentReceived;
            await _context.SaveChangesAsync();

            return new EmptyResult(); // tell Stripe its done
        }
    }
}