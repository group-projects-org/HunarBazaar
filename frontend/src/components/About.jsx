import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Header, Footer } from './header_footer';
import { Mail, Linkedin, Github, MapPin, Globe, ChevronDown } from 'lucide-react';

const About = () => {
  const { user_type } = useParams();
  const { t, i18n } = useTranslation('about');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false);
  };

  const currentLanguage = i18n.language === 'hi' ? 'हिंदी' : 'English';

  return (
    <div>
      <Header userType={user_type} />
      
      <main className="min-h-screen bg-gray-50">
  
        <div className="bg-white border-b-4 border-green-500 py-8 px-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t('hero_title')}
            </h1>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                <Globe size={20} />
                <span className="font-medium">{currentLanguage}</span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors ${
                      i18n.language === 'en' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors ${
                      i18n.language === 'hi' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {t('intro_title')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('intro_text')}
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('mission_title')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('mission_text')}
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('vision_title')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('vision_text')}
              </p>
            </section>
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {t('values_title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                    {num}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t(`value${num}_title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`value${num}_text`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {t('team_title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('team_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    KB
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {t('dev2_name')}
                  </h3>
                  <p className="text-green-600 font-semibold text-lg">
                    {t('dev2_role')}
                  </p>
                </div>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {t('dev2_bio')}
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:tanujbhatt8279@gmail.com"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Mail size={20} className="flex-shrink-0" />
                    <span className="text-sm break-all">
                      tanujbhatt@gmail.com
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/khajanbhatt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Linkedin size={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {t('dev2_linkedin_label')}
                    </span>
                  </a>
                  <a
                    href="https://github.com/Khajan38"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Github size={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {t('dev2_github_label')}
                    </span>
                  </a>
                 
                </div>
              </div>

            
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    VP
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {t('dev1_name')}
                  </h3>
                  <p className="text-green-600 font-semibold text-lg">
                    {t('dev1_role')}
                  </p>
                </div>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {t('dev1_bio')}
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:vineetpandey9935@gmail.com"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Mail size={20} className="flex-shrink-0" />
                    <span className="text-sm break-all">
                      vineetpande200@gmail.com
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vineet-pandey-5807692b4/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Linkedin size={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {t('dev1_linkedin_label')}
                    </span>
                  </a>
                  <a
                    href="https://github.com/vineet358"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                  >
                    <Github size={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {t('dev2_github_label')}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>

        
          <section className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {t('contact_title')}
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-4 text-gray-700 p-3 bg-white rounded-lg">
                <Mail className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <span className="font-semibold">{t('contact_email_label')}:</span>
                  <span className="ml-2">tanujbhatt8279@gmail.com</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-700 p-3 bg-white rounded-lg">
                <MapPin className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <span className="font-semibold">{t('contact_address_label')}:</span>
                  <span className="ml-2">{t('contact_address')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;