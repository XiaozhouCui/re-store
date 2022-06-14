using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class PaymentController : BaseApiController
    {
        private readonly PaymentService _paymentService;
        private readonly StoreContext _context;
        public PaymentController(PaymentService paymentService, StoreContext context)
        {
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
    }
}