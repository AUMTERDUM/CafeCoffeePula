'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Plus, Edit, Trash2, ArrowLeft, Clock, Coffee } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import { recipeAPI, menuAPI, inventoryAPI } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  costPerUnit: number;
}

interface RecipeIngredient {
  id: string;
  quantity: number;
  ingredient: Ingredient;
}

interface Recipe {
  id: string;
  productId: string;
  instructions?: string;
  prepTime?: number;
  product: Product;
  ingredients: RecipeIngredient[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [recipeForm, setRecipeForm] = useState({
    instructions: '',
    prepTime: 0,
    ingredients: [] as { ingredientId: string; quantity: number }[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesData, productsData, ingredientsData] = await Promise.all([
        recipeAPI.getRecipes(),
        menuAPI.getMenu(),
        inventoryAPI.getIngredients()
      ]);

      setRecipes(recipesData);
      setProducts(productsData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!selectedProduct || recipeForm.ingredients.length === 0) return;

    try {
      const recipeData = {
        product_id: selectedProduct,
        instructions: recipeForm.instructions || null,
        prep_time: recipeForm.prepTime || null,
        ingredients: recipeForm.ingredients.filter(ing => ing.quantity > 0).map(ing => ({
          ingredient_id: ing.ingredientId,
          quantity: ing.quantity
        }))
      };

      if (editingRecipe) {
        await recipeAPI.updateRecipe(editingRecipe.id, recipeData);
      } else {
        await recipeAPI.createRecipe(recipeData);
      }
      
      fetchData();
      setShowRecipeModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสูตร: ' + (error as Error).message);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm('คุณแน่ใจหรือว่าต้องการลบสูตรนี้?')) {
      try {
        await recipeAPI.deleteRecipe(recipeId);
        fetchData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('เกิดข้อผิดพลาดในการลบสูตร: ' + (error as Error).message);
      }
    }
  };

  const resetForm = () => {
    setEditingRecipe(null);
    setSelectedProduct('');
    setRecipeForm({
      instructions: '',
      prepTime: 0,
      ingredients: []
    });
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedProduct(recipe.productId);
    setRecipeForm({
      instructions: recipe.instructions || '',
      prepTime: recipe.prepTime || 0,
      ingredients: recipe.ingredients.map(ing => ({
        ingredientId: ing.ingredient.id,
        quantity: ing.quantity
      }))
    });
    setShowRecipeModal(true);
  };

  const addIngredientToRecipe = () => {
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { ingredientId: '', quantity: 0 }]
    });
  };

  const updateRecipeIngredient = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const removeRecipeIngredient = (index: number) => {
    const newIngredients = recipeForm.ingredients.filter((_, i) => i !== index);
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const calculateRecipeCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total, ing) => {
      return total + (ing.quantity * ing.ingredient.costPerUnit);
    }, 0);
  };

  const availableProducts = products.filter(product => 
    !recipes.some(recipe => recipe.productId === product.id) || 
    (editingRecipe && editingRecipe.productId === product.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-[var(--coffee-brown)] mx-auto mb-4 animate-pulse" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลดสูตรอาหาร...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coffee-theme">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[var(--coffee-light)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/inventory" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-[var(--coffee-brown)]" />
              </Link>
              <ChefHat className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
              <h1 className="text-2xl font-bold text-[var(--coffee-dark)]">จัดการสูตรอาหาร</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRecipeModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มสูตรใหม่
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const recipeCost = calculateRecipeCost(recipe);
            const profitMargin = recipe.product.price - recipeCost;
            const profitPercentage = (profitMargin / recipe.product.price) * 100;

            return (
              <div key={recipe.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {recipe.product.image && (
                      <img
                        src={recipe.product.image}
                        alt={recipe.product.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-[var(--coffee-dark)]">
                        {recipe.product.name}
                      </h3>
                      <p className="text-sm text-[var(--coffee-medium)]">
                        ราคาขาย: ฿{recipe.product.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(recipe)}
                      className="text-[var(--coffee-brown)] hover:text-[var(--coffee-dark)]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prep Time */}
                {recipe.prepTime && (
                  <div className="flex items-center mb-3 text-sm text-[var(--coffee-medium)]">
                    <Clock className="w-4 h-4 mr-1" />
                    เวลาเตรียม: {recipe.prepTime} นาที
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-4">
                  <h4 className="font-semibold text-[var(--coffee-dark)] mb-2">วัตถุดิบ:</h4>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ing) => (
                      <div key={ing.id} className="flex justify-between text-sm">
                        <span className="text-[var(--coffee-medium)]">
                          {ing.ingredient.name}
                        </span>
                        <span className="text-[var(--coffee-dark)]">
                          {ing.quantity} {ing.ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Analysis */}
                <div className="border-t border-[var(--coffee-light)] pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--coffee-medium)]">ต้นทุนวัตถุดิบ:</span>
                    <span className="text-[var(--coffee-dark)]">฿{recipeCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--coffee-medium)]">กำไร:</span>
                    <span className={profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                      ฿{profitMargin.toFixed(2)} ({profitPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                {recipe.instructions && (
                  <div className="mt-3 pt-3 border-t border-[var(--coffee-light)]">
                    <p className="text-sm text-[var(--coffee-medium)]">
                      {recipe.instructions}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-[var(--coffee-light)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--coffee-medium)] mb-2">
              ยังไม่มีสูตรอาหาร
            </h3>
            <p className="text-[var(--coffee-medium)] mb-4">
              เริ่มต้นสร้างสูตรสำหรับเมนูของคุณ
            </p>
            <button
              onClick={() => setShowRecipeModal(true)}
              className="btn-primary"
            >
              เพิ่มสูตรแรก
            </button>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-modern-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">
              {editingRecipe ? 'แก้ไขสูตร' : 'เพิ่มสูตรใหม่'}
            </h3>

            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  เลือกเมนู
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="cute-input w-full"
                  disabled={!!editingRecipe}
                >
                  <option value="">-- เลือกเมนู --</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (฿{product.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  วิธีทำ (ไม่บังคับ)
                </label>
                <textarea
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                  placeholder="อธิบายขั้นตอนการทำ..."
                  className="cute-input w-full h-20"
                />
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  เวลาเตรียม (นาที)
                </label>
                <input
                  type="number"
                  min="0"
                  value={recipeForm.prepTime}
                  onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: parseInt(e.target.value) || 0 })}
                  className="cute-input w-full"
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-[var(--coffee-dark)]">
                    วัตถุดิบ
                  </label>
                  <button
                    type="button"
                    onClick={addIngredientToRecipe}
                    className="btn-secondary text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    เพิ่มวัตถุดิบ
                  </button>
                </div>

                <div className="space-y-3">
                  {recipeForm.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <select
                        value={ing.ingredientId}
                        onChange={(e) => updateRecipeIngredient(index, 'ingredientId', e.target.value)}
                        className="cute-input flex-1"
                      >
                        <option value="">-- เลือกวัตถุดิบ --</option>
                        {ingredients.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.quantity}
                        onChange={(e) => updateRecipeIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="จำนวน"
                        className="cute-input w-24"
                      />
                      <button
                        type="button"
                        onClick={() => removeRecipeIngredient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRecipeModal(false);
                  resetForm();
                }}
                className="btn-secondary flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveRecipe}
                className="btn-primary flex-1"
                disabled={!selectedProduct || recipeForm.ingredients.length === 0}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
