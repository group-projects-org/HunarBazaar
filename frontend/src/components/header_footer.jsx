import './CSS/Header_Footer.css';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { FaHome, FaInfoCircle, FaBoxOpen, FaShoppingCart, FaClipboardList } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const Header = ( {a}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogoutClick = async () => {
    setError("Logging Out...");
    try {
      const response = await axios.post(`${BASE_URL}/api/logout`, null, {
        headers: {'Content-Type': 'application/json',},
        withCredentials: true,
      });
      const result = await response.json();
      if (result.email) {
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("username");
        localStorage.removeItem("phone");
        localStorage.removeItem("userType");
        setDropdownVisible(false);
      } else {
        console.error('Logout failed');
        setError("Failed to Logout");
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError("Error during Logout");
    }setError(null); navigate('/');
  };  

  return (
    <div>
      {error && (
        <>
          <div className="toast-overlay" onClick={() => {if (error !== "Logging Out...") setError(null);}}/>
          <div className="toast-message error" onClick={() => {if (error !== "Logging Out...") setError(null);}}>{error}</div>
        </>
      )}
      <div className="header">
        <div className="left-section">
          <img className="logo" src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <h1 style={{ fontFamily: "'Eagle Lake', cursive" }}>हुनरBazaar</h1>
        </div>
        <small className="slogan">"Skill in every hand, Market at every doorstep"</small>
        <div className="user-info" onClick={() => setDropdownVisible(!dropdownVisible)}>
          <span>{localStorage.getItem("user_email")}</span>
          <img src={'/assets/User.jpg'} alt="User" className="user-avatar" />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button >View Profile</button>
              <button onClick={handleLogoutClick}>Logout</button>
            </div>
          )}
        </div>
      </div>
      {a ? <SellerNavbar /> : <Navbar />}
    </div>
  );
};

const Navbar = () => {
  return (<nav className="navbar">
    <a href="/Home"><FaHome /> Home</a>
    <a href="/Home"><FaInfoCircle /> About</a>
    <a href="/Products"><FaBoxOpen /> Products</a>
    <a href="/CartCheckout"><FaShoppingCart /> Cart</a>
    <a href="/Orders"><FaClipboardList /> Orders</a>
  </nav>)
}
const SellerNavbar = () => {
  return (
    <nav className="navbar">
      <a href="/seller/Dashboard"><TrendingUp size={18} /> Dashboard</a>
      <a href="/seller/Products"><Package size={18} /> Product</a>
      <a href="/seller/Orders"><Users size={18} /> Orders</a>
      <a href="/seller/Analytics"><DollarSign size={18} /> Analytics</a>
    </nav>
  );
};

const Footer = () => {
     return (
       <footer className="footer">
         <div className="additional-section">
           <div className="featured">
             <h3>Special Offers</h3>
             <p>Check out our latest offers on clothing and apparel!</p>
           </div>
           <div className="newsletter">
             <h3>Subscribe to Our Newsletter</h3>
             <form action="/subscribe" method="POST">
               <input type="email" defaultValue={localStorage.getItem("user_email")} required />
               <button type="submit">Subscribe</button>
             </form>
           </div>
           <div className="social-media">
             <h3>Connect With Developer</h3>
             <a href="https://www.linkedin.com/in/khajanbhatt/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
             <a href="https://github.com/Khajan38/" target="_blank" rel="noopener noreferrer">Github Repositories</a>
             <a href="https://khajan38.github.io/Portfolio/" target="_blank" rel="noopener noreferrer">Portfolio Website</a>
             <a href="mailto:tanujbhatt8279@gmail.com" target="_blank" rel="noopener noreferrer">khajan@gmail.com</a>
           </div>
         </div>
         <p>&copy; {new Date().getFullYear()} <strong>My E-Clothing Website</strong>. All rights reserved.</p>
       </footer>
     );
   };

export { Header, Footer };