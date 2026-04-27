using Microsoft.EntityFrameworkCore;
using OnlineShop.Domain.Entities;
using OnlineShop.Domain.Enums;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public static class DatabaseSeeder
{
    public const string AdminEmail = "admin@onlineshop.local";
    public const string CustomerEmail = "customer@onlineshop.local";
    public const string DefaultPassword = "Password123!";

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await SeedUsersAsync(context);

        var sweet = await GetOrCreateCategoryAsync(context, "Sweet");
        var salty = await GetOrCreateCategoryAsync(context, "Salty");
        var drinks = await GetOrCreateCategoryAsync(context, "Drinks");

        await SeedProductsAsync(context, sweet.Id, SweetProducts);
        await SeedProductsAsync(context, salty.Id, SaltyProducts);
        await SeedProductsAsync(context, drinks.Id, DrinksProducts);

        await context.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        await EnsureUserAsync(context, AdminEmail, "System", "Admin", UserRole.Admin);
        await EnsureUserAsync(context, CustomerEmail, "Demo", "Customer", UserRole.Customer);
    }

    private static async Task EnsureUserAsync(
        ApplicationDbContext context,
        string email,
        string firstName,
        string lastName,
        UserRole role)
    {
        var normalizedEmail = email.ToLowerInvariant();
        var user = await context.Users.Include(u => u.Cart).FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null)
        {
            user = new User
            {
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultPassword),
                FirstName = firstName,
                LastName = lastName,
                Role = role,
                Cart = new Cart()
            };

            context.Users.Add(user);
            return;
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.Role = role;

        if (user.Cart is null)
        {
            context.Carts.Add(new Cart { UserId = user.Id });
        }
    }

    private static async Task<Category> GetOrCreateCategoryAsync(ApplicationDbContext context, string name)
    {
        var category = await context.Categories.FirstOrDefaultAsync(c => c.Name == name);
        if (category is not null)
            return category;

        category = new Category { Name = name };
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static async Task SeedProductsAsync(
        ApplicationDbContext context,
        Guid categoryId,
        IReadOnlyList<SeedProduct> products)
    {
        foreach (var productSeed in products)
        {
            var product = await context.Products.FirstOrDefaultAsync(p => p.Name == productSeed.Name);

            if (product is null)
            {
                context.Products.Add(new Product
                {
                    Name = productSeed.Name,
                    Description = productSeed.Description,
                    Price = productSeed.Price,
                    StockQuantity = productSeed.StockQuantity,
                    ImageUrl = productSeed.ImageUrl,
                    CategoryId = categoryId,
                    IsActive = true
                });

                continue;
            }

            product.Description = productSeed.Description;
            product.Price = productSeed.Price;
            product.StockQuantity = Math.Max(product.StockQuantity, productSeed.StockQuantity);
            product.ImageUrl = productSeed.ImageUrl;
            product.CategoryId = categoryId;
            product.IsActive = true;
            product.UpdatedAt = DateTime.UtcNow;
        }
    }

    private sealed record SeedProduct(
        string Name,
        string Description,
        decimal Price,
        int StockQuantity,
        string ImageUrl);

    private static readonly SeedProduct[] SweetProducts =
    [
        new("Belgian Chocolate Truffles", "Rich cocoa truffles with a smooth ganache center.", 12.99m, 45, "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80"),
        new("Vanilla Butter Cookies", "Crisp butter cookies baked with Madagascar vanilla.", 6.49m, 80, "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80"),
        new("Strawberry Cream Wafers", "Light wafer layers filled with strawberry cream.", 4.99m, 70, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"),
        new("Caramel Fudge Bites", "Soft caramel fudge pieces with a buttery finish.", 7.25m, 55, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80"),
        new("Dark Chocolate Almond Bar", "70 percent dark chocolate bar with roasted almonds.", 3.99m, 90, "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=80"),
        new("Honey Glazed Baklava", "Layered pastry with walnuts, pistachios, and honey syrup.", 10.50m, 35, "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=900&q=80"),
        new("Lemon Tartlets", "Small tart shells filled with bright lemon curd.", 8.75m, 42, "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80"),
        new("Cinnamon Sugar Donuts", "Soft ring donuts dusted with cinnamon sugar.", 5.99m, 60, "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80"),
        new("Chocolate Chip Muffins", "Bakery muffins packed with chocolate chips.", 6.75m, 48, "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80"),
        new("Raspberry Macarons", "French almond macarons with raspberry buttercream.", 13.50m, 30, "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=80"),
        new("Peanut Butter Cups", "Chocolate cups filled with creamy peanut butter.", 5.49m, 75, "https://images.unsplash.com/photo-1582176604856-e824b4736522?auto=format&fit=crop&w=900&q=80"),
        new("Coconut Snowballs", "Coconut covered sweets with a soft vanilla center.", 4.75m, 64, "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=900&q=80"),
        new("Blueberry Cheesecake Slice", "Creamy cheesecake slice topped with blueberry compote.", 7.99m, 38, "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80"),
        new("Salted Caramel Brownies", "Dense chocolate brownies swirled with salted caramel.", 8.99m, 52, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80"),
        new("Pistachio Nougat", "Chewy nougat with roasted pistachios and honey.", 9.25m, 40, "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80"),
        new("Milk Chocolate Pretzels", "Crunchy pretzels dipped in milk chocolate.", 5.25m, 68, "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=900&q=80"),
        new("Apple Cinnamon Pie", "Classic apple pie with cinnamon and flaky pastry.", 11.99m, 24, "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?auto=format&fit=crop&w=900&q=80"),
        new("Hazelnut Wafer Rolls", "Rolled wafers filled with hazelnut cocoa cream.", 4.50m, 85, "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=900&q=80"),
        new("Orange Jelly Candies", "Fruit jelly candies with natural orange flavor.", 3.75m, 100, "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80"),
        new("Classic Tiramisu Cup", "Coffee soaked sponge layered with mascarpone cream.", 6.99m, 34, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80")
    ];

    private static readonly SeedProduct[] SaltyProducts =
    [
        new("Sea Salt Potato Chips", "Thin-cut potato chips seasoned with sea salt.", 3.49m, 120, "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80"),
        new("Cheddar Cheese Crackers", "Baked crackers with sharp cheddar flavor.", 4.29m, 95, "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=900&q=80"),
        new("Roasted Salted Almonds", "Whole almonds roasted and lightly salted.", 9.99m, 70, "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80"),
        new("Pretzel Twists", "Crunchy baked pretzels with classic salt crystals.", 3.99m, 110, "https://images.unsplash.com/photo-1513647615875-60b69ac6a515?auto=format&fit=crop&w=900&q=80"),
        new("Sour Cream Onion Chips", "Ridged chips with sour cream and onion seasoning.", 3.79m, 105, "https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=900&q=80"),
        new("Spicy Tortilla Chips", "Corn tortilla chips with chili and lime.", 4.49m, 88, "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&w=900&q=80"),
        new("Mixed Party Nuts", "Blend of peanuts, cashews, almonds, and hazelnuts.", 11.50m, 58, "https://images.unsplash.com/photo-1536591375667-efdfb7962b31?auto=format&fit=crop&w=900&q=80"),
        new("Parmesan Breadsticks", "Crisp Italian breadsticks with parmesan seasoning.", 5.75m, 64, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"),
        new("BBQ Corn Puffs", "Airy corn puffs coated in smoky BBQ seasoning.", 3.25m, 92, "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80"),
        new("Salted Cashews", "Premium cashews roasted with fine salt.", 10.99m, 62, "https://images.unsplash.com/photo-1563412885-139e4045ebeb?auto=format&fit=crop&w=900&q=80"),
        new("Cheese Nachos Kit", "Tortilla chips with ready-to-heat cheese dip.", 7.49m, 46, "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80"),
        new("Herb Focaccia Crisps", "Toasted focaccia chips with rosemary and herbs.", 5.99m, 50, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"),
        new("Wasabi Peas", "Crunchy green peas coated in wasabi seasoning.", 4.95m, 73, "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=900&q=80"),
        new("Everything Bagel Chips", "Toasted bagel chips with sesame, garlic, and onion.", 4.85m, 67, "https://images.unsplash.com/photo-1585238342028-4bbcfc4f23c3?auto=format&fit=crop&w=900&q=80"),
        new("Chili Lime Peanuts", "Roasted peanuts with chili heat and lime zest.", 4.59m, 82, "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80"),
        new("Salted Popcorn", "Light popcorn seasoned with butter and sea salt.", 3.19m, 130, "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=80"),
        new("Garlic Rye Chips", "Crunchy rye chips with roasted garlic flavor.", 4.39m, 78, "https://images.unsplash.com/photo-1612871689353-cccfbd42f1d8?auto=format&fit=crop&w=900&q=80"),
        new("Olive Tapenade Crackers", "Savory crackers inspired by olive tapenade.", 5.25m, 54, "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80"),
        new("Smoked Paprika Chips", "Kettle chips seasoned with smoked paprika.", 3.89m, 98, "https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=900&q=80"),
        new("Mini Cheese Pretzels", "Bite-sized pretzels with cheddar dusting.", 4.15m, 86, "https://images.unsplash.com/photo-1513647615875-60b69ac6a515?auto=format&fit=crop&w=900&q=80")
    ];

    private static readonly SeedProduct[] DrinksProducts =
    [
        new("Sparkling Mineral Water", "Refreshing carbonated mineral water in a glass bottle.", 1.99m, 160, "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80"),
        new("Cold Brew Coffee", "Slow-steeped cold brew coffee with a smooth finish.", 3.99m, 75, "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80"),
        new("Fresh Orange Juice", "Pressed orange juice with no added sugar.", 4.49m, 70, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80"),
        new("Classic Cola", "Crisp cola drink served chilled.", 2.25m, 140, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80"),
        new("Lemon Iced Tea", "Black tea with lemon juice and light sweetness.", 2.75m, 100, "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80"),
        new("Strawberry Smoothie", "Creamy strawberry smoothie made with yogurt.", 5.49m, 38, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80"),
        new("Mango Nectar", "Sweet mango nectar with tropical fruit flavor.", 3.59m, 82, "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80"),
        new("Ginger Ale", "Bubbly ginger ale with a clean spicy note.", 2.35m, 112, "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=80"),
        new("Green Detox Juice", "Green juice blend with apple, cucumber, and spinach.", 5.99m, 44, "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=900&q=80"),
        new("Peach Iced Tea", "Refreshing iced tea blended with peach flavor.", 2.85m, 96, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80"),
        new("Energy Drink Citrus", "Citrus energy drink with caffeine and vitamins.", 3.25m, 90, "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=900&q=80"),
        new("Almond Milk", "Unsweetened almond milk for cereal and coffee.", 3.99m, 66, "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80"),
        new("Oat Milk Barista", "Creamy oat milk designed for coffee drinks.", 4.25m, 61, "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80"),
        new("Pomegranate Juice", "Tart pomegranate juice with deep fruit flavor.", 5.79m, 48, "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80"),
        new("Coconut Water", "Hydrating coconut water with natural electrolytes.", 3.49m, 84, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"),
        new("Raspberry Lemonade", "Lemonade brightened with raspberry puree.", 3.19m, 76, "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=900&q=80"),
        new("Mint Lime Soda", "Sparkling lime soda with a cool mint note.", 2.69m, 91, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"),
        new("Vanilla Protein Shake", "Ready-to-drink vanilla protein shake.", 4.99m, 53, "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80"),
        new("Chamomile Tea Bottle", "Chilled chamomile tea with mild floral notes.", 2.95m, 72, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80"),
        new("Berry Kombucha", "Lightly sparkling fermented tea with mixed berries.", 4.59m, 57, "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=900&q=80")
    ];
}
