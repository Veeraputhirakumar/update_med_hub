import { useState } from 'react';
import { 
  ShoppingCart, Check, Plus, Minus, MapPin, Clock, DollarSign, 
  Star, Truck, Store, Smartphone, QrCode, Share2, Download,
  Apple, Milk, Beef, Carrot, Wheat, Fish, Egg
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  estimatedPrice: number;
  priority: 'high' | 'medium' | 'low';
  alternatives: string[];
  nutritionalBenefit: string;
  checked: boolean;
  organic?: boolean;
  local?: boolean;
}

interface ShoppingListProps {
  mealPlan?: any[];
  budget: string;
  onClose?: () => void;
}

const ShoppingListGenerator = ({ mealPlan = [], budget, onClose }: ShoppingListProps) => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    {
      id: '1',
      name: 'Organic Spinach',
      quantity: '2',
      unit: 'bunches',
      category: 'Vegetables',
      estimatedPrice: 60,
      priority: 'high',
      alternatives: ['Regular spinach', 'Kale', 'Arugula'],
      nutritionalBenefit: 'Iron, Folate, Vitamin K',
      checked: false,
      organic: true,
      local: true
    },
    {
      id: '2',
      name: 'Greek Yogurt',
      quantity: '1',
      unit: 'large container',
      category: 'Dairy',
      estimatedPrice: 180,
      priority: 'high',
      alternatives: ['Regular yogurt', 'Plant-based yogurt'],
      nutritionalBenefit: 'Probiotics, Protein, Calcium',
      checked: false
    },
    {
      id: '3',
      name: 'Quinoa',
      quantity: '500',
      unit: 'grams',
      category: 'Grains',
      estimatedPrice: 320,
      priority: 'medium',
      alternatives: ['Brown rice', 'Millet', 'Bulgur'],
      nutritionalBenefit: 'Complete protein, Fiber',
      checked: false
    },
    {
      id: '4',
      name: 'Salmon Fillet',
      quantity: '4',
      unit: 'pieces',
      category: 'Protein',
      estimatedPrice: 800,
      priority: 'high',
      alternatives: ['Mackerel', 'Sardines', 'Tofu'],
      nutritionalBenefit: 'Omega-3, High-quality protein',
      checked: false
    },
    {
      id: '5',
      name: 'Avocados',
      quantity: '3',
      unit: 'pieces',
      category: 'Fruits',
      estimatedPrice: 150,
      priority: 'medium',
      alternatives: ['Olive oil', 'Nuts', 'Seeds'],
      nutritionalBenefit: 'Healthy fats, Fiber, Potassium',
      checked: false
    },
    {
      id: '6',
      name: 'Turmeric Powder',
      quantity: '1',
      unit: 'packet',
      category: 'Spices',
      estimatedPrice: 40,
      priority: 'low',
      alternatives: ['Fresh turmeric', 'Ginger powder'],
      nutritionalBenefit: 'Anti-inflammatory, Antioxidants',
      checked: false,
      organic: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('list');
  const [totalBudget, setTotalBudget] = useState(2000);

  const categories = ['All', 'Vegetables', 'Fruits', 'Protein', 'Dairy', 'Grains', 'Spices'];
  
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Vegetables': Carrot,
      'Fruits': Apple,
      'Protein': Beef,
      'Dairy': Milk,
      'Grains': Wheat,
      'Spices': Star
    };
    return icons[category] || ShoppingCart;
  };

  const getTotalPrice = () => {
    return shoppingList.reduce((total, item) => total + (item.checked ? 0 : item.estimatedPrice), 0);
  };

  const getCheckedItems = () => {
    return shoppingList.filter(item => item.checked).length;
  };

  const toggleItemCheck = (id: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const getBudgetColor = () => {
    const total = getTotalPrice();
    if (total <= totalBudget * 0.8) return 'text-green-600';
    if (total <= totalBudget) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Smart Shopping List
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                {getCheckedItems()}/{shoppingList.length} items
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Shopping List
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Tracker
              </TabsTrigger>
              <TabsTrigger value="stores" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Store Locator
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivery
              </TabsTrigger>
            </TabsList>

            {/* Shopping List Tab */}
            <TabsContent value="list" className="p-6">
              {/* Budget Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Total Estimated Cost</h3>
                    <p className={`text-2xl font-bold ${getBudgetColor()}`}>
                      ₹{getTotalPrice()}
                    </p>
                    <p className="text-sm text-gray-600">Budget: ₹{totalBudget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Items remaining</p>
                    <p className="text-lg font-semibold">{shoppingList.length - getCheckedItems()}</p>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Shopping Items */}
              <div className="space-y-3">
                {shoppingList.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-all ${
                        item.checked ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItemCheck(item.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <CategoryIcon className="w-5 h-5 text-gray-500" />
                              <div>
                                <h4 className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} {item.unit} • {item.category}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className={`font-semibold ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                ₹{item.estimatedPrice}
                              </p>
                              <div className="flex gap-1 mt-1">
                                <Badge className={getPriorityColor(item.priority)} size="sm">
                                  {item.priority}
                                </Badge>
                                {item.organic && (
                                  <Badge className="bg-green-100 text-green-800" size="sm">
                                    Organic
                                  </Badge>
                                )}
                                {item.local && (
                                  <Badge className="bg-blue-100 text-blue-800" size="sm">
                                    Local
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-1">
                                💚 {item.nutritionalBenefit}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Alternatives:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.alternatives.slice(0, 2).map((alt, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {alt}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-blue-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share List
                </Button>
                <Button variant="outline" className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </TabsContent>

            {/* Budget Tracker Tab */}
            <TabsContent value="budget" className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Total Budget</p>
                      <p className="text-xl font-bold text-gray-900">₹{totalBudget}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Current Total</p>
                      <p className={`text-xl font-bold ${getBudgetColor()}`}>₹{getTotalPrice()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Minus className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-xl font-bold text-gray-900">₹{totalBudget - getTotalPrice()}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.slice(1).map((category) => {
                        const categoryItems = shoppingList.filter(item => item.category === category);
                        const categoryTotal = categoryItems.reduce((sum, item) => sum + item.estimatedPrice, 0);
                        const percentage = totalBudget > 0 ? (categoryTotal / totalBudget) * 100 : 0;
                        
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                category === 'Vegetables' ? 'from-green-400 to-green-600' :
                                category === 'Fruits' ? 'from-red-400 to-red-600' :
                                category === 'Protein' ? 'from-purple-400 to-purple-600' :
                                category === 'Dairy' ? 'from-blue-400 to-blue-600' :
                                category === 'Grains' ? 'from-yellow-400 to-yellow-600' :
                                'from-gray-400 to-gray-600'
                              }`}></div>
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-xs text-gray-500">({categoryItems.length} items)</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">₹{categoryTotal}</span>
                              <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Store Locator Tab */}
            <TabsContent value="stores" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Nearby Stores</h3>
                </div>

                {[
                  { name: 'Fresh Market Organic', distance: '0.8 km', rating: 4.5, type: 'Organic Store' },
                  { name: 'BigBasket Store', distance: '1.2 km', rating: 4.2, type: 'Supermarket' },
                  { name: 'Nature\'s Basket', distance: '2.1 km', rating: 4.7, type: 'Premium Store' },
                  { name: 'Local Vegetable Market', distance: '0.5 km', rating: 4.0, type: 'Traditional Market' }
                ].map((store, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Store className="w-8 h-8 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{store.name}</h4>
                            <p className="text-sm text-gray-600">{store.type} • {store.distance}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{store.rating}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="p-6">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Truck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Everything Delivered</h3>
                  <p className="text-gray-600">Choose from multiple delivery partners</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'BigBasket', time: '2-4 hours', fee: 'Free above ₹200', logo: '🛒' },
                    { name: 'Grofers (Blinkit)', time: '10-15 mins', fee: '₹25', logo: '⚡' },
                    { name: 'Amazon Fresh', time: 'Same day', fee: 'Free above ₹500', logo: '📦' },
                    { name: 'Swiggy Instamart', time: '15-30 mins', fee: '₹35', logo: '🍽️' }
                  ].map((service, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{service.logo}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">Delivery: {service.time}</p>
                            <p className="text-sm text-gray-600">Fee: {service.fee}</p>
                          </div>
                          <Button size="sm">
                            Order Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Smart Shopping Assistant</h4>
                        <p className="text-sm text-gray-600">
                          Get notifications when items go on sale or when it's the best time to buy seasonal produce
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingListGenerator;
