import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductCard } from "../Cards";
import axios from "axios";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const ProductCards = ({ cart, editable = false, setCart }) => {
  if (!cart || cart.length === 0) return <p>Your cart is empty.</p>;
  return (
    <>
      {cart.map(({ id, name, price, image, orderQty, orderSize, orderColor }, index)=>(
        <ProductCard key={`${id}-${orderSize}-${orderColor}-${index}`} product={{ id: id, name, price, image, orderQty, orderSize, orderColor }} user_type="users" order={true} editable={editable} setCart={setCart}/>
      ))}
    </>
  );
};

const CartCheckout = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("cart");
  const [searchInput, setSearchInput] = useState("");
	const [billing, setBilling] = useState({name: localStorage.getItem("username") || "", email: "", phone: "", address: "", special_instructions: "", agent_notes: ""});
	const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getCart = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart"));
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
  
  const handleField = (field) => (e) => {setBilling({ ...billing, [field]: e.target.value });};
	
  const placeOrder = async (e) => {
    e.preventDefault();
    const { name, email, phone, address } = billing;
    if (!name || !email || !phone || !address) {
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
        setCart([]);
        console.log(data);
        navigate("/thankyou", { state: data });
      } else alert(`Order confirmation failed: ${data.error || "Unknown error"}`);
    } catch (error) {
      console.error("Order confirmation error:", error);
      alert("An error occurred during order confirmation.");
    }
  };

  if (loading) return (<>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </>); if (error) return (<>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </>);

  return (
    <><Header />
      {step === "cart" && (
        <section className="block w-full max-w-[1200px] text-center bg-[#f4f4f4] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]" style={{margin: "40px auto", padding: "10px 20px"}}>
          <h1 className="font-bold text-2xl" style={{fontFamily: "Merriweather, Cambria, serif", margin: "10px"}}>Your Cart</h1>
          <div className="flex items-center justify-center gap-2.5 bg-[#f2f2f2] rounded-lg" style={{margin: "10px 0", padding: "10px"}}>
            <input className="w-[250px] text-[1rem] border-[#ddd] border-2 rounded-[5px]" style={{padding: "10px"}} type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." />

            <button className={`bg-[#3cbf4e] h-11 text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 decoration-0 hover:bg-[#45a049] ${cart.length === 0 ? "bg-[#ccc] text-[#666] cursor-not-allowed opacity-60 pointer-events-none" : ""}`} disabled={cart.length === 0 || localStorage.getItem("userType") === "agent"? true: false} onClick={() => setStep("checkout")} style={{padding: "10px 15px"}}> Checkout</button>
          </div>
          <div className="flex flex-wrap justify-center gap-[15px] w-full box-border" style={{padding: "20px"}}><ProductCards cart={cart} editable setCart={setCart}/></div>
        </section>
      )}

      {step === "checkout" && (
        <section className="block w-full max-w-[1200px] text-center bg-[#f4f4f4] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]" style={{margin: "40px auto", padding: "10px 20px"}}>
          <h1 className="font-bold text-2xl" style={{fontFamily: "Merriweather, Cambria, serif", margin: "10px"}}>Checkout</h1>
          <div className="flex flex-wrap justify-center gap-[15px] w-full box-border" style={{padding: "20px"}}><ProductCards cart={filteredCart} /></div>

					{cart.length > 0 && (
						<div className="w-[70vw] max-w-none border border-[#ccc] rounded-2xl bg-[#f9f9f9] hover:cursor-not-allowed" style={{margin: "10px auto 70px auto", padding: "30px 40px"}}>
							<div className="flex items-center justify-between font-larger text-[17px] font-bold" style={{fontFamily: "Merriweather, Cambria, serif", padding: "2px 0px"}}><span>Total Items</span><span>{cart.length}</span></div>
							<div className="flex items-center justify-between font-larger text-[17px] font-bold" style={{fontFamily: "Merriweather, Cambria, serif", padding: "2px 0px"}}><span>Cart Total</span><span>₹ {total.toFixed(2)}</span></div>
							<div className="flex items-center justify-between font-larger text-[17px] font-bold" style={{fontFamily: "Merriweather, Cambria, serif", padding: "2px 0px"}}><span>Delivery Charges</span><span className="price">₹ 40</span></div>
							<hr />
							<div className="flex items-center justify-between font-larger text-[17px] font-bold" style={{fontFamily: "Merriweather, Cambria, serif", padding: "2px 0px"}}><span className="font-bold">Order Total</span><span className="price">₹ {(total + 40).toFixed(2)}</span></div>
						</div>
					)}

          <div className="bg-[#f9f9f9] w-[90%] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]" style={{fontFamily: "'Segoe UI', sans-serif", margin: "20px auto", padding: "24px"}}>
            <h1 className="text-3xl text-[#28a745] mb-2" style={{fontFamily: "Montserrat, Poppins, sans-serif", margin: "5px 0px 20px 0px"}}>Billing and Payments</h1>
            <form className="flex flex-col gap-3 w-full items-center" style={{padding: "0 30px"}} onSubmit={placeOrder}>
              <div className="flex justify-between gap-5 w-full">
                <input className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} type="text" value={billing.name} onChange={handleField("name")} required />

                <input className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} type="email" value={billing.email} onChange={handleField("email")} required />

                <input className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} type="tel" value={billing.phone} onChange={handleField("phone")} required />
              </div>

              <textarea className="w-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} placeholder="Shipping Address" value={billing.address} onChange={handleField("address")} required/>

              <div className="flex justify-between gap-5 w-full h-[100px]">
                <textarea className="w-full h-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} placeholder="Special Instructions, LandMarks" value={billing.special_instructions} onChange={handleField("special_instructions")} />

                <textarea className="w-full h-full text-[1rem] border border-[#ccc] rounded-lg transition duration-300 focus:border-[#3cbf4e] focus:outline-none" style={{padding: "10px 14px"}} placeholder="Agent Notes" value={billing.agent_notes} onChange={handleField("agent_notes")} />
              </div>

              <div className="flex justify-center gap-5" style={{marginTop: "10px"}}>
                <button className="text-[1rem] text-white font-bold border-0 rounded-lg cursor-pointer bg-[#28a745] transition duation-300 focus:border-[#28a745] focus:outline-none hover:bg-[#218838] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-[0.6]transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)" style={{fontFamily: "'Segoe UI', sans-serif", padding: "10px 20px"}} type="button" onClick={() => setStep("cart")}> Back to Cart</button>
                <button className="text-[1rem] text-white font-bold border-0 rounded-lg cursor-pointer bg-[#28a745] transition duation-300 focus:border-[#28a745] focus:outline-none hover:bg-[#218838] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-[0.6]transition-transform duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)" style={{fontFamily: "'Segoe UI', sans-serif", padding: "10px 20px"}} type="submit" disabled={cart.length === 0}>Place Order</button>
              </div>
            </form>
          </div>
        </section>
      )}
    <Footer /></>
  );
};

export default CartCheckout;