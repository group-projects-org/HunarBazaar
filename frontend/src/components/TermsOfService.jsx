import {Header, Footer} from './header_footer'
import { useParams } from "react-router-dom";
const TermsOfService = () => {
  const { user_type } = useParams();
  return (<div>
    <Header userType={user_type}/>
    <main>
      <h1>Terms of Service</h1>
    </main>
    <Footer />
  </div>)
}

export default TermsOfService
