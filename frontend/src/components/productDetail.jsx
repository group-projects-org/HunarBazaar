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
          const variants = Array.isArray(response.data.variants) ? response.data.variants : [];
          const variant = variants?.find(v => v.size === orderSize);
          if (variant && variant.options[orderColor] !== undefined){
            maxQuantity.current = variant.options[orderColor];
          } else maxQuantity.current = 0;
        } setLoading(false);
      } catch (error) { setLoading(false); setError(error.message); }
    }; if (product_id) fetchProductDetails();
  }, [limit, product_id]);

  const handleAddToCart = (change = null) => {
    if (!product) return console.warn("Product not loaded yet")
    setCart((prevCart) => {
      const safeCart = Array.isArray(prevCart) ? prevCart : [];
      const index = safeCart.findIndex((item) => item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize);
      let updatedCart = [...safeCart];
      if (index !== -1) {
        if (change === "buy_now") return;
        else if (change === "inc") updatedCart[index].orderQty += 1;
        else if (change === "dec") {
          updatedCart[index].orderQty -= 1;
          if (updatedCart[index].orderQty <= 0) updatedCart.splice(index, 1);
        }
      } else {
        updatedCart.push({id: Number(product_id), name: product.name, price: product.price, image: product?.images?.[0] || "", orderSize: selectedSize, orderColor: selectedColor, orderQty: 1, maxQty: maxQuantity.current,});
      } localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  if (loading) return (
  <div className='relative h-full w-full overflow-hidden'>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </div>); if (error) return (
  <div className='relative h-full w-full overflow-hidden'>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </div>);

  return (
    <div className='relative h-full w-full overflow-hidden lg:overflow-visible'>
    <Header userType={user_type}/>
    <div className="relative w-full max-w-[1200px] bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row h-full mx-auto my-10 pr-10.5 py-0 px-5 md:py-10">

      <div className="bg-transparent flex flex-col items-center justify-start gap-6 lg:sticky lg:top-0 w-full h-auto md:max-h-screen lg:w-[40%] p-4 mt-0 mr-2.5 mb-2.5 ml-2.5 overflow-x-hidden">
        {product?.images?.length > 0 && (
          <img src={product.images[selectedImage]} onClick={() => setZoomed(true)} alt={product.name || "Product image"} className="w-full md:h-[70%] object-cover rounded-md transition-all duration-300 cursor-zoom-in hover:scale-102" />
        )}
        <div className="flex items-center gap-2 overflow-x-auto transparent-scrollbar rounded-lg my-5 mx-0">
          {product?.images?.map((val, index) => (
          <div key={index} className="shrink-0 m-0 p-0">
            <img key={index} src={val} onClick={() => setSelectedImage(index)} alt={`${product.name} ${index + 1}`} className={`w-28 h-28 object-cover rounded-lg border border-[#ccc] ${ selectedImage === index ? 'border-blue-500' : 'border-gray-200' }`}/>
          </div>))}
        </div>

      </div>

      <div className="flex flex-1 flex-col gap-6 bg-transparent h-auto mt-[15px] mr-2.5 mb-2.5 ml-[30px]">
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
            <p className="text-gray-500 text-lg italic break-word" style={{ marginTop: "-8px" }}> No size variants available for this product. </p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Colors</h3>
          {selectedSize ? (
            <div className="flex gap-3 flex-wrap">
              {Object.entries(product?.variants?.find((variant) => variant.size === selectedSize)?.options || {}).map(([color, qty]) => (
                <button key={color} onClick={() => {setSelectedColor(color); maxQuantity.current = qty;}} className={`w-auto h-10 rounded-[10px] border-2 text-sm font-medium transition-all ${selectedColor === color ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 hover:border-gray-400 hover:bg-gray-200"}`} style={{fontFamily: "Montserrat, Poppins, sans-serif", paddingLeft:"10px", paddingRight:"10px"}}> {color}</button>
              ))}
            </div>
          ) : (<div className="text-gray-500 text-lg italic break-word" style={{ marginTop: "-8px" }}> Please select a size to see the variants available </div>
          )}
        </div>

        {user_type === "sellers" && (
        <div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}>Quantity</h3>
          <table className="min-w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Size</th>
                <th className="border p-2">Color</th>
                <th className="border p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {product?.variants?.map((variant) =>
                Object.entries(variant.options).map(([color, qty]) => (
                  <tr key={`${variant.size}-${color}`}>
                    <td className="border p-2">{variant.size}</td>
                    <td className="border p-2">{color}</td>
                    <td className="border p-2">{qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

        <div className="flex gap-5 pt-4 justify-center mt-2.5 mr-0 mb-[5px] ml-0">
          {(() => {
            const existingProduct = Array.isArray(cart)? cart.find((item) => item.id === Number(product_id) && item.orderColor === selectedColor && item.orderSize === selectedSize) : null;
            if (user_type === "users" && existingProduct) {
              return (
              <div className='h-fit max-w-[30%] flex-1 flex-column justify-center items-center text-center p-0 m-0'>
                <div className={`${existingProduct.orderQty < maxQuantity.current? "h-full" : "h-auto"} flex items-center justify-center gap-[15px] w-full`}>
                  <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 hover:bg-[#45a049] px-[5px] py-2.5" onClick={() => handleAddToCart("dec")} disabled={existingProduct.orderQty == 0}> <Minus /> </button>

                  <span className="text-[16px] font-bold text-center max-w-10"> {existingProduct.orderQty}</span>

                  <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 disabled:bg-[#f7f0f0] disabled:cursor-not-allowed disabled:text-black disabled:border disabled:border-[#d4d0d0] hover:bg-[#45a049] px-[5px] py-2.5" onClick={() => handleAddToCart("inc")} disabled={existingProduct.orderQty >= maxQuantity.current}> <Plus /> </button>
                </div>
                {existingProduct.orderQty >= maxQuantity.current && (<p className="block text-red-500 text-[12px] mt-2.5">❌ Max Ordering Quantity reached</p>)} 
              </div>
              );
            }  return (
              <button className="bg-green-500 w-[30%] rounded-sm border border-[#d4d0d0] disabled:bg-[#f7f0f0] disabled:cursor-not-allowed hover:bg-[#45a049]" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "2px 5px" }} disabled={ user_type === "sellers" || selectedSize == null || selectedColor == null} onClick={() => handleAddToCart()}> Add to Cart </button>
            );
            })()} 

            <button className="bg-green-500 w-[30%] rounded-sm border border-[#d4d0d0] disabled:bg-[#f7f0f0] disabled:cursor-not-allowed hover:bg-[#45a049]" style={{fontFamily: "Montserrat, Poppins, sans-serif", padding: "8px 5px" }} disabled={ user_type === "sellers" || selectedSize == null || selectedColor == null} onClick={() => {handleAddToCart("buy_now"); navigate("/CartCheckout?step=${encodeURIComponent('checkout')}")}}> BUY NOW </button>
          </div>

          <div className="text-center mt-3">
            <h3 className="text-2xl font-semibold" style={{ fontFamily: "Montserrat, Poppins, sans-serif", marginBottom: "10px" }}> Product Description </h3>
            <div className="space-y-6 text-gray-700 text-justify text-base leading-relaxed">
              <div className="prose max-w-none text-gray-700 leading-relaxed break-word whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: product.description }}/>
            </div>
          </div>

          {(() => {
            if (!product.reviews || product.reviews.length === 0) {
              return (
                <div className="text-center my-5">
                  <h3 className="text-2xl font-semibold mb-2.5" style={{ fontFamily: "Montserrat, Poppins, sans-serif"}}> Customer Reviews </h3>
                  <p className="text-gray-500 italic"> No reviews yet. Be the first to review this product! </p>
                </div>
              );
            }; return (
              <div className="flex flex-col text-center justify-center items-start lg:items-center w-full my-5">
                <h3 className="text-2xl font-semibold mb-2.5" style={{ fontFamily: "Montserrat, Poppins, sans-serif"}}> Customer Reviews </h3>
                <div className="flex gap-3 justify-center items-center mb-1.5">
                  <span className="text-2xl font-bold text-amber-500"> {Number(product.rating).toFixed(1)} </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={20} className={i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}/>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">({product.ratingCount} ratings) </span>
                </div>

                {product.reviews.slice(0, limit).map((rev, idx) => (
                  <div key={idx} className="w-[110%] lg:w-full lg:max-w-full border border-gray-200 rounded-lg hover:shadow-md transition-all text-left overflow-hidden px-5 py-2.5 my-2.5 -mx-5 lg:m-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className='flex flex-1 justify-start items-center'>
                        <img src={'/assets/User.jpg'} alt="User" className="w-8 h-8 rounded-[50%] bg-[#2563eb] text-white flex items-center justify-center font-medium mr-2.5" />
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
    </div>
  );
};

export default ProductDetail;