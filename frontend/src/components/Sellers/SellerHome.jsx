import "./../CSS/product.css";
import { Header, Footer } from "./../header_footer";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Header a={true}/>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Home;