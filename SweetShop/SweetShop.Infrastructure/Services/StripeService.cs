using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Enums;
using SweetShop.Domain.Exceptions;
using SweetShop.Infrastructure.Data;

namespace SweetShop.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StripeService> _logger;
    private readonly string _webhookSecret;

    public StripeService(
        IConfiguration configuration,
        ApplicationDbContext context,
        ILogger<StripeService> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;

        // Postavi Stripe API ključ globalno
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"]
            ?? throw new InvalidOperationException("Stripe Secret Key not configured.");

        _webhookSecret = _configuration["Stripe:WebhookSecret"] ?? string.Empty;
    }

    public async Task<StripePaymentIntentResult> CreatePaymentIntentAsync(int orderId, decimal amount, string currency = "usd")
    {
        // Pronađi porudžbinu i proveri da nema već uspešno plaćanje
        var order = await _context.Orders
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new NotFoundException("Order", orderId);

        if (order.Payment != null && order.Payment.Status == PaymentStatus.Succeeded)
            throw new BadRequestException("Ova porudžbina je već uspešno plaćena.");

        // Stripe radi sa najmanjom jedinicom valute (USD u centima = amount × 100)
        var amountInCents = (long)(amount * 100);

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = currency.ToLower(),
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
                AllowRedirects = "never"
            },
            Metadata = new Dictionary<string, string>
            {
                { "orderId", orderId.ToString() },
                { "customerId", order.CustomerId.ToString() }
            }
        };

        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);

        // Sačuvaj Payment u našoj bazi
        if (order.Payment == null)
        {
            var payment = new Domain.Entities.Payment
            {
                OrderId = order.Id,
                StripePaymentIntentId = paymentIntent.Id,
                Amount = amount,
                Currency = currency.ToUpper(),
                Status = PaymentStatus.Pending
            };
            _context.Payments.Add(payment);
        }
        else
        {
            // Ako već postoji ali nije succeeded, ažuriraj
            order.Payment.StripePaymentIntentId = paymentIntent.Id;
            order.Payment.Amount = amount;
            order.Payment.Currency = currency.ToUpper();
            order.Payment.Status = PaymentStatus.Pending;
        }

        await _context.SaveChangesAsync();

        return new StripePaymentIntentResult
        {
            PaymentIntentId = paymentIntent.Id,
            ClientSecret = paymentIntent.ClientSecret,
            Amount = amount,
            Currency = currency.ToUpper()
        };
    }

    public async Task ProcessWebhookEventAsync(string payload, string signature)
    {
        Event stripeEvent;

        try
        {
            // Verifikuj digitalni potpis - garantuje da je zahtev stvarno od Stripe-a
            stripeEvent = EventUtility.ConstructEvent(payload, signature, _webhookSecret);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook signature verification failed");
            throw new BadRequestException("Nevalidan webhook potpis.");
        }

        _logger.LogInformation("Stripe webhook received: {EventType}", stripeEvent.Type);

        // Obradi različite tipove događaja
        switch (stripeEvent.Type)
        {
            case "payment_intent.succeeded":
                await HandlePaymentSucceededAsync(stripeEvent);
                break;

            case "payment_intent.payment_failed":
                await HandlePaymentFailedAsync(stripeEvent);
                break;

            default:
                _logger.LogInformation("Unhandled Stripe event type: {EventType}", stripeEvent.Type);
                break;
        }
    }

    // ============= PRIVATE HANDLERS =============

    private async Task HandlePaymentSucceededAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not PaymentIntent paymentIntent)
            return;

        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.Items)
                    .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntent.Id);

        if (payment == null)
        {
            _logger.LogWarning("Payment not found for PaymentIntent: {Id}", paymentIntent.Id);
            return;
        }

        // Ažuriraj status plaćanja
        payment.Status = PaymentStatus.Succeeded;
        payment.PaidAt = DateTime.UtcNow;

        // Ažuriraj status porudžbine
        if (payment.Order != null && payment.Order.Status == OrderStatus.Pending)
        {
            payment.Order.Status = OrderStatus.Paid;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Payment succeeded for Order: {OrderId}", payment.OrderId);
    }

    private async Task HandlePaymentFailedAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not PaymentIntent paymentIntent)
            return;

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntent.Id);

        if (payment == null)
            return;

        payment.Status = PaymentStatus.Failed;
        await _context.SaveChangesAsync();

        _logger.LogWarning("Payment failed for Order: {OrderId}", payment.OrderId);
    }
}