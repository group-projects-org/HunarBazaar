import React from 'react';
import {Globe, Mail, Phone, MapPin, FileText, ChevronDown, ChevronUp, Minus, Plus} from "lucide-react";
import { SiCodechef, SiCodeforces, SiLeetcode, SiGithub, SiLinkedin, SiInstagram, SiFacebook, SiDiscord } from 'react-icons/si';
import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaXTwitter } from "react-icons/fa6"; 


const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  return(
    <div className="w-[45%] md:w-[calc(33.33%-15px)] lg:w-[calc(25%-15px)] border border-[rgba(0,0,0,0.1)] rounded-lg text-center bg-transparent shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] overflow-hidden p-[15px] mb-2.5" onClick={() => navigate(`/Products?category=${encodeURIComponent(category)}`)}> 
      <img className='w-full h-[200px] sm:h-[450px] lg:h-[350px] object-cover rounded-[5px] mb-2.5' src={`/assets/Categories/${category}.jpeg`} alt={category} />
      <div>
        <h3 className='text-[20px] md:text-[25px] text-[#3CBF4E] font-bold' style={{fontFamily: "'Great Vibes', cursive"}}>{category}</h3>
        <p className="text-[10px] md:text-[16px] gap-2.5 break-word" style={{fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>Explore our wide range of {category} products.</p>
      </div>
    </div>
  )
};

const ProductCard = ({ product, user_type = "users", order = false, editable = false, setCart = null,}) => {
  const navigate = useNavigate();
  const updateQuantity = useCallback((id, selectedColor, selectedSize, action) => {
    setCart((prev) => {
    const updatedCart = prev.map((item) => item.id === id && item.orderColor === selectedColor && item.orderSize === selectedSize? {...item, orderQty: action === "inc"? item.orderQty + 1 : item.orderQty - 1,} : item ).filter((i) => i.orderQty > 0);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  });},[setCart]);

  return (
    <div className="w-[45%] md:w-[calc(33.33%-15px)] lg:w-[calc(25%-15px)] border border-[rgba(0,0,0,0.1)] rounded-lg text-center bg-[#f9f9f9] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]" style={{ padding: "15px", marginBottom: "15px" }}>

      <img src={typeof product.image === "string"? product.image: product.image instanceof File ? URL.createObjectURL(product.image[0]) : "/placeholder.jpg"} alt={product.name} className="w-full h-[200px] sm:h-[450px] lg:h-[350px] object-cover rounded-[5px]" loading="lazy" style={{ marginBottom: "10px" }}/>

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
                <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => updateQuantity(product.id, product.orderColor, product.orderSize, "dec")} disabled={product.orderQty == 0}> <Minus /> </button>

                <span className="text-[16px] font-bold text-center max-w-10"> {product.orderQty}</span>

                <button className="text-[16px] cursor-pointer bg-[#3cbf4e] text-white border-0 rounded-sm transition-colors duration-300 disabled:bg-[#f7f0f0] disabled:cursor-not-allowed disabled:text-black disabled:border disabled:border-[#d4d0d0] hover:bg-[#45a049]" style={{ padding: "5px 10px" }} onClick={() => updateQuantity(product.id, product.orderColor, product.orderSize, "inc")} disabled={product.orderQty >= product.maxQty}> <Plus /> </button>
                
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

    <div ref={containerRef} className="marquee-container w-[109%] scrolling-text-container relative rounded-md overflow-hidden bg-white/10 backdrop-blur-sm transition-all duration-300" style={{margin:"0", padding: "0"}}>
      <div ref={textRef} className="marquee-content inline-flex whitespace-nowrap text-[10px] md:text-[16px] font-semibold" style={{"--scroll-distance": direction === "left" ? `-${distance}px` : `${distance}px`, animationDuration: duration, padding: "8px 0"}}>
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} style={{ padding: "0 30px", fontFamily: "'Bricolage Grotesque', sans-serif" }}> {text} </span>
        ))}
      </div>
    </div>
  </>);
};

const TitleDescriptionCard = ({title, description, index, showIndex = false, variant = "default", icon: Icon = null, actions = null, collapsible = false, className = "",}) => {
  const [open, setOpen] = useState(true);
  const variantStyles = {
    default: "border-gray-200 bg-gray-50",
    info: "border-blue-200 bg-blue-50",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
  }; const variantBadgeStyles = {
    default: "bg-gray-800 text-white",
    info: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-black",
  };
  return (
    <div className={`w-full rounded-xl border shadow-sm transition-all duration-300hover:scale-[1.02] hover:shadow-md ${variantStyles[variant]} ${className}`}>
      <div className="py-6 px-7">
        <div className="flex items-center justify-center gap-3 mb-2">
          {showIndex && (<span className={`flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full ${variantBadgeStyles[variant]}`}>{index + 1}</span>)}
          {Icon && (<Icon className="w-6 h-6 text-green-900" />)}
          <h2 className={`text-center text-[22px] font-bold ${!showIndex ? "text-green-900 underline" : "text-gray-800"} uppercase`}>{title}</h2>
        </div>

        {open && (<p className="text-gray-600 leading-relaxed text">{description}</p>)}

        {collapsible && (<button onClick={() => setOpen(!open)} className="mt-3 text-sm text-blue-600 hover:underline">{open ? "Show less" : "Show more"}</button>)}

        {actions && (<div className="mt-4 flex justify-center gap-3">{actions}</div>)}
      </div>
    </div>
  );
};

const DeveloperSocialCard = ({ developerInfo }) => {
  const {name, designation, description, image = null, phone, email, address, github, linkedin, portfolio, instagram, twitter, resume, discord, facebook, leetcode, codechef, codeforces} = developerInfo;
  const [showMore, setShowMore] = React.useState(false);
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-full max-w-md rounded-2xl border bg-white shadow-md p-6 transition hover:shadow-lg">
      <div className="flex items-center gap-4">
        {image ? (<img src={image} alt={name} className="w-16 h-16 rounded-full object-cover border"/>
        ) : (<div className="w-16 h-16 rounded-full bg-green-900 text-white flex items-center justify-center text-xl font-bold">{initials}</div>)}
        <div>
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <p className="text-sm text-green-800 font-medium">{designation}</p>
        </div>
      </div>

      {description && (<p className="mt-4 text-gray-600 text-sm leading-relaxed">{description}</p>)}

      <div className="mt-4 space-y-2 text-sm text-gray-700">
        {phone && (<div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <a href={`tel:${phone}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-black transition-colors duration-300 no-underline text-[0.7rem] md:text-[0.9rem] wrap-break-all " style={{fontFamily: "Poppins, sans-serif"}}>{phone}</a>
        </div>)}
        {email && (<div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-black transition-colors duration-300 no-underline text-[0.7rem] md:text-[0.9rem] wrap-break-all " style={{fontFamily: "Poppins, sans-serif"}}>{email}</a>
        </div>)}
        {address && (<div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-black transition-colors duration-300 no-underline text-[0.7rem] md:text-[0.9rem] wrap-break-all " style={{fontFamily: "Poppins, sans-serif"}}>{address}</a>
        </div>)}
      </div>

      <div className="mt-5 flex justify-center gap-4">
        {github && (<a href={github} target="_blank" rel="noreferrer"><SiGithub className="w-5 h-5 hover:text-black" /></a>)}
        {linkedin && (<a href={linkedin} target="_blank" rel="noreferrer"><SiLinkedin className="w-5 h-5 hover:text-blue-600" /></a>)}
        {portfolio && (<a href={portfolio} target="_blank" rel="noreferrer"><Globe className="w-5 h-5 hover:text-green-700" /></a>)}
      </div>

      {(instagram || twitter || resume || discord) && (
        <>
          <button onClick={() => setShowMore((p) => !p)} className="mt-4 flex items-center gap-1 text-sm mx-auto cursor-pointer"> {showMore ? "View less" : "View more"} {showMore ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}</button>

          {showMore && (
            <div className="mt-4 flex justify-center gap-4">
              {resume && (<a href={resume} target="_blank" rel="noreferrer"><FileText className="w-5 h-5 hover:text-gray-700" /></a>)}
              {discord && (<a href={discord} target="_blank" rel="noreferrer"> <SiDiscord className="w-5 h-5 hover:text-indigo-600" /></a>)}
              {instagram && (<a href={instagram} target="_blank" rel="noreferrer"><SiInstagram className="w-5 h-5 hover:text-pink-600" /></a>)}
              {twitter && (<a href={twitter} target="_blank" rel="noreferrer"><FaXTwitter className="w-5 h-5 hover:text-sky-500" /></a>)}
              {facebook && (<a href={facebook} target="_blank" rel="noreferrer"><SiFacebook className="w-5 h-5 hover:text-blue-800" /></a>)}
              {leetcode && (<a href={leetcode} target="_blank" rel="noreferrer"><SiLeetcode className="w-5 h-5 hover:text-orange-500" /></a>)}
              {codechef && (<a href={codechef} target="_blank" rel="noreferrer"><SiCodechef className="w-5 h-5 hover:text-yellow-500" /></a>)}
              {codeforces && (<a href={codeforces} target="_blank" rel="noreferrer"><SiCodeforces className="w-5 h-5 hover:text-blue-500" /></a>)}
            </div>
          )}
      </>)}
    </div>
  );
};

export { CategoryCard, ProductCard, MarqueeCard, TitleDescriptionCard, DeveloperSocialCard };