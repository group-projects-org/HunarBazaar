import { useRef, useEffect, useState, useCallback } from "react";
import { Minus, Plus } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  return(
    <div className="w-[calc(25%-15px)] border border-[rgba(0,0,0,0.1)] rounded-lg text-center bg-transparent shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] slideShowCard" style={{padding: "15px", marginBottom: "15px"}} onClick={() => navigate(`/Products?category=${encodeURIComponent(category)}`)}> 
      <img className='w-full h-[350px] object-cover rounded-[5px]' style={{marginBottom: "10px"}} src={`/assets/Categories/${category}.jpeg`} alt={category} />
      <div>
        <h3 className='text-[25px] text-[#3CBF4E]' style={{fontFamily: "'Great Vibes', cursive"}}>{category}</h3>
        <p className="gap-2.5" style={{fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>Explore our wide range of {category} products.</p>
      </div>
    </div>
  )
};

const ProductCard = ({ product, user_type = "users", order = false, editable = false, setCart = null,}) => {
  const navigate = useNavigate();
  const updateQuantity = useCallback((id, action) => {
    setCart((prev) => {
    const updatedCart = prev.map((item) => item.product.id === id ? {...item, orderQty: action === "inc"? item.orderQty + 1 : item.orderQty - 1,} : item ).filter((i) => i.orderQty > 0);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  });},[setCart]);

  return (
    <div className="w-[calc(25%-15px)] border border-[rgba(0,0,0,0.1)] rounded-lg text-center bg-[#f9f9f9] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] slideShowCard" style={{ padding: "15px", marginBottom: "15px" }}>

      <img src={typeof product.image === "string"? product.image: product.image instanceof File ? URL.createObjectURL(product.image[0]) : "/placeholder.jpg"} alt={product.name} className="w-full h-[350px] object-cover rounded-[5px]" loading="lazy" style={{ marginBottom: "10px" }}/>

      <h3 style={{ fontFamily: "Arial, sans-serif" }}>{product.name}</h3>
      <p><b>Price:</b> ₹{product.price}</p>
      <button className="bg-[#f7f0f0] rounded-sm border border-[#d4d0d0] hover:bg-[#dedada]" style={{ padding: "2px 5px", marginTop: "8px" }} onClick={() => {
        if (order) {
        const encodedSize = encodeURIComponent(product.orderSize);
        const encodedColor = encodeURIComponent(product.orderColor);
        navigate(`/Products/${product.id}/${user_type}?orderSize=${encodedSize}&orderColor=${encodedColor}`);
      } else { navigate(`/Products/${product.id}/${user_type}`); }
    }}> View Product </button>

      {order && (
        <div style={{marginTop: "4px"}}>
          <div className="flex justify-center items-center gap-5" style={{marginBottom: "4px"}}>
            <p><b>Color:</b> {product.orderColor}</p>
            <p><b>Size:</b> {product.orderSize}</p>
          </div>
          {editable ? (
            <div className='flex-1 flex-column justify-center items-center text-center' style={{padding: "0", margin: "0"}}>
              <div className="flex items-center justify-center gap-[15px] w-full">
                <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => updateQuantity(product.id, "dec")} disabled={product.orderQty == 0}> <Minus /> </button>

                <span className="text-[16px] font-bold text-center max-w-10"> {product.orderQty}</span>

                <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 disabled:bg-[#f7f0f0] disabled:cursor-not-allowed disabled:text-black disabled:border disabled:border-[#d4d0d0] hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => updateQuantity(product.id, "inc")} disabled={product.orderQty >= product.maxQty}> <Plus /> </button>
                
              </div>
              {product.orderQty >= product.maxQuantity && (<p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>❌ Max Ordering Quantity reached</p>)} 
            </div>
          ) : (<>
              <p><b>Quantity:</b> {product.orderQty}</p>
              <p><b>Total Price:</b> ₹{(product.price * product.orderQty).toFixed(2)}</p>
          </>)}
        </div>
    )}</div>
  );
};

const MarqueeCard = ({ announcements = ["🎉 Mega Festive Sale — Up to 70% OFF!", "🚚 Free Delivery on Orders Above ₹499!", "✨ New Arrivals — Grab Yours Now!"], direction = "left", baseSpeed = 100 }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState("20s");
  useEffect(() => {
    const textWidth = textRef.current?.scrollWidth || 0;
    setDistance(textWidth);
    const time = textWidth / baseSpeed;
    setDuration(`${time}s`);
  }, [announcements, baseSpeed]);

  return (<>
    <style>{`
      .marquee-content {
        animation: scroll linear infinite;
      } .marquee-container:hover .marquee-content {
        animation-play-state: paused;
      } @keyframes scroll {
        from { transform: translateX(0); }
        to { transform: translateX(var(--scroll-distance)); }
      }
    `}</style>

    <div ref={containerRef} className="marquee-container w-[109%] scrolling-text-container relative rounded-md overflow-hidden bg-white/10 backdrop-blur-sm transition-all duration-300" style={{margin: "0 0px 0 -50px", padding: "0"}}>
      <div ref={textRef} className="marquee-content inline-flex whitespace-nowrap text-[16px] font-semibold" style={{"--scroll-distance": direction === "left" ? `-${distance}px` : `${distance}px`, animationDuration: duration, padding: "8px 0"}}>
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} style={{ padding: "0 30px", fontFamily: "'Bricolage Grotesque', sans-serif" }}> {text} </span>
        ))}
      </div>
    </div>
  </>);
};

export { CategoryCard, ProductCard, MarqueeCard };