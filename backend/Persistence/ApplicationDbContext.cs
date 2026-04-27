using Microsoft.EntityFrameworkCore;
using OnlineShop.Domain.Entities;
using OnlineShop.Domain.Enums;

namespace OnlineShop.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            e.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            e.Property(u => u.Role).HasConversion<string>();

            e.HasOne(u => u.Cart)
             .WithOne(c => c.User)
             .HasForeignKey<Cart>(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(u => u.Orders)
             .WithOne(o => o.User)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
            e.HasIndex(c => c.Name).IsUnique();

            e.HasMany(c => c.Products)
             .WithOne(p => p.Category)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.Description).HasMaxLength(2000);
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.ImageUrl).HasMaxLength(500);
            e.HasIndex(p => p.Name);
            e.HasIndex(p => new { p.CategoryId, p.IsActive });
        });

        modelBuilder.Entity<Cart>(e =>
        {
            e.HasKey(c => c.Id);

            e.HasMany(c => c.Items)
             .WithOne(i => i.Cart)
             .HasForeignKey(i => i.CartId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.HasKey(ci => ci.Id);
            e.HasIndex(ci => new { ci.CartId, ci.ProductId }).IsUnique();

            e.HasOne(ci => ci.Product)
             .WithMany()
             .HasForeignKey(ci => ci.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Status).HasConversion<string>();
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.HasIndex(o => o.Status);

            e.HasMany(o => o.Items)
             .WithOne(i => i.Order)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(o => o.Payment)
             .WithOne(p => p.Order)
             .HasForeignKey<Payment>(p => p.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(oi => oi.Id);
            e.Property(oi => oi.UnitPrice).HasPrecision(18, 2);

            e.HasOne(oi => oi.Product)
             .WithMany()
             .HasForeignKey(oi => oi.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Status).HasConversion<string>();
            e.Property(p => p.Amount).HasPrecision(18, 2);
        });
    }
}
