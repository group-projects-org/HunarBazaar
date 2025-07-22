import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './CSS/product.css';
import { Header, Footer } from "./header_footer";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ProductsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerLoad = 60;

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/product_list`);
        const fetchedProducts = response.data.products;
        setProducts(fetchedProducts);
        const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
        setCategories(['All Categories', ...uniqueCategories]);
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        setSelectedCategory(categoryParam || 'All Categories');
        setLoading(false);
      } catch (error) {console.error("Error fetching products:", error);
        setError(error.message);
        setLoading(false);
    }};fetchProducts();
  }, []);

  useEffect(() => {
    const filterProducts = (search, category) => {
      return products.filter(product => {
        const matchesCategory = category === 'All Categories' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    };
    const filtered = filterProducts(searchInput, selectedCategory);
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchInput, selectedCategory, products]);

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === Number(productId));
    if (!product) return;
    const { _id, description, variants, tags, ...cleanProduct } = product;
    const existing = cart.find(item => item.product.id === productId);
    let updatedCart;
    if (existing) {
      updatedCart = cart.map(item => item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
    } else {updatedCart = [...cart, { product: cleanProduct, quantity: 1 }];
    }setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleUpdateQuantity = (productId, action) => {
    let updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: newQuantity };
      }return item;
    }).filter(item => item.quantity > 0);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((currentPage - 1) * productsPerLoad, currentPage * productsPerLoad),
    [filteredProducts, currentPage]
  );  

  return (
    <div>
    {loading && (<>
      <div className="toast-overlay" />
      <div className="toast-message processing">Loading the Data...</div>
    </>)}{error && (<>
      <div className="toast-overlay" onClick={() => { setError(null); }} />
      <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
    </>)}
     <Header />
     <div className="search-bar">
        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
        </select>
        <a className="anchor" href="/CartCheckout">View Cart</a>
        <a className={`anchor ${cart.length === 0 ? "disabled" : ""}`} href={cart.length === 0 ? "#" : `/CartCheckout?step=${encodeURIComponent("checkout")}`} onClick={(e) => { if (cart.length === 0) e.preventDefault();}}> Checkout </a>
     </div>

     <div id="products" className="section">
        <h1>Our Products</h1>
        <div className="product-container">
          {paginatedProducts.map(product => {
            const existingProduct = cart.find(item => item.product.id === product.id);
            return (
              <div className="product-card" key={product.id}>
                <img src={typeof product.image === 'string'? product.image: product.image instanceof File? URL.createObjectURL(product.image[0]): '/placeholder.jpg' } alt={product.name} style={{ objectFit: 'cover' }}/>
                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
                {existingProduct ? (
                  <div className="quantity-container">
                    <button className="quantity-button" onClick={() => handleUpdateQuantity(product.id, 'decrease')}>-</button>
                    <span className="quantity-display">{existingProduct.quantity}</span>
                    <button className="quantity-button" onClick={() => handleUpdateQuantity(product.id, 'increase')}>+</button>
                  </div>
                ) : (
                  <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pagination-container">
          {currentPage > 1 && (
            <button className="page-button current-page" onClick={() => setCurrentPage(currentPage - 1)}>&#10094;</button>
          )}
          <button className="page-button">{currentPage}</button>
          {currentPage * productsPerLoad < filteredProducts.length && (
            <button className="page-button current-page" onClick={() => setCurrentPage(currentPage + 1)}>&#10095;</button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;