package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"fmt"
	"time"
	"github.com/gofiber/fiber/v2"
)

// GetOrders - ดึงข้อมูลออเดอร์ทั้งหมด
func GetOrders(c *fiber.Ctx) error {
	var orders []models.Order
	result := database.DB.Preload("Items.Product.Category").Order("created_at DESC").Find(&orders)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch orders",
		})
	}
	
	return c.JSON(orders)
}

// CreateOrder - สร้างออเดอร์ใหม่ พร้อมหักสต๊อกอัตโนมัติ
func CreateOrder(c *fiber.Ctx) error {
	var request struct {
		Items []struct {
			MenuID   string  `json:"menuId"`
			Quantity int     `json:"quantity"`
			Price    float64 `json:"price"`
		} `json:"items"`
		CustomerName *string `json:"customerName"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	// Calculate total
	var totalAmount float64
	for _, item := range request.Items {
		totalAmount += item.Price * float64(item.Quantity)
	}
	
	// Generate order number
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().Unix())
	
	// Start transaction
	tx := database.DB.Begin()
	
	// Create order
	order := models.Order{
		OrderNumber:  orderNumber,
		TotalAmount:  totalAmount,
		Status:       models.OrderStatusPending,
		CustomerName: request.CustomerName,
	}
	
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create order",
		})
	}
	
	// Create order items และหักสต๊อก
	for _, item := range request.Items {
		// Create order item
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.MenuID,
			Quantity:  item.Quantity,
			Price:     item.Price,
			Subtotal:  item.Price * float64(item.Quantity),
		}
		
		if err := tx.Create(&orderItem).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to create order item",
			})
		}
		
		// Get product with recipe
		var product models.Product
		if err := tx.Preload("Recipe.Ingredients.Ingredient").First(&product, "id = ?", item.MenuID).Error; err != nil {
			// Product not found, continue (some products might not have recipes)
			continue
		}
		
		// If product has recipe, deduct ingredients
		if product.Recipe != nil {
			for _, recipeIngredient := range product.Recipe.Ingredients {
				totalNeeded := recipeIngredient.Quantity * float64(item.Quantity)
				
				// Check if enough stock
				if recipeIngredient.Ingredient.CurrentStock < totalNeeded {
					tx.Rollback()
					return c.Status(400).JSON(fiber.Map{
						"error": fmt.Sprintf("ไม่มี %s เพียงพอ (ต้องการ %.2f %s, มีเหลือ %.2f %s)", 
							recipeIngredient.Ingredient.Name,
							totalNeeded,
							recipeIngredient.Ingredient.Unit,
							recipeIngredient.Ingredient.CurrentStock,
							recipeIngredient.Ingredient.Unit),
					})
				}
				
				// Deduct stock
				newStock := recipeIngredient.Ingredient.CurrentStock - totalNeeded
				if err := tx.Model(&models.Ingredient{}).Where("id = ?", recipeIngredient.IngredientID).Update("current_stock", newStock).Error; err != nil {
					tx.Rollback()
					return c.Status(500).JSON(fiber.Map{
						"error": "Failed to update ingredient stock",
					})
				}
				
				// Record stock movement
				movement := models.StockMovement{
					IngredientID: recipeIngredient.IngredientID,
					Type:         models.StockMovementTypeOut,
					Quantity:     totalNeeded,
					Reason:       stringPtr(fmt.Sprintf("ขาย - %s", product.Name)),
					Reference:    &order.ID,
				}
				
				if err := tx.Create(&movement).Error; err != nil {
					tx.Rollback()
					return c.Status(500).JSON(fiber.Map{
						"error": "Failed to record stock movement",
					})
				}
			}
		}
	}
	
	// Commit transaction
	tx.Commit()
	
	// Return order with items
	database.DB.Preload("Items.Product").First(&order, "id = ?", order.ID)
	
	return c.Status(201).JSON(order)
}

// Helper function
func stringPtr(s string) *string {
	return &s
}
