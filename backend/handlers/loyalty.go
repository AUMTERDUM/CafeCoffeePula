package handlers

import (
	"coffee-pula-backend/database"
	"coffee-pula-backend/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetMembers ดึงรายการสมาชิก
func GetMembers(c *fiber.Ctx) error {
	var members []models.Member
	
	// ดึงพารามิเตอร์สำหรับการค้นหา
	search := c.Query("search")
	tier := c.Query("tier")
	isActive := c.Query("active")
	
	query := database.DB.Model(&models.Member{})
	
	// ค้นหาตามชื่อหรือเบอร์โทร
	if search != "" {
		query = query.Where("name LIKE ? OR phone LIKE ? OR member_number LIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	// กรองตามระดับสมาชิก
	if tier != "" {
		query = query.Where("tier = ?", tier)
	}
	
	// กรองตามสถานะ
	if isActive != "" {
		active, _ := strconv.ParseBool(isActive)
		query = query.Where("is_active = ?", active)
	}
	
	result := query.Order("created_at DESC").Find(&members)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(members)
}

// GetPointHistory ดึงประวัติการใช้คะแนนของสมาชิก
func GetPointHistory(c *fiber.Ctx) error {
	memberID := c.Params("member_id")
	
	var pointHistory []models.PointHistory
	
	// ดึงพารามิเตอร์สำหรับการแบ่งหน้า
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	pointType := c.Query("type")
	
	query := database.DB.Model(&models.PointHistory{}).Where("member_id = ?", memberID)
	
	// กรองตามประเภทคะแนน
	if pointType != "" {
		query = query.Where("type = ?", pointType)
	}
	
	result := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&pointHistory)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(pointHistory)
}

// GetMemberByID ดึงข้อมูลสมาชิกตาม ID
func GetMemberByID(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var member models.Member
	result := database.DB.Preload("PointHistories").Preload("RewardRedemptions.Reward").First(&member, "id = ?", id)
	
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
	}

	return c.JSON(member)
}

// GetMemberByNumber ดึงข้อมูลสมาชิกตามรหัสสมาชิก
func GetMemberByNumber(c *fiber.Ctx) error {
	memberNumber := c.Params("number")
	
	var member models.Member
	result := database.DB.Preload("PointHistories").Preload("RewardRedemptions.Reward").
		First(&member, "member_number = ?", memberNumber)
	
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
	}

	return c.JSON(member)
}

// CreateMember สร้างสมาชิกใหม่
func CreateMember(c *fiber.Ctx) error {
	var request struct {
		Name        string     `json:"name"`
		Phone       *string    `json:"phone"`
		Email       *string    `json:"email"`
		DateOfBirth *time.Time `json:"date_of_birth"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	if request.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}
	
	// ตรวจสอบเบอร์โทรซ้ำ
	if request.Phone != nil && *request.Phone != "" {
		var existingMember models.Member
		result := database.DB.First(&existingMember, "phone = ?", *request.Phone)
		if result.Error == nil {
			return c.Status(400).JSON(fiber.Map{"error": "Phone number already exists"})
		}
	}
	
	// สร้างรหัสสมาชิกใหม่
	memberNumber := generateMemberNumber()
	
	member := models.Member{
		BaseModel:       models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		MemberNumber:    memberNumber,
		Name:            request.Name,
		Phone:           request.Phone,
		Email:           request.Email,
		DateOfBirth:     request.DateOfBirth,
		TotalPoints:     0,
		AvailablePoints: 0,
		UsedPoints:      0,
		TotalSpent:      0,
		TotalOrders:     0,
		Tier:            "BRONZE",
		IsActive:        true,
	}
	
	result := database.DB.Create(&member)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	
	// สร้างประวัติคะแนนเริ่มต้น
	history := models.PointHistory{
		BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		MemberID:    member.ID,
		Type:        "BONUS",
		Points:      10, // คะแนนสมาชิกใหม่
		Description: "ยินดีต้อนรับสมาชิกใหม่",
	}
	database.DB.Create(&history)
	
	// อัพเดทคะแนนสมาชิก
	database.DB.Model(&member).Updates(models.Member{
		TotalPoints:     10,
		AvailablePoints: 10,
	})

	return c.Status(201).JSON(member)
}

// UpdateMember อัพเดทข้อมูลสมาชิก
func UpdateMember(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var member models.Member
	result := database.DB.First(&member, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
	}
	
	var updateData models.Member
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	updateData.UpdatedAt = time.Now()
	result = database.DB.Model(&member).Updates(updateData)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(member)
}

// EarnPoints เพิ่มคะแนนให้สมาชิก
func EarnPoints(c *fiber.Ctx) error {
	var request struct {
		MemberID    string  `json:"member_id"`
		OrderID     *string `json:"order_id"`
		Points      int     `json:"points"`
		Description string  `json:"description"`
		SpentAmount *float64 `json:"spent_amount"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	if request.Points <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Points must be positive"})
	}
	
	// ดึงข้อมูลสมาชิก
	var member models.Member
	result := database.DB.First(&member, "id = ?", request.MemberID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
	}
	
	// คำนวณคะแนนจากกฎ (ถ้ามีการใช้จ่าย)
	totalPoints := request.Points
	if request.SpentAmount != nil {
		extraPoints := calculatePointsFromRules(member, *request.SpentAmount)
		totalPoints += extraPoints
	}
	
	// สร้างประวัติคะแนน
	history := models.PointHistory{
		BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		MemberID:    request.MemberID,
		OrderID:     request.OrderID,
		Type:        "EARN",
		Points:      totalPoints,
		Description: request.Description,
		ExpiresAt:   getPointExpiryDate(), // คะแนนหมดอายุ 1 ปี
	}
	database.DB.Create(&history)
	
	// อัพเดทคะแนนสมาชิก
	newTotalPoints := member.TotalPoints + totalPoints
	newAvailablePoints := member.AvailablePoints + totalPoints
	
	updates := models.Member{
		TotalPoints:     newTotalPoints,
		AvailablePoints: newAvailablePoints,
		LastVisit:       &[]time.Time{time.Now()}[0],
	}
	
	// อัพเดทยอดใช้จ่ายและจำนวนออเดอร์
	if request.SpentAmount != nil {
		updates.TotalSpent = member.TotalSpent + *request.SpentAmount
		updates.TotalOrders = member.TotalOrders + 1
	}
	
	database.DB.Model(&member).Updates(updates)
	
	// ตรวจสอบการอัพเกรดระดับ
	checkTierUpgrade(member.ID)

	return c.JSON(fiber.Map{
		"message": "Points earned successfully",
		"points_earned": totalPoints,
		"new_balance": newAvailablePoints,
	})
}

// RedeemPoints ใช้คะแนน/แลกรางวัล
func RedeemPoints(c *fiber.Ctx) error {
	var request struct {
		MemberID string  `json:"member_id"`
		RewardID string  `json:"reward_id"`
		OrderID  *string `json:"order_id"`
		Notes    *string `json:"notes"`
	}
	
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	// ดึงข้อมูลสมาชิก
	var member models.Member
	result := database.DB.First(&member, "id = ?", request.MemberID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
	}
	
	// ดึงข้อมูลรางวัล
	var reward models.Reward
	result = database.DB.First(&reward, "id = ? AND is_active = ?", request.RewardID, true)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reward not found or inactive"})
	}
	
	// ตรวจสอบคะแนนเพียงพอ
	if member.AvailablePoints < reward.PointCost {
		return c.Status(400).JSON(fiber.Map{
			"error": "Insufficient points",
			"required": reward.PointCost,
			"available": member.AvailablePoints,
		})
	}
	
	// ตรวจสอบระดับสมาชิก
	if reward.RequiredTier != nil && !checkTierRequirement(member.Tier, *reward.RequiredTier) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Tier requirement not met",
			"required": *reward.RequiredTier,
			"current": member.Tier,
		})
	}
	
	// สร้างการแลกรางวัล
	redemption := models.RewardRedemption{
		BaseModel: models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		MemberID:  request.MemberID,
		RewardID:  request.RewardID,
		OrderID:   request.OrderID,
		PointsUsed: reward.PointCost,
		Status:    "PENDING",
		ExpiresAt: &[]time.Time{time.Now().AddDate(0, 0, 30)}[0], // หมดอายุ 30 วัน
		Notes:     request.Notes,
	}
	database.DB.Create(&redemption)
	
	// สร้างประวัติคะแนน
	history := models.PointHistory{
		BaseModel:     models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		MemberID:      request.MemberID,
		OrderID:       request.OrderID,
		Type:          "REDEEM",
		Points:        -reward.PointCost, // ลบคะแนน
		Description:   fmt.Sprintf("แลกรางวัล: %s", reward.Name),
		ReferenceType: stringPtr("REWARD"),
		ReferenceID:   &redemption.ID,
	}
	database.DB.Create(&history)
	
	// อัพเดทคะแนนสมาชิก
	newAvailablePoints := member.AvailablePoints - reward.PointCost
	newUsedPoints := member.UsedPoints + reward.PointCost
	
	database.DB.Model(&member).Updates(models.Member{
		AvailablePoints: newAvailablePoints,
		UsedPoints:      newUsedPoints,
		LastVisit:       &[]time.Time{time.Now()}[0],
	})
	
	// อัพเดทสถิติรางวัล
	database.DB.Model(&reward).Update("total_redemptions", reward.TotalRedemptions+1)

	return c.JSON(fiber.Map{
		"message": "Reward redeemed successfully",
		"redemption_id": redemption.ID,
		"points_used": reward.PointCost,
		"remaining_points": newAvailablePoints,
	})
}

// GetRewards ดึงรายการรางวัล
func GetRewards(c *fiber.Ctx) error {
	var rewards []models.Reward
	
	memberTier := c.Query("tier") // กรองตามระดับสมาชิก
	
	query := database.DB.Where("is_active = ?", true)
	
	// กรองตามระดับสมาชิก
	if memberTier != "" {
		query = query.Where("required_tier IS NULL OR required_tier = ?", memberTier)
	}
	
	result := query.Order("point_cost ASC").Find(&rewards)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}

	return c.JSON(rewards)
}

// GetMemberStats สstatistics สมาชิก
func GetMemberStats(c *fiber.Ctx) error {
	var stats struct {
		TotalMembers     int64   `json:"total_members"`
		ActiveMembers    int64   `json:"active_members"`
		BronzeMembers    int64   `json:"bronze_members"`
		SilverMembers    int64   `json:"silver_members"`
		GoldMembers      int64   `json:"gold_members"`
		PlatinumMembers  int64   `json:"platinum_members"`
		TotalPointsIssued int64  `json:"total_points_issued"`
		TotalPointsRedeemed int64 `json:"total_points_redeemed"`
	}
	
	database.DB.Model(&models.Member{}).Count(&stats.TotalMembers)
	database.DB.Model(&models.Member{}).Where("is_active = ?", true).Count(&stats.ActiveMembers)
	database.DB.Model(&models.Member{}).Where("tier = ?", "BRONZE").Count(&stats.BronzeMembers)
	database.DB.Model(&models.Member{}).Where("tier = ?", "SILVER").Count(&stats.SilverMembers)
	database.DB.Model(&models.Member{}).Where("tier = ?", "GOLD").Count(&stats.GoldMembers)
	database.DB.Model(&models.Member{}).Where("tier = ?", "PLATINUM").Count(&stats.PlatinumMembers)
	
	// รวมคะแนนที่ให้
	database.DB.Model(&models.PointHistory{}).Where("type = ? AND points > 0", "EARN").
		Select("COALESCE(SUM(points), 0)").Scan(&stats.TotalPointsIssued)
	
	// รวมคะแนนที่ใช้
	database.DB.Model(&models.PointHistory{}).Where("type = ? AND points < 0", "REDEEM").
		Select("COALESCE(SUM(ABS(points)), 0)").Scan(&stats.TotalPointsRedeemed)

	return c.JSON(stats)
}

// Helper functions
func generateMemberNumber() string {
	now := time.Now()
	return fmt.Sprintf("MEM%s%06d", now.Format("060102"), now.Unix()%1000000)
}

func calculatePointsFromRules(member models.Member, spentAmount float64) int {
	var rules []models.PointRule
	database.DB.Where("is_active = ? AND type = ?", true, "PURCHASE").
		Order("priority DESC").Find(&rules)
	
	totalPoints := 0
	
	for _, rule := range rules {
		if rule.SpendAmount != nil && rule.EarnPoints != nil {
			points := int(spentAmount / *rule.SpendAmount) * *rule.EarnPoints
			
			// ใช้ตัวคูณสำหรับระดับพิเศษ
			if rule.BonusMultiplier != nil && containsTier(rule.ApplicableTiers, member.Tier) {
				points = int(float64(points) * *rule.BonusMultiplier)
			}
			
			totalPoints += points
		}
	}
	
	return totalPoints
}

func getPointExpiryDate() *time.Time {
	expiry := time.Now().AddDate(1, 0, 0) // หมดอายุ 1 ปี
	return &expiry
}

func checkTierRequirement(currentTier, requiredTier string) bool {
	tiers := map[string]int{
		"BRONZE":   1,
		"SILVER":   2,
		"GOLD":     3,
		"PLATINUM": 4,
	}
	
	return tiers[currentTier] >= tiers[requiredTier]
}

func checkTierUpgrade(memberID string) {
	var member models.Member
	database.DB.First(&member, "id = ?", memberID)
	
	newTier := ""
	
	// กฎการอัพเกรดระดับ
	if member.TotalSpent >= 50000 && member.TotalOrders >= 100 {
		newTier = "PLATINUM"
	} else if member.TotalSpent >= 20000 && member.TotalOrders >= 50 {
		newTier = "GOLD"
	} else if member.TotalSpent >= 5000 && member.TotalOrders >= 20 {
		newTier = "SILVER"
	}
	
	if newTier != "" && newTier != member.Tier {
		// อัพเกรดระดับ
		database.DB.Model(&member).Update("tier", newTier)
		
		// บันทึกประวัติการอัพเกรด
		upgrade := models.TierUpgrade{
			BaseModel:     models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			MemberID:      memberID,
			FromTier:      member.Tier,
			ToTier:        newTier,
			AchievedSpend: member.TotalSpent,
			AchievedOrders: member.TotalOrders,
			UpgradeDate:   time.Now(),
		}
		database.DB.Create(&upgrade)
		
		// ให้คะแนนโบนัสการอัพเกรด
		bonusPoints := 50
		if newTier == "PLATINUM" {
			bonusPoints = 200
		} else if newTier == "GOLD" {
			bonusPoints = 100
		}
		
		history := models.PointHistory{
			BaseModel:   models.BaseModel{ID: uuid.New().String(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			MemberID:    memberID,
			Type:        "BONUS",
			Points:      bonusPoints,
			Description: fmt.Sprintf("โบนัสอัพเกรดเป็นสมาชิก%s", newTier),
		}
		database.DB.Create(&history)
		
		// อัพเดทคะแนน
		database.DB.Model(&member).Updates(models.Member{
			TotalPoints:     member.TotalPoints + bonusPoints,
			AvailablePoints: member.AvailablePoints + bonusPoints,
		})
	}
}

func containsTier(tiers []string, tier string) bool {
	for _, t := range tiers {
		if t == tier {
			return true
		}
	}
	return false
}
