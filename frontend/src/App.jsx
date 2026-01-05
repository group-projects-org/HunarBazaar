import { Routes, Route } from 'react-router-dom';
import LoginRegister from './components/Login.jsx';
import SellerHome from './components/Sellers/SellerHome.jsx';
import Home from './components/Users/Home.jsx';
import ProductsPage from './components/Users/Product.jsx';
import CartCheckout from './components/Users/cart.jsx'
import ThankYou from './components/Users/thankyou.jsx';
import CusAgentOrder from './components/cus_agent_order.jsx';
import Orders from './components/Users/orders.jsx';
import ProductsListed from './components/Sellers/Products.jsx';
import ProductDetail from './components/productDetail.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import About from './components/About.jsx';
import Profile from "./components/Users/Profile";

function App() {  
  return (
    <Routes>
      <Route path="/Login" element={<LoginRegister />} />
      <Route path="/Register" element={<LoginRegister />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/PrivacyPolicy/:user_type" element={<PrivacyPolicy />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="/TermsOfService/:user_type" element={<TermsOfService />} />
      <Route path="/About" element={<About />} />
      <Route path="/About/:user_type" element={<About />} />

      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Products" element={<ProductsPage />} />
      <Route path="/Products/:product_id/:user_type" element={<ProductDetail />} />
      <Route path="/CartCheckout" element={<CartCheckout />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/OrderData" element={<CusAgentOrder />} />

      <Route path="/seller/Home" element={<SellerHome />} />
      <Route path="/seller/Products" element={<ProductsListed />} />
      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}

export default App;