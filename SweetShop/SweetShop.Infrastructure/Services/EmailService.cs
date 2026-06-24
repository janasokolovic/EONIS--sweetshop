using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using SweetShop.Application.Interfaces;

namespace SweetShop.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var smtpHost = _config["Email:SmtpHost"]!;
        var smtpPort = int.Parse(_config["Email:SmtpPort"]!);
        var smtpUser = _config["Email:SmtpUser"]!;
        var smtpPass = _config["Email:SmtpPass"]!;
        var fromEmail = _config["Email:From"]!;

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(smtpUser, smtpPass)
        };

        var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, "SweetShop"),
            Subject = "Resetovanje lozinke – SweetShop",
            IsBodyHtml = true,
            Body = $"""
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
                  <h2 style="color:#3d2314">Resetovanje lozinke</h2>
                  <p>Primili smo zahtev za resetovanje lozinke na vašem SweetShop nalogu.</p>
                  <p>Kliknite na dugme ispod da biste postavili novu lozinku. Link je validan <strong>1 sat</strong>.</p>
                  <a href="{resetLink}" style="display:inline-block;padding:12px 24px;background:#3d2314;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">
                    Resetuj lozinku
                  </a>
                  <p style="color:#888;font-size:13px">Ako niste tražili ovu akciju, možete ignorisati ovaj email.</p>
                </div>
                """
        };
        mail.To.Add(toEmail);

        await client.SendMailAsync(mail);
    }
}
