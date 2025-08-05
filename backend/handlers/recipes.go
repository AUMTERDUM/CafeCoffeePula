package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"github.com/gofiber/fiber/v2"
)

// GetRecipes - ดึงข้อมูลสูตรทั้งหมด
func GetRecipes(c *fiber.Ctx) error {
	var recipes []models.Recipe
	result := database.DB.Preload("Product").Preload("Ingredients.Ingredient").Find(&recipes)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch recipes",
		})
	}
	
	return c.JSON(recipes)
}

// CreateRecipe - สร้างสูตรใหม่
func CreateRecipe(c *fiber.Ctx) error {
	var request struct {
		ProductID    string `json:"product_id"`
		Instructions *string `json:"instructions"`
		PrepTime     *int    `json:"prep_time"`
		Ingredients  []struct {
			IngredientID string  `json:"ingredient_id"`
			Quantity     float64 `json:"quantity"`
		} `json:"ingredients"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	// Start transaction
	tx := database.DB.Begin()
	
	// Create recipe
	recipe := models.Recipe{
		ProductID:    request.ProductID,
		Instructions: request.Instructions,
		PrepTime:     request.PrepTime,
	}
	
	if err := tx.Create(&recipe).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create recipe",
		})
	}
	
	// Create recipe ingredients
	for _, ing := range request.Ingredients {
		if ing.Quantity > 0 {
			recipeIngredient := models.RecipeIngredient{
				RecipeID:     recipe.ID,
				IngredientID: ing.IngredientID,
				Quantity:     ing.Quantity,
			}
			
			if err := tx.Create(&recipeIngredient).Error; err != nil {
				tx.Rollback()
				return c.Status(500).JSON(fiber.Map{
					"error": "Failed to create recipe ingredient",
				})
			}
		}
	}
	
	// Commit transaction
	tx.Commit()
	
	// Return recipe with full data
	database.DB.Preload("Product").Preload("Ingredients.Ingredient").First(&recipe, "id = ?", recipe.ID)
	
	return c.Status(201).JSON(recipe)
}

// UpdateRecipe - แก้ไขสูตร
func UpdateRecipe(c *fiber.Ctx) error {
	recipeID := c.Params("id")
	
	var request struct {
		Instructions *string `json:"instructions"`
		PrepTime     *int    `json:"prep_time"`
		Ingredients  []struct {
			IngredientID string  `json:"ingredient_id"`
			Quantity     float64 `json:"quantity"`
		} `json:"ingredients"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	// Start transaction
	tx := database.DB.Begin()
	
	// Update recipe basic info
	var recipe models.Recipe
	if err := tx.First(&recipe, "id = ?", recipeID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{
			"error": "Recipe not found",
		})
	}
	
	recipe.Instructions = request.Instructions
	recipe.PrepTime = request.PrepTime
	
	if err := tx.Save(&recipe).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update recipe",
		})
	}
	
	// Delete existing recipe ingredients
	if err := tx.Where("recipe_id = ?", recipeID).Delete(&models.RecipeIngredient{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete old ingredients",
		})
	}
	
	// Create new recipe ingredients
	for _, ing := range request.Ingredients {
		if ing.Quantity > 0 {
			recipeIngredient := models.RecipeIngredient{
				RecipeID:     recipeID,
				IngredientID: ing.IngredientID,
				Quantity:     ing.Quantity,
			}
			
			if err := tx.Create(&recipeIngredient).Error; err != nil {
				tx.Rollback()
				return c.Status(500).JSON(fiber.Map{
					"error": "Failed to create recipe ingredient",
				})
			}
		}
	}
	
	// Commit transaction
	tx.Commit()
	
	// Return updated recipe with full data
	database.DB.Preload("Product").Preload("Ingredients.Ingredient").First(&recipe, "id = ?", recipeID)
	
	return c.JSON(recipe)
}

// DeleteRecipe - ลบสูตร
func DeleteRecipe(c *fiber.Ctx) error {
	recipeID := c.Params("id")
	
	// Start transaction
	tx := database.DB.Begin()
	
	// Delete recipe ingredients first
	if err := tx.Where("recipe_id = ?", recipeID).Delete(&models.RecipeIngredient{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete recipe ingredients",
		})
	}
	
	// Delete recipe
	if err := tx.Delete(&models.Recipe{}, "id = ?", recipeID).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete recipe",
		})
	}
	
	// Commit transaction
	tx.Commit()
	
	return c.JSON(fiber.Map{
		"message": "Recipe deleted successfully",
	})
}
