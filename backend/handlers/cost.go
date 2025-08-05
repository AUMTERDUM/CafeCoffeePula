package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetProductCosts ดึงข้อมูลต้นทุนสินค้า
func GetProductCosts(c *fiber.Ctx) error {
	var costs []models.ProductCost
	
	// ดึงเฉพาะต้นทุนที่ใช้งานอยู่
	result := database.DB.
		Preload("Product").
		Where("is_active = ?", true).
		Order("effective_date DESC").
		Find(&costs)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(costs)
}

// UpdateProductCost อัปเดตต้นทุนสินค้า
func UpdateProductCost(c *fiber.Ctx) error {
	productID := c.Params("product_id")
	
	var input struct {
		CostPerUnit     float64  `json:"cost_per_unit"`
		RawMaterialCost *float64 `json:"raw_material_cost"`
		LaborCost       *float64 `json:"labor_cost"`
		OverheadCost    *float64 `json:"overhead_cost"`
		Notes           *string  `json:"notes"`
	}
	
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	
	// ปิดการใช้งานต้นทุนเก่า
	database.DB.Model(&models.ProductCost{}).
		Where("product_id = ? AND is_active = ?", productID, true).
		Update("is_active", false)
	
	// สร้างต้นทุนใหม่
	newCost := models.ProductCost{
		ProductID:       productID,
		CostPerUnit:     input.CostPerUnit,
		RawMaterialCost: input.RawMaterialCost,
		LaborCost:       input.LaborCost,
		OverheadCost:    input.OverheadCost,
		Notes:           input.Notes,
		EffectiveDate:   time.Now(),
		IsActive:        true,
	}
	
	result := database.DB.Create(&newCost)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	// อัปเดตต้นทุนในตาราง Product
	database.DB.Model(&models.Product{}).
		Where("id = ?", productID).
		Update("cost", input.CostPerUnit)

	return c.JSON(newCost)
}

// GetDailyProfitReport ดึงรายงานกำไรรายวัน
func GetDailyProfitReport(c *fiber.Ctx) error {
	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}
	
	reportDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format"})
	}

	// ตรวจสอบว่ามีรายงานแล้วหรือไม่
	var existingReport models.DailyProfitReport
	result := database.DB.Where("report_date = ?", reportDate).First(&existingReport)
	
	if result.Error == nil {
		return c.JSON(existingReport)
	}

	// สร้างรายงานใหม่
	report, err := generateDailyProfitReport(reportDate)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(report)
}

// generateDailyProfitReport สร้างรายงานกำไรรายวัน
func generateDailyProfitReport(reportDate time.Time) (*models.DailyProfitReport, error) {
	startDate := reportDate
	endDate := reportDate.Add(24 * time.Hour)
	
	// ดึงออเดอร์ในวันที่กำหนด
	var orders []models.Order
	database.DB.
		Preload("OrderItems.Product").
		Where("created_at >= ? AND created_at < ? AND status = ?", 
			startDate, endDate, models.OrderStatusCompleted).
		Find(&orders)

	totalRevenue := 0.0
	totalCost := 0.0
	totalOrders := len(orders)
	totalItems := 0
	productSales := make(map[string]int)

	for _, order := range orders {
		for _, item := range order.OrderItems {
			totalRevenue += item.Price * float64(item.Quantity)
			totalCost += item.Product.Cost * float64(item.Quantity)
			totalItems += item.Quantity
			productSales[item.Product.Name] += item.Quantity
		}
	}

	grossProfit := totalRevenue - totalCost
	profitMargin := 0.0
	if totalRevenue > 0 {
		profitMargin = (grossProfit / totalRevenue) * 100
	}

	averageOrderValue := 0.0
	if totalOrders > 0 {
		averageOrderValue = totalRevenue / float64(totalOrders)
	}

	// หาสินค้าขายดี (Top 5)
	topProducts := make([]string, 0)
	count := 0
	for product, qty := range productSales {
		if count < 5 {
			topProducts = append(topProducts, product+" ("+strconv.Itoa(qty)+")")
			count++
		}
	}

	report := &models.DailyProfitReport{
		ReportDate:        reportDate,
		TotalRevenue:      totalRevenue,
		TotalCost:         totalCost,
		GrossProfit:       grossProfit,
		ProfitMargin:      profitMargin,
		TotalOrders:       totalOrders,
		TotalItems:        totalItems,
		AverageOrderValue: averageOrderValue,
		TopSellingProducts: topProducts,
		GeneratedAt:       time.Now(),
	}

	database.DB.Create(report)
	return report, nil
}

// GetProductProfitReport ดึงรายงานกำไรต่อสินค้า
func GetProductProfitReport(c *fiber.Ctx) error {
	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}
	
	reportDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format"})
	}

	startDate := reportDate
	endDate := reportDate.Add(24 * time.Hour)

	// ดึงข้อมูลการขายแต่ละสินค้า
	var orderItems []models.OrderItem
	database.DB.
		Select("product_id, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue").
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Preload("Product").
		Where("orders.created_at >= ? AND orders.created_at < ? AND orders.status = ?", 
			startDate, endDate, models.OrderStatusCompleted).
		Group("product_id").
		Find(&orderItems)

	var reports []models.ProductProfitReport

	for _, item := range orderItems {
		revenue := item.Price * float64(item.Quantity)
		totalCost := item.Product.Cost * float64(item.Quantity)
		grossProfit := revenue - totalCost
		profitPerUnit := 0.0
		profitMargin := 0.0

		if item.Quantity > 0 {
			profitPerUnit = grossProfit / float64(item.Quantity)
		}
		if revenue > 0 {
			profitMargin = (grossProfit / revenue) * 100
		}

		report := models.ProductProfitReport{
			ProductID:     item.ProductID,
			Product:       item.Product,
			ReportDate:    reportDate,
			QuantitySold:  item.Quantity,
			Revenue:       revenue,
			TotalCost:     totalCost,
			GrossProfit:   grossProfit,
			ProfitPerUnit: profitPerUnit,
			ProfitMargin:  profitMargin,
			GeneratedAt:   time.Now(),
		}

		reports = append(reports, report)
	}

	return c.JSON(reports)
}

// GetProfitAnalytics ดึงข้อมูลวิเคราะห์กำไร
func GetProfitAnalytics(c *fiber.Ctx) error {
	// ช่วงวันที่ (ค่าเริ่มต้น 7 วันล่าสุด)
	days := c.QueryInt("days", 7)
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// สถิติรวม
	var totalStats struct {
		TotalRevenue  float64 `json:"total_revenue"`
		TotalCost     float64 `json:"total_cost"`
		TotalProfit   float64 `json:"total_profit"`
		TotalOrders   int64   `json:"total_orders"`
		AverageMargin float64 `json:"average_margin"`
	}

	// คำนวณสถิติรวม
	database.DB.Raw(`
		SELECT 
			COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue,
			COALESCE(SUM(p.cost * oi.quantity), 0) as total_cost,
			COALESCE(SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity), 0) as total_profit,
			COUNT(DISTINCT o.id) as total_orders
		FROM orders o
		JOIN order_items oi ON o.id = oi.order_id
		JOIN products p ON oi.product_id = p.id
		WHERE o.created_at >= ? AND o.created_at <= ? AND o.status = ?
	`, startDate, endDate, models.OrderStatusCompleted).Scan(&totalStats)

	if totalStats.TotalRevenue > 0 {
		totalStats.AverageMargin = (totalStats.TotalProfit / totalStats.TotalRevenue) * 100
	}

	// กำไรรายวัน
	var dailyProfits []struct {
		Date   string  `json:"date"`
		Profit float64 `json:"profit"`
		Revenue float64 `json:"revenue"`
		Cost   float64 `json:"cost"`
		Margin float64 `json:"margin"`
	}

	database.DB.Raw(`
		SELECT 
			DATE(o.created_at) as date,
			COALESCE(SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity), 0) as profit,
			COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
			COALESCE(SUM(p.cost * oi.quantity), 0) as cost,
			CASE 
				WHEN SUM(oi.price * oi.quantity) > 0 
				THEN ((SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity)) / SUM(oi.price * oi.quantity)) * 100
				ELSE 0 
			END as margin
		FROM orders o
		JOIN order_items oi ON o.id = oi.order_id
		JOIN products p ON oi.product_id = p.id
		WHERE o.created_at >= ? AND o.created_at <= ? AND o.status = ?
		GROUP BY DATE(o.created_at)
		ORDER BY date DESC
	`, startDate, endDate, models.OrderStatusCompleted).Scan(&dailyProfits)

	// สินค้าที่กำไรสูงสุด
	var topProfitableProducts []struct {
		ProductName   string  `json:"product_name"`
		TotalProfit   float64 `json:"total_profit"`
		QuantitySold  int     `json:"quantity_sold"`
		ProfitPerUnit float64 `json:"profit_per_unit"`
		ProfitMargin  float64 `json:"profit_margin"`
	}

	database.DB.Raw(`
		SELECT 
			p.name as product_name,
			COALESCE(SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity), 0) as total_profit,
			COALESCE(SUM(oi.quantity), 0) as quantity_sold,
			CASE 
				WHEN SUM(oi.quantity) > 0 
				THEN (SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity)) / SUM(oi.quantity)
				ELSE 0 
			END as profit_per_unit,
			CASE 
				WHEN SUM(oi.price * oi.quantity) > 0 
				THEN ((SUM(oi.price * oi.quantity) - SUM(p.cost * oi.quantity)) / SUM(oi.price * oi.quantity)) * 100
				ELSE 0 
			END as profit_margin
		FROM products p
		JOIN order_items oi ON p.id = oi.product_id
		JOIN orders o ON oi.order_id = o.id
		WHERE o.created_at >= ? AND o.created_at <= ? AND o.status = ?
		GROUP BY p.id, p.name
		ORDER BY total_profit DESC
		LIMIT 10
	`, startDate, endDate, models.OrderStatusCompleted).Scan(&topProfitableProducts)

	return c.JSON(fiber.Map{
		"summary": totalStats,
		"daily_profits": dailyProfits,
		"top_profitable_products": topProfitableProducts,
		"period": fiber.Map{
			"start_date": startDate.Format("2006-01-02"),
			"end_date":   endDate.Format("2006-01-02"),
			"days":       days,
		},
	})
}
