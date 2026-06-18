using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Exceptions;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly IOrderService _orderService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IStripeService stripeService,
        IOrderService orderService,
        ILogger<PaymentsController> logger)
    {
        _stripeService = stripeService;
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Kreira PaymentIntent za porudžbinu (Customer)
    /// </summary>
    [HttpPost("create-intent/{orderId}")]
    [Authorize]
    public async Task<ActionResult<StripePaymentIntentResult>> CreatePaymentIntent(int orderId)
    {
        // Pronađi porudžbinu (servis radi security check da je porudžbina vlasništvo prijavljenog kupca)
        var order = await _orderService.GetByIdAsync(orderId);

        var result = await _stripeService.CreatePaymentIntentAsync(
            orderId,
            order.TotalAmount,
            "usd"
        );

        return Ok(result);
    }

    /// <summary>
    /// Stripe webhook endpoint - prima obaveštenja o plaćanjima
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        // Pročitaj raw body (potreban za signature verification)
        using var reader = new StreamReader(HttpContext.Request.Body);
        var payload = await reader.ReadToEndAsync();

        // Stripe-Signature header sadrži digitalni potpis
        var signature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _stripeService.ProcessWebhookEventAsync(payload, signature);
            return Ok();
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning(ex, "Webhook bad request");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook processing error");
            return StatusCode(500, new { error = "Internal error processing webhook." });
        }
    }
}