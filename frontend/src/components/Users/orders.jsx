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
      <main className="block w-full max-w-[1200px] text-center bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] my-0 sm:my-10 sm:mx-auto p-7.5">
        <h1 className="font-bold text-2xl mt-0 mb-5 md:mt-auto" style={{fontFamily: "Merriweather, Cambria, serif"}}>Your Orders</h1>
        {result?.length > 0? (result.map((order, idx) => (
          <div key={idx} className="flex flex-col md:flex-row w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md justify-between md:items-center text-left hover:scale-102 transition-all duration-300 pt-5 px-7 mb-5" onClick={() => navigate(`/OrderData?order_id=${encodeURIComponent(order.order_id)}`)}>
            {order.images && order.images.length > 0 ? (
              <div className="flex gap-2 w-full md:max-w-[80%] mb-4 sm:justify-start overflow-x-auto transparent-scrollbar rounded-lg">
                {order.images.map((val, index) => (
                <div key={index} className="shrink-0 m-0 p-0">
                  <img key={index} src={val} alt={`Product Image ${index + 1}`} className="min-w-28 min-h-28 w-28 h-28 object-cover rounded-lg border border-gray-300" />
                </div>
                ))}
              </div>
            ) : ( <div className="text-gray-500 italic mb-4 text-sm"> No product images available </div> )}
            <div className="w-full md:w-[23%] md:ml-7 flex flex-col m-0 justify-center items-start">
              <div className="w-full flex justify-between items-center text-lg font-medium md:mb-3">
                <span className="text-green-600">₹ {order.total_amount}</span>
                <span className={`py-1 px-3 rounded-full text-sm font-semibold ${new Date(order.delivery_date) < new Date() ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {new Date(order.delivery_date) < new Date() ? "Delivered" : "In Progress"}
                </span>
              </div>

              <div className="text-gray-600 text-sm mb-5 md:mb-0">
                Order Date:{" "} <span className="font-medium"> {new Date(order.order_date).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})} </span>
                <br />
                Delivery Date:{" "} <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
            </div>
            </div>
          </div>
        ))) : (<>
        <div className="text-gray-500 italic mb-4 text-sm"> Nothing to show in Orders </div>
        <button className="bg-[#3cbf4e] hover:bg-[#45a049] text-white border-0 rounded-[5px] cursor-pointer text-[0.8rem] md:text-[1rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] px-3 py-2" onClick={() => navigate('/Products')}>Start Shopping Now</button>
        </>)}
        </main>
      <Footer />
    </div>
  );
};

export default Orders;