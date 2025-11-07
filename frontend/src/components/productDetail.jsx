import { useEffect, useState, useRef } from 'react';
import { Minus, Plus, Star } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import {Header, Footer} from './header_footer';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return [];
    return JSON.parse(value);
  } catch { return []; }
};

const ProductDetail = () => {
  const { product_id, user_type } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = safeParse('cart');;
      return Array.isArray(storedCart) ? storedCart : [];
    } catch { return [];}
  });
  const [product, setProduct] = useState(null);
  const [limit, setLimit] = useState(3);
  let maxQuantity = useRef(0);
  const navigate = useNavigate();

   useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderSize = params.get("orderSize");
    const orderColor = params.get("orderColor");
    setSelectedColor(orderColor); setSelectedSize(orderSize);
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/product`, {
          params: { product_id: product_id, limit: limit},
          withCredentials: true,
        }); setProduct(response.data);
        if (orderSize && orderSize) {
          const variant = response.data.variants.find(v => v.size === orderSize);
          console.log(variant);
          if (variant && variant.options[orderColor] !== undefined){
            maxQuantity.current = variant.options[orderColor];
          } else maxQuantity.current = 0;
        } setLoading(false);
      } catch (error) { setLoading(false); setError(error.message); }
    }; if (product_id) fetchProductDetails();
  }, [limit, product_id]);

  const handleAddToCart = (change = null) => {
    const safeCart = Array.isArray(cart) ? cart : [];
    const existing = safeCart.find((item) => item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize);
    let updatedCart;
    if (existing) {
      if (change === "inc") {
        updatedCart = safeCart.map((item) =>item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize ? { ...item, orderQty: item.orderQty + 1 } : item);
      } else if (change === "dec") {
        updatedCart = safeCart.map((item) => item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize ? { ...item, orderQty: item.orderQty - 1 } : item) .filter((item) => item.orderQty > 0);
      }
    } else {
      updatedCart = [...safeCart, { id: Number(product_id) , name: product.name, price: product.price, image: product.images[0], orderSize: selectedSize, orderColor: selectedColor, orderQty: 1, maxQty: maxQuantity.current } ];
    } setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  if (loading) return (<>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </>); if (error) return (<>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </>);

  return (
    <> 
    <Header userType={user_type}/>
    <div className="max-w-[1200px] mx-auto bg-[#f4f4f4] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row h-full " style={{margin: "40px 40px", padding: "10px 20px"}}>

      <div className="bg-transparent flex flex-col items-center justify-center gap-6 lg:sticky lg:top-0 lg:h-screen lg:w-[40%] w-full h-auto p-4" style={{margin:"0px 10px 10px 20px"}}>

        <img src={product.images[selectedImage]} onClick={() => setZoomed(true)} alt={product.name} className="w-full h-[70%] object-cover rounded-md transition-all duration-300 cursor-zoom-in hover:scale-102"/>
        
        <div className="flex gap-4">
          {product.images?.map((image, index) => (
            <button key={index} onClick={() => setSelectedImage(index)} className={`w-24 h-28 rounded-lg overflow-hidden border-2 transition-all ${ selectedImage === index ? 'border-blue-500' : 'border-gray-200' }`}>
              <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 bg-transparent h-auto" style={{margin:"15px 10px 10px 30px"}}>
        <div className="text-center font-bold">
          <h1 className="text-4xl text-gray-900 mb-2" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>{product.name}</h1>
          <p className="text-gray-500 text-lg uppercase tracking-wide">{product.category}</p>
        </div>
        <p className="text-emerald-800 font-extrabold text-[14px] uppercase tracking-wide">Special Price</p>
        <div className="flex items-center gap-4 font-bold" style={{marginTop: "-23px"}}>
          <strong className="text-[25px] text-gray-500 line-through" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>₹{Math.floor(product.price + product.price / 5)} </strong>
          <strong className="text-[30px] text-red-500" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}> ₹{Math.floor(product.price)} </strong>
          <strong className="text-[15px] bg-emerald-500 rounded-2xl text-white" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "4px 10px"}}> SALE </strong> 
        </div>

        {product.rating ? (
          <div className="flex items-center gap-2 text-gray-700 text-lg sm:ml-6 font-bold" style={{marginTop: "-20px"}}>
            <span className="font-semibold text-[16px] bg-[#234562] rounded-2xl text-white" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "3px 10px"}}>{product.rating.toFixed(1)} ★</span>
            <span className="text-gray-500"> {product.ratingCount} ratings</span>
            <span className="text-gray-500">and {product.reviewCount} reviews</span>
          </div>
        ) : (<div className="text-gray-500 text-lg sm:ml-6 italic" style={{marginTop: "-20px"}}> No ratings yet </div>
        )}

        <div>
          <h3 className="text-xl font-semibold" style={{fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px"}}>Size</h3>
          {product.variants?.some((variant) => Object.keys(variant.options).length > 0) ? (<div className="flex gap-3">
            {product.variants.filter((variant) => Object.keys(variant.options).length > 0)?.map((variant) => (
              <button key={variant.size} onClick={() => setSelectedSize(variant.size)} className={`w-10 h-10 rounded-lg border-2 text-lg font-medium transition-all ${ selectedSize === variant.size? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-400 hover: bg-gray-200' }`}> {variant.size} </button>
            ))}
          </div>) : (
            <p className="text-gray-500 text-lg italic" style={{ marginTop: "-8px" }}> No size variants available for this product. </p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Colors</h3>
          {selectedSize ? (
            <div className="flex gap-3 flex-wrap">
              {Object.entries(product.variants.find((variant) => variant.size === selectedSize)?.options || {}).map(([color, qty]) => (
                <button key={color} onClick={() => {setSelectedColor(color); maxQuantity.current = qty;}} className={`w-auto h-10 rounded-[10px] border-2 text-sm font-medium transition-all ${selectedColor === color ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 hover:border-gray-400 hover:bg-gray-200"}`} style={{fontFamily: "Montserrat, Poppins, sans-serif", paddingLeft:"10px", paddingRight:"10px"}}> {color}</button>
              ))}
            </div>
          ) : (<div className="text-gray-500 text-lg italic" style={{ marginTop: "-8px" }}> Please select a size to see the variants available </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 justify-center" style={{margin: "10px 0px 5px 0px"}}>
          {(() => {
            const existingProduct = cart.find((item) => item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize);
            if (user_type === "users" && existingProduct) {
              return (
              <div className='max-w-[30%] flex-1 flex-column justify-center items-center text-center' style={{padding: "0", margin: "0"}}>
                <div className="flex items-center justify-center gap-[15px] w-full">
                  <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => handleAddToCart("dec")} disabled={existingProduct.orderQty == 0}> <Minus /> </button>

                  <span className="text-[16px] font-bold text-center max-w-10"> {existingProduct.orderQty}</span>

                  <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 disabled:bg-[#f7f0f0] disabled:cursor-not-allowed disabled:text-black disabled:border disabled:border-[#d4d0d0] hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => handleAddToCart()} disabled={existingProduct.orderQty >= maxQuantity.current}> <Plus /> </button>
                  
                </div>
                {existingProduct.orderQty >= maxQuantity.current && (<p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>❌ Max Ordering Quantity reached</p>)} 
              </div>
              );
            }  return (
              <button className="bg-green-500 w-[30%] rounded-sm border border-[#d4d0d0] disabled:bg-[#f7f0f0] disabled:cursor-not-allowed hover:bg-[#45a049]" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "2px 5px" }} disabled={ user_type === "sellers" || selectedSize == null || selectedColor == null} onClick={() => handleAddToCart()}> Add to Cart </button>
            );
            })()} 

            <button className="bg-green-500 w-[30%] rounded-sm border border-[#d4d0d0] disabled:bg-[#f7f0f0] disabled:cursor-not-allowed hover:bg-[#45a049]" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "8px 5px" }} disabled={ user_type === "sellers" || selectedSize == null || selectedColor == null} onClick={() => {handleAddToCart("inc"); navigate("/CartCheckout?step=${encodeURIComponent('checkout')}")}}> BUY NOW </button>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Product Description </h3>
            <div className="space-y-6 text-gray-700 text-left text-base leading-relaxed">
              <div className="prose max-w-none text-gray-700 leading-relaxed break-all whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: product.description }}/>
              <p className="break-all whitespace-pre-wrap"> {product.description.fabric}</p>
              <p className="break-all whitespace-pre-wrap">{product.description.versatility}</p>
              <p className="italic text-gray-600 break-all whitespace-pre-wrap"> {product.description.style}</p>
            </div>
          </div>

          {(() => {
            if (!product.reviews || product.reviews.length === 0) {
              return (
                <div className="text-center" style={{marginTop: "-40px"}}>
                  <h3 className="text-2xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Customer Reviews </h3>
                  <p className="text-gray-500 italic"> No reviews yet. Be the first to review this product! </p>
                </div>
              );
            }; return (
              <div className="text-center items-center w-full" style={{marginTop: "-40px"}}>
                <h3 className="text-2xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Customer Reviews </h3>
                <div className="flex gap-3 justify-center items-center" style={{marginBottom: "6px"}}>
                  <span className="text-2xl font-bold text-amber-500"> {Number(product.rating).toFixed(1)} </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={20} className={i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}/>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">({product.ratingCount} ratings) </span>
                </div>

                {product.reviews.slice(0, limit).map((rev, idx) => (
                  <div key={idx} className="max-w-full border border-gray-200 rounded-lg hover:shadow-md transition-all text-left overflow-hidden" style={{padding: "10px 20px", margin: "10px"}}>
                    <div className="flex items-center justify-between mb-1">
                      <div className='flex flex-1 justify-start items-center'>
                        <img src={'/assets/User.jpg'} alt="User" className="w-8 h-8 rounded-[50%] bg-[#2563eb] text-white flex items-center justify-center font-medium" style={{marginRight: "10px"}}/>
                        <h4 className="font-semibold text-gray-800">{rev.username}</h4>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}/>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{rev.comment}</p>
                  </div>
                ))}

                {limit < product.reviewCount && (
                  <div className="text-center mt-6">
                    <button onClick={() => setLimit(limit + 3)} className="text-blue-600 font-semibold hover:text-blue-800" style={{fontFamily: ""}}> Load More Reviews ↓ </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      {zoomed && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setZoomed(false)}>
          <img src={product.images[selectedImage]} alt={product.name} className="max-w-[90%] max-h-[90%] rounded-lg object-contain cursor-zoom-out shadow-lg transition-all duration-300"/>
        </div>
      )} 
    <Footer />
    </>
  );
};

export default ProductDetail;