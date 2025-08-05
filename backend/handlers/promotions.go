package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetPromotions ดึงรายการโปรโมชั่นทั้งหมด
func GetPromotions(c *fiber.Ctx) error {
	var promotions []models.Promotion
	
	// ดึงเฉพาะโปรโมชั่นที่ Active และยังไม่หมดอายุ
	now := time.Now()
	result := database.DB.Where("status = ? AND (end_date IS NULL OR end_date > ?)", 
		models.PromotionStatusActive, now).Find(&promotions)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(promotions)
}

// GetActivePromotions ดึงโปรโมชั่นที่ใช้ได้ในปัจจุบัน
func GetActivePromotions(c *fiber.Ctx) error {
	var promotions []models.Promotion
	now := time.Now()
	currentTime := now.Format("15:04")
	
	query := database.DB.Where("status = ?", models.PromotionStatusActive)
	
	// เช็ควันที่
	query = query.Where("(start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)", 
		now, now)
	
	// เช็ค Happy Hour
	query = query.Where("(type != ? OR (start_time <= ? AND end_time >= ?))", 
		models.PromotionTypeHappyHour, currentTime, currentTime)
	
	result := query.Find(&promotions)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(promotions)
}

// CreatePromotion สร้างโปรโมชั่นใหม่
func CreatePromotion(c *fiber.Ctx) error {
	var promotion models.Promotion
	
	if err := c.BodyParser(&promotion); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	promotion.ID = uuid.New().String()
	promotion.CreatedAt = time.Now()
	promotion.UpdatedAt = time.Now()
	
	if promotion.Status == "" {
		promotion.Status = models.PromotionStatusActive
	}
	
	result := database.DB.Create(&promotion)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.Status(201).JSON(promotion)
}

// UpdatePromotion อัพเดทโปรโมชั่น
func UpdatePromotion(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var promotion models.Promotion
	result := database.DB.First(&promotion, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Promotion not found"})
	}
	
	var updateData models.Promotion
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	updateData.UpdatedAt = time.Now()
	result = database.DB.Model(&promotion).Updates(updateData)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(promotion)
}

// DeletePromotion ลบโปรโมชั่น
func DeletePromotion(c *fiber.Ctx) error {
	id := c.Params("id")
	
	result := database.DB.Delete(&models.Promotion{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Promotion not found"})
	}

	return c.JSON(fiber.Map{"message": "Promotion deleted successfully"})
}

// GetCoupons ดึงรายการคูปอง
func GetCoupons(c *fiber.Ctx) error {
	var coupons []models.Coupon
	result := database.DB.Preload("Promotion").Find(&coupons)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(coupons)
}

// CreateCoupon สร้างคูปองใหม่
func CreateCoupon(c *fiber.Ctx) error {
	var coupon models.Coupon
	
	if err := c.BodyParser(&coupon); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	coupon.ID = uuid.New().String()
	coupon.CreatedAt = time.Now()
	coupon.UpdatedAt = time.Now()
	
	result := database.DB.Create(&coupon)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.Status(201).JSON(coupon)
}

// ValidateCoupon ตรวจสอบความถูกต้องของคูปอง
func ValidateCoupon(c *fiber.Ctx) error {
	code := c.Params("code")
	
	var coupon models.Coupon
	result := database.DB.Preload("Promotion").First(&coupon, "code = ? AND is_used = ?", code, false)
	
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"valid": false,
			"error": "Coupon not found or already used",
		})
	}
	
	// ตรวจสอบโปรโมชั่นที่เชื่อมโยง
	if coupon.Promotion.Status != models.PromotionStatusActive {
		return c.Status(400).JSON(fiber.Map{
			"valid": false,
			"error": "Promotion is not active",
		})
	}
	
	// ตรวจสอบวันที่หมดอายุ
	now := time.Now()
	if coupon.Promotion.EndDate != nil && coupon.Promotion.EndDate.Before(now) {
		return c.Status(400).JSON(fiber.Map{
			"valid": false,
			"error": "Promotion has expired",
		})
	}
	
	return c.JSON(fiber.Map{
		"valid": true,
		"coupon": coupon,
		"promotion": coupon.Promotion,
	})
}

// CalculateDiscount คำนวณส่วนลดจากโปรโมชั่น
func CalculateDiscount(c *fiber.Ctx) error {
	var request struct {
		TotalAmount float64 `json:"total_amount"`
		Items       []struct {
			ProductID string  `json:"product_id"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"items"`
		CouponCode   *string `json:"coupon_code"`
		PromotionID  *string `json:"promotion_id"`
		CustomerName *string `json:"customer_name"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	var discountAmount float64 = 0
	var appliedPromotion *models.Promotion
	var appliedCoupon *models.Coupon
	
	// ถ้ามี coupon code
	if request.CouponCode != nil && *request.CouponCode != "" {
		var coupon models.Coupon
		result := database.DB.Preload("Promotion").First(&coupon, 
			"code = ? AND is_used = ?", *request.CouponCode, false)
		
		if result.Error == nil && coupon.Promotion.Status == models.PromotionStatusActive {
			appliedCoupon = &coupon
			appliedPromotion = &coupon.Promotion
		}
	}
	
	// ถ้าไม่มี coupon หรือ coupon ไม่ถูกต้อง ให้หาโปรโมชั่นอัตโนมัติ
	if appliedPromotion == nil {
		var promotions []models.Promotion
		now := time.Now()
		currentTime := now.Format("15:04")
		
		query := database.DB.Where("status = ?", models.PromotionStatusActive)
		query = query.Where("(start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)", 
			now, now)
		
		// เช็ค Happy Hour
		query = query.Where("(type != ? OR (start_time <= ? AND end_time >= ?))", 
			models.PromotionTypeHappyHour, currentTime, currentTime)
		
		// เช็คยอดขั้นต่ำ
		query = query.Where("(min_spend IS NULL OR min_spend <= ?)", request.TotalAmount)
		
		query.Find(&promotions)
		
		// หาโปรโมชั่นที่ให้ส่วนลดมากที่สุด
		var bestDiscount float64 = 0
		for _, promotion := range promotions {
			discount := calculatePromotionDiscount(promotion, request.TotalAmount, request.Items)
			if discount > bestDiscount {
				bestDiscount = discount
				appliedPromotion = &promotion
			}
		}
		discountAmount = bestDiscount
	} else {
		discountAmount = calculatePromotionDiscount(*appliedPromotion, request.TotalAmount, request.Items)
	}
	
	response := fiber.Map{
		"original_amount": request.TotalAmount,
		"discount_amount": discountAmount,
		"final_amount":    request.TotalAmount - discountAmount,
		"applied_promotion": appliedPromotion,
		"applied_coupon": appliedCoupon,
	}
	
	return c.JSON(response)
}

// calculatePromotionDiscount คำนวณส่วนลดตามประเภทโปรโมชั่น
func calculatePromotionDiscount(promotion models.Promotion, totalAmount float64, items []struct {
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}) float64 {
	switch promotion.Type {
	case models.PromotionTypeDiscount:
		if promotion.DiscountPercent != nil {
			discount := totalAmount * (*promotion.DiscountPercent / 100)
			if promotion.MaxDiscount != nil && discount > *promotion.MaxDiscount {
				return *promotion.MaxDiscount
			}
			return discount
		}
		
	case models.PromotionTypeFixedAmount:
		if promotion.DiscountAmount != nil {
			// ตรวจสอบยอดขั้นต่ำ
			if promotion.MinSpend == nil || totalAmount >= *promotion.MinSpend {
				return *promotion.DiscountAmount
			}
		}
		
	case models.PromotionTypeMinSpend:
		if promotion.MinSpend != nil && totalAmount >= *promotion.MinSpend {
			if promotion.DiscountPercent != nil {
				discount := totalAmount * (*promotion.DiscountPercent / 100)
				if promotion.MaxDiscount != nil && discount > *promotion.MaxDiscount {
					return *promotion.MaxDiscount
				}
				return discount
			}
		}
		
	case models.PromotionTypeHappyHour:
		if promotion.DiscountPercent != nil {
			discount := totalAmount * (*promotion.DiscountPercent / 100)
			if promotion.MaxDiscount != nil && discount > *promotion.MaxDiscount {
				return *promotion.MaxDiscount
			}
			return discount
		}
		
	case models.PromotionTypeBuyXGetY:
		// Buy X Get Y จะคำนวณในการสร้างออเดอร์
		return 0
	}
	
	return 0
}

// ApplyPromotion ใช้โปรโมชั่นกับออเดอร์
func ApplyPromotion(c *fiber.Ctx) error {
	var request struct {
		OrderID      string  `json:"order_id"`
		PromotionID  *string `json:"promotion_id"`
		CouponCode   *string `json:"coupon_code"`
		CustomerName *string `json:"customer_name"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	// ดึงข้อมูลออเดอร์
	var order models.Order
	result := database.DB.Preload("Items.Product").First(&order, "id = ?", request.OrderID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Order not found"})
	}
	
	var promotion models.Promotion
	var coupon *models.Coupon
	
	// ถ้าใช้คูปอง
	if request.CouponCode != nil {
		var couponModel models.Coupon
		result := database.DB.Preload("Promotion").First(&couponModel, 
			"code = ? AND is_used = ?", *request.CouponCode, false)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Invalid coupon"})
		}
		coupon = &couponModel
		promotion = couponModel.Promotion
	} else if request.PromotionID != nil {
		result := database.DB.First(&promotion, "id = ?", *request.PromotionID)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Promotion not found"})
		}
	}
	
	// คำนวณส่วนลด
	items := make([]struct {
		ProductID string  `json:"product_id"`
		Quantity  int     `json:"quantity"`
		Price     float64 `json:"price"`
	}, len(order.Items))
	
	for i, item := range order.Items {
		items[i].ProductID = item.ProductID
		items[i].Quantity = item.Quantity
		items[i].Price = item.Price
	}
	
	discountAmount := calculatePromotionDiscount(promotion, order.TotalAmount, items)
	
	// อัพเดทยอดรวมของออเดอร์
	newTotal := order.TotalAmount - discountAmount
	database.DB.Model(&order).Update("total_amount", newTotal)
	
	// บันทึกการใช้โปรโมชั่น
	usage := models.PromotionUsage{
		BaseModel:      models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		PromotionID:    promotion.ID,
		OrderID:        order.ID,
		CustomerName:   request.CustomerName,
		DiscountAmount: discountAmount,
	}
	
	if coupon != nil {
		usage.CouponCode = &coupon.Code
		// อัพเดทสถานะคูปองเป็นใช้แล้ว
		now := time.Now()
		database.DB.Model(coupon).Updates(models.Coupon{
			IsUsed: true,
			UsedAt: &now,
			UsedBy: request.CustomerName,
			OrderID: &order.ID,
		})
	}
	
	database.DB.Create(&usage)
	
	// อัพเดทจำนวนการใช้งานโปรโมชั่น
	database.DB.Model(&promotion).Update("usage_count", promotion.UsageCount+1)
	
	return c.JSON(fiber.Map{
		"message": "Promotion applied successfully",
		"order_id": order.ID,
		"original_amount": order.TotalAmount + discountAmount,
		"discount_amount": discountAmount,
		"final_amount": newTotal,
		"promotion": promotion,
		"coupon": coupon,
	})
}

// GetPromotionUsage ดึงประวัติการใช้โปรโมชั่น
func GetPromotionUsage(c *fiber.Ctx) error {
	var usages []models.PromotionUsage
	result := database.DB.Preload("Promotion").Preload("Order").Find(&usages)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(usages)
}
