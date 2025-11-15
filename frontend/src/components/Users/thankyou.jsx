import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "../header_footer";

export default function ThankYou () {
  const navigate = useNavigate();
  const data = useLocation().state || {};

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#f5dfd1] md:bg-transparent">
      <Header />
      <div className="block w-[85%] md:w-[70%] text-center bg-transparent md:bg-[#f5dfd1] rounded-lg md:border md:border-[#ebcfbe] md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] my-0 md:my-7 mx-auto py-5 md:p-10 max-w-[800px]">
        <div className="flex justify-center items-center gap-4">
          <img className="rounded-[50%]" style={{height:"100px"}} src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <div className='flex flex-col justify-center items-end gap-0' style={{margin:"20px 0"}}>
            <h1 className='text-[40px] sm:text-[50px] font-bold text-[#a2161f]' style={{ fontFamily:"Montserrat, Poppins, sans-serif"}}>हुनरBazaar</h1>
            <p className='text-[12px] font-bold text-[#a2161f] uppercase' style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>Luxury, Crafted by Talent</p>
          </div>
        </div>
        <center><img className="bg-transparent py-1 pl-[5px] pr-[3px] h-[250px] -mt-5" src={'/thank-you.webp'} alt="Thank You for you purchase"/></center>
        <p className="mb-10" style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>We appreciate your purchase and look forward to serving you again.</p>

        <div className="w-full m-0 py-5 px-6 md:px-10 mb-10.5 border border-[#ccc] rounded-lg bg-[#f7d1ba] shadow-[0_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-102 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]">
          <h1 className="font-bold text-[20px] text-[#a2161f] mb-2.5" style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>Order Summary</h1>
          <div className="flex items-center gap-2 overflow-x-auto transparent-scrollbar rounded-lg my-5 mx-0">
            {data.images.map((val, index) => (
            <div key={index} className="shrink-0 m-0 p-0">
              <img key={index} src={val} alt={`Product Image ${index + 1}`} className="w-32 h-32 object-cover rounded-lg border border-[#ccc]"/>
            </div>))}
          </div>
					<div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-y-1 gap-x-6 my-3 text-start">
            <span className="font-bold">Order Number:</span>
            <span className="px-2">ORD{data?.order_id}</span>
            <span className="font-bold">Delivery Date:</span>
            <span className="px-2">{data?.delivery_date}</span>
            <span className="font-bold">Total Items:</span>
            <span className="px-2">{data?.items}</span>
            <span className="font-bold">Order Total:</span>
            <span className="px-2">₹ {data?.total_amount}</span>
          </div>
        </div>
        <div className="flex flex-col p-5 m-5 items-center justify-center">
          <h1 className="font-bold text-[20px] text-[#a2161f] mb-5" style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>What's Next?</h1>
          <span>You will receive an email confirmation with your order details.</span>
          <span className="mb-3">Track your order through your account page.</span>
          <span className="font-bold mb-5">If you have any questions, feel free to <a href="mailto:tanujbhatt8279@gmail.com" target="_blank" rel="noopener noreferrer">contact us</a>.</span>
          <button className="bg-[#3cbf4e] hover:bg-[#45a049] text-white border-0 rounded-[5px] cursor-pointer text-[0.8rem] md:text-[1rem] font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)] w-fit py-3 px-3" style={{fontFamily: "'Segoe UI', sans-serif"}} onClick={() => navigate("/home")}>Return to Shop</button>
        </div>
    </div>
    <Footer /> 
  </div>);
}