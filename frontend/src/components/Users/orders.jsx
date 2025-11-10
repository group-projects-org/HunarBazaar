import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../header_footer";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
   
const Orders = () => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        console.log(res.data.orderDetails);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") setError(err.response?.data?.detail || err.message);
      } finally {setLoading(false);}
    }; fetchData();
    return () => abort.abort();
  }, []);  

  return (<>
      {loading && (<>
        <div className="toast-overlay" />
        <div className="toast-message processing">Loading the Data...</div>
      </>)}{error && (<>
        <div className="toast-overlay" onClick={() => { setError(null); }} />
        <div className="toast-message error" onClick={() => { setError(null); }}>{error}</div>
      </>)}
      <Header />
      <main className="block w-full max-w-[1200px] text-center bg-[#fefafa] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]" style={{margin: "40px auto", padding: "30px 30px"}}>
        {result.map((order, idx) => (
          <div key={idx} className="w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left" style={{padding:"20px", marginBottom:"20px"}}>
            {order.images && order.images.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                {order.images.map((val, index) => (
                  <img key={index} src={val} alt={`Product Image ${index + 1}`} className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-300" />
                ))}
              </div>
            ) : ( <div className="text-gray-500 italic mb-4 text-sm"> No product images available </div> )}
            <div className="flex justify-between items-center text-lg font-medium mb-2">
              <span className="text-green-600">₹ {order.total_amount}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${new Date(order.delivery_date) < new Date() ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {new Date(order.delivery_date) < new Date() ? "Delivered" : "In Progress"}
              </span>
            </div>

            <div className="text-gray-600 text-sm">
              Order Date:{" "}
              <span className="font-medium"> {new Date(order.order_date).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})} </span>
              <br />
              Delivery Date:{" "}
              <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        ))} </main>
      <Footer />
    </>
  );
};

export default Orders;