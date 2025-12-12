import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, DollarSign, Users, Search, Filter, ShoppingBag, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../header_footer";
import ProductModal from './ProductModal';
import StatCard from './StatCard';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const SellerHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({total_revenue: 0, total_products: 0, total_orders: 0, average_rating: 0});
  const [orders, setOrders] = useState([]);
  
  const categories = {
    "Men's Clothing": ["Shirts", "T-Shirts", "Jeans", "Trousers", "Jackets"],
    "Women's Clothing": ["Ethnic Wear", "Western Wear", "Dresses", "Tops", "Bottoms"],
    "Electronics": ["Mobile Phones", "Laptops", "Accessories", "Audio"],
    "Home & Living": ["Furniture", "Decor", "Kitchen", "Bedding"]
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Gray"];

  const handleSizeToggle = (size) => {
    setNewProduct(prev => ({
      ...prev,
      size: prev.size.includes(size) 
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  const handleColorToggle = (color) => {
    setNewProduct(prev => ({
      ...prev,
      color: prev.color.includes(color)
        ? prev.color.filter(c => c !== color)
        : [...prev.color, color]
    }));
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    stock: '',
    description: '',
    brand: '',
    material: '',
    size: [],
    color: [],
    images: []
  });

  useEffect(() => {
    // Check if user is a seller
    const userType = localStorage.getItem('userType');

    fetchSellerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchSellerData = async () => {
    setIsLoading(true);
    try {
      const sellerId = localStorage.getItem('userId');
      
      if (!sellerId) {
        console.error('No seller ID found in localStorage');
        alert('Please log in again to access your dashboard');
        navigate('/login');
        return;
      }
      
      try {
        // Fetch products
        const productsResponse = await fetch(`${BASE_URL}/api/seller/products?seller_id=${sellerId}`);
        if (!productsResponse.ok) {
          throw new Error(`Products API error: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();
        
        // Process products data
        let processedProducts = [];
        if (Array.isArray(productsData)) {
          processedProducts = productsData;
        } else if (productsData && typeof productsData === 'object') {
          // Check if it's an object with a products property
          if (Array.isArray(productsData.products)) {
            processedProducts = productsData.products;
          } else {
            // If it's just an object, convert it to an array
            const keys = Object.keys(productsData).filter(key => key !== 'success' && key !== 'message');
            if (keys.length > 0) {
              processedProducts = keys.map(key => productsData[key]);
            }
          }
        }
        
        // Ensure all products have valid image arrays
        processedProducts = processedProducts.map(product => ({
          ...product,
          images: Array.isArray(product.images) ? product.images : [],
          size: Array.isArray(product.size) ? product.size : [],
          color: Array.isArray(product.color) ? product.color : []
        }));
        
        setProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Continue with other fetches even if products fetch fails
      }
      
      try {
        // Fetch analytics
        const analyticsResponse = await fetch(`${BASE_URL}/api/seller/analytics?seller_id=${sellerId}`);
        if (!analyticsResponse.ok) {
          throw new Error(`Analytics API error: ${analyticsResponse.status}`);
        }
        
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Continue with other fetches even if analytics fetch fails
      }

      try {
        // Fetch orders
        const ordersResponse = await fetch(`${BASE_URL}/api/seller/orders?seller_id=${sellerId}`);
        if (!ordersResponse.ok) {
          throw new Error(`Orders API error: ${ordersResponse.status}`);
        }
        
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Continue even if orders fetch fails
      }
    } catch (error) {
      console.error('Error in fetchSellerData:', error);
      alert('There was a problem loading your dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.subcategory || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const sellerId = localStorage.getItem('userId');
      console.log('Adding product with seller ID:', sellerId);
      
      if (!sellerId) {
        alert('Seller ID not found. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Ensure arrays are properly formatted
      const formattedImages = Array.isArray(newProduct.images) ? newProduct.images : [];
      const formattedSizes = Array.isArray(newProduct.size) ? newProduct.size : [];
      const formattedColors = Array.isArray(newProduct.color) ? newProduct.color : [];
      
      const productData = {
        ...newProduct,
        seller_id: sellerId,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        status: "Active",
        orders: 0,
        rating: 0,
        images: formattedImages,
        size: formattedSizes,
        color: formattedColors,
        created_at: new Date().toISOString()
      };

      console.log('Sending product data:', productData);

      const response = await fetch(`${BASE_URL}/api/seller/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        alert('Product added successfully!');
        fetchSellerData(); // Refresh products list
        resetForm();
        setShowAddProduct(false);
      } else {
        alert('Failed to add product: ' + (responseData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('An error occurred while adding the product');
    }
  };

  const handleEditProduct = async (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      brand: product.brand || '',
      material: product.material || '',
      size: product.size || [],
      color: product.color || [],
      images: product.images || []
    });
    setShowAddProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.subcategory || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const sellerId = localStorage.getItem('userId');
      const productData = {
        ...newProduct,
        seller_id: sellerId,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        status: "Active",
        orders: 0,
        rating: 0
      };

      if (editingProduct) {
        const response = await fetch(`${BASE_URL}/api/seller/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          fetchSellerData(); // Refresh products list
        } else {
          const error = await response.json();
          alert('Failed to update product: ' + error.error);
        }
      } else {
        await handleAddProduct();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving the product');
    }

    resetForm();
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/seller/products/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchSellerData(); // Refresh products list
        } else {
          const error = await response.json();
          alert('Failed to delete product: ' + error.error);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting the product');
      }
    }
  };


  const resetForm = () => {
    setNewProduct({
      name: '', category: '', subcategory: '', price: '', stock: '',
      description: '', brand: '', material: '', size: [], color: [], images: []
    });
  };

 
  const handleCloseModal = () => {
    resetForm();
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  return (
    <div className='relative h-full w-full overflow-hidden'>
      {/* {loading && (<>
          <div className="toast-overlay" />
          <div className="toast-message processing">Loading the Data...</div>
      </>)}
      {error && (<>
        <div className="toast-overlay" onClick={() => setError(null)} />
        <div className="toast-message error" onClick={() => setError(null)}>{error}</div>
      </>)} */}

      <Header userType={"sellers"}/>

      <div className="main-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <div className="section-header">
                  <div className="title-container">
                    <Package size={28} style={{ color: '#3b82f6' }} />
                    <h2 className="page-title">Dashboard Overview</h2>
                  </div>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="add-button"
                  >
                    <Plus size={20} />
                    <span>Add Product</span>
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                  <StatCard
                    icon={Package}
                    title="Total Products"
                    value={analytics.total_products.toString()}
                    change="+2 this week"
                    color="#10B981"
                  />
                  <StatCard
                    icon={Users}
                    title="Total Orders"
                    value={analytics.total_orders.toString()}
                    change="+12 this week"
                    color="#3B82F6"
                  />
                  <StatCard
                    icon={DollarSign}
                    title="Total Revenue"
                    value={`₹${analytics.total_revenue.toLocaleString()}`}
                    change="+8.2% this month"
                    color="#F59E0B"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title="Avg. Rating"
                    value={analytics.average_rating.toString()}
                    change="+0.1 this month"
                    color="#EF4444"
                  />
                </div>

                <div className="card">
                  <h3 className="card-title">Recent Products</h3>
                  {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      <Package style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#D1D5DB' }} />
                      <p>No products added yet. Click the "Add Product" button to add your first product.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Product</th>
                            <th className="table-header">Category</th>
                            <th className="table-header">Price</th>
                            <th className="table-header">Stock</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 5).map((product) => (
                            <tr key={product._id} className="table-row">
                              <td className="table-cell">
                                <div className="product-info">
                                  <img src={product.images[0] || "https://via.placeholder.com/100"} alt={product.name} className="product-image" />
                                  <span style={{ fontWeight: '500' }}>{product.name}</span>
                                </div>
                              </td>
                              <td className="table-cell" style={{ color: '#6B7280' }}>{product.category}</td>
                              <td className="table-cell" style={{ fontWeight: '600', color: '#10B981' }}>₹{product.price}</td>
                              <td className="table-cell">{product.stock}</td>
                              <td className="table-cell">
                                <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                  {product.status}
                                </span>
                              </td>
                              <td className="table-cell">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => handleEditProduct(product)}
                                    className="edit-button"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                  >
                                    <Edit style={{ height: '12px', width: '12px' }} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="delete-button"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                  >
                                    <Trash2 style={{ height: '12px', width: '12px' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

  
            {activeTab === 'products' && (
              <div>
                <div className="section-header">
                  <div className="title-container">
                    <Package size={28} style={{ color: '#3b82f6' }} />
                    <h2 className="page-title">Manage Products</h2>
                  </div>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="add-button"
                  >
                    <Plus size={20} />
                    <span>Add New Product</span>
                  </button>
                </div><div className="search-section">
                  <div className="search-container">
                    <div className="search-input-container">
                      <Search className="search-icon" size={20} />
                      <input
                        type="text"
                        placeholder="Search products by name, category, or ID..."
                        className="search-input"
                      />
                    </div>
                    <button className="filter-button">
                      <Filter size={20} />
                      <span>Filters</span>
                    </button>
                  </div>
                </div><div className="products-grid">
                  {products.length === 0 ? (
                    <div className="no-products">
                      <Package style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#D1D5DB' }} />
                      <p>No products added yet. Click the "Add Product" button to add your first product.</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product._id} className="product-card">
                        <div className="product-image-container">
                          <img 
                            src={product.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"} 
                            alt={product.name} 
                            className="product-image-large" 
                            loading="lazy"
                            onError={(e) => {
                              console.warn(`Failed to load image for product: ${product.name}`);
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x200?text=Product+Image";
                            }}
                          />
                        </div>
                        <div className="product-content">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{product.category} • {product.subcategory}</p>
                          <div className="product-details">
                            <div>
                              <strong>Sizes:</strong> {(product.size || []).join(', ') || 'N/A'}
                            </div>
                            <div>
                              <strong>Colors:</strong> {(product.color || []).join(', ') || 'N/A'}
                            </div>
                          </div>
                          <div className="product-pricing">
                            <span className="product-price">{product.price}</span>
                            <span className="product-stock">Stock: {product.stock}</span>
                          </div>
                          <div className="product-meta">
                            <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                              {product.status}
                            </span>
                            <div className="product-stats">
                              {product.orders || 0} orders • ⭐ {product.rating || 0}
                            </div>
                          </div>
                          <div className="product-actions">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="edit-button"
                            >
                              <Edit style={{ height: '16px', width: '16px' }} />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="delete-button"
                            >
                              <Trash2 style={{ height: '16px', width: '16px' }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="section-header">
                  <div className="title-container">
                    <ShoppingBag size={28} style={{ color: '#3b82f6' }} />
                    <h2 className="page-title">Order Management</h2>
                  </div>
                </div>
                <div className="card">
                  <h3 className="card-title">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      <Package style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#D1D5DB' }} />
                      <p>No orders found. Orders will appear here once customers start purchasing your products.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Order ID</th>
                            <th className="table-header">Customer</th>
                            <th className="table-header">Products</th>
                            <th className="table-header">Total Amount</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Order Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id} className="table-row">
                              <td className="table-cell">#{order._id.slice(-6)}</td>
                              <td className="table-cell">
                                <div className="customer-info">
                                  <span style={{ fontWeight: '500' }}>{order.customer_name}</span>
                                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>{order.customer_email}</span>
                                </div>
                              </td>
                              <td className="table-cell">
                                {order.products.map(product => product.name).join(', ')}
                              </td>
                              <td className="table-cell" style={{ fontWeight: '600', color: '#10B981' }}>
                                ₹{order.total_amount}
                              </td>
                              <td className="table-cell">
                                <span className={`status-badge ${
                                  order.status === 'Delivered' ? 'status-active' : 
                                  order.status === 'Pending' ? 'status-pending' : 
                                  'status-inactive'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="table-cell">
                                {new Date(order.order_date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="section-header">
                  <div className="title-container">
                    <BarChart2 size={28} style={{ color: '#3b82f6' }} />
                    <h2 className="page-title">Analytics & Reports</h2>
                  </div>
                </div>
                <div className="card">
                  <h3 className="card-title">Sales Analytics</h3>
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    <TrendingUp style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#D1D5DB' }} />
                    <p>Analytics dashboard coming soon. Track your sales performance, customer insights, and revenue trends.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    
      {showAddProduct && (
        <ProductModal
          show={showAddProduct}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          categories={categories}
          sizes={sizes}
          colors={colors}
          handleSizeToggle={handleSizeToggle}
          handleColorToggle={handleColorToggle}
          isEditing={!!editingProduct}
        />
      )}
      <Footer />
    </div>
  );
};

export default SellerHome;