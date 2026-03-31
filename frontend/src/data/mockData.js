export const mockProducts = [
  { id: 1, name: 'Wireless Headphones Pro', category: 'Electronics', price: 129.99, stock: 45, status: true, image: 'https://placehold.co/60x60/e0f2fe/0ea5e9?text=HP' },
  { id: 2, name: 'Running Sneakers X3', category: 'Footwear', price: 89.99, stock: 120, status: true, image: 'https://placehold.co/60x60/fce7f3/ec4899?text=RS' },
  { id: 3, name: 'Leather Wallet Slim', category: 'Accessories', price: 34.99, stock: 0, status: false, image: 'https://placehold.co/60x60/fef3c7/f59e0b?text=LW' },
  { id: 4, name: 'Smart Watch Series 5', category: 'Electronics', price: 249.99, stock: 30, status: true, image: 'https://placehold.co/60x60/d1fae5/10b981?text=SW' },
  { id: 5, name: 'Cotton Hoodie Oversized', category: 'Clothing', price: 59.99, stock: 85, status: true, image: 'https://placehold.co/60x60/ede9fe/7c3aed?text=CH' },
  { id: 6, name: 'Yoga Mat Premium', category: 'Sports', price: 44.99, stock: 60, status: false, image: 'https://placehold.co/60x60/fee2e2/ef4444?text=YM' },
  { id: 7, name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 79.99, stock: 25, status: true, image: 'https://placehold.co/60x60/e0f2fe/0ea5e9?text=BS' },
  { id: 8, name: 'Stainless Steel Bottle', category: 'Accessories', price: 24.99, stock: 200, status: true, image: 'https://placehold.co/60x60/d1fae5/10b981?text=SB' },
]

export const mockCategories = [
  { id: 1, name: 'Electronics', description: 'Gadgets, devices and tech accessories', products: 12, status: true, icon: '💻' },
  { id: 2, name: 'Clothing', description: 'Apparel and fashion items', products: 45, status: true, icon: '👕' },
  { id: 3, name: 'Footwear', description: 'Shoes, sandals, boots and more', products: 28, status: true, icon: '👟' },
  { id: 4, name: 'Accessories', description: 'Bags, wallets, belts and jewellery', products: 33, status: false, icon: '👜' },
  { id: 5, name: 'Sports', description: 'Sports and fitness equipment', products: 19, status: true, icon: '🏋️' },
  { id: 6, name: 'Home & Living', description: 'Decor, furniture, kitchenware', products: 22, status: true, icon: '🏠' },
]

export const mockUsers = [
  { id: 1, name: 'Aisha Patel', email: 'aisha@example.com', role: 'Customer', orders: 12, joined: '2024-01-15', status: true, avatar: 'AP' },
  { id: 2, name: 'James Kowalski', email: 'james@example.com', role: 'Customer', orders: 5, joined: '2024-02-20', status: true, avatar: 'JK' },
  { id: 3, name: 'Sara Mendez', email: 'sara@example.com', role: 'Admin', orders: 0, joined: '2023-11-10', status: true, avatar: 'SM' },
  { id: 4, name: 'David Chen', email: 'david@example.com', role: 'Customer', orders: 8, joined: '2024-03-05', status: false, avatar: 'DC' },
  { id: 5, name: 'Priya Sharma', email: 'priya@example.com', role: 'Customer', orders: 21, joined: '2023-09-18', status: true, avatar: 'PS' },
  { id: 6, name: 'Omar Hassan', email: 'omar@example.com', role: 'Moderator', orders: 0, joined: '2024-01-28', status: true, avatar: 'OH' },
]

export const mockBanners = [
  { id: 1, title: 'Summer Sale 2024', subtitle: 'Up to 50% off on all products', image: 'https://placehold.co/300x100/0ea5e9/fff?text=Summer+Sale', link: '/sale', status: true, position: 'Hero' },
  { id: 2, title: 'New Arrivals', subtitle: 'Explore the latest collection', image: 'https://placehold.co/300x100/7c3aed/fff?text=New+Arrivals', link: '/new', status: true, position: 'Sidebar' },
  { id: 3, title: 'Free Shipping', subtitle: 'On orders above $50', image: 'https://placehold.co/300x100/10b981/fff?text=Free+Shipping', link: '/shipping', status: false, position: 'Footer' },
  { id: 4, title: 'Flash Deal Friday', subtitle: 'Limited time offers every Friday', image: 'https://placehold.co/300x100/f59e0b/fff?text=Flash+Deal', link: '/deals', status: true, position: 'Hero' },
]

export const mockOrders = [
  { id: '#ORD-1001', customer: 'Aisha Patel', email: 'aisha@example.com', items: 3, total: 289.97, status: 'Delivered', date: '2024-03-10', payment: 'Credit Card' },
  { id: '#ORD-1002', customer: 'James Kowalski', email: 'james@example.com', items: 1, total: 89.99, status: 'Processing', date: '2024-03-12', payment: 'PayPal' },
  { id: '#ORD-1003', customer: 'Priya Sharma', email: 'priya@example.com', items: 5, total: 454.95, status: 'Shipped', date: '2024-03-11', payment: 'Credit Card' },
  { id: '#ORD-1004', customer: 'David Chen', email: 'david@example.com', items: 2, total: 164.98, status: 'Cancelled', date: '2024-03-09', payment: 'Debit Card' },
  { id: '#ORD-1005', customer: 'Sara Mendez', email: 'sara@example.com', items: 4, total: 339.96, status: 'Pending', date: '2024-03-13', payment: 'PayPal' },
  { id: '#ORD-1006', customer: 'Omar Hassan', email: 'omar@example.com', items: 1, total: 249.99, status: 'Delivered', date: '2024-03-08', payment: 'Credit Card' },
  { id: '#ORD-1007', customer: 'Aisha Patel', email: 'aisha@example.com', items: 2, total: 154.98, status: 'Shipped', date: '2024-03-14', payment: 'PayPal' },
]

export const chartData = [
  { month: 'Oct', revenue: 4200, orders: 38 },
  { month: 'Nov', revenue: 5800, orders: 52 },
  { month: 'Dec', revenue: 8900, orders: 79 },
  { month: 'Jan', revenue: 6100, orders: 55 },
  { month: 'Feb', revenue: 7200, orders: 64 },
  { month: 'Mar', revenue: 9400, orders: 88 },
]
