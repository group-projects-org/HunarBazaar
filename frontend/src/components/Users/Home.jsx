import { useEffect, useState, useRef } from "react";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
import axios from "axios";
import { CategoryCard, MarqueeCard } from "../Cards";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [numOfCategories, setNoOfCategories] = useState(() => 
    typeof window !== "undefined" && window.innerWidth >= 768 ? 10 : 6);
  const slides = useRef([]);

  useEffect(() => {
    slides.current = Array.from({ length: 10 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 5);
  }, []);

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
    const timer = setInterval(() => {setCurrentSlide((prev) => (prev + 1) % 5);}, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {setCurrentSlide((prev) => (prev - 1 + 5) % 5);};
  const handleNext = () => {setCurrentSlide((prev) => (prev + 1) % 5);};

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
      <div className="relative max-w-full" style={{marginBottom: "-20%"}}>
        {slides.current.map((num, index) => (
          <div key={num} style={{ display: currentSlide === index ? "block" : "none" }}> <img className= "w-full h-auto"src={`/assets/Discounts/Discount${num}.jpeg`} alt={`Slide ${num}`} /> </div>
        ))}
        <button className="h-[50%] top-0 cursor-pointer absolute left-[0.5px] text-black font-bold text-[30px] bg-transparent border-0 shadow-none active:border-2 active:border-black active:shadow-[0_0_0_1.5px_#ddd] hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300" style={{padding: "10px 15px"}} onClick={handlePrev}> &#10094; </button>
        <button className="h-[50%] top-0 cursor-pointer absolute right-[0.5px] text-black font-bold text-[30px] bg-transparent border-0 shadow-none active:border-2 active:border-black active:shadow-[0_0_0_1.5px_#ddd] hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300" style={{padding: "10px 15px"}}onClick={handleNext}> &#10095; </button>
      </div>

      <MarqueeCard announcements={["🎉 Mega Festive Sale — Up to 70% OFF on all categories!", "🚚 Free Delivery on Orders Above ₹499!", "🔥 Flash Deal: Buy 2 Get 1 FREE on Select Items!", "🕒 Hurry! Limited-Time Offers Ending Soon!", "🎁 Exclusive Combo Offers Available Today!", "🌟 New Arrivals — Fresh Styles Just Dropped!", "🛍️ Flat ₹200 OFF on Your First Purchase!", "💥 Clearance Sale — Grab Before It’s Gone!", "✨ Join Trendify Plus & Get Early Access to Big Sales!"]} />

      <div className="relative border-0 bg-transparent shadow-none w-full text-center rounded-lg" style={{ padding: '10px 20px' }}>
        <h1 className="font-bold text-xl md:text-2xl" style={{fontFamily: "Merriweather, Cambria, serif"}}>Our Categories</h1>
        <div className="flex flex-wrap justify-center gap-3 md:gap-5 w-full box-border custom-container" style={{margin:"0"}}>
          {categories.slice(0, numOfCategories).map((listItem, index) => (<CategoryCard key={listItem.id || index} category={listItem} />))}
        </div>
        {numOfCategories < categories.length && (
          <button  className="bg-[#3cbf4e] hover:bg-[#45a049] text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]" style={{padding: "8px 12px", margin:"10px"}} onClick={() => setNoOfCategories(Math.min(categories.length, numOfCategories + 4))}>Load More...</button>
        )}
      </div>
      <Footer />
      <style>{`.custom-container { margin: 0; }
        @media (min-width: 1024px) {.custom-container { padding: 20px; }}
      `}</style>
    </div>
  );
};

export default Home;