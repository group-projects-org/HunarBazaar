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
     document.body.style.backgroundImage = "url('assets/login_background.jpeg')";
     document.body.style.backgroundSize = "cover";
     document.body.style.backgroundRepeat = "no-repeat";
     document.body.style.backgroundPosition = "center";
     return () => {
       document.body.style.backgroundImage = "";
       document.body.style.backgroundSize = "";
       document.body.style.backgroundRepeat = "";
       document.body.style.backgroundPosition = "";
     };
   }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api`, { signal });
        console.log("Login auto-triggered:", res.data);
      } catch (err) {
        if (axios.isCancel(err)) console.log("❌ Request cancelled (component unmounted).");
        else console.error("Error fetching API:", err);
    }}; fetchData();
    return () => {
      controller.abort();
      console.log("🧹 Cleanup: API request aborted.");
  };}, []);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") setShowDevModal(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRegisterClick = () => {setIsActive(true);};
  const handleLoginClick = () => {setIsActive(false);};
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
      const response = await axios.post(`${BASE_URL}/api/login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }); 
      const data = response.data;
      console.log("Login successful:", data);
      localStorage.setItem("user_email", data.user_email);
      navigate(formData.userType !== "sellers" ? "/Home" : "/seller/");
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
       setTimer({miniutes: 2, seconds: 59});
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
    <> {showDevModal && (
      <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300" onClick={() => setShowDevModal(false)}>
        <div className="bg-white/95 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-[90%] border border-gray-200 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2"> ⚠️ Development Mode</h2>
          <p className="text-gray-600 mb-1"> This website is currently in development phase.</p>
          <p className="text-gray-600 mb-3"> Verification features are disabled for testing users.</p>
          <div className="bg-gray-100 rounded-xl p-3 mb-4">
            <p className="text-gray-700 text-sm">
              <strong>Username:</strong>{" "}
              <span className="text-blue-600 font-medium">user</span> <br />
              <strong>Password:</strong>{" "}
              <span className="text-blue-600 font-medium">user123</span>
            </p>
          </div>
          <button onClick={() => { setShowDevModal(false); setIsActive(false); setFormData({...formData, username: "user", password: "user123", }); }} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-200" > Login Now </button>
          <p className="text-xs text-gray-500 mt-5 italic">For testing purposes only — no real data is stored.</p>
        </div>
      </div>
    )} <div className={`container ${isActive ? 'active' : ''}`}>
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit}>
          <h1>Login</h1>
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
      </div>

      {/* Registration */}
      <div className="form-box register">
        <form onSubmit={handleRegisterSubmit}>
          <h1>Registration</h1>
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
      </div>

      {/* Toggle */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <img className="logo" style={{height:"200px"}}src={'assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
          <h2>Hello, Welcome!</h2>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={handleRegisterClick}>Register</button>
        </div>
        <div className="toggle-panel toggle-right">
          <img className="logo" style={{height:"200px"}}src={'assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>  
          <h2>Welcome Back!</h2>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={handleLoginClick}>Login</button>
        </div>
      </div> 
    </div></>
  );
};

export default LoginRegister;