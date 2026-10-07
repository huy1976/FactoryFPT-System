# Stage 1: Build .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file dự án để restore dependencies
COPY ["src/FactoryFPT.Api/FactoryFPT.Api.csproj", "src/FactoryFPT.Api/"]
COPY ["src/FactoryFPT.Application/FactoryFPT.Application.csproj", "src/FactoryFPT.Application/"]
COPY ["src/FactoryFPT.Domain/FactoryFPT.Domain.csproj", "src/FactoryFPT.Domain/"]
COPY ["src/FactoryFPT.Infrastructure/FactoryFPT.Infrastructure.csproj", "src/FactoryFPT.Infrastructure/"]

RUN dotnet restore "src/FactoryFPT.Api/FactoryFPT.Api.csproj"

# Copy toàn bộ mã nguồn và build Release
COPY . .
WORKDIR "/src/src/FactoryFPT.Api"
RUN dotnet publish "FactoryFPT.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FactoryFPT.Api.dll"]