import React, { useEffect, useState } from "react";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
import axios from "axios";
import { CategoryCard, MarqueeCard } from "../Cards";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/get_categories`, {
          withCredentials: true,
        }); setCategories(response.data.categories);
      } catch (error) { setError(error.message);
      } finally { setLoading(false); }
    }; fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {setCurrentSlide((prev) => (prev + 1) % 8);}, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {setCurrentSlide((prev) => (prev - 1 + 8) % 8);};
  const handleNext = () => {setCurrentSlide((prev) => (prev + 1) % 8);};

  return (
    <>
      {loading && (<>
        <div className="toast-overlay" />
        <div className="toast-message processing">Loading the Data...</div>
      </>)}{error && (<>
        <div className="toast-overlay" onClick={() => { setError(null); }} />
        <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
      </>)}
      <Header />
      <div className="relative max-w-full" style={{marginBottom: "0"}}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
          <div key={num} style={{ display: currentSlide === index ? "block" : "none" }}> <img className= "w-full h-auto"src={`/assets/Discounts/Discount${num}.jpeg`} alt={`Slide ${num}`} /> </div>
        ))}
        <button className="h-[250px] cursor-pointer absolute top-px left-[0.5px] text-black font-bold text-[30px] bg-transparent border-0 shadow-none active:border-2 active:border-black active:shadow-[0_0_0_1.5px_#ddd] hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300" style={{padding: "10px 15px"}} onClick={handlePrev}> &#10094; </button>
        <button className="h-[250px] cursor-pointer absolute top-px right-[0.5px] text-black font-bold text-[30px] bg-transparent border-0 shadow-none active:border-2 active:border-black active:shadow-[0_0_0_1.5px_#ddd] hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300" style={{padding: "10px 15px"}}onClick={handleNext}> &#10095; </button>
      </div>
      <div className="relative border-0 bg-transparent shadow-none w-full max-w-[1200px] text-center rounded-lg" style={{margin: '-250px auto 20px auto', padding: '10px 20px'}}>
        <h1 className="font-bold text-2xl" style={{fontFamily: "Merriweather, Cambria, serif", margin: "10px"}}>Our Categories</h1>
        <MarqueeCard announcements={["🎉 Mega Festive Sale — Up to 70% OFF on all categories!", "🚚 Free Delivery on Orders Above ₹499!", "🔥 Flash Deal: Buy 2 Get 1 FREE on Select Items!", "🕒 Hurry! Limited-Time Offers Ending Soon!", "🎁 Exclusive Combo Offers Available Today!", "🌟 New Arrivals — Fresh Styles Just Dropped!", "🛍️ Flat ₹200 OFF on Your First Purchase!", "💥 Clearance Sale — Grab Before It’s Gone!", "✨ Join Trendify Plus & Get Early Access to Big Sales!"]} />
        <div className="flex flex-wrap justify-center gap-5 w-full box-border" style={{padding: "20px", margin: "0"}}>
          {categories.map((listItem, index) => (<CategoryCard key={listItem.id || index} category={listItem} />))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;