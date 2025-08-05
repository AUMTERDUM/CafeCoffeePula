# Coffee PuLa Backend - Go Fiber & GORM

## Overview
High-performance backend API for Coffee POS system built with:
- **Go Fiber**: Fast HTTP web framework
- **GORM**: Powerful ORM for database operations  
- **SQLite**: Lightweight database for development

## Features
- 🏪 **Menu Management**: Categories and products CRUD
- 📝 **Order Processing**: Create orders with automatic stock deduction
- 📦 **Inventory Management**: Ingredients and stock tracking
- 🧪 **Recipe Management**: Link products with ingredients
- 📊 **Stock Movements**: Track all inventory changes
- 🔄 **Automatic Stock Deduction**: When orders are placed

## Quick Start

### Prerequisites
- Go 1.21 or higher
- Git

### Installation
```bash
cd backend
go mod tidy
go run main.go
```

### Server will start on: http://localhost:8080

## API Endpoints

### Health Check
- `GET /health` - Server status

### Menu Management
- `GET /api/categories` - Get all categories
- `GET /api/menu` - Get all products
- `POST /api/menu` - Create new product
- `PUT /api/menu/:id` - Update product
- `DELETE /api/menu/:id` - Delete product

### Order Management  
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order (auto stock deduction)

### Inventory Management
- `GET /api/inventory/ingredients` - Get all ingredients
- `POST /api/inventory/ingredients` - Create new ingredient
- `GET /api/inventory/movements` - Get stock movements
- `POST /api/inventory/adjust-stock` - Adjust ingredient stock

### Recipe Management
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Database Schema

### Core Models
- **Category**: Product categories
- **Product**: Menu items
- **Order**: Customer orders
- **OrderItem**: Items in orders
- **Payment**: Payment information

### Inventory Models
- **Ingredient**: Raw materials/ingredients
- **Recipe**: Product recipes
- **RecipeIngredient**: Recipe-ingredient relationships
- **StockMovement**: Stock change history

## Auto Stock Deduction
When an order is created:
1. Check product recipes
2. Calculate total ingredients needed
3. Verify sufficient stock
4. Deduct ingredients automatically
5. Record stock movements
6. Return error if insufficient stock

## Development

### Project Structure
```
backend/
├── main.go              # Application entry point
├── models/              # Data models (GORM)
├── database/            # Database connection & migration
├── handlers/            # API route handlers
└── go.mod              # Go dependencies
```

### Adding New Features
1. Define models in `models/models.go`
2. Add database migrations in `database/database.go`
3. Create handlers in `handlers/`
4. Register routes in `main.go`

## Production Deployment
- Change database to PostgreSQL/MySQL
- Add authentication middleware
- Implement rate limiting
- Add environment configuration
- Set up logging and monitoring
