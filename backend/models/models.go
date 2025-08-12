package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with UUID
type BaseModel struct {
	ID        string         `json:"id" gorm:"type:varchar(36);primary_key;"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (base *BaseModel) BeforeCreate(tx *gorm.DB) error {
	base.ID = uuid.New().String()
	return nil
}

// Category model
type Category struct {
	BaseModel
	Name        string    `json:"name" gorm:"unique;not null"`
	Description *string   `json:"description"`
	Products    []Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

// Product model
type Product struct {
	BaseModel
	Name        string      `json:"name" gorm:"not null"`
	Description *string     `json:"description"`
	Price       float64     `json:"price" gorm:"not null"`
	Cost        float64     `json:"cost" gorm:"default:0"` // ต้นทุนต่อหน่วย
	Image       *string     `json:"image"`
	Available   bool        `json:"available" gorm:"default:true"`
	CategoryID  string      `json:"category_id" gorm:"not null"`
	Category    Category    `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	OrderItems  []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:ProductID"`
	Recipe      *Recipe     `json:"recipe,omitempty" gorm:"foreignKey:ProductID"`
}

// Order model
type Order struct {
	BaseModel
	OrderNumber   string         `json:"order_number" gorm:"unique;not null"`
	TotalAmount   float64        `json:"total_amount" gorm:"not null"`
	Status        OrderStatus    `json:"status" gorm:"default:'PENDING'"`
	PaymentMethod *PaymentMethod `json:"payment_method"`
	CustomerName  *string        `json:"customer_name"`
	Notes         *string        `json:"notes"`
	Items         []OrderItem    `json:"items,omitempty" gorm:"foreignKey:OrderID"`
	Payment       *Payment       `json:"payment,omitempty" gorm:"foreignKey:OrderID"`
}

// OrderItem model
type OrderItem struct {
	BaseModel
	Quantity  int     `json:"quantity" gorm:"not null"`
	Price     float64 `json:"price" gorm:"not null"`
	Subtotal  float64 `json:"subtotal" gorm:"not null"`
	OrderID   string  `json:"order_id" gorm:"not null"`
	ProductID string  `json:"product_id" gorm:"not null"`
	Order     Order   `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Product   Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

// Payment model
type Payment struct {
	BaseModel
	Amount        float64       `json:"amount" gorm:"not null"`
	Method        PaymentMethod `json:"method" gorm:"not null"`
	Status        PaymentStatus `json:"status" gorm:"default:'PENDING'"`
	TransactionID *string       `json:"transaction_id"`
	OrderID       string        `json:"order_id" gorm:"unique;not null"`
	Order         Order         `json:"order,omitempty" gorm:"foreignKey:OrderID"`
}

// Ingredient model
type Ingredient struct {
	BaseModel
	Name           string             `json:"name" gorm:"unique;not null"`
	Unit           string             `json:"unit" gorm:"not null"` // มล., กรัม, ถ้วย, ช้อน
	CostPerUnit    float64            `json:"cost_per_unit" gorm:"not null"`
	CurrentStock   float64            `json:"current_stock" gorm:"default:0"`
	MinStock       float64            `json:"min_stock" gorm:"default:0"`
	MaxStock       *float64           `json:"max_stock"`
	Supplier       *string            `json:"supplier"`
	Description    *string            `json:"description"`
	Recipes        []RecipeIngredient `json:"recipes,omitempty" gorm:"foreignKey:IngredientID"`
	StockMovements []StockMovement    `json:"stock_movements,omitempty" gorm:"foreignKey:IngredientID"`
}

// Recipe model
type Recipe struct {
	BaseModel
	ProductID    string             `json:"product_id" gorm:"unique;not null"`
	Instructions *string            `json:"instructions"`
	PrepTime     *int               `json:"prep_time"` // เวลาในการเตรียม (นาที)
	Product      Product            `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Ingredients  []RecipeIngredient `json:"ingredients,omitempty" gorm:"foreignKey:RecipeID"`
}

// RecipeIngredient model
type RecipeIngredient struct {
	BaseModel
	RecipeID     string     `json:"recipe_id" gorm:"not null"`
	IngredientID string     `json:"ingredient_id" gorm:"not null"`
	Quantity     float64    `json:"quantity" gorm:"not null"` // ปริมาณที่ใช้
	Recipe       Recipe     `json:"recipe,omitempty" gorm:"foreignKey:RecipeID"`
	Ingredient   Ingredient `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
}

// StockMovement model
type StockMovement struct {
	BaseModel
	IngredientID string            `json:"ingredient_id" gorm:"not null"`
	Type         StockMovementType `json:"type" gorm:"not null"`
	Quantity     float64           `json:"quantity" gorm:"not null"`
	Reason       *string           `json:"reason"`    // เหตุผล เช่น "ขาย", "เสียหาย", "เติมสต๊อก"
	Reference    *string           `json:"reference"` // อ้างอิง เช่น OrderID
	Ingredient   Ingredient        `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
}

// Enums
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "PENDING"
	OrderStatusConfirmed OrderStatus = "CONFIRMED"
	OrderStatusPreparing OrderStatus = "PREPARING"
	OrderStatusReady     OrderStatus = "READY"
	OrderStatusCompleted OrderStatus = "COMPLETED"
	OrderStatusCancelled OrderStatus = "CANCELLED"
)

type PaymentMethod string

const (
	PaymentMethodCash          PaymentMethod = "CASH"
	PaymentMethodCreditCard    PaymentMethod = "CREDIT_CARD"
	PaymentMethodDebitCard     PaymentMethod = "DEBIT_CARD"
	PaymentMethodMobilePayment PaymentMethod = "MOBILE_PAYMENT"
	PaymentMethodQRCode        PaymentMethod = "QR_CODE"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusCompleted PaymentStatus = "COMPLETED"
	PaymentStatusFailed    PaymentStatus = "FAILED"
	PaymentStatusRefunded  PaymentStatus = "REFUNDED"
)

type StockMovementType string

const (
	StockMovementTypeIn     StockMovementType = "IN"     // เข้า
	StockMovementTypeOut    StockMovementType = "OUT"    // ออก
	StockMovementTypeAdjust StockMovementType = "ADJUST" // ปรับปรุง
)

// Promotion System Models
type PromotionType string

const (
	PromotionTypeDiscount    PromotionType = "DISCOUNT"     // ส่วนลด %
	PromotionTypeFixedAmount PromotionType = "FIXED_AMOUNT" // ลดเงินสดจำนวนคงที่
	PromotionTypeBuyXGetY    PromotionType = "BUY_X_GET_Y"  // ซื้อ X ได้ Y
	PromotionTypeHappyHour   PromotionType = "HAPPY_HOUR"   // Happy Hour
	PromotionTypeMinSpend    PromotionType = "MIN_SPEND"    // ซื้อครบ xx บาท ลด xx%
)

type PromotionStatus string

const (
	PromotionStatusActive   PromotionStatus = "ACTIVE"
	PromotionStatusInactive PromotionStatus = "INACTIVE"
	PromotionStatusExpired  PromotionStatus = "EXPIRED"
)

// โปรโมชั่น/ส่วนลด
type Promotion struct {
	BaseModel
	Name        string          `json:"name" gorm:"not null"`
	Description *string         `json:"description"`
	Type        PromotionType   `json:"type" gorm:"not null"`
	Status      PromotionStatus `json:"status" gorm:"default:ACTIVE"`

	// ส่วนลด
	DiscountPercent *float64 `json:"discount_percent"` // เปอร์เซ็นต์ส่วนลด
	DiscountAmount  *float64 `json:"discount_amount"`  // จำนวนเงินส่วนลด
	MaxDiscount     *float64 `json:"max_discount"`     // ส่วนลดสูงสุด

	// เงื่อนไข
	MinSpend        *float64 `json:"min_spend"`        // ยอดขั้นต่ำ
	ApplicableItems *string  `json:"applicable_items"` // สินค้าที่ใช้ได้ (JSON array)

	// Happy Hour
	StartTime *string `json:"start_time"` // เวลาเริ่ม HH:MM
	EndTime   *string `json:"end_time"`   // เวลาสิ้นสุด HH:MM

	// Buy X Get Y
	BuyQuantity *int `json:"buy_quantity"` // ซื้อ X
	GetQuantity *int `json:"get_quantity"` // ได้ Y

	// วันที่
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`

	// จำนวนครั้งที่ใช้ได้
	UsageLimit  *int `json:"usage_limit"`  // จำกัดการใช้งาน
	UsageCount  int  `json:"usage_count"`  // จำนวนครั้งที่ใช้แล้ว
	PerCustomer *int `json:"per_customer"` // จำกัดต่อลูกค้า

	Code *string `json:"code"` // รหัสคูปอง (ถ้ามี)
}

// คูปองส่วนลด
type Coupon struct {
	BaseModel
	Code        string  `json:"code" gorm:"unique;not null"`
	Name        string  `json:"name" gorm:"not null"`
	Description *string `json:"description"`

	PromotionID string    `json:"promotion_id" gorm:"not null"`
	Promotion   Promotion `json:"promotion" gorm:"foreignKey:PromotionID"`

	// สถานะคูปอง
	IsUsed  bool       `json:"is_used" gorm:"default:false"`
	UsedAt  *time.Time `json:"used_at"`
	UsedBy  *string    `json:"used_by"`  // ลูกค้าที่ใช้
	OrderID *string    `json:"order_id"` // ออเดอร์ที่ใช้
}

// การใช้โปรโมชั่น
type PromotionUsage struct {
	BaseModel
	PromotionID string    `json:"promotion_id" gorm:"not null"`
	Promotion   Promotion `json:"promotion" gorm:"foreignKey:PromotionID"`

	OrderID string `json:"order_id" gorm:"not null"`
	Order   Order  `json:"order" gorm:"foreignKey:OrderID"`

	CustomerName   *string `json:"customer_name"`
	DiscountAmount float64 `json:"discount_amount"` // จำนวนเงินที่ลดจริง
	CouponCode     *string `json:"coupon_code"`     // รหัสคูปองที่ใช้ (ถ้ามี)
}

// Receipt System Models
type ReceiptType string

const (
	ReceiptTypeFull    ReceiptType = "FULL"    // ใบเสร็จเต็ม
	ReceiptTypeSimple  ReceiptType = "SIMPLE"  // ใบเสร็จย่อ
	ReceiptTypeKitchen ReceiptType = "KITCHEN" // ใบสั่งครัว
)

type ReceiptStatus string

const (
	ReceiptStatusPending ReceiptStatus = "PENDING" // รอพิมพ์
	ReceiptStatusPrinted ReceiptStatus = "PRINTED" // พิมพ์แล้ว
	ReceiptStatusFailed  ReceiptStatus = "FAILED"  // พิมพ์ไม่สำเร็จ
)

// ใบเสร็จ
type Receipt struct {
	BaseModel
	OrderID string `json:"order_id" gorm:"not null"`
	Order   Order  `json:"order" gorm:"foreignKey:OrderID"`

	ReceiptNumber string        `json:"receipt_number" gorm:"unique;not null"` // เลขที่ใบเสร็จ
	Type          ReceiptType   `json:"type" gorm:"not null"`
	Status        ReceiptStatus `json:"status" gorm:"default:PENDING"`

	// ข้อมูลใบเสร็จ
	CompanyName    string  `json:"company_name"`
	CompanyAddress *string `json:"company_address"`
	CompanyPhone   *string `json:"company_phone"`
	CompanyTaxID   *string `json:"company_tax_id"`

	CustomerName    *string `json:"customer_name"`
	CustomerPhone   *string `json:"customer_phone"`
	CustomerAddress *string `json:"customer_address"`
	CustomerTaxID   *string `json:"customer_tax_id"`

	// ยอดเงิน
	SubtotalAmount float64 `json:"subtotal_amount"` // ยอดรวมก่อนส่วนลด
	DiscountAmount float64 `json:"discount_amount"` // ส่วนลด
	TaxAmount      float64 `json:"tax_amount"`      // ภาษี
	TotalAmount    float64 `json:"total_amount"`    // ยอดรวมสุทธิ
	PaidAmount     float64 `json:"paid_amount"`     // เงินที่รับ
	ChangeAmount   float64 `json:"change_amount"`   // เงินทอน

	// การชำระเงิน
	PaymentMethod  PaymentMethod `json:"payment_method"`
	QRCodeData     *string       `json:"qr_code_data"`      // ข้อมูล QR สำหรับชำระเงิน
	QRCodeImageURL *string       `json:"qr_code_image_url"` // URL รูป QR Code

	// การพิมพ์
	PrintedAt   *time.Time `json:"printed_at"`
	PrintedBy   *string    `json:"printed_by"`
	PrinterName *string    `json:"printer_name"` // ชื่อเครื่องพิมพ์
	PrintCount  int        `json:"print_count"`  // จำนวนครั้งที่พิมพ์

	// ข้อมูลเพิ่มเติม
	Notes         *string    `json:"notes"`
	FooterMessage *string    `json:"footer_message"` // ข้อความท้ายใบเสร็จ
	IsVoided      bool       `json:"is_voided"`      // ยกเลิกใบเสร็จ
	VoidedAt      *time.Time `json:"voided_at"`
	VoidedBy      *string    `json:"voided_by"`
	VoidReason    *string    `json:"void_reason"`
}

// การตั้งค่าเครื่องพิมพ์
type PrinterConfig struct {
	BaseModel
	Name           string  `json:"name" gorm:"unique;not null"`     // ชื่อเครื่องพิมพ์
	Type           string  `json:"type" gorm:"not null"`            // ประเภท (THERMAL, INKJET, etc.)
	Brand          string  `json:"brand"`                           // ยี่ห้อ (Epson, Xprinter, etc.)
	Model          *string `json:"model"`                           // รุ่น
	ConnectionType string  `json:"connection_type"`                 // USB, NETWORK, BLUETOOTH
	IPAddress      *string `json:"ip_address"`                      // IP สำหรับ Network printer
	Port           *int    `json:"port"`                            // Port สำหรับ Network printer
	DevicePath     *string `json:"device_path"`                     // Device path สำหรับ USB
	PaperWidth     int     `json:"paper_width" gorm:"default:80"`   // ความกว้างกระดาษ (mm)
	CharPerLine    int     `json:"char_per_line" gorm:"default:32"` // จำนวนตัวอักษรต่อบรรทัด
	IsDefault      bool    `json:"is_default" gorm:"default:false"` // เครื่องพิมพ์หลัก
	IsActive       bool    `json:"is_active" gorm:"default:true"`   // เปิดใช้งาน
	Settings       *string `json:"settings"`                        // การตั้งค่าเพิ่มเติม (JSON)
}

// รายการสั่งพิมพ์
type PrintJob struct {
	BaseModel
	ReceiptID string  `json:"receipt_id" gorm:"not null"`
	Receipt   Receipt `json:"receipt" gorm:"foreignKey:ReceiptID"`

	PrinterID *string        `json:"printer_id"`
	Printer   *PrinterConfig `json:"printer" gorm:"foreignKey:PrinterID"`

	Status  string `json:"status" gorm:"default:PENDING"` // PENDING, PROCESSING, COMPLETED, FAILED
	Content string `json:"content" gorm:"type:text"`      // เนื้อหาที่จะพิมพ์
	Copies  int    `json:"copies" gorm:"default:1"`       // จำนวนสำเนา

	StartedAt    *time.Time `json:"started_at"`
	CompletedAt  *time.Time `json:"completed_at"`
	ErrorMessage *string    `json:"error_message"`
	RetryCount   int        `json:"retry_count" gorm:"default:0"`
	MaxRetries   int        `json:"max_retries" gorm:"default:3"`
}

// ข้อมูลสมาชิก (Loyalty Program)
type Member struct {
	BaseModel
	MemberNumber string     `json:"member_number" gorm:"unique;not null"` // รหัสสมาชิก
	Name         string     `json:"name" gorm:"not null"`                 // ชื่อสมาชิก
	Phone        *string    `json:"phone" gorm:"unique"`                  // เบอร์โทร
	Email        *string    `json:"email" gorm:"unique"`                  // อีเมล
	DateOfBirth  *time.Time `json:"date_of_birth"`                        // วันเกิด

	// คะแนนสะสม
	TotalPoints     int `json:"total_points" gorm:"default:0"`     // คะแนนรวมตลอดกาล
	AvailablePoints int `json:"available_points" gorm:"default:0"` // คะแนนที่ใช้ได้
	UsedPoints      int `json:"used_points" gorm:"default:0"`      // คะแนนที่ใช้แล้ว

	// สถิติการใช้บริการ
	TotalSpent  float64    `json:"total_spent" gorm:"default:0"`  // ยอดใช้จ่ายรวม
	TotalOrders int        `json:"total_orders" gorm:"default:0"` // จำนวนออเดอร์รวม
	LastVisit   *time.Time `json:"last_visit"`                    // การเยี่ยมชมครั้งล่าสุด

	// การตั้งค่า
	Tier     string `json:"tier" gorm:"default:BRONZE"`    // ระดับสมาชิก: BRONZE, SILVER, GOLD, PLATINUM
	IsActive bool   `json:"is_active" gorm:"default:true"` // สถานะสมาชิก

	// ความสัมพันธ์
	PointHistories    []PointHistory     `json:"point_histories" gorm:"foreignKey:MemberID"`
	RewardRedemptions []RewardRedemption `json:"reward_redemptions" gorm:"foreignKey:MemberID"`
}

// ประวัติการเก็บคะแนน
type PointHistory struct {
	BaseModel
	MemberID string `json:"member_id" gorm:"not null"`
	Member   Member `json:"member" gorm:"foreignKey:MemberID"`

	OrderID *string `json:"order_id"` // อ้างอิงจากออเดอร์
	Order   *Order  `json:"order" gorm:"foreignKey:OrderID"`

	Type        string `json:"type" gorm:"not null"`   // EARN, REDEEM, EXPIRE, BONUS, ADJUST
	Points      int    `json:"points" gorm:"not null"` // จำนวนคะแนน (+/-)
	Description string `json:"description"`            // รายละเอียด

	// สำหรับคะแนนที่มีวันหมดอายุ
	ExpiresAt *time.Time `json:"expires_at"`
	IsExpired bool       `json:"is_expired" gorm:"default:false"`

	// อ้างอิง
	ReferenceType *string `json:"reference_type"` // ORDER, REWARD, MANUAL, etc.
	ReferenceID   *string `json:"reference_id"`
}

// รางวัลและสิทธิพิเศษ
type Reward struct {
	BaseModel
	Name        string  `json:"name" gorm:"not null"` // ชื่อรางวัล
	Description *string `json:"description"`          // รายละเอียด
	Type        string  `json:"type" gorm:"not null"` // FREE_ITEM, DISCOUNT, BUY_X_GET_Y

	// เงื่อนไขการแลก
	PointCost    int     `json:"point_cost" gorm:"default:0"` // คะแนนที่ต้องใช้
	RequiredTier *string `json:"required_tier"`               // ระดับสมาชิกที่ต้องการ

	// รายละเอียดรางวัล
	FreeProductID   *string  `json:"free_product_id"` // สินค้าฟรี
	FreeProduct     *Product `json:"free_product" gorm:"foreignKey:FreeProductID"`
	DiscountAmount  *float64 `json:"discount_amount"`  // จำนวนเงินลด
	DiscountPercent *float64 `json:"discount_percent"` // เปอร์เซ็นต์ลด

	// Buy X Get Y
	BuyQuantity        *int     `json:"buy_quantity"`                         // ซื้อกี่ชิ้น
	GetQuantity        *int     `json:"get_quantity"`                         // แถมกี่ชิ้น
	ApplicableProducts []string `json:"applicable_products" gorm:"type:json"` // สินค้าที่ใช้ได้

	// การตั้งค่า
	IsActive   bool       `json:"is_active" gorm:"default:true"`
	UsageLimit *int       `json:"usage_limit"` // จำกัดการใช้ต่อคน
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`

	// สถิติ
	TotalRedemptions int `json:"total_redemptions" gorm:"default:0"`

	// ความสัมพันธ์
	Redemptions []RewardRedemption `json:"redemptions" gorm:"foreignKey:RewardID"`
}

// การแลกรางวัล
type RewardRedemption struct {
	BaseModel
	MemberID string `json:"member_id" gorm:"not null"`
	Member   Member `json:"member" gorm:"foreignKey:MemberID"`

	RewardID string `json:"reward_id" gorm:"not null"`
	Reward   Reward `json:"reward" gorm:"foreignKey:RewardID"`

	OrderID *string `json:"order_id"` // ออเดอร์ที่ใช้รางวัล
	Order   *Order  `json:"order" gorm:"foreignKey:OrderID"`

	PointsUsed int    `json:"points_used" gorm:"not null"`   // คะแนนที่ใช้
	Status     string `json:"status" gorm:"default:PENDING"` // PENDING, USED, EXPIRED, CANCELLED

	UsedAt    *time.Time `json:"used_at"`    // วันที่ใช้
	ExpiresAt *time.Time `json:"expires_at"` // วันหมดอายุ

	Notes *string `json:"notes"`
}

// กฎการให้คะแนน
type PointRule struct {
	BaseModel
	Name        string  `json:"name" gorm:"not null"` // ชื่อกฎ
	Description *string `json:"description"`          // รายละเอียด
	Type        string  `json:"type" gorm:"not null"` // PURCHASE, BIRTHDAY, REFERRAL, BONUS

	// กฎการให้คะแนนจากการซื้อ
	SpendAmount *float64 `json:"spend_amount"` // ใช้จ่ายกี่บาท
	EarnPoints  *int     `json:"earn_points"`  // ได้กี่คะแนน

	// กฎพิเศษ
	BonusMultiplier      *float64 `json:"bonus_multiplier"`                       // ตัวคูณคะแนน
	SpecialDays          []string `json:"special_days" gorm:"type:json"`          // วันพิเศษ
	ApplicableCategories []string `json:"applicable_categories" gorm:"type:json"` // หมวดหมู่ที่ใช้ได้
	ApplicableProducts   []string `json:"applicable_products" gorm:"type:json"`   // สินค้าที่ใช้ได้

	// ระดับสมาชิก
	ApplicableTiers []string `json:"applicable_tiers" gorm:"type:json"` // ระดับที่ใช้ได้

	// การตั้งค่า
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	Priority  int        `json:"priority" gorm:"default:0"` // ลำดับความสำคัญ
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
}

// การอัพเกรดระดับสมาชิก
type TierUpgrade struct {
	BaseModel
	MemberID string `json:"member_id" gorm:"not null"`
	Member   Member `json:"member" gorm:"foreignKey:MemberID"`

	FromTier string `json:"from_tier" gorm:"not null"` // ระดับเดิม
	ToTier   string `json:"to_tier" gorm:"not null"`   // ระดับใหม่

	RequiredSpend  float64 `json:"required_spend"`  // ยอดใช้จ่ายที่ต้องการ
	RequiredOrders int     `json:"required_orders"` // จำนวนออเดอร์ที่ต้องการ

	AchievedSpend  float64 `json:"achieved_spend"`  // ยอดใช้จ่ายที่ทำได้
	AchievedOrders int     `json:"achieved_orders"` // จำนวนออเดอร์ที่ทำได้

	UpgradeDate time.Time `json:"upgrade_date" gorm:"not null"` // วันที่อัพเกรด
	Notes       *string   `json:"notes"`
}

// Cost Management Models
// บันทึกต้นทุนสินค้า
type ProductCost struct {
	BaseModel
	ProductID string  `json:"product_id" gorm:"not null"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`

	CostPerUnit   float64   `json:"cost_per_unit" gorm:"not null"`  // ต้นทุนต่อหน่วย
	EffectiveDate time.Time `json:"effective_date" gorm:"not null"` // วันที่มีผล

	// รายละเอียดต้นทุน
	RawMaterialCost *float64 `json:"raw_material_cost"` // ต้นทุนวัตถุดิบ
	LaborCost       *float64 `json:"labor_cost"`        // ต้นทุนแรงงาน
	OverheadCost    *float64 `json:"overhead_cost"`     // ค่าใช้จ่ายทั่วไป

	Notes    *string `json:"notes"`
	IsActive bool    `json:"is_active" gorm:"default:true"`
}

// รายงานกำไรขาดทุนรายวัน
type DailyProfitReport struct {
	BaseModel
	ReportDate time.Time `json:"report_date" gorm:"uniqueIndex:idx_daily_report"`

	// ยอดขาย
	TotalRevenue float64 `json:"total_revenue"` // รายได้รวม
	TotalCost    float64 `json:"total_cost"`    // ต้นทุนรวม
	GrossProfit  float64 `json:"gross_profit"`  // กำไรขั้นต้น
	ProfitMargin float64 `json:"profit_margin"` // อัตรากำไร %

	// จำนวนการขาย
	TotalOrders       int     `json:"total_orders"`        // จำนวนออเดอร์
	TotalItems        int     `json:"total_items"`         // จำนวนสินค้าที่ขาย
	AverageOrderValue float64 `json:"average_order_value"` // ยอดเฉลี่ยต่อออเดอร์

	// รายละเอียดเพิ่มเติม
	TopSellingProducts  []string `json:"top_selling_products" gorm:"type:json"`  // สินค้าขายดี
	ProductSalesDetails []byte   `json:"product_sales_details" gorm:"type:json"` // รายละเอียดการขายแต่ละสินค้า

	GeneratedAt time.Time `json:"generated_at" gorm:"autoCreateTime"`
}

// รายงานกำไรต่อสินค้า
type ProductProfitReport struct {
	BaseModel
	ProductID  string    `json:"product_id" gorm:"not null"`
	Product    Product   `json:"product" gorm:"foreignKey:ProductID"`
	ReportDate time.Time `json:"report_date"`

	// ข้อมูลการขาย
	QuantitySold  int     `json:"quantity_sold"`   // จำนวนที่ขาย
	Revenue       float64 `json:"revenue"`         // รายได้
	TotalCost     float64 `json:"total_cost"`      // ต้นทุนรวม
	GrossProfit   float64 `json:"gross_profit"`    // กำไรขั้นต้น
	ProfitPerUnit float64 `json:"profit_per_unit"` // กำไรต่อหน่วย
	ProfitMargin  float64 `json:"profit_margin"`   // อัตรากำไร %

	GeneratedAt time.Time `json:"generated_at" gorm:"autoCreateTime"`
}
