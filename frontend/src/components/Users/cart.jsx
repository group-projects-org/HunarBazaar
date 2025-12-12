import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductCard } from "../Cards";
import axios from "axios";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return [];
    return JSON.parse(value);
  } catch { return []; }
};

const ProductCards = ({ cart, navigate, editable = false, setCart }) => {
  if (!cart || cart.length === 0) return(<div className="flex flex-col">
    <div className="text-gray-500 italic mb-4 text-sm"> Your cart is empty... </div>
    <button className="bg-[#3cbf4e] hover:bg-[#45a049] text-white border-0 rounded-[5px] cursor-pointer text-[0.8rem] md:text-[1rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] px-3 py-2" onClick={() => navigate('/Products')}>Start Shopping Now</button>
  </div>);
  return (
    <>
      {cart.map(({ id, name, price, image, orderQty, orderSize, orderColor, maxQty }, index)=>(
        <ProductCard key={`${id}-${orderSize}-${orderColor}-${index}`} product={{ id: id, name, price, image, orderQty, orderSize, orderColor, maxQty }} user_type="users" order={true} editable={editable} setCart={setCart}/>
      ))}
    </>
  );
};

const CartCheckout = () => {
  const DELIVERY_CHARGE = 40.00;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("cart");
  const [searchInput, setSearchInput] = useState("");
	const [billing, setBilling] = useState({name: localStorage.getItem("username") || "", email: "", phone: "", address: "", special_instructions: "", agent_notes: "", location: "", pincode: null});
	const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getCart = () => {
      try {
        const storedCart = safeParse('cart');;
        return Array.isArray(storedCart) ? storedCart : [];
      } catch {return [];}
    }; const stored = getCart();
    setCart(stored);
    const params = new URLSearchParams(location.search);
    const urlStep = params.get("step");
    if (urlStep === "checkout") setStep("checkout");
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/userData`, {
          withCredentials: true,
        }); const userData = response.data.data;
        setBilling((prev) => ({...prev,name: userData.username || "", email: userData.email || "", phone: userData.phone || ""}));
      } catch (error) { console.error("❌ Error fetching user data:", error);}
    }; fetchUserData();
    setLoading(false);
  }, [location.search]);

  const filteredCart = searchInput.trim() === ''? cart : cart.filter(({ name }) => name?.toLowerCase().includes(searchInput.toLowerCase()));

  const total = cart.reduce((sum, item) => sum + item.price * item.orderQty, 0);
  const savings = cart.reduce((sum, item) => sum + item.savings * item.orderQty, 0);
  
  const handleField = (field) => (e) => {setBilling({ ...billing, [field]: e.target.value });};
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setBilling({ ...billing, pincode: value });
    if (value.length === 6 && /^[0-9]{6}$/.test(value)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        if (data[0].Status === "Success") {
          const districtName = data[0].PostOffice[0].District;
          setBilling((prev) => ({ ...prev, location: districtName }));
        } else {
          setBilling((prev) => ({ ...prev, location: "" }));
          alert("Invalid Pincode");
        }
      } catch (error) { console.error("Error fetching district:", error); }
    } else { setBilling((prev) => ({ ...prev, location: "" })); }
  };
	
  const placeOrder = async (e) => {
    e.preventDefault();
    const { name, email, phone, address, pincode, location } = billing;
    if (!name || !email || !phone || !address || !location || !pincode) {
      alert("Please fill out all required fields.");
      return;
    } const orderDetails = { ...billing, cart, total };
    try {
      const response = await axios.post(`${BASE_URL}/api/order`, orderDetails, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); const data = response.data;
      if (response.status === 409) alert(data.error || "User already exists.");
      else if (response.status === 200) {
        alert("Order placed successfully!");
        setCart([]); localStorage.setItem('cart', JSON.stringify([]));
        navigate("/thankyou", { state: data });
      } else alert(`Order confirmation failed: ${data.error || "Unknown error"}`);
    } catch (error) {
      console.error("ORDER ERROR FULL OBJECT:", error);
      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("RESPONSE DATA:", error.response.data);
        console.error("HEADERS:", error.response.headers);
      } else {console.error("NO RESPONSE (NETWORK/CONFIG ERROR):", error.message);}
    alert("An error occurred during order confirmation.");
  }};

  if (loading) return (<>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </>); if (error) return (<>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </>);

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <Header />
      {step === "cart" && (
        <section className="block w-full max-w-[1200px] text-center bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:my-10 mx-auto py-2.5 px-5">
          <h1 className="font-bold text-2xl m-2.5" style={{fontFamily: "Merriweather, Cambria, serif"}}>Your Cart</h1>
          <div className="flex items-center justify-center gap-2.5 bg-[#f2f2f2] rounded-lg my-2.5 mx-0 p-2.5">
            <input className="w-[250px] text-[1rem] border-[#ddd] border-2 rounded-[5px] p-2.5" type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." />

            <button className={`bg-[#3cbf4e] h-11 text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 decoration-0 hover:bg-[#45a049] py-2.5 px-[15px] ${cart.length === 0 ? "bg-[#ccc] text-[#666] cursor-not-allowed opacity-60 pointer-events-none" : "" }`} disabled={cart.length === 0 || localStorage.getItem("userType") === "agent"? true: false} onClick={() => setStep("checkout")}> Checkout</button>
          </div>
          <div className="flex flex-wrap justify-center gap-[15px] w-full box-border p-5"><ProductCards cart={filteredCart} navigate={navigate} editable={true} setCart={setCart}/></div>
        </section>
      )}

      {step === "checkout" && (
        <section className="block w-full max-w-[1200px] text-center bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:my-10 mx-auto py-2.5 px-5">
          <h1 className="font-bold text-2xl m-2.5" style={{fontFamily: "Merriweather, Cambria, serif"}}>Checkout</h1>
          <div className="flex flex-wrap justify-center gap-[15px] w-full box-border p-5"><ProductCards cart={cart} navigate={navigate} editable={false} setCart={setCart}/></div>

          {cart.length > 0 && (
            <div className="bg-[#e9f7ed] rounded-[10px] border border-[#e0e0e0] text-left px-15 py-7 w-[90%] mx-auto mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]" style={{fontFamily: "'Segoe UI', sans-serif"}}>
              <center><h1 className="text-3xl text-[#28a745] mt-[5px] mr-0 my-5 ml" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>Order Summary</h1></center>
              <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
                <span className="font-bold" style={{fontFamily: "Merriweather"}}>Cart Total:</span>
                <span>₹ {(total + savings).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
                <span className="font-bold" style={{fontFamily: "Merriweather"}}>Discount:</span>
                <span> - ₹ {savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
                <span className="font-bold" style={{fontFamily: "Merriweather"}}>Delivery Charges:</span>
                <span>+ ₹ {DELIVERY_CHARGE.toFixed(2)}</span>
              </div>
              <hr className="border border-[#ddd] h-0.5 bg-black my-2" />
              <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
                <span className="font-bold" style={{fontFamily: "Merriweather"}}>Order Total:</span>
                <span>₹ {(total + DELIVERY_CHARGE).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
                <span className="font-bold" style={{fontFamily: "Merriweather"}}>Total Items:</span>
                <span>{cart.length} items</span>
              </div>
              <center><span className="text-3xl text-green-700 font-bold" style={{fontFamily: "Great Vibes, cursive"}}>Your total savings on this order is: </span><span className="text-xl text-green-700 font-bold" style={{fontFamily: "Merriweather"}}>₹ {savings.toFixed(2)}</span></center>
            </div>
          )}

          <div className="bg-[#f9f9f9] w-[90%] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] my-5 mb-10 md:mb-5 mx-auto py-6 px-10 md:py-10 md:px-14" style={{fontFamily: "'Segoe UI', sans-serif"}}>
            <h1 className="text-3xl text-[#28a745] mt-[5px] mr-0 my-5 ml" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>Billing and Payments</h1>
            <form className="flex flex-col gap-3 w-full items-center py-0 px-0.5" onSubmit={placeOrder}>
              <div className="flex flex-col md:flex-row justify-between gap-5 w-full">

                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="username" className="font-bold py-0 px-0.5">Username</label>
                  <input id="username" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5 cursor-not-allowed" type="text" value={billing.name} onChange={handleField("name")} readOnly required />
                </div>

                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="email" className="font-bold py-0 px-0.5">Email</label>
                  <input id="email" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5 cursor-not-allowed" type="email" value={billing.email} onChange={handleField("email")} readOnly required />
                </div>

                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="phone" className="font-bold  py-0 px-0.5">Phone Number</label>
                  <input id="phone" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5 cursor-not-allowed" type="tel" value={billing.phone} onChange={handleField("phone")} readOnly required />
                </div>
              </div>

              <div className="w-full flex flex-col justify-center items-start">
                <label htmlFor="address" className="font-bold  py-0 px-0.5">Delivery Destination</label>
                <textarea id="address" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5" placeholder="Shipping Address" value={billing.address} onChange={handleField("address")} required/>
              </div>

              <div className="w-full flex flex-col md:flex-row justify-center items-center gap-5">
                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="pincode" className="font-bold py-0 px-0.5">Pincode</label>
                  <input id="pincode" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5" type="text" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" value={billing.pincode} onChange={handlePincodeChange} required />
                </div>

                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="location" className="font-bold py-0 px-0.5">District</label>
                  <input id="location" className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none cursor-not-allowed py-2.5 px-3.5" type="text" value={billing.location} readOnly onChange={handleField("location")} required />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-5 w-full">
                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="special_ins" className="font-bold py-0">Speical Instructions</label>
                  <textarea id="special_ins" className="w-full h-[120px] text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5" placeholder="Special Instructions, LandMarks" value={billing.special_instructions} onChange={handleField("special_instructions")} />
                </div>

                <div className="w-full flex flex-col justify-center items-start">
                  <label htmlFor="agent_notes" className="font-bold py-0 px-0.5">Agent Notes</label>
                  <textarea id="agent_notes" className="w-full h-[120px] text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none py-2.5 px-3.5" placeholder="Agent Notes" value={billing.agent_notes} onChange={handleField("agent_notes")} />
                </div>
              </div>

              <div className="flex justify-center gap-5 mt-2.5">
                <button className="text-[1rem] text-white font-bold border-0 rounded-lg cursor-pointer bg-[#28a745] transition duation-300 focus:border-[#28a745] focus:outline-none hover:bg-[#218838] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-[0.6]transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15) py-2.5 px-5" style={{fontFamily: "'Segoe UI', sans-serif"}} type="button" onClick={() => setStep("cart")}> Back to Cart</button>
                <button className="text-[1rem] text-white font-bold border-0 rounded-lg cursor-pointer bg-[#28a745] transition duation-300 focus:border-[#28a745] focus:outline-none hover:bg-[#218838] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-[0.6]transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15) py-2.5 px-5" style={{fontFamily: "'Segoe UI', sans-serif"}} type="submit" disabled={cart.length === 0}>Place Order</button>
              </div>
            </form>
          </div>
        </section>
      )}
    <Footer />
  </div>
  );
};

export default CartCheckout;