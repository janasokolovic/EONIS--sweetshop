namespace SweetShop.Application.Interfaces;

public interface IStripeService
{
    /// <summary>
    /// Kreira PaymentIntent na Stripe-u i vraća client secret koji frontend koristi za naplatu
    /// </summary>
    Task<StripePaymentIntentResult> CreatePaymentIntentAsync(int orderId, decimal amount, string currency = "usd");

    /// <summary>
    /// Verifikuje da je webhook poziv stvarno došao od Stripe-a (digitalni potpis)
    /// </summary>
    Task ProcessWebhookEventAsync(string payload, string signature);
}

public class StripePaymentIntentResult
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
}