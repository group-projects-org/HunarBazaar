import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "./header_footer";
import './CSS/orders.css'
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const ProductCards = ({ cart, editable = false, onQuantityChange }) => {
  if (cart.length === 0) return <p>Your cart is empty.</p>;
  return cart.map(({ product, quantity }) => (
    <div key={product.id} className="product-card">
      <img src={typeof product.image === 'string'? product.image: product.image instanceof File? URL.createObjectURL(product.image[0]): '/placeholder.jpg' } alt={product.name} style={{ objectFit: 'cover' }}/>
      <h3>{product.name}</h3>
      {editable ? (
        <><p>Price: ₹{product.price}</p>
          <div className="quantity-container">
            <button className="quantity-button" onClick={() => onQuantityChange(product.id, "decrease")} > – </button>
            <span className="quantity-display">{quantity}</span>
            <button className="quantity-button" onClick={() => onQuantityChange(product.id, "increase")} > + </button>
          </div> </>
      ) : (
        <> <p>Quantity: {quantity}</p>
          <p>Total Price: ₹{(product.price * quantity).toFixed(2)}</p> </>
      )}
    </div>
  ));
};

const CusAgentOrder = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [accessLevel, setAccessLevel] = useState("public");
  const [password, setPassword] = useState(null);
  const [order_id, setOrder_ID] = useState(null);
  const location = useLocation();

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
        setLoading(true);
        setError(null);
        const isProtected = accessLevel === "protected";
        const url = `${BASE_URL}${isProtected ? "/api/getOrderData": `/api/getOrderQR?order_id=${encodeURIComponent(order_id)}`}`;
        const res = await axios({method: isProtected ? "POST" : "GET", url, data: isProtected ? { order_id, password } : null, withCredentials: true, headers: { "Content-Type": "application/json" }, signal: abort.signal});
        setResult(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || err.message);
      } finally { setLoading(false);}
    })(); return () => abort.abort();
  }, [order_id, accessLevel, password]);     

  if (loading) return (<>
    <div className="toast-overlay" />
    <div className="toast-message processing">Loading the Data...</div>
  </>); if (error)   return (<>
    <div className="toast-overlay" onClick={() => { setError(null); }} />
    <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
  </>); if (!result) return null;
  return (<> <Header />
    <div className="section order-section">
      <div className="orderSection">
        <div className="user-details">
          <h2>Order Details</h2> <hr></hr>
          <span style={{ fontWeight: "bold", fontSize: "20px", textAlign: "center", marginBottom: "20px" }}>{result?.data?.order_id}</span>
          <div className="cart-total"><span>User ID:</span><span>{result?.data?.user_id}</span></div>
          <div className="cart-total"><span>Agent ID:</span><span>{result?.data?.agent_id}</span></div>
          <span style={{ display: "block", textAlign: "center", marginTop: "20px", fontWeight: "bold", fontSize: "20px" }}>{result?.data?.status}</span>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon">&#10003;</div>
              <div className="timeline-content">Order Confirmed, {new Date(result?.data?.order_date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</div>
            </div>
            <div className="timeline-line"></div>
            <div className="timeline-item">
              <div className="timeline-icon">&#10003;</div>
              <div className="timeline-content">Delivered, {new Date(result?.data?.delivery_date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</div>
            </div>
          </div>
        </div>
        <div className = "sensitive-details">
        {accessLevel === "public" ? (<img className="qr-img" src={`data:image/png;base64,${result?.qr_image_b64}`} alt="Secure order QR" />) : (<>
          <div className="cart-total"><span>User Name:</span><span>{result?.sensitive_data?.username}</span></div>
          <div className="cart-total"><span>User Email:</span><span>{result?.sensitive_data?.user_email}</span></div>
          <div className="cart-total"><span>User Phone:</span><span>{result?.sensitive_data?.phone}</span></div>
        {result?.sensitive_data?.userType === "users" && (<>
          <div className="cart-total"><span>Transaction ID:</span><span>{result?.sensitive_data?.transaction_id}</span></div>
          <div className="cart-total"><span>OTP:</span><span>{result?.sensitive_data?.OTP}</span></div>
        </>)}
          <div className="cart-total"><span>Agent Notes:</span><span>{result?.sensitive_data?.agent_notes}</span></div>
          <div className="cart-total"><span>Special Instructions:</span><span>{result?.sensitive_data?.special_instructions}</span></div>
          <div className="cart-total"><span>Return Policy:</span><span>{result?.sensitive_data?.return_policy}</span></div>
        </>)}</div></div>
      <div className = "userSection">
        <div className="user-details">
          <h2>User Details</h2> <hr></hr>
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>{result?.userDetails?.username}</span>
          <span>{result?.userDetails?.user_id}</span>
          <span>{result?.userDetails?.email}</span>
          <span>{result?.userDetails?.phone}</span>
        </div>
        <div className="transactions-details">
          <h2>Price Details</h2> <hr />
          <div className="cart-total"><span>Cart Total</span><span>₹ {result.data.total_amount - DELIVERY_CHARGE}</span></div>
          <div className="cart-total"><span>Delivery Charges</span><span>₹ {DELIVERY_CHARGE}</span></div><hr />
          <div className="cart-total"><span>Order Total</span><span>₹ {result.data.total_amount}</span></div>
          <div className="payment-status"><span>Payment Status</span><span>Paid</span></div>
        </div>
      </div>
      <div></div>
    </div>
    {accessLevel === "protected" && (<><section id="cart" className="section">
      <h1>Items Ordered</h1>
      <div id="cart-list" className="product-container"><ProductCards cart={result.sensitive_data.cart}/></div> 
    </section></>)}
    <Footer /></>
  )
}

export default CusAgentOrder;
const DELIVERY_CHARGE = 40;