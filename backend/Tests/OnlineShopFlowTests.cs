using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OnlineShop.API.Controllers;
using OnlineShop.Application.DTOs.Auth;
using OnlineShop.Application.DTOs.Cart;
using OnlineShop.Application.DTOs.Categories;
using OnlineShop.Application.DTOs.Orders;
using OnlineShop.Application.DTOs.Payments;
using OnlineShop.Application.DTOs.Products;
using OnlineShop.Domain.Entities;
using OnlineShop.Domain.Enums;
using OnlineShop.Infrastructure.Options;
using OnlineShop.Infrastructure.Services;
using OnlineShop.Persistence;

namespace OnlineShop.Tests;

public class OnlineShopFlowTests
{
    [Fact]
    public async Task Auth_Register_And_Login_Return_Token_And_Customer_Role()
    {
        await using var db = CreateDb();
        var auth = CreateAuthService(db);

        var register = await auth.RegisterAsync(new RegisterRequest
        {
            Email = "user@example.com",
            Password = "password123",
            FirstName = "Test",
            LastName = "User"
        });

        var login = await auth.LoginAsync(new LoginRequest
        {
            Email = "user@example.com",
            Password = "password123"
        });

        Assert.True(register.IsSuccess);
        Assert.False(string.IsNullOrWhiteSpace(register.Data!.Token));
        Assert.Equal("Customer", register.Data.Role);
        Assert.True(login.IsSuccess);
        Assert.False(string.IsNullOrWhiteSpace(login.Data!.Token));
        Assert.Equal("Customer", login.Data.Role);
    }

    [Fact]
    public void Product_Create_Update_Delete_Actions_Require_Admin_Role()
    {
        AssertRequiresAdmin<ProductsController>(nameof(ProductsController.Create));
        AssertRequiresAdmin<ProductsController>(nameof(ProductsController.Update));
        AssertRequiresAdmin<ProductsController>(nameof(ProductsController.Delete));
    }

    [Fact]
    public void Category_Create_Update_Delete_Actions_Require_Admin_Role()
    {
        AssertRequiresAdmin<CategoriesController>(nameof(CategoriesController.Create));
        AssertRequiresAdmin<CategoriesController>(nameof(CategoriesController.Update));
        AssertRequiresAdmin<CategoriesController>(nameof(CategoriesController.Delete));
    }

    [Fact]
    public async Task Cart_Add_Update_Remove_And_Clear_Work_With_Cart_Item_Ids()
    {
        await using var db = CreateDb();
        var user = AddUser(db);
        var category = AddCategory(db);
        var firstProduct = AddProduct(db, category.Id, "Keyboard", 50m, 8);
        var secondProduct = AddProduct(db, category.Id, "Mouse", 20m, 5);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var cart = new CartService(db);

        var added = await cart.AddItemAsync(user.Id, new AddToCartRequest
        {
            ProductId = firstProduct.Id,
            Quantity = 2
        });
        var cartItemId = added.Data!.Items.Single().Id;

        var updated = await cart.UpdateItemAsync(user.Id, cartItemId, new UpdateCartItemRequest
        {
            Quantity = 3
        });
        var removed = await cart.RemoveItemAsync(user.Id, cartItemId);
        var addedAgain = await cart.AddItemAsync(user.Id, new AddToCartRequest
        {
            ProductId = secondProduct.Id,
            Quantity = 1
        });
        var cleared = await cart.ClearCartAsync(user.Id);
        var finalCart = await cart.GetCartAsync(user.Id);

        Assert.True(added.IsSuccess);
        Assert.Equal(2, added.Data.Items.Single().Quantity);
        Assert.True(updated.IsSuccess);
        Assert.Equal(3, updated.Data!.Items.Single().Quantity);
        Assert.True(removed.IsSuccess);
        Assert.True(addedAgain.IsSuccess);
        Assert.True(cleared.IsSuccess);
        Assert.Empty(finalCart.Data!.Items);
    }

    [Fact]
    public async Task Create_Order_From_Cart_Clears_Cart_And_Decrements_Stock()
    {
        await using var db = CreateDb();
        var user = AddUser(db);
        var category = AddCategory(db);
        var product = AddProduct(db, category.Id, "Desk", 100m, 4);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        await new CartService(db).AddItemAsync(user.Id, new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 2
        });

        var order = await new OrderService(db).CreateFromCartAsync(user.Id);
        var cart = await new CartService(db).GetCartAsync(user.Id);

        Assert.True(order.IsSuccess);
        Assert.Equal("Pending", order.Data!.Status);
        Assert.Equal(200m, order.Data.TotalAmount);
        Assert.Empty(cart.Data!.Items);
        Assert.Equal(2, (await db.Products.FindAsync(product.Id))!.StockQuantity);
    }

    [Fact]
    public async Task Process_Payment_Marks_Payment_Paid_And_Order_Processing()
    {
        await using var db = CreateDb();
        var (user, order) = await CreateOrderAsync(db);

        var payment = await new PaymentService(db).ProcessAsync(user.Id, new CreatePaymentRequest
        {
            OrderId = order.Id
        });

        var updatedOrder = await db.Orders.Include(o => o.Payment).SingleAsync(o => o.Id == order.Id);
        Assert.True(payment.IsSuccess);
        Assert.Equal("Paid", payment.Data!.Status);
        Assert.Equal(OrderStatus.Processing, updatedOrder.Status);
        Assert.NotNull(updatedOrder.Payment);
    }

    [Fact]
    public async Task Cancel_Order_Restores_Stock_And_Sets_Cancelled()
    {
        await using var db = CreateDb();
        var (user, order) = await CreateOrderAsync(db);
        var productId = order.Items.Single().ProductId;

        var result = await new OrderService(db).CancelAsync(order.Id, user.Id);
        var updatedOrder = await db.Orders.FindAsync(order.Id);
        var product = await db.Products.FindAsync(productId);

        Assert.True(result.IsSuccess);
        Assert.Equal(OrderStatus.Cancelled, updatedOrder!.Status);
        Assert.Equal(10, product!.StockQuantity);
    }

    [Fact]
    public async Task Admin_Update_Order_Status_Sets_Requested_Status()
    {
        await using var db = CreateDb();
        var (_, order) = await CreateOrderAsync(db);

        var result = await new OrderService(db).UpdateStatusAsync(order.Id, new UpdateOrderStatusRequest
        {
            Status = "Shipped"
        });

        Assert.True(result.IsSuccess);
        Assert.Equal("Shipped", result.Data!.Status);
    }

    private static ApplicationDbContext CreateDb()
    {
        var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var db = new ApplicationDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    private static AuthService CreateAuthService(ApplicationDbContext db) =>
        new(db, Options.Create(new JwtOptions
        {
            Issuer = "tests",
            Audience = "tests",
            Secret = "super-secret-test-key-with-enough-length",
            ExpiryMinutes = 60
        }));

    private static User AddUser(ApplicationDbContext db, UserRole role = UserRole.Customer)
    {
        var user = new User
        {
            Email = $"{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            FirstName = "Test",
            LastName = "User",
            Role = role
        };
        db.Users.Add(user);
        return user;
    }

    private static Category AddCategory(ApplicationDbContext db)
    {
        var category = new Category { Name = $"Category {Guid.NewGuid():N}" };
        db.Categories.Add(category);
        return category;
    }

    private static Product AddProduct(
        ApplicationDbContext db,
        Guid categoryId,
        string name,
        decimal price,
        int stock)
    {
        var product = new Product
        {
            Name = name,
            Description = name,
            Price = price,
            StockQuantity = stock,
            CategoryId = categoryId,
            ImageUrl = string.Empty,
            IsActive = true
        };
        db.Products.Add(product);
        return product;
    }

    private static async Task<(User User, Order Order)> CreateOrderAsync(ApplicationDbContext db)
    {
        var user = AddUser(db);
        var category = AddCategory(db);
        var product = AddProduct(db, category.Id, "Monitor", 75m, 10);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        await new CartService(db).AddItemAsync(user.Id, new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 2
        });

        var orderResult = await new OrderService(db).CreateFromCartAsync(user.Id);
        var order = await db.Orders
            .Include(o => o.Items)
            .SingleAsync(o => o.Id == orderResult.Data!.Id);

        return (user, order);
    }

    private static void AssertRequiresAdmin<TController>(string methodName)
    {
        var method = typeof(TController).GetMethod(methodName);
        Assert.NotNull(method);

        var authorize = method.GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .SingleOrDefault();

        Assert.NotNull(authorize);
        Assert.Equal("Admin", authorize.Roles);
    }
}
