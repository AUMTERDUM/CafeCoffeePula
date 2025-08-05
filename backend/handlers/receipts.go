package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetReceipts ดึงรายการใบเสร็จ
func GetReceipts(c *fiber.Ctx) error {
	var receipts []models.Receipt
	result := database.DB.Preload("Order").Preload("Order.Items.Product").Find(&receipts)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(receipts)
}

// GetReceiptByID ดึงใบเสร็จตาม ID
func GetReceiptByID(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var receipt models.Receipt
	result := database.DB.Preload("Order").Preload("Order.Items.Product").First(&receipt, "id = ?", id)
	
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Receipt not found"})
	}

	return c.JSON(receipt)
}

// CreateReceipt สร้างใบเสร็จ
func CreateReceipt(c *fiber.Ctx) error {
	var request struct {
		OrderID         string                 `json:"order_id"`
		Type            models.ReceiptType     `json:"type"`
		CustomerName    *string                `json:"customer_name"`
		CustomerPhone   *string                `json:"customer_phone"`
		CustomerAddress *string                `json:"customer_address"`
		PaymentMethod   models.PaymentMethod   `json:"payment_method"`
		PaidAmount      float64                `json:"paid_amount"`
		QRCodeData      *string                `json:"qr_code_data"`
		Notes           *string                `json:"notes"`
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
	
	// สร้างเลขที่ใบเสร็จ
	receiptNumber := generateReceiptNumber()
	
	// คำนวณยอดเงิน
	subtotal := order.TotalAmount
	discount := float64(0) // TODO: คำนวณส่วนลดจากโปรโมชั่น
	tax := float64(0)      // TODO: คำนวณภาษี
	total := subtotal - discount + tax
	change := request.PaidAmount - total
	
	receipt := models.Receipt{
		BaseModel:       models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		OrderID:         request.OrderID,
		ReceiptNumber:   receiptNumber,
		Type:            request.Type,
		Status:          models.ReceiptStatusPending,
		CompanyName:     "Coffee PuLa",
		CompanyAddress:  stringPtr("123 Coffee Street, Bangkok 10110"),
		CompanyPhone:    stringPtr("02-123-4567"),
		CustomerName:    request.CustomerName,
		CustomerPhone:   request.CustomerPhone,
		CustomerAddress: request.CustomerAddress,
		SubtotalAmount:  subtotal,
		DiscountAmount:  discount,
		TaxAmount:       tax,
		TotalAmount:     total,
		PaidAmount:      request.PaidAmount,
		ChangeAmount:    change,
		PaymentMethod:   request.PaymentMethod,
		QRCodeData:      request.QRCodeData,
		Notes:           request.Notes,
		FooterMessage:   stringPtr("ขอบคุณที่ใช้บริการ - Thank you for your business"),
	}
	
	result = database.DB.Create(&receipt)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	// โหลดข้อมูลเต็มสำหรับ response
	database.DB.Preload("Order").Preload("Order.Items.Product").First(&receipt, "id = ?", receipt.ID)

	return c.Status(201).JSON(receipt)
}

// PrintReceipt พิมพ์ใบเสร็จ
func PrintReceipt(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var request struct {
		PrinterID *string `json:"printer_id"`
		Copies    int     `json:"copies"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	if request.Copies <= 0 {
		request.Copies = 1
	}
	
	// ดึงข้อมูลใบเสร็จ
	var receipt models.Receipt
	result := database.DB.Preload("Order").Preload("Order.Items.Product").First(&receipt, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Receipt not found"})
	}
	
	// หาเครื่องพิมพ์
	var printer models.PrinterConfig
	if request.PrinterID != nil {
		result = database.DB.First(&printer, "id = ? AND is_active = ?", *request.PrinterID, true)
	} else {
		result = database.DB.First(&printer, "is_default = ? AND is_active = ?", true, true)
	}
	
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Printer not found or inactive"})
	}
	
	// สร้างเนื้อหาใบเสร็จ
	content := generateReceiptContent(receipt, printer)
	
	// สร้าง print job
	printJob := models.PrintJob{
		BaseModel: models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ReceiptID: receipt.ID,
		PrinterID: &printer.ID,
		Status:    "PENDING",
		Content:   content,
		Copies:    request.Copies,
	}
	
	result = database.DB.Create(&printJob)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	// TODO: ส่งไปยัง print service จริงๆ
	// ตอนนี้แค่อัพเดทสถานะ
	now := time.Now()
	database.DB.Model(&printJob).Updates(models.PrintJob{
		Status:      "COMPLETED",
		StartedAt:   &now,
		CompletedAt: &now,
	})
	
	// อัพเดทใบเสร็จ
	database.DB.Model(&receipt).Updates(models.Receipt{
		Status:      models.ReceiptStatusPrinted,
		PrintedAt:   &now,
		PrinterName: &printer.Name,
		PrintCount:  receipt.PrintCount + request.Copies,
	})

	return c.JSON(fiber.Map{
		"message": "Receipt sent to printer successfully",
		"print_job_id": printJob.ID,
		"printer": printer.Name,
		"copies": request.Copies,
	})
}

// GetPrinters ดึงรายการเครื่องพิมพ์
func GetPrinters(c *fiber.Ctx) error {
	var printers []models.PrinterConfig
	result := database.DB.Where("is_active = ?", true).Find(&printers)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(printers)
}

// CreatePrinter สร้างเครื่องพิมพ์
func CreatePrinter(c *fiber.Ctx) error {
	var printer models.PrinterConfig
	
	if err := c.BodyParser(&printer); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	printer.ID = uuid.New().String()
	printer.CreatedAt = time.Now()
	printer.UpdatedAt = time.Now()
	
	// ถ้าเป็น default printer ให้ยกเลิก default ของตัวอื่น
	if printer.IsDefault {
		database.DB.Model(&models.PrinterConfig{}).Where("is_default = ?", true).Update("is_default", false)
	}
	
	result := database.DB.Create(&printer)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.Status(201).JSON(printer)
}

// UpdatePrinter อัพเดทเครื่องพิมพ์
func UpdatePrinter(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var printer models.PrinterConfig
	result := database.DB.First(&printer, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Printer not found"})
	}
	
	var updateData models.PrinterConfig
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	// ถ้าเป็น default printer ให้ยกเลิก default ของตัวอื่น
	if updateData.IsDefault {
		database.DB.Model(&models.PrinterConfig{}).Where("id != ? AND is_default = ?", id, true).Update("is_default", false)
	}
	
	updateData.UpdatedAt = time.Now()
	result = database.DB.Model(&printer).Updates(updateData)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(printer)
}

// DeletePrinter ลบเครื่องพิมพ์
func DeletePrinter(c *fiber.Ctx) error {
	id := c.Params("id")
	
	result := database.DB.Delete(&models.PrinterConfig{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Printer not found"})
	}

	return c.JSON(fiber.Map{"message": "Printer deleted successfully"})
}

// GetPrintJobs ดึงรายการงานพิมพ์
func GetPrintJobs(c *fiber.Ctx) error {
	var printJobs []models.PrintJob
	result := database.DB.Preload("Receipt").Preload("Printer").Find(&printJobs)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(printJobs)
}

// VoidReceipt ยกเลิกใบเสร็จ
func VoidReceipt(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var request struct {
		Reason *string `json:"reason"`
		VoidedBy *string `json:"voided_by"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	var receipt models.Receipt
	result := database.DB.First(&receipt, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Receipt not found"})
	}
	
	if receipt.IsVoided {
		return c.Status(400).JSON(fiber.Map{"error": "Receipt is already voided"})
	}
	
	now := time.Now()
	result = database.DB.Model(&receipt).Updates(models.Receipt{
		IsVoided:   true,
		VoidedAt:   &now,
		VoidedBy:   request.VoidedBy,
		VoidReason: request.Reason,
	})
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(fiber.Map{"message": "Receipt voided successfully"})
}

// Helper functions
func generateReceiptNumber() string {
	now := time.Now()
	return fmt.Sprintf("RCP%s%06d", now.Format("20060102"), now.Unix()%1000000)
}

func generateReceiptContent(receipt models.Receipt, printer models.PrinterConfig) string {
	var content strings.Builder
	
	// ความกว้างของใบเสร็จ
	lineWidth := printer.CharPerLine
	
	// Header
	content.WriteString(centerText(receipt.CompanyName, lineWidth))
	content.WriteString("\n")
	
	if receipt.CompanyAddress != nil {
		content.WriteString(centerText(*receipt.CompanyAddress, lineWidth))
		content.WriteString("\n")
	}
	
	if receipt.CompanyPhone != nil {
		content.WriteString(centerText("Tel: "+*receipt.CompanyPhone, lineWidth))
		content.WriteString("\n")
	}
	
	content.WriteString(strings.Repeat("-", lineWidth))
	content.WriteString("\n")
	
	// Receipt info
	content.WriteString(fmt.Sprintf("Receipt No: %s\n", receipt.ReceiptNumber))
	content.WriteString(fmt.Sprintf("Date: %s\n", receipt.CreatedAt.Format("02/01/2006 15:04")))
	
	if receipt.CustomerName != nil {
		content.WriteString(fmt.Sprintf("Customer: %s\n", *receipt.CustomerName))
	}
	
	content.WriteString(strings.Repeat("-", lineWidth))
	content.WriteString("\n")
	
	// Items
	if receipt.Type == models.ReceiptTypeFull {
		// แสดงรายการสินค้าแบบเต็ม
		for _, item := range receipt.Order.Items {
			content.WriteString(fmt.Sprintf("%s\n", item.Product.Name))
			content.WriteString(fmt.Sprintf("  %d x %.2f = %.2f\n", 
				item.Quantity, item.Price, float64(item.Quantity)*item.Price))
		}
	} else {
		// แสดงรายการสินค้าแบบย่อ
		content.WriteString(fmt.Sprintf("Items: %d\n", len(receipt.Order.Items)))
	}
	
	content.WriteString(strings.Repeat("-", lineWidth))
	content.WriteString("\n")
	
	// Totals
	content.WriteString(fmt.Sprintf("Subtotal: %.2f\n", receipt.SubtotalAmount))
	
	if receipt.DiscountAmount > 0 {
		content.WriteString(fmt.Sprintf("Discount: -%.2f\n", receipt.DiscountAmount))
	}
	
	if receipt.TaxAmount > 0 {
		content.WriteString(fmt.Sprintf("Tax: %.2f\n", receipt.TaxAmount))
	}
	
	content.WriteString(fmt.Sprintf("TOTAL: %.2f\n", receipt.TotalAmount))
	content.WriteString(fmt.Sprintf("Paid: %.2f\n", receipt.PaidAmount))
	
	if receipt.ChangeAmount > 0 {
		content.WriteString(fmt.Sprintf("Change: %.2f\n", receipt.ChangeAmount))
	}
	
	content.WriteString(strings.Repeat("-", lineWidth))
	content.WriteString("\n")
	
	// Payment method
	content.WriteString(fmt.Sprintf("Payment: %s\n", receipt.PaymentMethod))
	
	// QR Code info
	if receipt.QRCodeData != nil {
		content.WriteString("\n")
		content.WriteString(centerText("Scan QR to Pay", lineWidth))
		content.WriteString("\n")
		content.WriteString(centerText(*receipt.QRCodeData, lineWidth))
		content.WriteString("\n")
	}
	
	// Footer
	if receipt.FooterMessage != nil {
		content.WriteString("\n")
		content.WriteString(centerText(*receipt.FooterMessage, lineWidth))
		content.WriteString("\n")
	}
	
	content.WriteString("\n\n\n") // Feed paper
	
	return content.String()
}

func centerText(text string, width int) string {
	if len(text) >= width {
		return text
	}
	
	padding := (width - len(text)) / 2
	return strings.Repeat(" ", padding) + text
}
