# Stage 1: build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY Backend.csproj ./
RUN dotnet restore

# copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app

# Stage 2: run the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Expose the listening port
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "Backend.dll"]