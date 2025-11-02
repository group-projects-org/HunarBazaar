import { useEffect, useState, useMemo } from 'react';
import ProductModal from './ProductModal';
import axios from 'axios';
import './../CSS/product.css';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const ProductsListed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, description: '', variants: [ { size: 'S', options: {} }, { size: 'M', options: {} }, { size: 'L', options: {} }, { size: 'XL', options: {} } ], images: []
  });
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState('All Categories');
  const [sellerCategories, setSellerCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerLoad = 60;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const user_id = localStorage.getItem("user_id");
        let response = await axios.get(`${BASE_URL}/api/seller_products_list`, { params: { seller_id: user_id }});
        const fetchedProducts = response.data.products;
        setProducts(fetchedProducts);
        const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
        setSellerCategories(['All Categories', ...uniqueCategories]);
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        setSelectedCategory(categoryParam || 'All Categories');
        response = await fetch(`${BASE_URL}/api/get_categories`);
        const data = await response.json();
        setCategories(data.categories);
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

  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((currentPage - 1) * productsPerLoad, currentPage * productsPerLoad),
    [filteredProducts, currentPage]
  );  

  const handleSaveProduct = () => {
    console.log('Saving Product:', newProduct);
    setShowModal(false);
  };

  return (
    <div>
    {loading && (<>
      <div className="toast-overlay" />
      <div className="toast-message processing">Loading the Data...</div>
    </>)}{error && (<>
      <div className="toast-overlay" onClick={() => { setError(null); }} />
      <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
    </>)}
     <div className="search-bar">
        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {sellerCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
        </select>
        <button className="anchor" onClick={() => setShowModal(true)}>Add Product</button>{showModal && <ProductModal onClose={() => setShowModal(false)} />}
        {showModal && (<ProductModal
          show={true}
          onClose={() => setShowModal(false)}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onSave={handleSaveProduct}
          categories={categories}
          sizes={['S', 'M', 'L', 'XL']}
          handleSizeToggle={(size) => {
            const updatedSizes = newProduct.size.includes(size)
              ? newProduct.size.filter(s => s !== size)
              : [...newProduct.size, size];
            setNewProduct({ ...newProduct, size: updatedSizes });
          }}
        />
      )}
     </div> <div id="products" className="section">
        <h1>Your Saleable Products</h1>
        <div className="product-container">
          {paginatedProducts.map(product => {
            return (
              <div className="product-card" key={product.id}>
                <img src={typeof product.image === 'string'? product.image: product.image instanceof File? URL.createObjectURL(product.image[0]): '/placeholder.jpg' } alt={product.name} style={{ objectFit: 'cover' }}/>
                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
                <button>See Details</button>
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
    </div>
  );
};

export default ProductsListed;