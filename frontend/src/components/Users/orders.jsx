import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const OrderCards = ({ result, navigate }) => {
     if (!result || result.length === 0) return <p>No Orders to Show...</p>;
     return result.map((order) => (
       <button key={order.order_id} className="orderItem"   onClick={() => navigate(`/OrderData?order_id=${encodeURIComponent(order.order_id)}`)}>
         <div id="item-total" className="cart-total" style={{ fontSize: "20px", marginBottom: "10px"}}>
          <span className="tag" style={{color: "#28a745"}}>{order.order_id}</span>
          <span className="price" style={{color: "#28a745"}}>₹ {order.total_amount}</span>
         </div>
         <div id="item-total" className="cart-total">
           <span className="tag ">{new Date(order.order_date).toDateString()} - {new Date(order.delivery_date).toDateString()}</span>
           <span className="price">{order.status}</span>
         </div>
       </button>
     ));
   };
   
const Orders = () => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abort = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_URL}/api/getOrder`, {
          withCredentials: true,
          signal: abort.signal,
        }); setResult(res.data.orderDetails);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") setError(err.response?.data?.detail || err.message);
      } finally {setLoading(false);}
    }; fetchData();
    return () => abort.abort();
  }, []);

  useEffect(() => {
     if (result) {
       console.log("✅ result updated:", result);
     }
   }, [result]);   

  return (<>
      {loading && (<>
        <div className="toast-overlay" />
        <div className="toast-message processing">Loading the Data...</div>
      </>)}{error && (<>
        <div className="toast-overlay" onClick={() => { setError(null); }} />
        <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
      </>)}
      <Header />
      <div className="section orderListDisplay"><OrderCards result={result} navigate={navigate} /></div>
      <Footer />
    </>
  );
};

export default Orders;