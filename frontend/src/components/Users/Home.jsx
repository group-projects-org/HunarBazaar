import React, { useEffect, useState } from "react";
import "./../CSS/product.css";
import "./../CSS/slideshow.css";
import { Header, Footer } from "../header_footer";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
import axios from "axios";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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
      <div className="slideshow-container">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
          <div key={num} className="mySlides fade" style={{ display: currentSlide === index ? "block" : "none" }}> <img src={`/assets/Discounts/Discount${num}.jpeg`} alt={`Slide ${num}`} /> </div>
        ))}
        <button className="prev" onClick={handlePrev}> &#10094; </button>
        <button className="next" onClick={handleNext}> &#10095; </button>
      </div>

      <div id="category" className="section slideShowSection">
        <h1>Our Categories</h1>
        <div id="category-list" className="product-container">
          {categories.map((category) => (
            <div className="product-card slideShowCard" key={category} onClick={() => navigate(`/Products?category=${encodeURIComponent(category)}`)}> 
              <img src={`/assets/Categories/${category}.jpeg`} alt={category} />
              <div className="category-content">
                <h3>{category}</h3>
                <p>Explore our wide range of {category} products.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;