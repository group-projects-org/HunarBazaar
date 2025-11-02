import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "../header_footer";
import './../CSS/thankyou.css'

export default function ThankYou () {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state || {};
  if (!data) return <p>Error loading order details.</p>;

  return (
    <><Header />
      <div id="thankyou" className="section thankyou">
        <h1>Thank You for Your Order!</h1>
        <p>We appreciate your purchase and look forward to serving you again.</p>
        <div className="cart-summary-tot">
          <h1>Order Summary</h1>
					<div id="order_number" className="cart-total"><span className="tag">Order Number</span><span className="price">ORD{data.order_id}</span></div>
					<div id="delivery_date" className="cart-total"><span className="tag">Delivery Date</span><span className="price">{data.delivery_date}</span></div>
          <div id="item-total" className="cart-total"><span className="tag">Total Items</span><span className="price">{data.items}</span></div>
					<div id="order-total" className="cart-total"><span className="tag">Order Total</span><span className="price">₹ {data.total_amount}</span></div>
        </div>
        <div id="next-steps">
            <h2>What's Next?</h2>
            <ul>
                <li>You will receive an email confirmation with your order details.</li>
                <li>Track your order through your account page.</li>
                <li>If you have any questions, feel free to <a href="mailto:tanujbhatt8279@gmail.com" target="_blank" rel="noopener noreferrer">contact us</a>.</li>
            </ul>
        </div>
        <button id="return-to-shop" onClick={() => navigate("/home")}>Return to Shop</button>
    </div>
    <Footer /> </>
  );
}