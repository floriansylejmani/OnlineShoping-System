using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Auth;
using OnlineShop.Application.DTOs.Cart;
using OnlineShop.Application.DTOs.Categories;
using OnlineShop.Application.DTOs.Orders;
using OnlineShop.Application.DTOs.Payments;
using OnlineShop.Application.DTOs.Products;
using OnlineShop.Infrastructure.Services;
using OnlineShop.Persistence;

namespace OnlineShop.Tests;

public sealed class ApiAuthorizationTests : IClassFixture<ApiAuthorizationTests.ShopApiFactory>
{
    private readonly ShopApiFactory _factory;

    public ApiAuthorizationTests(ShopApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Admin_Endpoints_Reject_Anonymous_And_Customer_But_Allow_Admin()
    {
        using var client = _factory.CreateClient();
        var customerToken = await LoginAsync(client, DatabaseSeeder.CustomerEmail, DatabaseSeeder.DefaultPassword);
        var adminToken = await LoginAsync(client, DatabaseSeeder.AdminEmail, DatabaseSeeder.DefaultPassword);

        await AssertStatusAsync(client, HttpMethod.Get, "/api/admin/dashboard", null, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/admin/dashboard", customerToken, HttpStatusCode.Forbidden);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/admin/dashboard", adminToken, HttpStatusCode.OK);

        var category = await GetFirstCategoryAsync(client);
        var productRequest = new CreateProductRequest
        {
            Name = $"HTTP Test Product {Guid.NewGuid():N}",
            Description = "Created by API authorization tests.",
            Price = 12.50m,
            StockQuantity = 5,
            ImageUrl = "",
            CategoryId = category.Id
        };

        await AssertStatusAsync(client, HttpMethod.Post, "/api/products", null, HttpStatusCode.Unauthorized, productRequest);
        await AssertStatusAsync(client, HttpMethod.Post, "/api/products", customerToken, HttpStatusCode.Forbidden, productRequest);

        SetBearer(client, adminToken);
        var createdProductResponse = await client.PostAsJsonAsync("/api/products", productRequest);
        Assert.Equal(HttpStatusCode.OK, createdProductResponse.StatusCode);
        var createdProduct = await ReadJsonAsync<ProductDto>(createdProductResponse);

        var updateProduct = new UpdateProductRequest
        {
            Name = createdProduct.Name,
            Description = "Updated by API authorization tests.",
            Price = createdProduct.Price,
            StockQuantity = createdProduct.StockQuantity,
            ImageUrl = createdProduct.ImageUrl,
            CategoryId = createdProduct.CategoryId,
            IsActive = true
        };
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/products/{createdProduct.Id}", customerToken, HttpStatusCode.Forbidden, updateProduct);
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/products/{createdProduct.Id}", adminToken, HttpStatusCode.OK, updateProduct);
        await AssertStatusAsync(client, HttpMethod.Delete, $"/api/products/{createdProduct.Id}", customerToken, HttpStatusCode.Forbidden);
        await AssertStatusAsync(client, HttpMethod.Delete, $"/api/products/{createdProduct.Id}", adminToken, HttpStatusCode.NoContent);

        var createCategory = new CreateCategoryRequest { Name = $"HTTP Category {Guid.NewGuid():N}" };
        await AssertStatusAsync(client, HttpMethod.Post, "/api/categories", null, HttpStatusCode.Unauthorized, createCategory);
        await AssertStatusAsync(client, HttpMethod.Post, "/api/categories", customerToken, HttpStatusCode.Forbidden, createCategory);
        SetBearer(client, adminToken);
        var categoryResponse = await client.PostAsJsonAsync("/api/categories", createCategory);
        Assert.Equal(HttpStatusCode.OK, categoryResponse.StatusCode);
        var createdCategory = await ReadJsonAsync<CategoryDto>(categoryResponse);

        var updateCategory = new UpdateCategoryRequest { Name = $"{createdCategory.Name} Updated" };
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/categories/{createdCategory.Id}", customerToken, HttpStatusCode.Forbidden, updateCategory);
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/categories/{createdCategory.Id}", adminToken, HttpStatusCode.OK, updateCategory);
        await AssertStatusAsync(client, HttpMethod.Delete, $"/api/categories/{createdCategory.Id}", customerToken, HttpStatusCode.Forbidden);
        await AssertStatusAsync(client, HttpMethod.Delete, $"/api/categories/{createdCategory.Id}", adminToken, HttpStatusCode.NoContent);

        var order = await CreateOrderForCustomerAsync(client, customerToken);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/orders", null, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/orders", customerToken, HttpStatusCode.Forbidden);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/orders", adminToken, HttpStatusCode.OK);
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/orders/{order.Id}/status", customerToken, HttpStatusCode.Forbidden, new UpdateOrderStatusRequest { Status = "Shipped" });
        await AssertStatusAsync(client, HttpMethod.Put, $"/api/orders/{order.Id}/status", adminToken, HttpStatusCode.OK, new UpdateOrderStatusRequest { Status = "Shipped" });
    }

    [Fact]
    public async Task Protected_Endpoints_Reject_Anonymous_And_Invalid_Tokens()
    {
        using var client = _factory.CreateClient();

        await AssertStatusAsync(client, HttpMethod.Get, "/api/cart", null, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Post, "/api/orders", null, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Post, "/api/payments", null, HttpStatusCode.Unauthorized, new CreatePaymentRequest { OrderId = Guid.NewGuid() });

        const string invalidToken = "not-a-valid-jwt";
        await AssertStatusAsync(client, HttpMethod.Get, "/api/cart", invalidToken, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Get, "/api/orders/my", invalidToken, HttpStatusCode.Unauthorized);
        await AssertStatusAsync(client, HttpMethod.Post, "/api/payments", invalidToken, HttpStatusCode.Unauthorized, new CreatePaymentRequest { OrderId = Guid.NewGuid() });
    }

    [Fact]
    public async Task Customer_Resources_Are_Isolated_By_Authenticated_User()
    {
        using var client = _factory.CreateClient();
        var userAToken = await RegisterAsync(client, "user-a");
        var userBToken = await RegisterAsync(client, "user-b");

        var userAOrder = await CreateOrderForCustomerAsync(client, userAToken);

        SetBearer(client, userBToken);
        var userBCart = await client.GetFromJsonAsync<CartDto>("/api/cart", JsonOptions);
        var userBOrders = await client.GetFromJsonAsync<IReadOnlyList<OrderDto>>("/api/orders/my", JsonOptions);
        var readUserAOrder = await client.GetAsync($"/api/orders/{userAOrder.Id}");
        var payUserAOrder = await client.PostAsJsonAsync("/api/payments", new CreatePaymentRequest { OrderId = userAOrder.Id });

        Assert.NotNull(userBCart);
        Assert.Empty(userBCart.Items);
        Assert.NotNull(userBOrders);
        Assert.Empty(userBOrders);
        Assert.Equal(HttpStatusCode.NotFound, readUserAOrder.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, payUserAOrder.StatusCode);
    }

    [Fact]
    public async Task Auth_Api_Returns_Token_And_Never_Returns_Password_Fields()
    {
        using var client = _factory.CreateClient();
        var email = $"auth-{Guid.NewGuid():N}@example.com";

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "password123",
            FirstName = "Auth",
            LastName = "User"
        });
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = "password123"
        });
        var invalidLoginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = "wrong-password"
        });

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidLoginResponse.StatusCode);

        var auth = await ReadJsonAsync<AuthResponse>(loginResponse);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(auth.Token);
        var registerJson = await registerResponse.Content.ReadAsStringAsync();
        var loginJson = await loginResponse.Content.ReadAsStringAsync();

        Assert.False(string.IsNullOrWhiteSpace(auth.Token));
        Assert.Contains(token.Claims, claim => claim.Type == ClaimTypes.NameIdentifier);
        Assert.Contains(token.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "Customer");
        Assert.True(token.ValidTo > DateTime.UtcNow);
        Assert.DoesNotContain("password", registerJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("password", loginJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("hash", registerJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("hash", loginJson, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await ReadJsonAsync<AuthResponse>(response);
        return auth.Token;
    }

    private static async Task<string> RegisterAsync(HttpClient client, string label)
    {
        var email = $"{label}-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "password123",
            FirstName = label,
            LastName = "User"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await ReadJsonAsync<AuthResponse>(response);
        return auth.Token;
    }

    private static async Task<CategoryDto> GetFirstCategoryAsync(HttpClient client)
    {
        var categories = await client.GetFromJsonAsync<IReadOnlyList<CategoryDto>>("/api/categories", JsonOptions);
        Assert.NotNull(categories);
        return Assert.Single(categories.Take(1));
    }

    private static async Task<ProductDto> GetFirstProductAsync(HttpClient client)
    {
        var products = await client.GetFromJsonAsync<PagedResult<ProductDto>>("/api/products?page=1&pageSize=1", JsonOptions);
        Assert.NotNull(products);
        return Assert.Single(products.Items);
    }

    private static async Task<OrderDto> CreateOrderForCustomerAsync(HttpClient client, string customerToken)
    {
        SetBearer(client, customerToken);
        var product = await GetFirstProductAsync(client);

        var addCartResponse = await client.PostAsJsonAsync("/api/cart/items", new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 1
        });
        Assert.Equal(HttpStatusCode.OK, addCartResponse.StatusCode);

        var orderResponse = await client.PostAsync("/api/orders", content: null);
        Assert.Equal(HttpStatusCode.OK, orderResponse.StatusCode);
        return await ReadJsonAsync<OrderDto>(orderResponse);
    }

    private static async Task AssertStatusAsync(
        HttpClient client,
        HttpMethod method,
        string url,
        string? token,
        HttpStatusCode expected,
        object? body = null)
    {
        client.DefaultRequestHeaders.Authorization = null;
        using var request = new HttpRequestMessage(method, url);
        if (body is not null)
            request.Content = JsonContent.Create(body);

        if (token is not null)
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.SendAsync(request);
        Assert.Equal(expected, response.StatusCode);
    }

    private static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response)
    {
        var value = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        Assert.NotNull(value);
        return value;
    }

    private static void SetBearer(HttpClient client, string token) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public sealed class ShopApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("Filename=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            _connection.Open();

            builder.UseEnvironment("Testing");
            builder.UseSetting("Jwt:Issuer", "tests");
            builder.UseSetting("Jwt:Audience", "tests");
            builder.UseSetting("Jwt:Secret", "super-secret-test-key-with-enough-length");
            builder.UseSetting("Jwt:ExpiryMinutes", "60");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
                services.RemoveAll<IDbContextOptionsConfiguration<ApplicationDbContext>>();
                services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(_connection));
            });
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            _connection.Dispose();
        }
    }
}
