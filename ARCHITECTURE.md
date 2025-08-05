# Coffee PuLa - Full Stack Configuration

## Architecture
- **Frontend**: Next.js 15 (Port 3000) - React-based UI
- **Backend**: Go Fiber (Port 8080) - High-performance API server
- **Database**: SQLite with GORM - Lightweight persistence

## API Base URLs
- Development: http://localhost:8080/api
- Frontend: http://localhost:3000

## Backend Features ✅
- 🏪 Menu Management (Categories, Products)
- 📝 Order Processing with Auto Stock Deduction
- 📦 Inventory Management (Ingredients, Stock)
- 🧪 Recipe Management (Product-Ingredient Relations) 
- 📊 Stock Movement Tracking
- 🚀 High Performance Go Fiber Framework

## Frontend Updates Needed
1. Update API calls to use http://localhost:8080/api
2. Modify inventory page to use new Go endpoints
3. Update recipe management for new API structure
4. Test auto stock deduction on POS orders

## Next Steps
1. Update Frontend API endpoints ✅
2. Test inventory system integration
3. Implement recipe-inventory linking  
4. Add low stock alerts from backend
5. Deploy both services
