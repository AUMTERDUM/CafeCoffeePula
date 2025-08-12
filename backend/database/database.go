package database

import (
	"coffee-pula-backend/models"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// โหลด environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default values")
	}

	// อ่านค่าจาก environment variables
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "coffee_user")
	dbPassword := getEnv("DB_PASSWORD", "coffee_password")
	dbName := getEnv("DB_NAME", "coffee_pula_db")

	// สร้าง DSN string
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

// Helper function to get environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.Category{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.Ingredient{},
		&models.Recipe{},
		&models.RecipeIngredient{},
		&models.StockMovement{},
		// Promotion System
		&models.Promotion{},
		&models.Coupon{},
		&models.PromotionUsage{},
		// Receipt System
		&models.Receipt{},
		&models.PrinterConfig{},
		&models.PrintJob{},
		// Loyalty Program
		&models.Member{},
		&models.PointHistory{},
		&models.Reward{},
		&models.RewardRedemption{},
		&models.PointRule{},
		&models.TierUpgrade{},
		// Cost Management
		&models.ProductCost{},
		&models.DailyProfitReport{},
		&models.ProductProfitReport{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migration completed")
}

func Seed() {
	// Check if categories already exist
	var categoryCount int64
	DB.Model(&models.Category{}).Count(&categoryCount)

	if categoryCount > 0 {
		log.Println("Data already seeded, skipping...")
		return
	}

	// Seed Categories
	categories := []models.Category{
		{Name: "กาแฟร้อน", Description: stringPtr("เครื่องดื่มกาแฟร้อน")},
		{Name: "กาแฟเย็น", Description: stringPtr("เครื่องดื่มกาแฟเย็น")},
		{Name: "ชา", Description: stringPtr("เครื่องดื่มชา")},
		{Name: "เครื่องดื่มอื่นๆ", Description: stringPtr("เครื่องดื่มไม่มีคาเฟอีน")},
	}

	for i := range categories {
		DB.Create(&categories[i])
	}

	// Seed Ingredients
	ingredients := []models.Ingredient{
		{Name: "เมล็ดกาแฟ", Unit: "กรัม", CostPerUnit: 0.50, CurrentStock: 5000, MinStock: 500, MaxStock: floatPtr(10000), Supplier: stringPtr("บริษัท กาแฟไทย")},
		{Name: "นมสด", Unit: "มล.", CostPerUnit: 0.02, CurrentStock: 10000, MinStock: 1000, MaxStock: floatPtr(20000), Supplier: stringPtr("ฟาร์มนม")},
		{Name: "น้ำตาล", Unit: "กรัม", CostPerUnit: 0.01, CurrentStock: 2000, MinStock: 200, MaxStock: floatPtr(5000), Supplier: stringPtr("โรงงานน้ำตาล")},
		{Name: "ผงโกโก้", Unit: "กรัม", CostPerUnit: 0.08, CurrentStock: 1000, MinStock: 100, MaxStock: floatPtr(2000), Supplier: stringPtr("บริษัท โกโก้")},
		{Name: "น้ำ", Unit: "มล.", CostPerUnit: 0.001, CurrentStock: 50000, MinStock: 5000, MaxStock: floatPtr(100000), Supplier: stringPtr("ประปา")},
	}

	for i := range ingredients {
		DB.Create(&ingredients[i])
	}

	// Seed Products with cost
	products := []models.Product{
		{Name: "เอสเปรสโซ", Description: stringPtr("กาแฟเข้มข้น"), Price: 45, Cost: 15.0, Available: true, CategoryID: categories[0].ID},
		{Name: "อเมริกาโน่", Description: stringPtr("กาแฟดำผสมน้ำ"), Price: 50, Cost: 18.0, Available: true, CategoryID: categories[0].ID},
		{Name: "ลาเต้", Description: stringPtr("กาแฟผสมนมสด"), Price: 65, Cost: 25.0, Available: true, CategoryID: categories[0].ID},
		{Name: "คาปูชิโน่", Description: stringPtr("กาแฟผสมนมฟอง"), Price: 70, Cost: 28.0, Available: true, CategoryID: categories[0].ID},
		{Name: "มอคค่า", Description: stringPtr("กาแฟผสมโกโก้"), Price: 75, Cost: 32.0, Available: true, CategoryID: categories[0].ID},
		{Name: "ลาเต้เย็น", Description: stringPtr("กาแฟนมเย็น"), Price: 70, Cost: 30.0, Available: true, CategoryID: categories[1].ID},
	}

	for i := range products {
		DB.Create(&products[i])
	}

	// Seed Recipes
	recipes := []models.Recipe{
		{ProductID: products[0].ID, Instructions: stringPtr("ชงเอสเปรสโซ 1 shot"), PrepTime: intPtr(2)},
		{ProductID: products[1].ID, Instructions: stringPtr("ชงเอสเปรสโซ 1 shot แล้วเติมน้ำร้อน"), PrepTime: intPtr(3)},
		{ProductID: products[2].ID, Instructions: stringPtr("ชงเอสเปรสโซ 1 shot แล้วเติมนมสดร้อน"), PrepTime: intPtr(4)},
		{ProductID: products[4].ID, Instructions: stringPtr("ชงเอสเปรสโซ 1 shot ผสมโกโก้และนมสด"), PrepTime: intPtr(5)},
	}

	for i := range recipes {
		DB.Create(&recipes[i])
	}

	// Seed Recipe Ingredients
	recipeIngredients := []models.RecipeIngredient{
		// Espresso
		{RecipeID: recipes[0].ID, IngredientID: ingredients[0].ID, Quantity: 18}, // กาแฟ 18g
		{RecipeID: recipes[0].ID, IngredientID: ingredients[4].ID, Quantity: 30}, // น้ำ 30ml

		// Americano
		{RecipeID: recipes[1].ID, IngredientID: ingredients[0].ID, Quantity: 18},  // กาแฟ 18g
		{RecipeID: recipes[1].ID, IngredientID: ingredients[4].ID, Quantity: 180}, // น้ำ 180ml

		// Latte
		{RecipeID: recipes[2].ID, IngredientID: ingredients[0].ID, Quantity: 18},  // กาแฟ 18g
		{RecipeID: recipes[2].ID, IngredientID: ingredients[1].ID, Quantity: 200}, // นม 200ml
		{RecipeID: recipes[2].ID, IngredientID: ingredients[4].ID, Quantity: 30},  // น้ำ 30ml

		// Mocha
		{RecipeID: recipes[3].ID, IngredientID: ingredients[0].ID, Quantity: 18},  // กาแฟ 18g
		{RecipeID: recipes[3].ID, IngredientID: ingredients[1].ID, Quantity: 180}, // นม 180ml
		{RecipeID: recipes[3].ID, IngredientID: ingredients[3].ID, Quantity: 15},  // โกโก้ 15g
		{RecipeID: recipes[3].ID, IngredientID: ingredients[4].ID, Quantity: 30},  // น้ำ 30ml
	}

	for i := range recipeIngredients {
		DB.Create(&recipeIngredients[i])
	}

	// Create sample promotions
	var promotionCount int64
	DB.Model(&models.Promotion{}).Count(&promotionCount)

	if promotionCount == 0 {
		now := time.Now()
		nextWeek := now.AddDate(0, 0, 7)

		promotions := []models.Promotion{
			{
				BaseModel:       models.BaseModel{ID: uuid.New().String()},
				Name:            "Happy Hour 15:00-17:00",
				Description:     stringPtr("ส่วนลด 20% ในช่วง 15:00-17:00"),
				Type:            models.PromotionTypeHappyHour,
				Status:          models.PromotionStatusActive,
				DiscountPercent: floatPtr(20),
				StartTime:       stringPtr("15:00"),
				EndTime:         stringPtr("17:00"),
				StartDate:       &now,
				EndDate:         &nextWeek,
			},
			{
				BaseModel:       models.BaseModel{ID: uuid.New().String()},
				Name:            "ซื้อครบ 200 บาท ลด 10%",
				Description:     stringPtr("ซื้อครบ 200 บาท รับส่วนลด 10% สูงสุด 50 บาท"),
				Type:            models.PromotionTypeMinSpend,
				Status:          models.PromotionStatusActive,
				DiscountPercent: floatPtr(10),
				MinSpend:        floatPtr(200),
				MaxDiscount:     floatPtr(50),
				StartDate:       &now,
				EndDate:         &nextWeek,
			},
			{
				BaseModel:      models.BaseModel{ID: uuid.New().String()},
				Name:           "ลด 30 บาท",
				Description:    stringPtr("ส่วนลดเงินสด 30 บาท"),
				Type:           models.PromotionTypeFixedAmount,
				Status:         models.PromotionStatusActive,
				DiscountAmount: floatPtr(30),
				MinSpend:       floatPtr(100),
				StartDate:      &now,
				EndDate:        &nextWeek,
			},
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String()},
				Name:        "ซื้อ 2 แก้ว ได้ 1 แก้วฟรี",
				Description: stringPtr("ซื้อกาแฟ 2 แก้ว ได้ 1 แก้วฟรี"),
				Type:        models.PromotionTypeBuyXGetY,
				Status:      models.PromotionStatusActive,
				BuyQuantity: intPtr(2),
				GetQuantity: intPtr(1),
				StartDate:   &now,
				EndDate:     &nextWeek,
			},
		}

		for _, promotion := range promotions {
			DB.Create(&promotion)
		}

		// Create sample coupons
		coupons := []models.Coupon{
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String()},
				Code:        "WELCOME20",
				Name:        "คูปองต้อนรับ",
				Description: stringPtr("คูปองต้อนรับลูกค้าใหม่ลด 20%"),
				PromotionID: promotions[0].ID,
			},
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String()},
				Code:        "SAVE30",
				Name:        "คูปองลด 30 บาท",
				Description: stringPtr("คูปองลดเงินสด 30 บาท"),
				PromotionID: promotions[2].ID,
			},
		}

		for _, coupon := range coupons {
			DB.Create(&coupon)
		}
	}

	// Create sample printer configs
	var printerCount int64
	DB.Model(&models.PrinterConfig{}).Count(&printerCount)

	if printerCount == 0 {
		printers := []models.PrinterConfig{
			{
				BaseModel:      models.BaseModel{ID: uuid.New().String()},
				Name:           "Epson TM-T20III",
				Type:           "THERMAL",
				Brand:          "Epson",
				Model:          stringPtr("TM-T20III"),
				ConnectionType: "USB",
				DevicePath:     stringPtr("/dev/usb/lp0"),
				PaperWidth:     80,
				CharPerLine:    32,
				IsDefault:      true,
				IsActive:       true,
			},
			{
				BaseModel:      models.BaseModel{ID: uuid.New().String()},
				Name:           "Xprinter XP-58IIH",
				Type:           "THERMAL",
				Brand:          "Xprinter",
				Model:          stringPtr("XP-58IIH"),
				ConnectionType: "NETWORK",
				IPAddress:      stringPtr("192.168.1.100"),
				Port:           intPtr(9100),
				PaperWidth:     58,
				CharPerLine:    24,
				IsDefault:      false,
				IsActive:       true,
			},
			{
				BaseModel:      models.BaseModel{ID: uuid.New().String()},
				Name:           "Kitchen Printer",
				Type:           "THERMAL",
				Brand:          "Epson",
				Model:          stringPtr("TM-T82III"),
				ConnectionType: "NETWORK",
				IPAddress:      stringPtr("192.168.1.101"),
				Port:           intPtr(9100),
				PaperWidth:     80,
				CharPerLine:    32,
				IsDefault:      false,
				IsActive:       true,
			},
		}

		for _, printer := range printers {
			DB.Create(&printer)
		}
	}

	// Seed Loyalty Program Data
	var memberCount int64
	DB.Model(&models.Member{}).Count(&memberCount)
	if memberCount == 0 {
		// สร้างกฎการให้คะแนน
		pointRules := []models.PointRule{
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:        "คะแนนจากการซื้อ",
				Description: stringPtr("ซื้อครบ 100 บาท ได้ 1 คะแนน"),
				Type:        "PURCHASE",
				SpendAmount: floatPtr(100),
				EarnPoints:  intPtr(1),
				IsActive:    true,
			},
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:        "คะแนนวันเกิด",
				Description: stringPtr("ได้คะแนนพิเศษในวันเกิด"),
				Type:        "BIRTHDAY",
				EarnPoints:  intPtr(50),
				IsActive:    true,
			},
			{
				BaseModel:       models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:            "คะแนนสมาชิกทอง",
				Description:     stringPtr("สมาชิกทองได้คะแนนเพิ่ม 50%"),
				Type:            "PURCHASE",
				SpendAmount:     floatPtr(100),
				EarnPoints:      intPtr(1),
				BonusMultiplier: floatPtr(1.5),
				ApplicableTiers: []string{"GOLD", "PLATINUM"},
				IsActive:        true,
			},
		}

		for _, rule := range pointRules {
			DB.Create(&rule)
		}

		// สร้างรางวัล
		rewards := []models.Reward{
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:        "กาแฟฟรี 1 แก้ว",
				Description: stringPtr("แลกกาแฟเอสเพรสโซ 1 แก้วฟรี"),
				Type:        "FREE_ITEM",
				PointCost:   50,
				IsActive:    true,
				UsageLimit:  intPtr(1), // ใช้ได้ 1 ครั้งต่อคน
			},
			{
				BaseModel:      models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:           "ส่วนลด 50 บาท",
				Description:    stringPtr("ส่วนลดเงินสด 50 บาท"),
				Type:           "DISCOUNT",
				PointCost:      100,
				DiscountAmount: floatPtr(50),
				IsActive:       true,
			},
			{
				BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				Name:        "ซื้อ 10 แถม 1",
				Description: stringPtr("ซื้อกาแฟครบ 10 แก้ว แถม 1 แก้วฟรี"),
				Type:        "BUY_X_GET_Y",
				PointCost:   0, // ไม่ต้องใช้คะแนน
				BuyQuantity: intPtr(10),
				GetQuantity: intPtr(1),
				IsActive:    true,
			},
		}

		for _, reward := range rewards {
			DB.Create(&reward)
		}

		// สร้างสมาชิกตัวอย่าง
		members := []models.Member{
			{
				BaseModel:       models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				MemberNumber:    "MEM001",
				Name:            "สมชาย ใจดี",
				Phone:           stringPtr("0881234567"),
				Email:           stringPtr("somchai@example.com"),
				TotalPoints:     150,
				AvailablePoints: 120,
				UsedPoints:      30,
				TotalSpent:      2500,
				TotalOrders:     15,
				Tier:            "SILVER",
				IsActive:        true,
				LastVisit:       &[]time.Time{time.Now().AddDate(0, 0, -2)}[0],
			},
			{
				BaseModel:       models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				MemberNumber:    "MEM002",
				Name:            "สุวรรณา ทองคำ",
				Phone:           stringPtr("0887654321"),
				Email:           stringPtr("suwanna@example.com"),
				TotalPoints:     500,
				AvailablePoints: 480,
				UsedPoints:      20,
				TotalSpent:      8000,
				TotalOrders:     40,
				Tier:            "GOLD",
				IsActive:        true,
				LastVisit:       &[]time.Time{time.Now().AddDate(0, 0, -1)}[0],
			},
		}

		for _, member := range members {
			DB.Create(&member)
		}
	}

	// Seed Product Costs (only if products exist)
	var productCount int64
	DB.Model(&models.Product{}).Count(&productCount)
	if productCount > 0 {
		var productCostCount int64
		DB.Model(&models.ProductCost{}).Count(&productCostCount)

		if productCostCount == 0 {
			var allProducts []models.Product
			DB.Find(&allProducts)

			for _, product := range allProducts {
				productCost := models.ProductCost{
					ProductID:       product.ID,
					CostPerUnit:     product.Cost,
					RawMaterialCost: floatPtr(product.Cost * 0.6), // 60% วัตถุดิบ
					LaborCost:       floatPtr(product.Cost * 0.3), // 30% แรงงาน
					OverheadCost:    floatPtr(product.Cost * 0.1), // 10% ค่าใช้จ่ายทั่วไป
					EffectiveDate:   time.Now(),
					IsActive:        true,
					Notes:           stringPtr("ต้นทุนเริ่มต้น"),
				}
				DB.Create(&productCost)
			}
		}
	}

	log.Println("Database seeded successfully")
}

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func floatPtr(f float64) *float64 {
	return &f
}

func intPtr(i int) *int {
	return &i
}
