import { Header, Footer } from "./../header_footer";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className='relative h-full w-full overflow-hidden'>
      <Header userType={"sellers"}/>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Home;