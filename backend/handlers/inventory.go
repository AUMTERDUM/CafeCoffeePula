package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"github.com/gofiber/fiber/v2"
)

// GetIngredients - ดึงข้อมูลวัตถุดิบทั้งหมด
func GetIngredients(c *fiber.Ctx) error {
	var ingredients []models.Ingredient
	result := database.DB.Order("name ASC").Find(&ingredients)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch ingredients",
		})
	}
	
	return c.JSON(ingredients)
}

// CreateIngredient - เพิ่มวัตถุดิบใหม่
func CreateIngredient(c *fiber.Ctx) error {
	var ingredient models.Ingredient
	
	if err := c.BodyParser(&ingredient); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	result := database.DB.Create(&ingredient)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create ingredient",
		})
	}
	
	return c.Status(201).JSON(ingredient)
}

// GetStockMovements - ดึงข้อมูลการเคลื่อนไหวสต๊อก
func GetStockMovements(c *fiber.Ctx) error {
	var movements []models.StockMovement
	result := database.DB.Preload("Ingredient").Order("created_at DESC").Limit(50).Find(&movements)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch stock movements",
		})
	}
	
	return c.JSON(movements)
}

// AdjustStock - ปรับปรุงสต๊อกวัตถุดิบ
func AdjustStock(c *fiber.Ctx) error {
	var request struct {
		IngredientID string                `json:"ingredient_id"`
		Type         models.StockMovementType `json:"type"`
		Quantity     float64               `json:"quantity"`
		Reason       *string               `json:"reason"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	// Start transaction
	tx := database.DB.Begin()
	
	// Get current ingredient
	var ingredient models.Ingredient
	if err := tx.First(&ingredient, "id = ?", request.IngredientID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{
			"error": "Ingredient not found",
		})
	}
	
	// Calculate new stock
	var newStock float64
	switch request.Type {
	case models.StockMovementTypeIn:
		newStock = ingredient.CurrentStock + request.Quantity
	case models.StockMovementTypeOut:
		newStock = ingredient.CurrentStock - request.Quantity
		if newStock < 0 {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{
				"error": "Insufficient stock",
			})
		}
	case models.StockMovementTypeAdjust:
		newStock = request.Quantity
	}
	
	// Update ingredient stock
	if err := tx.Model(&ingredient).Update("current_stock", newStock).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update stock",
		})
	}
	
	// Record stock movement
	movement := models.StockMovement{
		IngredientID: request.IngredientID,
		Type:         request.Type,
		Quantity:     request.Quantity,
		Reason:       request.Reason,
	}
	
	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to record movement",
		})
	}
	
	// Commit transaction
	tx.Commit()
	
	// Return updated ingredient
	database.DB.First(&ingredient, "id = ?", request.IngredientID)
	
	return c.JSON(fiber.Map{
		"ingredient": ingredient,
		"movement":   movement,
	})
}
