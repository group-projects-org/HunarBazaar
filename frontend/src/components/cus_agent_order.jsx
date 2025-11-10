import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "./header_footer";
import { ProductCard } from "./Cards";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const CusAgentOrder = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [accessLevel, setAccessLevel] = useState("public");
  const [password, setPassword] = useState(null);
  const [order_id, setOrder_ID] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    const logout = async () => {
      const cart = localStorage.getItem('cart');
      try {
        const response = await axios.post(`${BASE_URL}/api/logout`, { cart },{
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            signal: controller.signal,
          }
        ); const result = response.data;
        if (result.message === "Logout successful") {
          localStorage.removeItem("username");
          localStorage.removeItem("cart");
        } else {
          console.error('Logout failed');
          setError("Failed to Logout");
        }
      } catch (error) {
        if (axios.isCancel(error)) { console.log('Logout request canceled');
        } else {
          console.error('Error during logout:', error);
          setError("Error during Logout");
        }
    }}; logout();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    setOrder_ID(qs.get("order_id") ?? null);
    setAccessLevel(qs.get("password") ? "protected" : "public");
  }, [location.search]);
  
  useEffect(() => {
    if (accessLevel !== "protected") return;
    const entered = prompt("Enter the Password:");
    if (entered) setPassword(entered);
    else window.location.href = "/";
  }, [accessLevel]);

  useEffect(() => {
    if (!order_id) return;
    if (accessLevel === "protected" && !password) return;
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const isProtected = accessLevel === "protected";
        const url = `${BASE_URL}${isProtected ? "/api/getOrderData": `/api/getOrderQR?`}`;
        const res = await axios.get(url, {
          params: { order_id, password },
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
          signal: abort.signal
        }); setResult(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || err.message);
      } finally { setLoading(false);}
    })(); return () => abort.abort();
  }, [order_id, accessLevel, password]);
  
  const getDeliveryStatus = (data) => {
    if (!data?.order_date || !data?.delivery_date) return "Unknown";
    const orderDate = new Date(data.order_date);
    const deliveryDate = new Date(data.delivery_date);
    const currentDate = new Date();
    if (currentDate > deliveryDate) return "Delivered";
    const totalDuration = deliveryDate - orderDate;
    const timeLeft = deliveryDate - currentDate;
    if (timeLeft <= totalDuration / 3) return "Out for Delivery";
    return "Shipping";
  };

  if (loading) return (<>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </>); if (error)   return (<>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </>); if (!result) return null;

  return (<> 
    <Header />
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start" style={{padding:"24px", fontFamily:'Roboto, sans-serif'}}>

      <div className="flex flex-col flex-2 bg-[#ffffff] border border-[#e0e0e0] rounded-[10px] items-start" style={{padding:"30px", marginLeft: "15px"}}>
        <div className="w-full rounded-[10px] shadow-[0_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-102 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]" style={{padding: "20px 30px"}}>
          <h2 className="text-[20px] text-[#3cbf4e] font-bold" style={{margin:"0 0 10px 0", fontFamily:"Merriweather, Cambria, serif"}}>Order Details</h2> 
          <hr className="border border-[#ddd]" style={{margin: "2px"}}/>

          <div className="flex items-center justify-center gap-4" style={{margin:"20px"}}>
            {result.data.images.map((val, index) => (
              <img key={index} src={val} alt={`Product Image ${index + 1}`} className="w-32 h-32 object-cover rounded-lg border border-[#ccc]"/>
            ))}
          </div>
          
          <div className="flex justify-between items-center font-bold text-[20px] text-[#1d1c1c]" style={{margin: "5px 0"}}>
            <span>Order ID:</span>
            <span>{result?.data?.order_id}</span>
          </div>
          <div className="flex justify-between items-center text-[18px] text-[#1d1c1c]" style={{margin: "5px 0"}}>
            <span>Username:</span>
            <span>{result?.userDetails?.username}</span>
          </div>
          <div className="flex justify-between items-center text-[18px] text-[#1d1c1c]" style={{margin: "5px 0"}}>
            <span>Agent:</span>
            <span>{result?.data?.agent_name}</span>
          </div>

          <span className="block text-center font-bold text-[20px]" style={{marginTop: "20px"}}>{result?.data?.payment_status}</span>
          <hr className="border border-[#ddd]" style={{margin: "2px"}}/>

          <div className="relative flex flex-col text-gray-800" style={{ marginTop: "20px", paddingLeft: "30px" }}>
            <div className="flex items-center relative mb-2">
              <div className="w-5 h-5 bg-green-500 text-white rounded-full text-center text-[12px] absolute left-0 flex items-center justify-center"> ✓</div>
              <div style={{marginLeft:"30px"}}>
                Order Confirmed:{" "}{new Date(result?.data?.order_date).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric", })}
              </div>
            </div>
            <div className="absolute w-0.5 bg-green-500 h-7 top-[22px] left-[9px]" />
            <div className="flex items-center relative mb-2">
              <div className="w-5 h-5 bg-green-500 text-white rounded-full text-center text-[12px] absolute left-0 flex items-center justify-center"> ✓ </div>
              <div style={{marginLeft:"30px"}}>
                Delivery:{" "} {new Date(result?.data?.delivery_date). toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric"})}
              </div>
            </div>
            <div className="text-[15px] font-medium" style={{marginLeft:"30px", marginTop:"4px"}}>
              <span className="text-gray-700">Status: </span>
              <span className="text-green-600">{getDeliveryStatus(result?.data)}</span>
            </div>
          </div>
        </div>

        <div className = "min-h-[220px] bg-[#f9f9f9] rounded-[10px] border border-[#e0e0e0] w-full" style={{marginTop:"25px", padding:"20px"}}>
        {accessLevel === "public" ? (
          <center><img className="w-[200px] h-[200px] object-contain border border-[#ddd] rounded-lg" src={`data:image/png;base64,${result?.qr_image_b64}`} alt="Secure order QR" /></center>
        ) : (<>
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span className="font-bold">Address:</span>
            <span>{result?.sensitive_data?.address}</span>
          </div>
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span className="font-bold">Location:</span>
            <span>{result?.sensitive_data?.location}</span>
          </div>
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span className="font-bold">Pincode:</span>
            <span>{result?.sensitive_data?.pincode}</span>
          </div>
          <div className="flex justify-between items-center gap-12" style={{margin:"6px 0"}}>
            <span className="font-bold">Special Instructions:</span>
            <span className="break-word text-end">{result?.sensitive_data?.special_instructions}</span>
          </div>
          <div className="flex justify-between items-center gap-12" style={{margin:"6px 0"}}>
            <span className="font-bold">Agent Notes:</span>
            <span className="break-word text-end">{result?.sensitive_data?.agent_notes}</span>
          </div>
          {result?.user_type === "users" && (<>
            {result.data.payment_status == "Paid" && (<div className="flex justify-between items-center gap-12" style={{margin:"6px 0"}}>
              <span className="font-bold">Transaction ID:</span>
              <span className="break-word text-end">{result?.sensitive_data?.transaction_id}</span>
            </div>)}
            <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
              <span className="font-bold">OTP:</span>
              <span>{result?.sensitive_data?.OTP}</span>
             </div>
            <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
              <span className="font-bold">Return Policy:</span>
              <span>{result?.sensitive_data?.return_policy}</span>
            </div>
          </>)}
        </>)}
        </div>
      </div>

      <div className = "flex flex-col flex-1 gap-4 w-full">
        {(result.user_type === "users" || accessLevel === "protected") &&(
        <div className="bg-[#ffffff] rounded-[10px] border border-[#e0e0e0] text-left w-full" style={{padding:"16px 20px"}}>
          <h2 className="text-[18px] text-[#3cbf4e] font-bold" style={{margin:"0 0 10px 0", fontFamily:"Merriweather, Cambria, serif"}}>User Details</h2> 
          <hr className="border border-[#ddd]" style={{margin: "2px"}}/>
          <div className="flex justify-between items-center text-[18px] text-[#1d1c1c]" style={{ margin:"5px 0" }}>
            <span className="font-bold">Username: </span>
            <span>{result?.userDetails?.username}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] text-[#1d1c1c]" style={{ margin:"6px 0" }}>
            <span className="font-bold">Email: </span>
            <span>{result?.userDetails?.email}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] text-[#1d1c1c]" style={{ margin:"6px 0" }}>
            <span className="font-bold">Phone: </span>
            <span>+91 {result?.userDetails?.phone}</span>
          </div>
        </div>)}
        {(result.user_type === "agents" || accessLevel === "protected") &&(
        <div className="bg-[#ffffff] rounded-[10px] border border-[#e0e0e0] text-left w-full" style={{padding:"16px 20px"}}>
          <h2 className="text-[18px] text-[#3cbf4e] font-bold" style={{margin:"0 0 10px 0", fontFamily:"Merriweather, Cambria, serif"}}>Agent Details</h2>
          <hr className="border border-[#ddd]" style={{margin: "2px"}}/>
          <div className="flex justify-between items-center text-[18px] text-[#1d1c1c]" style={{ margin:"5px 0" }}>
            <span className="font-bold">Username: </span>
            <span>{result?.agentDetails?.username}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] text-[#1d1c1c]" style={{ margin:"6px 0" }}>
            <span className="font-bold">Email: </span>
            <span>{result?.agentDetails?.email}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] text-[#1d1c1c]" style={{ margin:"6px 0" }}>
            <span className="font-bold">Phone: </span>
            <span>+91 {result?.agentDetails?.phone}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] text-[#1d1c1c]" style={{ margin:"6px 0" }}>
            <span className="font-bold">Vehicle Number: </span>
            <span>{result?.agentDetails?.vehicle_number}</span>
          </div>
        </div>)
        }

        <div className="bg-[#ffffff] rounded-[10px] border border-[#e0e0e0] text-left w-full" style={{padding:"16px 20px"}}>
          <h2 className="text-[18px] text-[#3cbf4e] font-bold" style={{margin:"0 0 10px 0", fontFamily:"Merriweather, Cambria, serif"}}>Price Details</h2> 
          <hr className="border border-[#ddd]" style={{margin: "2px"}} />
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span>Cart Total:</span>
            <span>₹ {result.data.total_amount - DELIVERY_CHARGE}</span>
          </div>
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span>Delivery Charges:</span>
            <span>₹ {DELIVERY_CHARGE}</span>
          </div>
          <hr className="border border-[#ddd]" style={{margin: "2px"}} />
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span>Order Total:</span>
            <span>₹ {result.data.total_amount}</span>
          </div>
          <div className="flex justify-between items-center" style={{margin:"6px 0"}}>
            <span>Payment Status:</span>
            <span>{result.data.payment_status}</span>
          </div>
          {accessLevel === "protected" && result?.sensitive_data?.userType === "users" && result.data.payment_status == "Paid" && (
          <div className="flex flex-wrap justify-between items-center gap-12" style={{ margin: "6px 0" }}>
            <span className="font-medium text-gray-700">Transaction ID:</span>
            <span className="text-gray-800 break-word text-end w-auto sm:max-w-[60%]"> {result?.sensitive_data?.transaction_id}</span>
          </div> )}
        </div>
      </div>
      <div></div>
    </div>
    {accessLevel === "protected" && (
      <section className="block w-full max-w-[1200px] text-center bg-[#f4f4f4] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]" style={{margin: "40px auto", padding: "10px 20px"}}>
        <h1 className="font-bold text-2xl" style={{fontFamily: "Merriweather, Cambria, serif", margin: "10px"}}>Items Ordered</h1>
        <div className="flex flex-wrap justify-center gap-[15px] w-full box-border" style={{padding: "20px"}}>
        {(!result.sensitive_data.cart || result.sensitive_data.cart.length === 0)? (<p>Your cart is empty.</p>) : (
          <>
            {result.sensitive_data.cart.map(({ id, name, price, image, orderQty, orderSize, orderColor, maxQty }, index)=>(
              <ProductCard key={`${id}-${orderSize}-${orderColor}-${index}`} product={{ id: id, name, price, image, orderQty, orderSize, orderColor, maxQty }} user_type="users" order={true} editable={false} />
            ))}
          </>
        )} </div>
      </section>
    )}
    <Footer /></>
  )
}

export default CusAgentOrder;
const DELIVERY_CHARGE = 40;