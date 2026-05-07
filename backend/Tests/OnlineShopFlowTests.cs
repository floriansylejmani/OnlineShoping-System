using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
using OnlineShop.Application.Validators.Auth;
using OnlineShop.Application.Validators.Cart;
using OnlineShop.Application.Validators.Payments;
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
    public async Task Auth_Response_Does_Not_Expose_Password_And_Stores_BCrypt_Hash()
    {
        await using var db = CreateDb();
        var auth = CreateAuthService(db);

        var result = await auth.RegisterAsync(new RegisterRequest
        {
            Email = "private@example.com",
            Password = "password123",
            FirstName = "Private",
            LastName = "User"
        });

        var user = await db.Users.SingleAsync(u => u.Email == "private@example.com");
        var responsePropertyNames = typeof(AuthResponse)
            .GetProperties()
            .Select(property => property.Name)
            .ToArray();

        Assert.True(result.IsSuccess);
        Assert.DoesNotContain(responsePropertyNames, name => name.Contains("Password", StringComparison.OrdinalIgnoreCase));
        Assert.NotEqual("password123", user.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", user.PasswordHash));
    }

    [Fact]
    public async Task Auth_Token_Contains_Expiry_User_Id_And_Role_Claims()
    {
        await using var db = CreateDb();
        var auth = CreateAuthService(db);

        var result = await auth.RegisterAsync(new RegisterRequest
        {
            Email = "claims@example.com",
            Password = "password123",
            FirstName = "Claims",
            LastName = "User"
        });

        var token = new JwtSecurityTokenHandler().ReadJwtToken(result.Data!.Token);

        Assert.True(token.ValidTo > DateTime.UtcNow);
        Assert.Contains(token.Claims, claim => claim.Type == ClaimTypes.NameIdentifier);
        Assert.Contains(token.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "Customer");
    }

    [Fact]
    public async Task Auth_Login_Fails_For_Invalid_Credentials_And_Duplicate_Register()
    {
        await using var db = CreateDb();
        var auth = CreateAuthService(db);

        var firstRegister = await auth.RegisterAsync(new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "password123",
            FirstName = "Test",
            LastName = "User"
        });
        var duplicateRegister = await auth.RegisterAsync(new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "password123",
            FirstName = "Test",
            LastName = "User"
        });
        var invalidLogin = await auth.LoginAsync(new LoginRequest
        {
            Email = "duplicate@example.com",
            Password = "wrong-password"
        });

        Assert.True(firstRegister.IsSuccess);
        Assert.False(duplicateRegister.IsSuccess);
        Assert.False(invalidLogin.IsSuccess);
        Assert.Contains("Email is already registered.", duplicateRegister.Errors);
        Assert.Equal(["Invalid email or password."], invalidLogin.Errors);
    }

    [Fact]
    public async Task Request_Validators_Reject_Invalid_Auth_Cart_And_Payment_Input()
    {
        var register = await new RegisterRequestValidator().ValidateAsync(new RegisterRequest
        {
            Email = "not-an-email",
            Password = "short",
            FirstName = "",
            LastName = ""
        });
        var login = await new LoginRequestValidator().ValidateAsync(new LoginRequest());
        var addCart = await new AddToCartRequestValidator().ValidateAsync(new AddToCartRequest
        {
            ProductId = Guid.Empty,
            Quantity = 0
        });
        var updateCart = await new UpdateCartItemRequestValidator().ValidateAsync(new UpdateCartItemRequest
        {
            Quantity = 0
        });
        var payment = await new CreatePaymentRequestValidator().ValidateAsync(new CreatePaymentRequest
        {
            OrderId = Guid.Empty
        });

        Assert.False(register.IsValid);
        Assert.False(login.IsValid);
        Assert.False(addCart.IsValid);
        Assert.False(updateCart.IsValid);
        Assert.False(payment.IsValid);
    }

    [Fact]
    public async Task Products_Can_Be_Listed_With_Search_Category_And_Price_Filter()
    {
        await using var db = CreateDb();
        var electronics = AddCategory(db, "Electronics");
        var books = AddCategory(db, "Books");
        AddProduct(db, electronics.Id, "Wireless Mouse", 25m, 10);
        AddProduct(db, electronics.Id, "Gaming Keyboard", 80m, 10);
        AddProduct(db, books.Id, "Cookbook", 15m, 10);
        await db.SaveChangesAsync();

        var result = await new ProductService(db).GetAllAsync(new ProductQueryRequest
        {
            Search = "mouse",
            CategoryId = electronics.Id,
            MinPrice = 20m,
            MaxPrice = 30m
        });

        Assert.True(result.IsSuccess);
        var product = Assert.Single(result.Data!.Items);
        Assert.Equal("Wireless Mouse", product.Name);
    }

    [Fact]
    public async Task Categories_Create_Update_And_Delete_When_Unused()
    {
        await using var db = CreateDb();
        var service = new CategoryService(db);

        var created = await service.CreateAsync(new CreateCategoryRequest { Name = "Accessories" });
        var updated = await service.UpdateAsync(created.Data!.Id, new UpdateCategoryRequest { Name = "Office Accessories" });
        var deleted = await service.DeleteAsync(created.Data.Id);

        Assert.True(created.IsSuccess);
        Assert.True(updated.IsSuccess);
        Assert.Equal("Office Accessories", updated.Data!.Name);
        Assert.True(deleted.IsSuccess);
    }

    [Fact]
    public async Task Category_Delete_Fails_When_Active_Products_Exist()
    {
        await using var db = CreateDb();
        var category = AddCategory(db);
        AddProduct(db, category.Id, "Tablet", 250m, 4);
        await db.SaveChangesAsync();

        var result = await new CategoryService(db).DeleteAsync(category.Id);

        Assert.False(result.IsSuccess);
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
    public void Protected_Controllers_Require_Server_Side_Authorization()
    {
        AssertControllerRequiresAuthorize<AdminController>("Admin");
        AssertControllerRequiresAuthorize<CartController>();
        AssertControllerRequiresAuthorize<OrdersController>();
        AssertControllerRequiresAuthorize<PaymentsController>();
        AssertRequiresAdmin<OrdersController>(nameof(OrdersController.GetAll));
        AssertRequiresAdmin<OrdersController>(nameof(OrdersController.UpdateStatus));
    }

    [Fact]
    public void Normal_User_Role_Does_Not_Satisfy_Admin_Only_Controller_Metadata()
    {
        var authorize = typeof(AdminController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .Single();

        var roles = Assert.IsType<string>(authorize.Roles);
        Assert.Equal("Admin", roles);
        Assert.DoesNotContain("Customer", roles.Split(',', StringSplitOptions.TrimEntries));
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
    public async Task Cart_Item_Update_And_Remove_Are_Scoped_To_Current_User()
    {
        await using var db = CreateDb();
        var owner = AddUser(db);
        var otherUser = AddUser(db);
        var category = AddCategory(db);
        var product = AddProduct(db, category.Id, "Headphones", 40m, 5);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var cart = new CartService(db);
        var added = await cart.AddItemAsync(owner.Id, new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 1
        });
        var ownerItemId = added.Data!.Items.Single().Id;

        var updateAsOtherUser = await cart.UpdateItemAsync(otherUser.Id, ownerItemId, new UpdateCartItemRequest
        {
            Quantity = 2
        });
        var removeAsOtherUser = await cart.RemoveItemAsync(otherUser.Id, ownerItemId);
        var ownerCart = await cart.GetCartAsync(owner.Id);

        Assert.False(updateAsOtherUser.IsSuccess);
        Assert.False(removeAsOtherUser.IsSuccess);
        Assert.Single(ownerCart.Data!.Items);
        Assert.Equal(1, ownerCart.Data.Items.Single().Quantity);
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
    public async Task Customer_Cannot_Read_Or_Cancel_Another_Users_Order()
    {
        await using var db = CreateDb();
        var (_, order) = await CreateOrderAsync(db);
        var otherUser = AddUser(db);
        await db.SaveChangesAsync();

        var orders = new OrderService(db);
        var readAsOtherUser = await orders.GetByIdForUserAsync(order.Id, otherUser.Id, isAdmin: false);
        var cancelAsOtherUser = await orders.CancelAsync(order.Id, otherUser.Id);

        Assert.False(readAsOtherUser.IsSuccess);
        Assert.False(cancelAsOtherUser.IsSuccess);
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
        Assert.Equal("Completed", payment.Data!.Status);
        Assert.Equal(OrderStatus.Processing, updatedOrder.Status);
        Assert.NotNull(updatedOrder.Payment);
    }

    [Fact]
    public async Task Payment_Demo_Flow_Does_Not_Accept_Card_Data_And_Cannot_Process_Twice()
    {
        await using var db = CreateDb();
        var (user, order) = await CreateOrderAsync(db);
        var service = new PaymentService(db);

        var firstPayment = await service.ProcessAsync(user.Id, new CreatePaymentRequest
        {
            OrderId = order.Id
        });
        var secondPayment = await service.ProcessAsync(user.Id, new CreatePaymentRequest
        {
            OrderId = order.Id
        });
        var requestProperties = typeof(CreatePaymentRequest).GetProperties().Select(property => property.Name);
        var responseProperties = typeof(PaymentDto).GetProperties().Select(property => property.Name);

        Assert.True(firstPayment.IsSuccess);
        Assert.False(secondPayment.IsSuccess);
        Assert.DoesNotContain(requestProperties.Concat(responseProperties), name =>
            name.Contains("Card", StringComparison.OrdinalIgnoreCase) ||
            name.Contains("Cvv", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Payment_Cannot_Process_Order_For_Different_User()
    {
        await using var db = CreateDb();
        var (_, order) = await CreateOrderAsync(db);
        var otherUser = AddUser(db);
        await db.SaveChangesAsync();

        var payment = await new PaymentService(db).ProcessAsync(otherUser.Id, new CreatePaymentRequest
        {
            OrderId = order.Id
        });

        Assert.False(payment.IsSuccess);
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

    private static Category AddCategory(ApplicationDbContext db, string? name = null)
    {
        var category = new Category { Name = name ?? $"Category {Guid.NewGuid():N}" };
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

    private static void AssertControllerRequiresAuthorize<TController>(string? role = null)
    {
        var authorize = typeof(TController).GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .SingleOrDefault();

        Assert.NotNull(authorize);
        if (role is not null)
            Assert.Equal(role, authorize.Roles);
    }
}
