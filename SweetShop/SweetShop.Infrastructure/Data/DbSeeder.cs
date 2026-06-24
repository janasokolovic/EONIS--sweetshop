using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Enums;

namespace SweetShop.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
      
        await context.Database.MigrateAsync();

  
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Čokolade", Description = "Različite vrste premium čokolada", ImageUrl = "/images/categories/chocolates.jpg" },
                new() { Name = "Bombone", Description = "Šećerne bombone svih ukusa", ImageUrl = "/images/categories/candies.jpg" },
                new() { Name = "Lizalice", Description = "Šarene lizalice i lollipops", ImageUrl = "/images/categories/lollipops.jpg" },
                new() { Name = "Žvake", Description = "Različite žvake i gume za žvakanje", ImageUrl = "/images/categories/gum.jpg" }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

    
        if (!await context.Products.AnyAsync())
        {
            var cokolada = await context.Categories.FirstAsync(c => c.Name == "Čokolade");
            var bombone = await context.Categories.FirstAsync(c => c.Name == "Bombone");
            var lizalice = await context.Categories.FirstAsync(c => c.Name == "Lizalice");
            var zvake = await context.Categories.FirstAsync(c => c.Name == "Žvake");

            var products = new List<Product>
            {
     
                new() { Name = "Milka Mliječna čokolada", Description = "Klasična švajcarska mliječna čokolada, 100g", Price = 2.99m, StockQuantity = 100, CategoryId = cokolada.Id },
                new() { Name = "Lindt Dark 70%", Description = "Premium tamna čokolada sa 70% kakaa", Price = 4.50m, StockQuantity = 50, CategoryId = cokolada.Id },
                new() { Name = "Toblerone", Description = "Švajcarska čokolada sa medom i bademima", Price = 5.20m, StockQuantity = 75, CategoryId = cokolada.Id },

        
                new() { Name = "Haribo Goldbears", Description = "Gumeni medvedići u različitim ukusima, 200g", Price = 3.50m, StockQuantity = 150, CategoryId = bombone.Id },
                new() { Name = "Skittles Tropical", Description = "Voćni dražeji sa tropskim ukusima", Price = 2.20m, StockQuantity = 200, CategoryId = bombone.Id },
                new() { Name = "M&M's Peanut", Description = "Čokoladne bombone sa kikirikijem", Price = 3.99m, StockQuantity = 120, CategoryId = bombone.Id },

 
                new() { Name = "Chupa Chups Mix", Description = "Pakovanje od 25 lizalica raznih ukusa", Price = 6.99m, StockQuantity = 80, CategoryId = lizalice.Id },
                new() { Name = "Mega Lizalica Vrtska", Description = "Velika spiralna lizalica, 200g", Price = 4.50m, StockQuantity = 40, CategoryId = lizalice.Id },
                new() { Name = "Dum Dums Original", Description = "Mini lizalice u različitim ukusima", Price = 1.99m, StockQuantity = 300, CategoryId = lizalice.Id },

  
                new() { Name = "Orbit Spearmint", Description = "Žvaka sa ukusom mente, bez šećera", Price = 1.50m, StockQuantity = 250, CategoryId = zvake.Id },
                new() { Name = "Hubba Bubba Original", Description = "Žvaka koja se može duvati u bubble", Price = 2.20m, StockQuantity = 180, CategoryId = zvake.Id },
                new() { Name = "5 Gum Cobalt", Description = "Premium žvaka sa hladnim ukusom mente", Price = 2.99m, StockQuantity = 130, CategoryId = zvake.Id }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }


        if (!await context.Users.OfType<Admin>().AnyAsync())
        {
            var admin = new Admin
            {
                Email = "admin@sweetshop.com",
                FirstName = "Admin",
                LastName = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(admin);
            await context.SaveChangesAsync();
        }
    }
}