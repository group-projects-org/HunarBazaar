import { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import { HiCheck } from "react-icons/hi";
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const CodeCaptcha = ({validated, isActive}) => {
  const [captchaImg, setCaptchaImg] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [answer, setAnswer] = useState("");
  const [isValid, setIsValid] = useState(false);
  const loadCaptcha = async () => {
    if (!isActive || isValid) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/captcha/new`);
      const data = res.data;
      setCaptchaId(data.captchaId);
      setCaptchaImg("data:image/png;base64," + data.image);
      setAnswer("");
    } catch (err){console.error("Error loading captcha:", err);}
  };

  const validateCaptcha = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/captcha_otp/validate`, { id:captchaId, answer:answer });
      const data = res.data;
      if (data.valid){
        validated(true);
        setIsValid(true);
        setAnswer("Captcha Validated");
      } return data.valid;
    } catch (err) {
      console.error("Error validating captcha:", err);
      return false;
    }
  };

  useEffect(() => {loadCaptcha();}, [isActive]);
  useEffect(() => {
    if (answer.length === 5) validateCaptcha();
  }, [answer]);

  return (
    <div className="flex flex-col md:flex-row mb-1 items-center justify-center gap-2">
      <div className="flex w-full gap-2 md:w-[55%] items-center">
        {captchaImg ? <img src={captchaImg} alt="captcha" title="Captcha" className="cursor-not-allowed w-full h-[45px] rounded-2xl mb-2.5" /> : <div className="w-full h-[45px] rounded-2xl bg-gray-300 animate-pulse mb-2.5"></div>}
        {isValid? <HiCheck className="cursor-pointer text-green-600 text-2xl p-2 rounded-[10px] h-[45px] w-[45px] mb-2.5" title="CAPTCHA Validated" />: <FiRefreshCw onClick={loadCaptcha} className="cursor-pointer text-red-600 text-2xl p-2 rounded-[10px] h-[45px] w-[45px] mb-2.5" title="Refresh CAPTCHA" />}
      </div>
      <div className="input-box w-full md:w-[45%] disabled:cursor-not-allowed"><input type="text" disabled={isValid} value={answer} maxLength={5} placeholder="Enter captcha" onChange={(e) => setAnswer(e.target.value)} /></div>
    </div>
  );
};

export { CodeCaptcha };
