import { Header, Footer } from './header_footer'
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Globe } from "lucide-react";

const PrivacyPolicy = () => {
  const { user_type } = useParams();
  const { t, i18n } = useTranslation(['common', 'privacy']);
  return (<div className='relative h-full w-full overflow-hidden lg:overflow-visible'>
    <Header userType={user_type} />
    <div className="relative w-full max-w-[1200px] bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] h-full mx-auto my-10 py-0 px-10 md:py-10 text-justify">
      <div className="relative flex items-center mb-6 w-full">
        <h1 className="font-bold absolute left-1/2 -translate-x-1/2 text-4xl text-green-900 text-center" style={{ fontFamily: "Montserrat, Poppins, sans-serif" }}> {t('privacy_policy', { ns: 'common' })} </h1>
        <div className="flex flex-row items-center justify-center gap-2 ml-auto">
          <Globe className="w-5 h-5 text-gray-500" />
          <select className="p-2.5 border border-gray-300 rounded" onChange={(e) => i18n.changeLanguage(e.target.value) } value={i18n.language}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      <p><b>{t('disclaimer', { ns: 'common' })}</b>: {t('disclaimer', { ns: 'privacy' })}</p> <br/>

      <p>{t('first_paragraph1', { ns: 'privacy' })}
        
        <b> {t('HunarBazaar_Internet_Private_Limited', { ns: 'common' })}</b>{t('first_paragraph2', { ns: 'privacy' })}<b>{t('brand', { ns: 'common' })} {t('website', { ns: 'common' })} <a href="https://hunar-bazaar-theta.vercel.app/" target='_blank' className='text-blue-500 underline cursor-pointer'>https://hunar-bazaar-theta.vercel.app/</a></b>{t('first_paragraph3', { ns: 'privacy' })}</p> <br/>

      <p>{t('second_paragraph', { ns: 'privacy' })}<a href="/PrivacyPolicy" className='font-bold text-blue-500 cursor-pointer'>{t('privacy_policy', { ns: 'common' })}</a>, <a href="/TermsOfService" className='font-bold text-blue-500 cursor-pointer'>{t('terms_of_use', { ns: 'common' })}</a>{t('second_paragraph2', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('third_heading', { ns: 'privacy' })}:</h3>

      <p>{t('third_paragraph', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph2', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph3', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph4', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph5', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph6', { ns: 'privacy' })}</p> <br/>
      <p>{t('third_paragraph7', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('fourth_heading', { ns: 'privacy' })}:</h3>

      <p>{t('fourth_paragraph', { ns: 'privacy' })}</p> <br/>
      <p>{t('fourth_paragraph2', { ns: 'privacy' })}</p> <br/>
      <ul className="list-disc pl-6">
        <li><p>{t('fourth_paragraph21', { ns: 'privacy' })}</p></li>
        <li><p>{t('fourth_paragraph22', { ns: 'privacy' })}</p></li>
        <li><p>{t('fourth_paragraph23', { ns: 'privacy' })}</p></li>
      </ul> <br/>
      <p>{t('fourth_paragraph24', { ns: 'privacy' })}</p> <br/>
      <p>{t('fourth_paragraph3', { ns: 'privacy' })}</p> <br/>
      <p>{t('fourth_paragraph4', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('cookies', { ns: 'common' })}:</h3>

      <p>{t('fifth_paragraph', { ns: 'privacy' })}<a href="https://www.google.com/intl/en/policies/privacy/" target='_blank' className='text-blue-500 underline cursor-pointer'>https://www.google.com/intl/en/policies/privacy/</a>{t('fifth_paragraph2', { ns: 'privacy' })}<a href="https://tools.google.com/dlpage/gaoptout" target='_blank' className='text-blue-500 underline cursor-pointer'>https://tools.google.com/dlpage/gaoptout</a>{t('fifth_paragraph3', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('sixth_heading', { ns: 'privacy' })}:</h3>

      <p>{t('sixth_paragraph', { ns: 'privacy' })}</p> <br/>
      <p>{t('sixth_paragraph2', { ns: 'privacy' })}</p> <br/>
      <p>{t('sixth_paragraph3', { ns: 'privacy' })}</p> <br/>
      <p>{t('sixth_paragraph4', { ns: 'privacy' })}</p> <br/>
      <p>{t('sixth_paragraph5', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('seventh_heading', { ns: 'privacy' })}:</h3> <p>{t('seventh_paragraph', { ns: 'privacy' })}</p>
      
      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('eighth_heading', { ns: 'privacy' })}:</h3> <p>{t('eighth_paragraph', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('ninth_heading', { ns: 'privacy' })}:</h3> <p>{t('ninth_paragraph', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('tenth_heading', { ns: 'privacy' })}:</h3> <p>{t('tenth_paragraph', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('eleventh_heading', { ns: 'privacy' })}:</h3> <p>{t('eleventh_paragraph', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('twelfth_heading', { ns: 'privacy' })}:</h3> <p>{t('twelfth_paragraph', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('thirteenth_heading', { ns: 'privacy' })}:</h3>

      <p>{t('thirteenth_paragraph', { ns: 'privacy' })}</p> <br/>
      <p>{t('thirteenth_paragraph2', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('fourteenth_heading', { ns: 'privacy' })}:</h3>

      <p>{t('fourteenth_paragraph', { ns: 'privacy' })}</p> <br/>
      <p>{t('fourteenth_paragraph2', { ns: 'privacy' })}</p>

      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('fifteenth_heading', { ns: 'privacy' })}:</h3> <p>{t('fifteenth_paragraph', { ns: 'privacy' })}</p>
      
      <h3 className='font-bold text-xl text-green-900 underline my-4 uppercase' style={{fontFamily: "Playfair"}}>{t('sixteenth_heading', { ns: 'privacy' })}:</h3>

      <p>{t('fourteenth_paragraph', { ns: 'privacy' })}</p> <br/>
      <p><b>{t('name', { ns: 'common' })}:</b> {t('khajan', { ns: 'common' })}</p>
      <p><b>{t('address', { ns: 'common' })}:</b> {t('khajan_location', { ns: 'common' })}</p>
      <b>{t('email', { ns: 'common' })}:</b> <a href="mailto:tanujbhatt8279@gmail.com" className='font-bold text-blue-500 cursor-pointer'>{t('khajan_email', { ns: 'common' })}</a><br />
      <p><b>{t('phone', { ns: 'common' })}:</b> {t('khajan_phone', { ns: 'common' })}</p>
      <b>{t('HunarBazaar_Internet_Private_Limited', { ns: 'common' })}</b>

      <p className='text-sm text-gray-600 mt-8'>{t('last_updated', { ns: 'common' })}: January 3, 2026</p>
    </div>
    <Footer />
  </div>)
}

export default PrivacyPolicy
