import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CSS/login.css';
import { useNavigate } from 'react-router-dom';
import { CodeCaptcha, Recaptcha } from './Captchas';
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
axios.defaults.withCredentials = true;

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [OTP, setOTP] = useState("");
  const [timer, setTimer] = useState({minutes: 2, seconds: 59});
  const [isEmailVerified, setIsEmailVerified] = useState('No');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaValidated, setCaptchaValidated] = useState(false);
  const [formData, setFormData] = useState({userType: 'users', username: '', email: '', password: '', phone: ''});
  const [userId, setUserId] = useState(null);
  const [TFA, setTFA] = useState(false);
  const [TFAEmailVerified, setTFAEmailVerified] = useState('No');
  const [recaptchaValidated, setRecaptchaValidated] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        let res = await axios.get(`${BASE_URL}`, {withCredentials: true,}); 
        res = await axios.get(`${BASE_URL}/api/verify-token`, { withCredentials: true,
        }); if (res.data.valid) {
          console.log("✅ Auto-login success:");
          localStorage.setItem("username", res.data.username);
          navigate(res.data.userType === "sellers" ? "/seller/Home" : res.data.userType === "agents" ? "/agent/" : "/Home");
        }
      } catch (err) { console.error("❌ No active session:", err.response?.data?.message || err.message); }
    }; verifyToken();
  }, [navigate]);

  const handleRegisterClick = () => { setIsActive(true); }; 
  const handleLoginClick = () => { setIsActive(false); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "username") {
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => checkUsername(value, formData.userType), 600);
      setTypingTimeout(timeout);
    }
  };

  const checkUsername = async (username, userType) => {
    if (!isActive) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/check-username`, {username, userType,});
      setIsAvailable(res.data.available);
    } catch (err) { console.error("Username check failed:", err);}
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      setForgotPassword(false); setConfirmPassword("");
      const { data } = await axios.post(`${BASE_URL}/api/check_login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); setUserId(data.user_id);
      setTFA(data.TFA);
      setFormData(prev => ({...prev, email: data.email }));
      if (!data.TFA) commonLoginAfterTFA( data.user_id );
    } catch (error) {
      if (error.response) alert(`Login failed: ${error.response.data.error || "Unknown error"}`);
      else alert("An error occurred during login.");
      console.error("Login error:", error);
    } setIsLoggingIn(false);
  };
  
  const commonLoginAfterTFA = async ( localUserId ) => {
    const mergeCarts = (guestCart, serverCart) => {
      const map = new Map();
      const makeKey = (item) => `${item.id}-${item.orderSize}-${item.orderColor}`
      serverCart.forEach(item => { map.set(makeKey(item), { ...item }); });
      guestCart.forEach(item => {
        const key = makeKey(item);
        if (map.has(key)) map.get(key).orderQty = item.orderQty;
        else map.set(key, { ...item });
      }); return [...map.values()];
    }; try{
      const { data } = await axios.post(`${BASE_URL}/api/login`, {"user_id": localUserId, "userType": formData.userType}, { headers: { "Content-Type": "application/json" }, withCredentials: true, }); 
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");
      localStorage.setItem("username", data.username);
      const serverCart = data.cart || [];
      const mergedCart = mergeCarts(guestCart, serverCart);
      localStorage.setItem("cart", JSON.stringify(mergedCart));
      navigate(formData.userType !== "sellers" ? "/Home" : "/seller/Home");
    } catch (error) {
      console.error("Post-TFA login error:", error);
      alert("An error occurred during post-TFA login.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/register`, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }); const data = await response.json();
      if (response.status === 409) {
        alert(data.error || 'User already exists.');
      } else if (response.ok) {
        alert('Registration Successful');
          setIsActive(false);
      } else {
        alert(`Registration failed: ${data.error || 'Unknown error'}`);
        setIsActive(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    } setIsLoggingIn(false);
  };  

  const timerRef = useRef();
  useEffect(() => {
    if (isEmailVerified === "Verifying" || TFAEmailVerified === "Verifying") {
      setTimer({ minutes: 2, seconds: 59 });
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const totalSeconds = prev.minutes * 60 + prev.seconds;
          if (totalSeconds <= 1) {
            clearInterval(timerRef.current);
            if (isEmailVerified === "Verifying") setIsEmailVerified("No");
            if (TFAEmailVerified === "Verifying"){
              alert("Error Occurred! Please try logging in again."); 
              setTFA(false); navigate("/Login"); 
              setTFAEmailVerified("No");
            } localStorage.removeItem("tempOTP");
            return { minutes: 0, seconds: 0 };
          } const nextTotalSeconds = totalSeconds - 1;
          return {
            minutes: Math.floor(nextTotalSeconds / 60),
            seconds: nextTotalSeconds % 60,
          };});}, 1000);} return () => clearInterval(timerRef.current);
  }, [isEmailVerified, TFAEmailVerified]);  

  const HandleEmailVerify = async (type = 0, email = null) => {
    try {
      if (type !== 1) setIsEmailVerified("Verifying");
      else setTFAEmailVerified("Verifying");
      setTimer({minutes: 2, seconds: 59});
      const res = await axios.post(`${BASE_URL}/api/send-email-otp`, {
        email: email || formData.email,
      }); localStorage.setItem("tempOTPId", res.data.otpId);
      return 1;
    } catch (err) {
      console.error("OTP sending failed:", err);
      if (type !== 1)setIsEmailVerified("No");
      else setTFAEmailVerified("No");
      return 0;
    }
  };
   
  const handleOtpSubmit = async (type = 0) => {
    const otpId = localStorage.getItem("tempOTPId");
    try {
      const res = await axios.post(`${BASE_URL}/api/captcha_otp/validate`, { id:otpId, answer:OTP });
      const data = res.data;
      if (data.valid){
        if (type !== 1) setIsEmailVerified("Yes");
        else setTFAEmailVerified("Yes");
        setOTP(""); localStorage.removeItem("tempOTPId");
      } else {
        alert("Incorrect OTP");
        setOTP("");
      } return data.valid;
    } catch (err) {
      console.error("Error validating OTP:", err);
      return false;
    }
  };

  const InitiateForgotPassword = async () => {
    if (formData.username.length === 0){
      alert("Please enter your username first.");
      return;
    } setTFA(false); setRecaptchaValidated(false);
    setConfirmPassword(""); setFormData(prev => ({...prev, password: ""}));
    try{
      const { data } = await axios.post(`${BASE_URL}/api/get_email`, {username: formData.username, userType: formData.userType,}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); setFormData(prev => ({...prev, email: data.email })); setForgotPassword(true); 
    } catch (error) {
      if (error.response) alert(`Error: ${error.response.data.detail || "Unknown error"}`);
      else alert("An error occurred while fetching email.");
      console.error("Fetch email error:", error);
      setForgotPassword(false);
    }
  }
  const ResetForgotPassword = () => {
    try{
      axios.post(`${BASE_URL}/api/reset_password`, {username: formData.username, userType: formData.userType, newPassword: formData.password,}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); alert("Password reset successful. Please login with your new password.");
    } catch (error) {
      if (error.response) alert(`Error: ${error.response.data.error || "Unknown error"}`);
      else alert("An error occurred while resetting password.");  
    } setForgotPassword(false); setTFAEmailVerified("No"); setFormData(prev => ({...prev, password: ""})); navigate("/Login");
  }

  return (
    <div className='flex flex-col min-h-screen w-full justify-center items-center bg-[url("/assets/login_background.jpeg")] bg-cover bg-no-repeat bg-center overflow-hidden'>
    <div className="relative flex flex-col min-h-screen w-full justify-center items-center bg-[url('/assets/login_background.jpeg')] bg-cover bg-no-repeat bg-center overflow-hidden">

      {/* Login */}
      <div className={`absolute top-0 right-0 w-full md:w-[40%] h-full bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center text-[#ccc] text-center transition-all ease-in-out duration-600 ${isActive ? 'translate-x-[-50%] transform opacity-0 pointer-events-none' : 'delay-100 opacity-100 translate-x-0 transform z-20'}`} style={{ padding: '40px' }}>
        <div className="flex justify-center items-center gap-4">
          <img className="bg-[#BCAA99] rounded-[50%]" style={{height:"100px"}} src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <div className='flex flex-col justify-center items-end gap-0' style={{margin:"20px 0"}}>
            <h1 className='text-[40px] sm:text-[50px] font-bold text-[#BCAA99]' style={{ fontFamily:"Montserrat, Poppins, sans-serif"}}>हुनरBazaar</h1>
            <p className='text-[12px] font-bold text-[#BCAA99] uppercase' style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>Luxury, Crafted by Talent</p>
          </div>
        </div>
        {(!TFA && !forgotPassword)? (<>
          <h1 className='text-[50px] font-bold text-[#BFB28C]' style={{margin:"20px 0", fontFamily:"Great Vibes, cursive"}}>Login</h1>
          <form className= "w-full" onSubmit={handleLoginSubmit}>
            <div className="input-box">
              <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required />
              <i className='bx bxs-user'></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Password"  name="password" value={formData.password} onChange={handleChange} required />
              <i className='bx bxs-lock-alt'></i>
            </div> 
            <button type="button" className='text-[13px] underline mb-2.5 cursor-pointer' style={{fontFamily: "Montserrat"}} onClick={InitiateForgotPassword}>Forgot Password?</button>
            <button type="submit" className="btn" disabled={isLoggingIn}>{isLoggingIn ? "Logging In..." : "LogIn"}</button>
            <div className="role-toggle">
              <div className={`toggle-option ${formData.userType === 'users' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, userType: 'users' })}>User</div>
              <div className={`toggle-option ${formData.userType === 'sellers' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, userType: 'sellers' })}>Seller</div>
              <div className={`toggle-option ${formData.userType === 'agents' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, userType: 'agents' })}>Agent</div>
              <div className={`slider ${formData.userType === 'agents'? 'right': formData.userType === 'users'? 'left': 'middle'} loginS`}></div>
            </div>
          </form>
          <div className={`w-full h-full text-[#ccc] flex flex-col justify-center items-center`}>
            <p style={{fontFamily: "'Montserrat', 'Poppins', sans-serif", marginBottom: '8px'}}>Don't have an account?</p>
            <button className="btn h-[46px] border-2 border-white shadow-none" style={{width:"30%"}} onClick={handleRegisterClick}>Register</button>
          </div>
        </>):(<>
          <h1 className='text-[40px] font-bold text-[#BFB28C] mb-0 mt-5 mx-0' style={{fontFamily:"Great Vibes, cursive"}}>{forgotPassword? "Forgot Password" : "Two-Factor Authentication"}</h1>
          <span className='mb-10 mt-0' style={{fontFamily: "'Montserrat', 'Poppins', sans-serif"}}>You Security, Our Responsibility</span>
          {!forgotPassword && <span className='mb-2 text-[9px]' style={{fontFamily: "'Montserrat', 'Poppins', sans-serif"}}>For added security, please enter the code that has been sent to the registered email</span>}
          <form className="w-full" onSubmit={(e) => {e.preventDefault(); commonLoginAfterTFA(userId)}}>
            {TFAEmailVerified === "No" && (<div className="input-box">
              <input type="number" name="otp" placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} pattern="[0-9]{6}" disabled={TFAEmailVerified !== "Verifying"} required/>
              <button type="button" className="btn min-w-28" disabled={!recaptchaValidated} onClick={() => {
                const result = HandleEmailVerify(1, formData.email);
                if (TFA && result === 0){
                  alert("Error Occurred! Please try logging in again."); 
                  setTFA(false); navigate("/Login"); 
                }
              }}>Send OTP</button><i className='bx bxs-envelope'></i>
            </div>)}
            {TFAEmailVerified  === 'Verifying' && (<div className="input-box">
              <input type="number" name="otp" placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} pattern="[0-9]{6}" required/><span>{timer.minutes}:{timer.seconds}</span>
              <button type="submit" className="btn" disabled={OTP.length !== 6 && !recaptchaValidated} onClick={() => handleOtpSubmit(1)}>Submit</button>
            </div>)}{TFAEmailVerified === "Yes" && (<div className="input-box">
            <input type="text" placeholder="Email"  name="email" value={formData.email} disabled={true} required /><button type="button" className="btn">Verified</button><i className='bx bxs-envelope'></i>
          </div>)}
            <Recaptcha validated={setRecaptchaValidated}/>
            {forgotPassword && (<>
              <div className="input-box">
                <input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                <i className='bx bxs-lock-alt'></i>
              </div>
              <div className="input-box">
                <input type="password" placeholder="Confirm Password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <i className='bx bxs-lock-alt'></i>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== formData.password && (<p style={{ color: "red", fontSize: "12px", marginTop: "-0.5rem" }}>Passwords do not match</p>)}
              <button type="button" className="btn" disabled={TFAEmailVerified !== "Yes" || formData.password.length === 0 || confirmPassword !== formData.password || !recaptchaValidated} onClick={ResetForgotPassword}>{isLoggingIn ? "Resetting..." : "Reset Password"}</button>
            </>)}
          </form>
        </>)
      }</div>

      {/* Registration */}
      <div className={`absolute top-0 left-0 w-full sm:w-[40%] h-full overflow-hidden bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center text-[#ccc] text-center transition-all ease-in-out duration-600 ${isActive ? 'translate-x-0 transform delay-100 opacity-100 z-20' : 'translate-x-[50%] transform opacity-0 pointer-events-none'}`} style={{ padding: '40px' }}>
        <div className="flex lg:hidden justify-center items-center gap-4">
          <img className="bg-[#BCAA99] rounded-[50%]" style={{height:"100px"}} src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <div className='flex flex-col justify-center items-end gap-0' style={{margin:"20px 0"}}>
            <h1 className='text-[40px] sm:text-[50px] font-bold text-[#BCAA99]' style={{ fontFamily:"Montserrat, Poppins, sans-serif"}}>हुनरBazaar</h1>
            <p className='text-[12px] font-bold text-[#BCAA99] uppercase' style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>Luxury, Crafted by Talent</p>
          </div>
        </div>
        <h1 className='text-[50px] font-bold text-[#BFB28C]' style={{margin:"20px 0", fontFamily:"Great Vibes, cursive"}}>Registration</h1>
        <form className="w-full" onSubmit={handleRegisterSubmit}>
          <div className="input-box">
            <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required />
            <i className='bx bxs-user'></i>
          </div>
          {formData.username.length > 0 && !isAvailable && (<p style={{ color: "red", fontSize: "12px", marginTop: "-0.5rem" }}>❌ Username already taken</p>)}

          {isEmailVerified === "No" && (<div className="input-box">
            <input type="text" placeholder="Email"  name="email" value={formData.email} onChange={handleChange} required /><button type="button" className="btn" disabled={!formData.email?.includes('@')} onClick={HandleEmailVerify}>Verify</button><i className='bx bxs-envelope'></i>
          </div>)}{isEmailVerified  === 'Verifying' && (<div className="input-box">
            <input type="number" name="otp" placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} pattern="[0-9]{6}" required/><span>{timer.minutes}:{timer.seconds}</span><button type="button" className="btn" disabled={OTP.length !== 6} onClick={handleOtpSubmit}>Submit</button>
          </div>)}{isEmailVerified === "Yes" && (<div className="input-box">
            <input type="text" placeholder="Email"  name="email" value={formData.email} disabled={true} required /><button type="button" className="btn">Verified</button><i className='bx bxs-envelope'></i>
          </div>)}

          <div className="input-box">
            <input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Confirm Password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <i className='bx bxs-lock-alt'></i>
          </div>
          {confirmPassword.length > 0 && confirmPassword !== formData.password && (<p style={{ color: "red", fontSize: "12px", marginTop: "-0.5rem" }}>Passwords do not match</p>)}
          <CodeCaptcha validated={setCaptchaValidated} isActive={isActive} />

          <button type="submit" className="btn" disabled={!isAvailable || isLoggingIn || !captchaValidated || isEmailVerified !== "Yes" || confirmPassword !== formData.password}>{isLoggingIn ? "Registering..." : "Register"}</button>
          <div className="role-toggle">
            <div className={`toggle-option ${formData.userType === 'users' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, userType: 'users' })}>User</div>
            <div className={`toggle-option ${formData.userType === 'sellers' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, userType: 'sellers' })}>Seller</div>
            <div className={`slider ${formData.userType === 'sellers'? 'right': 'left'} registerS`}></div>
          </div>
        </form>

        <div className={`w-full h-full text-[#ccc] flex flex-col justify-center items-center z-2 ${isActive? 'left-0 delay-1200' : 'left-[-50%] delay-600'}`}>
          <p style={{fontFamily: "'Montserrat', 'Poppins', sans-serif", marginBottom: '8px'}}>Already have an account?</p>
          <button className="btn w-[10%] h-[46px] border-2 border-white shadow-none" onClick={handleLoginClick}>Login</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginRegister;