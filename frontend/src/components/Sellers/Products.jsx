import { useEffect, useState, useMemo } from 'react';
import ProductModal from './ProductModal';
import { ProductCard } from './../Cards';
import { Header, Footer } from '../header_footer';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const ProductsListed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    variants: [
      { size: 'S', options: {} },
      { size: 'M', options: {} },
      { size: 'L', options: {} },
      { size: 'XL', options: {} }
    ],
    images: []
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerLoad = 60;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response = await axios.get(`${BASE_URL}/api/seller_products_list`, {
          withCredentials: true
        });

        // ✅ New backend returns flat array of products directly
        let fetchedProducts = [];
        if (response.data.products && response.data.products.length > 0) {
          fetchedProducts = response.data.products.map(p => ({
            id: p.id || p.product_id,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image || (p.images && p.images.length > 0 ? p.images[0] : null)
          }));
        }


        setProducts(fetchedProducts);
        const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
        setSellerCategories(['All Categories', ...uniqueCategories]);

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        setSelectedCategory(categoryParam || 'All Categories');

        const categoryRes = await fetch(`${BASE_URL}/api/get_categories`);
        const data = await categoryRes.json();
        setCategories(data.categories || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    const filterProducts = (search, category) => {
      return products.filter(product => {
        const matchesCategory = category === 'All Categories' || product.category === category;
        const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    };
    const filtered = filterProducts(searchInput, selectedCategory);
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchInput, selectedCategory, products]);

  // ✅ Paginated results
  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((currentPage - 1) * productsPerLoad, currentPage * productsPerLoad),
    [filteredProducts, currentPage]
  );

  // ✅ Handle new product save
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('description', newProduct.description);
      formData.append('variants', JSON.stringify(newProduct.variants));
      formData.append('image_links', JSON.stringify(newProduct.image_links))

      if (newProduct.images && newProduct.images.length > 0) {
        newProduct.images.forEach(file => formData.append('images', file));
      }

      const response = await axios.post(`${BASE_URL}/api/add_product`, formData, {
        withCredentials: true
      });

      if (response.status === 200 || response.status === 201) {
        alert('✅ Product saved successfully!');
        setShowModal(false);
        setNewProduct({
          name: '',
          price: '',
          category: '',
          description: '',
          variants: [],
          images: [],
          image_links: []
        });
      } else {
        alert('❌ Failed to save product. Try again.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('⚠️ Error while saving product');
    }
  };

  // ✅ Handle size toggle inside modal
  const handleSizeToggle = (size) => {
    const updatedVariants = newProduct.variants.map(v =>
      v.size === size ? { ...v, selected: !v.selected } : v
    );
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  return (
    <>
      {loading && (
        <>
          <div className="toast-overlay" />
          <div className="toast-message processing">Loading the Data...</div>
        </>
      )}
      {error && (
        <>
          <div className="toast-overlay" onClick={() => setError(null)} />
          <div className="toast-message error" onClick={() => setError(null)}>
            {error}
          </div>
        </>
      )}

      <Header userType={"sellers"}/>

      <div className="flex items-center justify-center gap-2.5 bg-[#f2f2f2] rounded-lg"
        style={{ margin: "20px 0", padding: "10px" }}>
        <input
          className="w-[250px] text-[1rem] border-[#ddd] border-2 rounded-[5px]"
          style={{ padding: "10px" }}
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
        />
        <select
          className="w-[150px] text-[1rem] border-2 border-[#ddd] rounded-[5px]"
          style={{ padding: "10px" }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {sellerCategories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          className="bg-[#3cbf4e] h-11 text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 hover:bg-[#45a049]"
          style={{ padding: "10px 15px" }}
          onClick={() => setShowModal(true)}
        >
          Add Product
        </button>
      </div>

      {showModal && (
        <ProductModal
          show={true}
          onClose={() => setShowModal(false)}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onSave={handleSaveProduct}
          categories={categories}
          sizes={['S', 'M', 'L', 'XL']}
          handleSizeToggle={handleSizeToggle}
        />
      )}

      <div
        className="block w-full max-w-[1200px] text-center bg-[#f4f4f4] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
        style={{ margin: "40px auto", padding: "10px 20px" }}
      >
        <h1 className="font-bold text-2xl" style={{ fontFamily: "Merriweather, Cambria, serif", margin: "10px" }}>
          Our Products
        </h1>

        <div className="flex flex-wrap justify-center gap-[15px] w-full box-border" style={{ padding: "20px" }}>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map(product => (
              <ProductCard product={product} key={product.id} user_type={"sellers"}/>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        <div>
          {currentPage > 1 && (
            <button
              className="bg-[#ccc] border-[#ddd] border cursor-pointer hover:bg-[#ddd] font-bold rounded-[5px] text-[1rem]"
              style={{ padding: "8px 12px", margin: "5px" }}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &#10094;
            </button>
          )}
          <button
            className="bg-[#3cbf4e] text-white border-0 rounded-[5px] cursor-pointer text-[1rem] hover:bg-[#45a049]"
            style={{ padding: "10px 15px" }}
          >
            {currentPage}
          </button>
          {currentPage * productsPerLoad < filteredProducts.length && (
            <button
              className="bg-[#ccc] border-[#ddd] border cursor-pointer hover:bg-[#ddd] font-bold rounded-[5px] text-[1rem]"
              style={{ padding: "8px 12px", margin: "5px" }}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              &#10095;
            </button>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductsListed;