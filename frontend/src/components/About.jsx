import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Header, Footer } from './header_footer';
import { Mail, Linkedin, Github, MapPin, Globe } from 'lucide-react';
import { FaBullseye, FaBinoculars } from "react-icons/fa";
import { DeveloperSocialCard, TitleDescriptionCard } from './Cards';
const About = () => {
  const { user_type } = useParams();
  const { t, i18n } = useTranslation(['about', 'common']);
  const developerInfo = [
    {name: t('khajan', {ns: "common"}), designation: t('khajan_designation', {ns: "common"}), description: t('khajan_description', {ns: "about"}), image: "/assets/Commons/tanuj_profile.jfif", phone: t('khajan_phone', {ns: "common"}), email: t('khajan_email', {ns: "common"}), address: t('khajan_location', {ns: "common"}), github: "https://github.com/Khajan38", linkedin: "https://www.linkedin.com/in/khajanbhatt/", portfolio: "https://khajan38.vercel.app/", instagram: "https://www.instagram.com/tanuj_bhatt38/", twitter: "https://x.com/khajan_bhatt38", resume: "https://khajan38.github.io/Resume/Khajan-Bhatt-Resume.pdf", discord: "https://discord.com/users/khajan38_79800", leetcode: "https://leetcode.com/u/khajan_bhatt/", codechef: "https://www.codechef.com/users/khajan_bhatt" },
    {name: t('vineet', {ns: "common"}), designation: t('vineet_designation', {ns: "common"}), description: t('vineet_description', {ns: "about"}), image: "/assets/Commons/vineet_profile.jpeg", phone: t('vineet_phone', {ns: "common"}), email: t('vineet_email', {ns: "common"}), address: t('vineet_location', {ns: "common"}), github: "https://github.com/vineet358", linkedin: "https://www.linkedin.com/in/vineet-pandey-5807692b4/", portfolio: "https://vineet358.github.io/resume/vineet__pandey_resum.pdf", instagram: "https://www.instagram.com/_vineet__pandey_/", twitter: "https://x.com/vineet__pandey", resume: "https://vineet358.github.io/resume/vineet__pandey_resum.pdf", leetcode: "https://leetcode.com/u/vineet__pandey/", codechef: "https://www.codechef.com/users/vineetpandey32"},
  ];

  return (<>
    <Header userType={user_type} />
    <div className="relative w-full max-w-[1200px] bg-transparent md:bg-[#f4f4f4] rounded-lg md:shadow-[0_4px_10px_rgba(0,0,0,0.1)] h-full mx-auto my-10 py-0 px-10 md:py-10 text-justify">
      <div className="relative flex flex-col md:flex-row items-center mb-6 w-full">
        <h1 className="font-bold md:absolute md:left-1/2 md:-translate-x-1/2 text-4xl text-green-900 text-center underline" style={{ fontFamily: "Montserrat, Poppins, sans-serif" }}> {t('about', { ns: 'common' })} </h1>
        <div className="flex flex-row items-center justify-center gap-2 ml-auto mt-2 md:mt-0">
          <Globe className="w-5 h-5 text-gray-500" />
          <select className="p-2.5 border border-gray-300 rounded" onChange={(e) => i18n.changeLanguage(e.target.value) } value={i18n.language}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>
        
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
        <div className="flex-1">
          <div className="flex justify-end items-right gap-4 bg-[url('/assets/Commons/about_background.jpeg')] bg-cover bg-center p-4 rounded-lg">
            <img className="bg-transparent rounded-[50%] p-2" style={{height:"120px", width:"120px"}} src={'/assets/Hunar_Bazaar.jpeg'} alt="App Logo"/>
            <div className='flex flex-col justify-center items-end gap-0'>
              <h1 className='text-[30px] sm:text-[50px] font-bold text-[#b92438]' style={{ fontFamily:"Montserrat, Poppins, sans-serif"}}>{t('brand', {ns:"common"})}</h1>
              <p className='text-[9px] sm:text-[12px] font-bold text-[#b92438] uppercase' style={{fontFamily:"Montserrat, Poppins, sans-serif"}}>{t('brandline', {ns:"common"})}</p>
            </div>
          </div>
          <h3 className='font-bold text-left text-[25px] text-green-900 underline my-4 uppercase' style={{fontFamily: "Montserrat"}}>{t('intro_title')}:</h3>
          <p className="text-lg text-gray-700 leading-relaxed">{t('intro_text')}</p>
        </div>
        <img className="h-full w-full md:w-[30%] rounded-lg" src="/assets/Commons/about_side_video.gif" alt="About Us"/>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <TitleDescriptionCard title={t('mission_title')} description={t('mission_text')} icon={FaBullseye} />
        <TitleDescriptionCard title={t('vision_title')} description={t('vision_text')} icon={FaBinoculars} />
      </div>

      <h3 className='font-bold text-center text-[25px] text-green-900 underline mb-8 uppercase' style={{fontFamily: "Montserrat"}}>{t('values_title', {ns: "about"})}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[0, 1, 2, 3, 4, 5].map((num) => (<TitleDescriptionCard title={t(`value${num}_title`)} description={t(`value${num}_text`)} key={num} index={num} showIndex={true} collapsible={true} />))}
      </div>

      <section className="mb-16">
        <div className="text-center mb-12">
          <h3 className='font-bold text-center text-[25px] text-green-900 underline uppercase' style={{fontFamily: "Montserrat"}}>{t('team_title', {ns: "about"})}</h3>
          <p className="text-gray-600 text-lg" style={{fontFamily: "Montserrat"}}>{t('team_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">{developerInfo.map((dev, i) => (<DeveloperSocialCard key={i} developerInfo={dev} />))}</div>
      </section>

    </div>
    <Footer />
  </>);
};

export default About;