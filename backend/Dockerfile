FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/OnlineShop.sln backend/
COPY backend/API/OnlineShop.API.csproj backend/API/
COPY backend/Application/OnlineShop.Application.csproj backend/Application/
COPY backend/Domain/OnlineShop.Domain.csproj backend/Domain/
COPY backend/Infrastructure/OnlineShop.Infrastructure.csproj backend/Infrastructure/
COPY backend/Persistence/OnlineShop.Persistence.csproj backend/Persistence/
COPY backend/Tests/OnlineShop.Tests.csproj backend/Tests/

RUN dotnet restore backend/OnlineShop.sln

COPY backend/ backend/
RUN dotnet publish backend/API/OnlineShop.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OnlineShop.API.dll"]
