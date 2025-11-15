import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Header, Footer } from "./../header_footer";
import { ProductCard } from '../Cards';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return [];
    return JSON.parse(value);
  } catch { return []; }
};

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
    const storedCart = safeParse('cart');
    setCart(storedCart);
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/product_list`, {
          withCredentials: true,
        });
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

  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((currentPage - 1) * productsPerLoad, currentPage * productsPerLoad),
    [filteredProducts, currentPage]
  ); 

  return (
    <div className='relative h-full w-full overflow-hidden'>
    {loading && (<>
      <div className="toast-overlay" />
      <div className="toast-message processing">Loading the Data...</div>
    </>)}{error && (<>
      <div className="toast-overlay" onClick={() => { setError(null); }} />
      <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
    </>)}
     <Header />

     <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 bg-transparent md:bg-[#f2f2f2] rounded-lg my-3 md:my-5 mx-auto p-2.5">
        <input className="w-[250px] text-[1rem] border-[#ddd] border-2 rounded-[5px]" style={{padding: "10px"}} type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." />
      <div className='flex items-center justify-center gap-2.5 bg-transparent rounded-lg'>
        <select className="w-full sm:w-[180px] md:w-[200px] lg:w-[150px] text-[1rem] border-2 border-[#ddd] bg-[#f2f2f2] rounded-[5px] transition-all duration-300 overflow-hidden " style={{padding: "10px"}} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((cat, idx) => (<option key={idx} value={cat} className="w-fit whitespace-nowrap text-[0.5rem] sm:text-[1rem]"> {cat} </option> ))}
        </select>
        <a className="bg-[#3cbf4e] h-11 whitespace-nowrap text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 decoration-0 hover:bg-[#45a049] px-[15px] py-2.5" href="/CartCheckout">View Cart</a>
        <a className={`bg-[#3cbf4e] px-[15px] py-2.5 h-11 text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 decoration-0 hover:bg-[#45a049] ${cart.length === 0 ? "bg-[#ccc] text-[#666] cursor-not-allowed opacity-60 pointer-events-none" : ""}`} href={cart.length === 0 ? "#" : `/CartCheckout?step=${encodeURIComponent("checkout")}`} onClick={(e) => { if (cart.length === 0) e.preventDefault();}}> Checkout </a>
        </div>
     </div>

     <div className="block w-full max-w-[1200px] text-center bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] m-0 md:my-7 mx-auto px-5 py-2.5">
        <h1 className="font-bold text-2xl m-2.5" style={{fontFamily: "Merriweather, Cambria, serif"}}>Our Products</h1>
        <div className="flex flex-wrap justify-center gap-5 w-full box-border p-5">
          {paginatedProducts.map(product => {
            return ( <ProductCard product={product} key={product.id} /> );
          })}
        </div>

        <div>
          {currentPage > 1 && (
            <button className="bg-[#ccc] border-[#ddd] border cursor-pointer hover:bg-[#ddd] font-bold rounded-[5px] text-[1rem] transition-colors duration-300 decoration-0 py-2 px-3 m-[5px]" onClick={() => setCurrentPage(currentPage - 1)}>&#10094;</button>
          )}
          <button className="bg-[#3cbf4e] text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 decoration-0 hover:bg-[#45a049] py-2.5 px-[15px]">{currentPage}</button>
          {currentPage * productsPerLoad < filteredProducts.length && (
            <button className="bg-[#ccc] border-[#ddd] border cursor-pointer hover:bg-[#ddd] font-bold rounded-[5px] text-[1rem] transition-colors duration-300 decoration-0 py-2 px-3 m-[5px]" onClick={() => setCurrentPage(currentPage + 1)}>&#10095;</button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;