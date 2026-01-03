import { Header, Footer } from './header_footer';
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Globe } from "lucide-react";

const TermsOfService = () => {
  const { user_type } = useParams();
  const { t, i18n } = useTranslation(['common', 'terms']);

  const BuyerTerms = () => (
    <div>
      <h3 className='font-bold text-2xl text-green-900 underline my-4' style={{ fontFamily: "Playfair" }}>{t('buyer_terms_heading', { ns: 'terms' })}</h3>

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>1. {t('buyer_section1_title', { ns: 'terms' })}</h4>
      <p>{t('buyer_section1_content', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>2. {t('buyer_section2_title', { ns: 'terms' })}</h4>
      <p>{t('buyer_section2_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section2_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section2_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section2_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section2_point4', { ns: 'terms' })}</li>
        <li>{t('buyer_section2_point5', { ns: 'terms' })}</li>
      </ul>
      <p>{t('buyer_section2_footer', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        3. {t('buyer_section3_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section3_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section3_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section3_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section3_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section3_point4', { ns: 'terms' })}</li>
        <li>{t('buyer_section3_point5', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        4. {t('buyer_section4_title', { ns: 'terms' })}
      </h4>
      <p><strong>{t('buyer_section4_subtitle1', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section4_sub1_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section4_sub1_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section4_sub1_point3', { ns: 'terms' })}</li>
      </ul>
      <p><strong>{t('buyer_section4_subtitle2', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section4_sub2_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section4_sub2_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section4_sub2_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section4_sub2_point4', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        5. {t('buyer_section5_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section5_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section5_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section5_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section5_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section5_point4', { ns: 'terms' })}</li>
        <li>{t('buyer_section5_point5', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        6. {t('buyer_section6_title', { ns: 'terms' })}
      </h4>
      <p><strong>{t('buyer_section6_subtitle1', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section6_sub1_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section6_sub1_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section6_sub1_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section6_sub1_point4', { ns: 'terms' })}</li>
      </ul>
      <p><strong>{t('buyer_section6_subtitle2', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section6_sub2_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section6_sub2_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section6_sub2_point3', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        7. {t('buyer_section7_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section7_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section7_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point4', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point5', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point6', { ns: 'terms' })}</li>
        <li>{t('buyer_section7_point7', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        8. {t('buyer_section8_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section8_content', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        9. {t('buyer_section9_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section9_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section9_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section9_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section9_point3', { ns: 'terms' })}</li>
      </ul>
      <p>{t('buyer_section9_footer', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        10. {t('buyer_section10_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section10_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section10_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section10_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section10_point3', { ns: 'terms' })}</li>
        <li>{t('buyer_section10_point4', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        11. {t('buyer_section11_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section11_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('buyer_section11_point1', { ns: 'terms' })}</li>
        <li>{t('buyer_section11_point2', { ns: 'terms' })}</li>
        <li>{t('buyer_section11_point3', { ns: 'terms' })}</li>
      </ul>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        12. {t('buyer_section12_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section12_content', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        13. {t('buyer_section13_title', { ns: 'terms' })}
      </h4>
      <p>{t('buyer_section13_content', { ns: 'terms' })}</p>
      <br />

      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        14. {t('buyer_section14_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section16_content', { ns: 'terms' })}</p>
      <p>
        <b>{t('name', { ns: 'common' })}:</b> {t('vineet', { ns: 'common' })}<br />
        <b>{t('email', { ns: 'common' })}:</b> <a href="mailto:vp1246194@gmail.com" className='font-bold text-blue-500 cursor-pointer'>{t('vineet_email', { ns: 'common' })}</a><br />
        <b>{t('phone', { ns: 'common' })}:</b> {t('vineet_phone', { ns: 'common' })}<br />
        <b>{t('address', { ns: 'common' })}:</b> {t('vineet_location', { ns: 'common' })}
        {t('HunarBazaar_Internet_Private_Limited', { ns: 'common' })}
      </p>
    </div>
  );

  const SellerTerms = () => (
    <div>
      <h3 className='font-bold text-2xl text-green-900 underline my-4 mt-8' style={{ fontFamily: "Playfair" }}>
        {t('seller_terms_heading', { ns: 'terms' })}
      </h3>
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        1. {t('seller_section1_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section1_content', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        2. {t('seller_section2_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section2_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section2_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section2_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section2_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section2_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section2_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section2_point6', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        3. {t('seller_section3_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section3_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section3_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point6', { ns: 'terms' })}</li>
        <li>{t('seller_section3_point7', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        4. {t('seller_section4_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section4_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section4_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point6', { ns: 'terms' })}</li>
        <li>{t('seller_section4_point7', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        5. {t('seller_section5_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section5_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section5_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section5_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section5_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section5_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section5_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section5_point6', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        6. {t('seller_section6_title', { ns: 'terms' })}
      </h4>
      <p><strong>{t('seller_section6_subtitle1', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section6_sub1_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub1_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub1_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub1_point4', { ns: 'terms' })}</li>
      </ul>
      <p><strong>{t('seller_section6_subtitle2', { ns: 'terms' })}</strong></p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section6_sub2_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub2_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub2_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section6_sub2_point4', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        7. {t('seller_section7_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section7_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section7_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section7_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section7_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section7_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section7_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section7_point6', { ns: 'terms' })}</li>
      </ul>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        8. {t('seller_section8_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section8_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section8_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section8_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section8_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section8_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section8_point5', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section8_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        9. {t('seller_section9_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section9_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section9_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section9_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section9_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section9_point4', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section9_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        10. {t('seller_section10_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section10_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section10_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section10_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section10_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section10_point4', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section10_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        11. {t('seller_section11_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section11_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section11_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section11_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section11_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section11_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section11_point5', { ns: 'terms' })}</li>
        <li>{t('seller_section11_point6', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section11_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        12. {t('seller_section12_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section12_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section12_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section12_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section12_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section12_point4', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section12_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        13. {t('seller_section13_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section13_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section13_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section13_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section13_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section13_point4', { ns: 'terms' })}</li>
      </ul>
      <p>{t('seller_section13_footer', { ns: 'terms' })}</p>
      <br />
  
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        14. {t('seller_section14_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section14_intro', { ns: 'terms' })}</p>
      <ul className='list-disc ml-8 my-2'>
        <li>{t('seller_section14_point1', { ns: 'terms' })}</li>
        <li>{t('seller_section14_point2', { ns: 'terms' })}</li>
        <li>{t('seller_section14_point3', { ns: 'terms' })}</li>
        <li>{t('seller_section14_point4', { ns: 'terms' })}</li>
        <li>{t('seller_section14_point5', { ns: 'terms' })}</li>
      </ul>
      <br />
   <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        15. {t('seller_section15_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section15_content', { ns: 'terms' })}</p>
      <br />
      <h4 className='font-bold text-lg text-green-900 mt-4 mb-2'>
        16. {t('seller_section16_title', { ns: 'terms' })}
      </h4>
      <p>{t('seller_section16_content', { ns: 'terms' })}</p>
      <p>
        <b>{t('name', { ns: 'common' })}:</b> {t('khajan', { ns: 'common' })}<br />
        <b>{t('email', { ns: 'common' })}:</b> <a href="mailto:tanujbhatt8279@gmail.com" className='font-bold text-blue-500 cursor-pointer'>{t('khajan_email', { ns: 'common' })}</a><br />
        <b>{t('phone', { ns: 'common' })}:</b> {t('khajan_phone', { ns: 'common' })}<br />
        <b>{t('address', { ns: 'common' })}:</b> {t('khajan_location', { ns: 'common' })}
        {t('HunarBazaar_Internet_Private_Limited', { ns: 'common' })}
      </p>

      <br />
    </div>
  );

  const showBuyer = !user_type || user_type === 'buyer';
  const showSeller = !user_type || user_type === 'seller';

  return (
    <div className='relative h-full w-full overflow-hidden lg:overflow-visible'>
      <Header userType={user_type} />
      
      <div className="relative w-full max-w-[1200px] bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] h-full mx-auto my-10 py-0 px-10 md:py-10 text-justify">
        <div className="relative flex items-center mb-6 w-full">
          <h1 className="font-bold absolute left-1/2 -translate-x-1/2 text-4xl text-green-900 text-center" style={{ fontFamily: "Montserrat, Poppins, sans-serif" }}>
            {t('terms_of_service', { ns: 'common' })}
          </h1>
          <div className="flex flex-row items-center justify-center gap-2 ml-auto">
            <Globe className="w-5 h-5 text-gray-500" />
            <select className="p-2.5 border border-gray-300 rounded" onChange={(e) => i18n.changeLanguage(e.target.value)} value={i18n.language}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>

        <p><b>{t('disclaimer', { ns: 'common' })}</b>: {t('disclaimer', { ns: 'terms' })}</p>
        <br />

        <p>{t('introduction_para1', { ns: 'terms' })} <b>{t('brand', { ns: 'common' })}</b> {t('introduction_para2', { ns: 'terms' })}</p>
        <br />

        {showBuyer && <BuyerTerms />}
        {showSeller && <SellerTerms />}

        <p className='text-sm text-gray-600 mt-8'>{t('last_updated', { ns: 'common' })}: January 3, 2026</p>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;