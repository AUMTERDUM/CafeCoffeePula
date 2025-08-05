package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"github.com/gofiber/fiber/v2"
)

// GetCategories - ดึงข้อมูลหมวดหมู่ทั้งหมด
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	result := database.DB.Find(&categories)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch categories",
		})
	}
	
	return c.JSON(categories)
}

// GetMenu - ดึงข้อมูลเมนูทั้งหมด
func GetMenu(c *fiber.Ctx) error {
	var products []models.Product
	result := database.DB.Preload("Category").Where("available = ?", true).Find(&products)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch menu",
		})
	}
	
	return c.JSON(products)
}

// CreateProduct - เพิ่มเมนูใหม่
func CreateProduct(c *fiber.Ctx) error {
	var product models.Product
	
	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	result := database.DB.Create(&product)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create product",
		})
	}
	
	// Load category relation
	database.DB.Preload("Category").First(&product, "id = ?", product.ID)
	
	return c.Status(201).JSON(product)
}

// UpdateProduct - แก้ไขเมนู
func UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	
	var product models.Product
	if err := database.DB.First(&product, "id = ?", productID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	
	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	
	if err := database.DB.Save(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update product",
		})
	}
	
	// Load category relation
	database.DB.Preload("Category").First(&product, "id = ?", product.ID)
	
	return c.JSON(product)
}

// DeleteProduct - ลบเมนู
func DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	
	if err := database.DB.Delete(&models.Product{}, "id = ?", productID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete product",
		})
	}
	
	return c.JSON(fiber.Map{
		"message": "Product deleted successfully",
	})
}
