import { Header, Footer } from "./../header_footer";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Header userType={"sellers"}/>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Home;