package main

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/handlers"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cache"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Initialize database
	database.Connect()
	database.Migrate()
	database.Seed()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())

	// CORS - Allow network access from any IP in local network
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*", // Allow all origins for local network access
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: false,
	}))

	// Compression - Reduce response size
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed, // Fast compression
	}))

	// Cache middleware for GET requests (menu, categories)
	app.Use(cache.New(cache.Config{
		Next: func(c *fiber.Ctx) bool {
			// Only cache GET requests for specific endpoints
			if c.Method() != "GET" {
				return true
			}
			path := c.Path()
			// Cache menu and categories (they don't change often)
			return path != "/api/menu" && path != "/api/categories"
		},
		Expiration:   5 * time.Minute, // Cache for 5 minutes
		CacheControl: true,
	}))

	// API Routes
	api := app.Group("/api")

	// Health check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Coffee PuLa Backend API",
			"status":  "running",
			"version": "1.0.0",
		})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"timestamp": c.Context().Time(),
		})
	})

	// Menu routes
	api.Get("/categories", handlers.GetCategories)
	api.Get("/menu", handlers.GetMenu)
	api.Post("/menu", handlers.CreateProduct)
	api.Put("/menu/:id", handlers.UpdateProduct)
	api.Delete("/menu/:id", handlers.DeleteProduct)

	// Order routes
	api.Get("/orders", handlers.GetOrders)
	api.Post("/orders", handlers.CreateOrder)

	// Inventory routes
	inventory := api.Group("/inventory")
	inventory.Get("/ingredients", handlers.GetIngredients)
	inventory.Post("/ingredients", handlers.CreateIngredient)
	inventory.Get("/movements", handlers.GetStockMovements)
	inventory.Post("/adjust-stock", handlers.AdjustStock)

	// Recipe routes
	api.Get("/recipes", handlers.GetRecipes)
	api.Post("/recipes", handlers.CreateRecipe)
	api.Put("/recipes/:id", handlers.UpdateRecipe)
	api.Delete("/recipes/:id", handlers.DeleteRecipe)

	// Promotion routes
	promotions := api.Group("/promotions")
	promotions.Get("/", handlers.GetPromotions)
	promotions.Get("/active", handlers.GetActivePromotions)
	promotions.Post("/", handlers.CreatePromotion)
	promotions.Put("/:id", handlers.UpdatePromotion)
	promotions.Delete("/:id", handlers.DeletePromotion)
	promotions.Post("/calculate-discount", handlers.CalculateDiscount)
	promotions.Post("/apply", handlers.ApplyPromotion)
	promotions.Get("/usage", handlers.GetPromotionUsage)

	// Coupon routes
	coupons := api.Group("/coupons")
	coupons.Get("/", handlers.GetCoupons)
	coupons.Post("/", handlers.CreateCoupon)
	coupons.Get("/validate/:code", handlers.ValidateCoupon)

	// Receipt routes
	receipts := api.Group("/receipts")
	receipts.Get("/", handlers.GetReceipts)
	receipts.Get("/:id", handlers.GetReceiptByID)
	receipts.Post("/", handlers.CreateReceipt)
	receipts.Post("/:id/print", handlers.PrintReceipt)
	receipts.Post("/:id/void", handlers.VoidReceipt)

	// Printer routes
	printers := api.Group("/printers")
	printers.Get("/", handlers.GetPrinters)
	printers.Post("/", handlers.CreatePrinter)
	printers.Put("/:id", handlers.UpdatePrinter)
	printers.Delete("/:id", handlers.DeletePrinter)

	// Print job routes
	api.Get("/print-jobs", handlers.GetPrintJobs)

	// Loyalty Program routes
	loyalty := api.Group("/loyalty")

	// Member management
	members := loyalty.Group("/members")
	members.Get("/", handlers.GetMembers)
	members.Get("/:id", handlers.GetMemberByID)
	members.Get("/number/:number", handlers.GetMemberByNumber)
	members.Post("/", handlers.CreateMember)
	members.Put("/:id", handlers.UpdateMember)
	members.Get("/:id/history", handlers.GetPointHistory)

	// Points management
	loyalty.Post("/earn-points", handlers.EarnPoints)
	loyalty.Post("/redeem-points", handlers.RedeemPoints)

	// Rewards
	rewards := loyalty.Group("/rewards")
	rewards.Get("/", handlers.GetRewards)

	// Statistics
	loyalty.Get("/stats", handlers.GetMemberStats)

	// Cost Management routes
	cost := api.Group("/cost")
	cost.Get("/products", handlers.GetProductCosts)
	cost.Put("/products/:product_id", handlers.UpdateProductCost)
	cost.Get("/reports/daily", handlers.GetDailyProfitReport)
	cost.Get("/reports/products", handlers.GetProductProfitReport)
	cost.Get("/analytics", handlers.GetProfitAnalytics)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "OK",
			"message": "Coffee PuLa Backend is running!",
		})
	})

	// Serve static files from Next.js build (if exists)
	// Place Next.js 'out' folder contents in 'static' folder
	app.Static("/", "./static", fiber.Static{
		Compress:      true,
		Browse:        false,
		Index:         "index.html",
		CacheDuration: 24 * time.Hour,
	})

	// Start server - Listen on all network interfaces (0.0.0.0)
	log.Println("🚀 Server starting on http://0.0.0.0:8081")
	log.Println("📡 Access from other devices: http://YOUR_PC_IP:8081")
	log.Fatal(app.Listen("0.0.0.0:8081"))
}
