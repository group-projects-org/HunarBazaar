import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { FaHome, FaInfoCircle, FaBoxOpen, FaShoppingCart, FaClipboardList } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const Header = ({ userType }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState(null);
  const loggedIn = !!localStorage.getItem("username");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [picture, setPicture] = useState('/assets/User.jpg');
  const userTabs = [
    ["/Home", FaHome, "Home"],
    ["/About/users", FaInfoCircle, "About"],
    ["/Products", FaBoxOpen, "Products"],
    ["/CartCheckout", FaShoppingCart, "Cart"],
    ["/Orders", FaClipboardList, "Orders"]
  ]; 
  const sellerTabs = [
    ["/seller/Home", TrendingUp, "Dashboard"],
    ["/About/sellers", FaInfoCircle, "About"],
    ["/seller/Products", Package, "Product"],
    ["/seller/Orders", Users, "Orders"],
    ["/seller/Analytics", DollarSign, " Analytics"],
    ["/seller/Invoices", FaClipboardList, "Invoices"]
  ]; 
  useEffect(() => {
    axios.get(`${BASE_URL}/api/userData`, {
      withCredentials: true,
    }).then((res) => {
      const userData = res.data.data;
      if (userData && userData.picture){setPicture(userData.picture);}
    });
  }, []);
  const handleLogoutClick = async () => {
    setError("Logging Out...");
    const rawCart = localStorage.getItem("cart");
    let cart = [];
    try {cart = JSON.parse(rawCart) || [];}
    catch {cart = [];}
    try {
      const response = await axios.post(`${BASE_URL}/api/logout`, { cart }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      const result = response.data;
      if (result.message === "Logout successful") {
        localStorage.removeItem("username");
        localStorage.removeItem("cart");
        setDropdownVisible(false);
      } else {
        console.error('Logout failed');
        setError("Failed to Logout");
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError("Error during Logout");
    } finally { setError(null); setPicture('/assets/User.jpg'); navigate('/');}
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) 
        setDropdownVisible(false);
    }; if (dropdownVisible) document.addEventListener("mousedown", handleClickOutside);
    else  document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownVisible]);

  return (
    <div>
      {error && (
        <>
          <div className="toast-overlay" onClick={() => {if (error !== "Logging Out...") setError(null);}}/>
          <div className="toast-message error" onClick={() => {if (error !== "Logging Out...") setError(null);}}>{error}</div>
        </>
      )}
      <div className="relative flex justify-between items-center h-10 sm:h-[60px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-linear-to-r from-[#3cbf4e] to-[#2ecc71] z-1000">

        <div className="flex items-center gap-[0.4rem] md:gap-[0.8rem]">
          <img className="h-10 sm:h-[60px] w-auto object-contain" style={{marginLeft: "5px"}} src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <h1 className="text-[1rem] md:text-[1.6rem] font-bold text-black" style={{ fontFamily: "Eagle Lake, cursive" }}>हुनरBazaar</h1>
        </div>

        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <small className="text-[14px] text-black font-light leading-[1.2] tracking-[1px] uppercase text-center whitespace-nowrap" style={{ fontFamily: "Montserrat, Poppins, sans-serif" }} > "Craftsmanship you can feel, Luxury you can wear" </small>
        </div>

        <div ref={dropdownRef} className="flex items-center gap-4 text-black relative cursor-pointer" style={{marginRight: "15px"}} onClick={() => setDropdownVisible(!dropdownVisible)} >
          <span className="overflow-hidden hover:text-[#333]" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {loggedIn? localStorage.getItem("username") : <button onClick={() => navigate('/Login')} className='font-bold hover:underline cursor-pointer py-4 text-[14px]' style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>Hello, Login</button>}
          </span>
          <img src={picture} alt="User" className="w-8 h-8 rounded-[50%] bg-transparent text-white flex items-center justify-center font-medium" />
          {dropdownVisible && (
          <div className="absolute top-full whitespace-nowrap right-0 bg-white shadow-[0_4px_8px_rgba(0,0,0,0.15)] rounded-sm z-10 p-2">
            <button className="w-full block text-left cursor-pointer hover:bg-[#e4e4e4] rounded-sm bg-transparent border-none disabled:hover:bg-transparent disabled:cursor-not-allowed disabled={!loggedIn} px-4 py-2" disabled={!loggedIn}>View Profile </button>
            <button onClick={handleLogoutClick} className="w-full block text-left cursor-pointer rounded-sm hover:bg-[#e4e4e4] bg-transparent border-none disabled:hover:bg-transparent disabled:cursor-not-allowed px-4 py-2" disabled={!loggedIn}> Logout </button>
          </div> )}
        </div>
      </div>

      <Navbar tabs={userType == "sellers"? sellerTabs: userTabs} />
    </div>
  );
};

const NavLink = ({ href, icon: Icon, label }) => (
  <a href={href} className="inline-flex items-center gap-2 text-[12px] md:text-[16px] no-underline text-white bg-transparent rounded-[7px] transition-colors duration-300 hover:bg-[#3cbf4e] hover:text-white" style={{"padding": "6px 10px"}}
  > <Icon /> {label} </a>
);

const Navbar = ({ tabs }) => {
  const [navVisible, setNavVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (windowWidth >= 768) setNavVisible(true);
  }, [windowWidth]);
  return (
    <nav className="flex flex-col md:flex-row justify-center md:items-center gap-0 md:gap-5 bg-[#444] shadow-[0_4px_6px_rgba(0,0,0,0.1)]" style={{ padding: windowWidth >= 768 ? "10px" : "5px" }}>
      <div className='flex gap-2 justify-center items-center'>
        <button onClick={() => setNavVisible((prev) => !prev)} className="md:hidden rounded-[50%] border border-[#3cbf4e] text-white text-[10px] w-5 h-5" style={{marginBottom:"2px", padding:"0"}}> ☰ </button>
        <small className="md:hidden text-[10px] text-white uppercase text-center whitespace-nowrap" style={{ fontFamily: "Montserrat, Poppins, sans-serif" }} > "Skill in every hand, Market at every doorstep" </small>
      </div>
      {(navVisible || windowWidth >= 768) && (
        <div className="flex flex-col md:flex-row gap-0 md:gap-5">{tabs.map(([href, Icon, label]) => (<NavLink key={label} href={href} icon={Icon} label={label} />))}</div>
      )}
    </nav>
  );
};

const Footer = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const links = [
    ["Privacy Policy", `https://hunar-bazaar-theta.vercel.app/PrivacyPolicy/`, "https://cdn-icons-png.flaticon.com/512/3064/3064197.png"],
    ["Terms of Serivce", "https://hunar-bazaar-theta.vercel.app/TermsOfService/", "https://cdn-icons-png.flaticon.com/512/942/942748.png"],
    ["tanujbhatt8279@gmail.com", "mailto:tanujbhatt8279@gmail.com", "https://cdn-icons-png.flaticon.com/512/732/732200.png"],
    ["vp1246194@gmail.com", "mailto:vp1246194@gmail.com", "https://cdn-icons-png.flaticon.com/512/732/732200.png"]
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/userData`, {
          withCredentials: true,
        }); const userData = response.data.data;
        setUserEmail(userData.email || "");
        setSubscribed(userData.subscribed || false);
      } catch (error) { console.error("❌ Error fetching user data:", error);}
    }; fetchUserData();
  }, []);

  const handleSubscription = async (e) =>{
  e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/subscribe`, { subscribed }, {
        withCredentials: true,
      }); setSubscribed(!subscribed);
    } catch (error) { console.error("❌ Error fetching user data:", error);}
  }

  return (
    <footer>
      <div className="flex flex-col md:flex-row justify-around bg-[#f8f8f8] gap-5 overflow-hidden" style={{padding: "20px"}}>
        <div className="flex-1 flex flex-col text-center w-full">
          <h3 className='text-[1rem] md:text-[1.2rem] text-[#333] font-bold' style={{fontFamily: "Merriweather, Cambria, serif", marginBottom: "15px"}}>Special Offers</h3>
          <p className="text-[0.8rem] md:text-[1rem] text-[#666666] block w-[90%] leading-relaxed" style={{margin: "2px auto auto auto", fontFamily: "'Segoe UI', sans-serif"}}>Check out our latest offers on clothing and apparel! <b>NEW ARRIVALS and SPECIAL COMBO OFFERS</b> designed just for you !!!</p>
        </div>
        <div className="flex-1 flex flex-col text-center">
          <h3 className='text-[1rem] md:text-[1.2rem] text-[#333] font-bold' style={{fontFamily: "Merriweather, Cambria, serif", marginBottom: "10px"}}>Subscribe to Our Newsletter</h3>
          <form onSubmit={handleSubscription}>
            <input type="email" defaultValue={userEmail} className="text-[0.8rem] md:text-[1rem] text-[#666666] block w-[80%] rounded-[5px] border border-[#bcb9b9] cursor-not-allowed" style={{margin: "auto auto 14px auto", padding: "10px"}} readOnly required />
            <button type="submit" className={`${subscribed ? "bg-red-500 hover:bg-red-600" : "bg-[#3cbf4e] hover:bg-[#45a049]"} text-white border-0 rounded-[5px] cursor-pointer text-[0.8rem] md:text-[1rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] py-2 px-3`}>{subscribed? "Cancel" : "Subscribe"}</button>
          </form>
        </div>
        <div className="flex-1 flex flex-col text-center">
          <h3 className='text-[1rem] md:text-[1.2rem] text-[#333] font-bold' style={{fontFamily: "Merriweather, Cambria, serif", marginBottom: "15px"}}>Connect With Developer</h3>
          {links.map(([name, url, icon], idx)=> {
          return (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[#45a049] hover:text-black transition-colors duration-300 no-underline text-[0.7rem] md:text-[0.9rem] flex items-center justify-start wrap-break-all " style={{marginBottom: "7px", paddingLeft: "20%", fontFamily: "Poppins, sans-serif"}} >
              <img className="w-[15px] h-[15px] md:w-[25px] md:h-[25px]" style={{margin: "0px 8px"}}src={icon} alt={name} /> {name} 
            </a>
          );
        })}
        </div>
      </div>
      <p className="text-center bg-[#555555] text-white relative bottom-0 width-full" style={{padding: "15px", fontFamily: "Poppins, sans-serif"}}>&copy; {new Date().getFullYear()}<b> | My E-Clothing Website </b> | All rights reserved</p>
    </footer>
  );
};

export { Header, Footer };