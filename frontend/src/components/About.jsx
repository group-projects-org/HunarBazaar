import {Header, Footer} from './header_footer'
import { useParams } from "react-router-dom";
const About = () => {
  const { user_type } = useParams();
  return (<div>
    <Header userType={user_type}/>
    <main>
      <h1>About Us</h1>
    </main>
    <Footer />
  </div>)
}

export default About
