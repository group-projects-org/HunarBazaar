import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CSS/login.css';
import { useNavigate } from 'react-router-dom';
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
     const [isPhoneVerified, setIsPhoneVerified] = useState('No');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [formData, setFormData] = useState({userType: 'users', username: '', email: '', password: '', phone: ''});
     const [showDevModal, setShowDevModal] = useState(false);
     const navigate = useNavigate();

   useEffect(() => {
    const verifyToken = async () => {
      try {
        let res = await axios.get(`${BASE_URL}`, {withCredentials: true,}); 
        res = await axios.get(`${BASE_URL}/api/verify-token`, { withCredentials: true,
        }); if (res.data.valid) {
          console.log("✅ Auto-login success:", res.data);
          localStorage.setItem("username", res.data.username);
          navigate(res.data.userType === "sellers" ? "/seller/Home" : res.data.userType === "agents" ? "/agent/" : "/Home");
        }
      } catch (err) { console.log("❌ No active session:", err.response?.data?.message || err.message); }
    }; verifyToken();
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") setShowDevModal(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    try {
      const res = await axios.post(`${BASE_URL}/api/check-username`, {username, userType,});
      setIsAvailable(res.data.available);
    } catch (err) { console.error("Username check failed:", err);}
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); localStorage.setItem("username", data.username);
      localStorage.setItem("cart", data.cart);
      navigate(formData.userType !== "sellers" ? "/Home" : "/seller/Home");
    } catch (error) {
      if (error.response) alert(`Login failed: ${error.response.data.error || "Unknown error"}`);
      else alert("An error occurred during login.");
      console.error("Login error:", error);
    } setIsLoggingIn(false);
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
    if (isPhoneVerified === "Verifying" || isEmailVerified === "Verifying") {
      setTimer({ minutes: 2, seconds: 59 });
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const totalSeconds = prev.minutes * 60 + prev.seconds;
          if (totalSeconds <= 1) {
            clearInterval(timerRef.current);
            if (isPhoneVerified === "Verifying") setIsPhoneVerified("No");
            if (isEmailVerified === "Verifying") setIsEmailVerified("No");
            localStorage.removeItem("tempOTP");
            return { minutes: 0, seconds: 0 };
          }const nextTotalSeconds = totalSeconds - 1;
          return {
            minutes: Math.floor(nextTotalSeconds / 60),
            seconds: nextTotalSeconds % 60,
          };});}, 1000);}return () => clearInterval(timerRef.current);
  }, [isPhoneVerified, isEmailVerified]);  

  const HandlePhoneVerify = async () => {
     try {
       setIsPhoneVerified("Verifying");
       setTimer({minutes: 2, seconds: 59});
       const res = await axios.post(`${BASE_URL}/api/send-sms-otp`, {
         country_code: '+91',
         phone: formData.phone
       });
       localStorage.setItem("tempOTP", res.data.otp);
       console.log("OTP Sent....");
     } catch (err) {
       console.error("OTP sending failed:", err);
       setIsPhoneVerified("No");
       setShowDevModal(true);
     }
   };
   const HandleEmailVerify = async () => {
     try {
       setIsEmailVerified("Verifying");
       setTimer({miniutes: 2, seconds: 59});
       const res = await axios.post(`${BASE_URL}/api/send-email-otp`, {
         email: formData.email
       });
       localStorage.setItem("tempOTP", res.data.otp);
       console.log("OTP Sent...");
     } catch (err) {
       console.error("OTP sending failed:", err);
       setIsEmailVerified("No");
       setShowDevModal(true);
     }
   };
   
  const handleOtpSubmit = (type) => {
    if (OTP === localStorage.getItem("tempOTP")) {
      if (type) setIsPhoneVerified("Yes");
      else setIsEmailVerified("Yes")
      setOTP("");
      localStorage.removeItem("tempOTP");
    } else {
      alert("Incorrect OTP");
      setOTP("");
    }
  };
  
  return (
    <div className='flex flex-col min-h-screen w-full justify-center items-center bg-[url("/assets/login_background.jpeg")] bg-cover bg-no-repeat bg-center overflow-hidden'>

      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300" onClick={() => setShowDevModal(false)}>
          <div className="bg-[#85BDBF] rounded-2xl shadow-2xl text-center border border-[#57737A] animate-fadeIn w-[80%] sm:w-[35%]" style={{padding: "24px"}} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-black" style={{fontFamily:"Poppins, sans-serif", marginBottom: "8px"}}> ⚠️ Development Mode</h2>
            <p className="text-black wrap-break-word" style={{marginBottom: "4px"}}> This website is currently in development phase. Verification features are disabled for testing users. </p> <p className="text-blackwrap-break-word" style={{marginBottom: "12px"}}>You can checkout our website via follow crendentials for all roles including <b>User</b>, <b>Seller</b> and <b>Agent</b>:</p>
            <div className="bg-[#85BDBF] rounded-xl p-3" style={{marginBottom: "16px"}}>
              <p className="text-black text-sm" style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>
                <strong>Username:</strong>{" "}
                <span className="text-[#0c555b] font-medium">user</span> <br />
                <strong>Password:</strong>{" "}
                <span className="text-[#0c555b] font-medium">user123</span>
              </p>
            </div>
            <button onClick={() => { setShowDevModal(false); setIsActive(false); setFormData({...formData, username: "user", password: "user123", }); }} className=" bg-[#048d82] hover:bg-[#025c55] text-white font-medium rounded-lg shadow-md transition-all duration-200" style={{padding: "8px 20px"}}> Login Now </button>
            <p className="text-xs text-gray-500 italic" style={{marginTop: "20px"}}>For testing purposes only — no real data is stored.</p>
          </div>
        </div>
      )} 
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
      </div>

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
            <input type="text" placeholder="Email"  name="email" value={formData.email} onChange={handleChange} required /><button type="button" className="btn" disabled={!formData.email.includes('@') || isPhoneVerified === "Verifying"} onClick={HandleEmailVerify}>Verify</button><i className='bx bxs-envelope'></i>
          </div>)}{isEmailVerified  === 'Verifying' && (<div className="input-box">
            <input type="text" name="otp" placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} pattern="[0-9]{6}" required/><span>{timer.minutes}:{timer.seconds}</span><button type="button" className="btn" disabled={OTP.length !== 6} onClick={() => handleOtpSubmit(false)}>Submit</button>
          </div>)}{isEmailVerified === "Yes" && (<div className="input-box">
            <input type="text" placeholder="Email"  name="email" value={formData.email} onChange={handleChange} disabled={true} required /><button type="button" className="btn">Verified</button><i className='bx bxs-envelope'></i>
          </div>)}

          {isPhoneVerified === "No" && (<div className="input-box">
            <span>+91</span><input type="tel" name="phone" placeholder="10 digit Phone-Number" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" required/><button type="button" className="btn" disabled={formData.phone.length !== 10 || isEmailVerified === "Verifying"} onClick={HandlePhoneVerify}>Verify</button><i className='bx bxs-phone'></i>
          </div>)}{isPhoneVerified  === 'Verifying' && (<div className="input-box">
            <input type="text" name="otp" placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} pattern="[0-9]{6}" required/><span>{timer.minutes}:{timer.seconds}</span><button type="button" className="btn" disabled={OTP.length !== 6} onClick={() => handleOtpSubmit(true)}>Submit</button>
          </div>)}{isPhoneVerified === "Yes" && (<div className="input-box">
            <span>+91</span><input type="tel" name="phone" placeholder="10 digit Phone-Number" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" disabled={true} required/><button type="button" className="btn">Verified</button><i className='bx bxs-phone'></i>
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

          <button type="submit" className="btn" disabled={!isAvailable || isLoggingIn || isPhoneVerified !== "Yes" || isEmailVerified !== "Yes"}>{isLoggingIn ? "Registering..." : "Register"}</button>
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