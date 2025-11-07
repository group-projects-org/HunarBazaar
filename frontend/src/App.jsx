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

function App() {  
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Products" element={<ProductsPage />} />
      <Route path="/Products/:product_id/:user_type" element={<ProductDetail />} />
      <Route path="/CartCheckout" element={<CartCheckout />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/OrderData" element={<CusAgentOrder />} />

      <Route path="/seller/Home" element={<SellerHome />} />
      <Route path="/seller/Products" element={<ProductsListed />} />

    </Routes>
  );
}

export default App;