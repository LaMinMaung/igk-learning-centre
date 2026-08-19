import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, Mail, Phone, MapPin, Menu, X, GraduationCap, CheckCircle, Languages, Globe, Quote, Shield, Dumbbell, Heart, Palette, Calculator, LogIn, PlayCircle, FileText, Clock, Building2, TrendingUp } from 'lucide-react';
import ChatWidget from '../components/chatbot/ChatWidget';
import pb from '../lib/pocketbase';

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  icon: string;
  features: string[];
  route: string;
  status: string;
  order: number;
}

interface SiteContent {
  key: string;
  value: string;
  section: string;
}

interface SiteMedia {
  id: string;
  name: string;
  image: string;
  alt_text?: string;
  usage_key: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Record<string, SiteMedia>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        // Fetch programs
        const programsData = await pb.collection('programs').getFullList<Program>({
          filter: 'status = "published"',
          sort: 'order',
          requestKey: null,
        });
        setPrograms(programsData);

        // Fetch site content
        const contentData = await pb.collection('site_content').getFullList<SiteContent>({
          requestKey: null,
        });
        const contentMap: Record<string, string> = {};
        contentData.forEach(item => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);

        // Fetch site media
        const mediaData = await pb.collection('site_media').getFullList<SiteMedia>({
          requestKey: null,
        });
        const mediaMap: Record<string, SiteMedia> = {};
        mediaData.forEach(item => {
          mediaMap[item.usage_key] = item;
        });
        setMedia(mediaMap);
      } catch (error) {
        console.error('Failed to fetch CMS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/sgcaptcha/solver.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load captcha solver'));
        document.head.appendChild(script);
      });

      // @ts-ignore
      const pow = new sgpowcaptcha.PoWSolver();
      
      const challengeRes = await fetch('/sgcaptcha/challenge');
      const challenge = await challengeRes.text();
      
      const solution = await pow.start(challenge);

      const contactFormData = new FormData();
      contactFormData.append('message', `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      contactFormData.append('sol', solution);

      const response = await fetch('/sgcaptcha/contact', {
        method: 'POST',
        body: contactFormData
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      BookOpen: <BookOpen className="w-8 h-8" />,
      GraduationCap: <GraduationCap className="w-8 h-8" />,
      Award: <Award className="w-8 h-8" />,
      Calculator: <Calculator className="w-8 h-8" />,
      Languages: <Languages className="w-8 h-8" />,
      Globe: <Globe className="w-8 h-8" />,
    };
    return icons[iconName] || <BookOpen className="w-8 h-8" />;
  };

  const getMediaUrl = (usageKey: string, fallback: string = '') => {
    const mediaItem = media[usageKey];
    if (mediaItem) {
      return pb.files.getUrl(mediaItem, mediaItem.image);
    }
    return fallback;
  };

  const campusPhotos = [
    { title: 'Graduation Ceremony', image: 'public_9c5d_bf31d1de0bb74f2ba078fb84e4c5ffe3.png', description: '2024-2025 Academic Year Graduation', key: 'campus_graduation' },
    { title: 'Football', image: 'public_b0ad_522e94459c4248f186c6296453791008.jpg', description: 'Sports training and physical development', key: 'campus_football' },
    { title: 'Information & Communication Technology', image: 'public_a023_5083587c822a490dab8b9b949c28b481.jpg', description: 'Hands-on learning with technology', key: 'campus_ict' },
    { title: 'Scout Program', image: 'public_8d12_56536b0a50c14f8ca0b6e4977eb82ed7.jpg', description: 'Building leadership and outdoor skills', key: 'campus_scout' },
    { title: 'Red Cross', image: 'public_73bd_d473067ba8804b688324f580e7a34774.jpg', description: 'Community service and first aid training', key: 'campus_redcross' },
    { title: 'Modern Classroom', image: 'public_7c4b_4c8e76ba16a54d878642d1226d7f287a.jpeg', description: 'State-of-the-art learning environment', key: 'campus_classroom' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-2xl sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img 
                src={getMediaUrl('logo', '/public_582d_8769138177dc4f61b94ad786acaa8d4a.png')}
                alt="IGK Learning Centre Logo" 
                className="w-12 h-12 mr-3 rounded-full ring-2 ring-amber-400"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                IGK Learning Centre
              </span>
            </div>
            
            {/* Social Icons */}
            <div className="hidden md:flex items-center space-x-4 mr-8">
              <a 
                href="https://www.facebook.com/IGKLC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-all transform hover:scale-125 duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@ingyinkhittlc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-all transform hover:scale-125 duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-200 hover:text-amber-400 transition-all duration-300 font-medium">Home</a>
              <a href="#programs" className="text-gray-200 hover:text-amber-400 transition-all duration-300 font-medium">Programs</a>
              <a href="#about" className="text-gray-200 hover:text-amber-400 transition-all duration-300 font-medium">About</a>
              <button
                onClick={() => navigate('/book-appointment')}
                className="text-gray-200 hover:text-amber-400 transition-all duration-300 font-medium"
              >
                Book Appointment
              </button>
              <a href="#contact" className="text-gray-200 hover:text-amber-400 transition-all duration-300 font-medium">Contact</a>
              <button
                onClick={() => navigate('/lms/login')}
                className="flex items-center bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <LogIn className="w-4 h-4 mr-2" />
                LMS Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-all duration-300 text-amber-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700 animate-[slide-up_0.3s_ease-out]">
              <a href="#home" className="block py-3 text-gray-200 hover:text-amber-400 transition-all duration-300 hover:pl-2">Home</a>
              <a href="#programs" className="block py-3 text-gray-200 hover:text-amber-400 transition-all duration-300 hover:pl-2">Programs</a>
              <a href="#about" className="block py-3 text-gray-200 hover:text-amber-400 transition-all duration-300 hover:pl-2">About</a>
              <button
                onClick={() => navigate('/book-appointment')}
                className="block py-3 text-gray-200 hover:text-amber-400 transition-all duration-300 w-full text-left hover:pl-2"
              >
                Book Appointment
              </button>
              <a href="#contact" className="block py-3 text-gray-200 hover:text-amber-400 transition-all duration-300 hover:pl-2">Contact</a>
              <button
                onClick={() => navigate('/lms/login')}
                className="block py-3 text-amber-400 hover:text-amber-300 transition-all duration-300 w-full text-left font-semibold hover:pl-2"
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                LMS Login
              </button>
              
              {/* Mobile Social Icons */}
              <div className="flex space-x-6 mt-4 pt-4 border-t border-gray-700">
                <a 
                  href="https://www.facebook.com/IGKLC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-all duration-300"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com/@ingyinkhittlc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-all duration-300"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section id="home" className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-red-900/10 to-gray-800/10 animate-[glow_3s_ease-in-out_infinite]"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-[slide-up_0.6s_ease-out]">
            <p className="text-2xl sm:text-3xl font-semibold text-amber-400 mb-4">
              {content.hero_subtitle || 'Leading International School In Maesod'}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent leading-tight">
              <span dangerouslySetInnerHTML={{ __html: content.hero_title || 'Honored to be Part of<br>Your Learning Journey' }} />
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {content.hero_description || 'From Montessori to Cambridge International Curriculum, test preparation to language programs - IGK Learning Centre provides comprehensive education for all ages.'}
            </p>
            <a
              href="#programs"
              className="inline-block bg-gradient-to-r from-red-700 to-red-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-red-500/50"
            >
              Explore Our Programs
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 animate-[scale_0.3s_ease-out_0.2s] border-2 border-gray-700 hover:border-amber-400 transform hover:-translate-y-3 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-3">3+</div>
              <div className="text-gray-400 font-semibold text-lg">Years of Excellence</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 animate-[scale_0.3s_ease-out_0.3s] border-2 border-gray-700 hover:border-amber-400 transform hover:-translate-y-3 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent mb-3">500+</div>
              <div className="text-gray-400 font-semibold text-lg">Students Served</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 animate-[scale_0.3s_ease-out_0.4s] border-2 border-gray-700 hover:border-amber-400 transform hover:-translate-y-3 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-3">{programs.length}</div>
              <div className="text-gray-400 font-semibold text-lg">Core Programs</div>
            </div>
          </div>
        </div>
      </section>
      {/* Programs Section */}
      <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
              {content.programs_heading || 'Our Educational Programs'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {content.programs_subheading || 'Comprehensive learning opportunities from early childhood through test preparation and beyond.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={program.id}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 hover:-translate-y-3 border-2 border-gray-600 hover:border-red-700 animate-[scale_0.3s_ease-out] group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-red-700 to-red-600 text-white p-4 rounded-xl group-hover:scale-125 transition-transform duration-300 shadow-lg shadow-red-500/50">
                    {getIcon(program.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-amber-300 ml-4">{program.title}</h3>
                </div>
                
                <div 
                  className="text-gray-400 mb-6 min-h-[80px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: program.description }}
                />
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gray-600 px-4 py-2 rounded-lg shadow-md border-2 border-gray-500 hover:border-amber-400 transition-all duration-300">
                    <span className="text-sm text-gray-400">Duration: </span>
                    <span className="font-semibold text-red-400">{program.duration}</span>
                  </div>
                  <div className="bg-gray-600 px-4 py-2 rounded-lg shadow-md border-2 border-gray-500 hover:border-amber-400 transition-all duration-300">
                    <span className="text-sm text-gray-400">Level: </span>
                    <span className="font-semibold text-amber-400">{program.level}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/apply')}
                    className="block w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 transform hover:scale-105 text-center shadow-lg shadow-amber-500/30"
                  >
                    Apply Now
                  </button>
                  <button 
                    onClick={() => navigate(program.route)}
                    className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Extracurricular Programs Section */}
          <div className="mt-20 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-3xl p-16 shadow-2xl border-2 border-gray-600">
            <h3 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
              {content.extracurriculars_heading || 'Extracurricular Programs'}
            </h3>
            <p className="text-xl text-gray-200 mb-10 text-center max-w-4xl mx-auto leading-relaxed">
              {content.extracurriculars_description || 'Once you join any program, you will automatically gain access to our comprehensive extracurricular activities - providing strong evidence of well-rounded development for university applications.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 border-2 border-gray-600 hover:border-amber-400">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h4 className="text-2xl font-bold mb-3">Sports</h4>
                <p className="text-gray-300">Football, Badminton, Swimming</p>
              </div>
              
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 border-2 border-gray-600 hover:border-amber-400">
                <Heart className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h4 className="text-2xl font-bold mb-3">Red Cross</h4>
                <p className="text-gray-300">Community Service & First Aid</p>
              </div>
              
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 border-2 border-gray-600 hover:border-amber-400">
                <Shield className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h4 className="text-2xl font-bold mb-3">Scout Program</h4>
                <p className="text-gray-300">Leadership & Outdoor Skills</p>
              </div>
              
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 border-2 border-gray-600 hover:border-amber-400">
                <Palette className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h4 className="text-2xl font-bold mb-3">Art & Music</h4>
                <p className="text-gray-300">Creative Expression & Performance</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/extracurriculars')}
                className="bg-white text-red-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-amber-100 transition-all duration-300 transform hover:scale-110 shadow-2xl"
              >
                Learn More About Extracurriculars
              </button>
            </div>

            <p className="text-center mt-8 text-lg text-gray-200">
              <CheckCircle className="w-6 h-6 inline mr-2 text-amber-400" />
              These programs strengthen your university applications with diverse extracurricular achievements
            </p>
          </div>
        </div>
      </section>
      {/* Campus Life & Activities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
              Campus Life & Activities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Take a look at our vibrant campus, dedicated educators, and student achievements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campusPhotos.map((photo, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-2xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-500 hover:-translate-y-3 hover:shadow-amber-500/40"
              >
                <img
                  src={getMediaUrl(photo.key, photo.image)}
                  alt={photo.title}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-amber-300 mb-2">{photo.title}</h3>
                  <p className="text-gray-300">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Teachers Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
              Meet Our Educators
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Dedicated professionals committed to nurturing every student's potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Teacher 1 - Kyaw Ye Htut */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600 hover:border-red-700 hover:shadow-amber-500/30 transition-all duration-500 transform hover:-translate-y-3">
              <div className="mb-6">
                <img
                  src={getMediaUrl('teacher_kyaw', 'public_d47e_20c07869e6e14c76b74bb2b0ca998bd8.jpg')}
                  alt="Kyaw Ye Htut - Academic Director"
                  className="w-full h-80 object-cover rounded-xl border-4 border-amber-500/50"
                />
              </div>
              <h3 className="text-2xl font-bold text-amber-300 mb-2">Sir Kyaw Ye Htut @Kyaw Zin Phyo</h3>
              <p className="text-amber-500 mb-6 font-semibold text-lg">Academic Director</p>
              <div className="relative">
                <Quote className="w-10 h-10 text-amber-500/30 absolute -top-3 -left-3" />
                <p className="text-gray-400 italic pl-8 leading-relaxed">
                  "Education is not about memorizing answers; it is about learning how to think, grow and lead. At IGK Learning Centre, we nurture minds that are ready for the future."
                </p>
              </div>
            </div>

            {/* Teacher 2 - Way Linn */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600 hover:border-red-700 hover:shadow-amber-500/30 transition-all duration-500 transform hover:-translate-y-3">
              <div className="mb-6">
                <img
                  src={getMediaUrl('teacher_waylinn', 'public_1635_4de1a8974bb34e3a87e1d670a192da44.jpg')}
                  alt="Way Linn - Vice Principal"
                  className="w-full h-80 object-cover rounded-xl border-4 border-amber-500/50"
                />
              </div>
              <h3 className="text-2xl font-bold text-amber-300 mb-2">Sir Way Linn</h3>
              <p className="text-amber-500 mb-6 font-semibold text-lg">Vice Principal</p>
              <div className="relative">
                <Quote className="w-10 h-10 text-amber-500/30 absolute -top-3 -left-3" />
                <p className="text-gray-400 italic pl-8 leading-relaxed">
                  "Way Linn is the Vice-Principal of IGK Learning Centre, with a strong academic background in international relations, development studies, and research. He holds a Master of Development Studies and a Bachelor of Arts (Honours) in International Relations, and is currently a Master of Arts candidate in International Relations. He also holds a Diploma in Research Studies and is presently in his first year of the Master of Applied Statistics. His work focuses on academic leadership, research-driven education, and fostering a supportive learning environment for student success."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Student Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real experiences from students who have grown with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student 1 - Nyein Chan */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-600 hover:border-red-700 hover:shadow-amber-500/30 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-amber-500/50">
                  <img
                    src={getMediaUrl('student_nyeinchan', 'public_1a38_e96aa142c550409099d5691cf6e3ae5d.png')}
                    alt="Nyein Chan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-300">Nyein Chan</h3>
                  <p className="text-amber-500 text-sm">Currently finishing GED</p>
                </div>
              </div>
              <div className="relative">
                <Quote className="w-8 h-8 text-amber-500/30 absolute -top-2 -left-2" />
                <p className="text-gray-400 italic pl-6 leading-relaxed">
                  "IGK Learning Centre has been instrumental in my GED preparation journey. The teachers are patient and knowledgeable, breaking down complex concepts into understandable pieces. The supportive environment makes studying feel less overwhelming. I'm confident that with IGK's guidance, I'll achieve my educational goals and move forward to the next chapter of my academic career."
                </p>
              </div>
            </div>

            {/* Student 2 - Kyaw Zaw Oo */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-600 hover:border-red-700 hover:shadow-amber-500/30 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-amber-500/50">
                  <img
                    src={getMediaUrl('student_kyawzawoo', 'public_ab2e_ced17c5a767f4365a90416fb3e122d0d.png')}
                    alt="Kyaw Zaw Oo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-300">Kyaw Zaw Oo</h3>
                  <p className="text-amber-500 text-sm">GED Graduate, 2026</p>
                </div>
              </div>
              <div className="relative">
                <Quote className="w-8 h-8 text-amber-500/30 absolute -top-2 -left-2" />
                <p className="text-gray-400 italic pl-6 leading-relaxed">
                  "I passed my GED after studying in IGK in 2026. They assisted me with studying, buying and scheduling my examination and encouraged me from the start. I never really felt left out in Ingyin Khitt. I'm always thankful for what IGK did for me throughout the years."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose IGK Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-8">
                {content.about_heading || 'Why Choose IGK Learning Centre?'}
              </h2>
              <div 
                className="text-lg text-gray-400 mb-8 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.about_description || 'We provide a nurturing environment that combines international standards with personalized attention, helping students achieve their full potential from early childhood through advanced test preparation.' }}
              />
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-red-800/30 p-3 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-red-700">
                    <Award className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-300 mb-2 text-lg">International Standards</h3>
                    <p className="text-gray-400">Cambridge UK curriculum and globally recognized test preparation programs.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="bg-amber-900/30 p-3 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-amber-600">
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-300 mb-2 text-lg">Experienced Educators</h3>
                    <p className="text-gray-400">Qualified teachers with expertise in multiple curricula and teaching methods.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="bg-red-800/30 p-3 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-red-700">
                    <BookOpen className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-300 mb-2 text-lg">Comprehensive Programs</h3>
                    <p className="text-gray-400">From Montessori to languages and test prep - all under one roof.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl p-12 text-white shadow-2xl border-2 border-gray-600">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">Ready to Join Us?</h3>
              <p className="text-gray-200 mb-8 text-lg leading-relaxed">
                IGK is honored to be a part of the children's learning journey. Discover how we can support your educational goals.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-gray-200">
                  <CheckCircle className="w-6 h-6 mr-3 text-amber-400" />
                  <span>Montessori to Cambridge curriculum</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <CheckCircle className="w-6 h-6 mr-3 text-amber-400" />
                  <span>Test preparation (IGCSE, GED, SAT, TOEFL)</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <CheckCircle className="w-6 h-6 mr-3 text-amber-400" />
                  <span>Language programs (Thai, Chinese & more)</span>
                </li>
                <li className="flex items-center text-gray-200">
                  <CheckCircle className="w-6 h-6 mr-3 text-amber-400" />
                  <span>Extracurricular activities included</span>
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full bg-white text-red-700 py-4 rounded-xl font-bold text-lg hover:bg-amber-100 transition-all duration-300 text-center shadow-2xl transform hover:scale-105"
              >
                Contact Us Today
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
              {content.contact_heading || 'Get in Touch'}
            </h2>
            <p className="text-xl text-gray-400">
              {content.contact_subheading || "Have questions about our programs? We'd love to hear from you."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-2xl border-2 border-gray-600">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-amber-300 mb-3">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-5 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-amber-300 mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-5 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-amber-300 mb-3">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-5 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 resize-none text-gray-200"
                    placeholder="Which program are you interested in?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-red-500/30"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-amber-900/30 border-2 border-amber-500 text-amber-300 px-5 py-4 rounded-xl">
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-900/30 border-2 border-red-500 text-red-300 px-5 py-4 rounded-xl">
                    Sorry, there was an error sending your message. Please try again.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-amber-300 mb-8">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="bg-red-800/30 p-4 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-red-700">
                      <Phone className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-2 text-lg">Phone</h4>
                      <a href="tel:+66823545362" className="text-gray-400 hover:text-amber-400 transition-all duration-300 block">082-354-5362</a>
                      <a href="tel:+66824653236" className="text-gray-400 hover:text-amber-400 transition-all duration-300 block">082-465-3236</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group">
                    <div className="bg-amber-900/30 p-4 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-amber-600">
                      <Mail className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-2 text-lg">Email</h4>
                      <a href="mailto:info@igklearningcentre.com" className="text-gray-400 hover:text-amber-400 transition-all duration-300">
                        info@igklearningcentre.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group">
                    <div className="bg-red-800/30 p-4 rounded-xl mr-4 group-hover:scale-125 transition-transform duration-300 border border-red-700">
                      <MapPin className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-2 text-lg">Address</h4>
                      <p className="text-gray-400 mb-3 leading-relaxed">
                        95/72, Samak Sappakan Road<br />
                        Ruam Raeng Community, Mae Sot District<br />
                        Tak Province 63110<br />
                        (next to the new road)
                      </p>
                      <a
                        href="https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=95%2F72%20%2C%20Samak%20Sappakan%20Road%2C%20Ruam%20Raeng%20Community%2C%20Mae%20Sot%20District%2C%20Tak%20Province%2063110%20(next%20to%20the%20new%20road)%2C%20Mae%20Sot%2C%20Thailand%2C%2063110&FORM=FBKPL1&mkt=en-US"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:text-red-400 font-bold transition-all duration-300"
                      >
                        View on Map →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-10 rounded-2xl text-white shadow-2xl border-2 border-gray-600">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">Visit Us</h3>
                <p className="mb-6 text-gray-200 leading-relaxed">
                  We welcome visits from prospective students and parents. Contact us to schedule a tour of our facilities.
                </p>
                <div className="space-y-3">
                  <p className="flex justify-between text-gray-200">
                    <span>Monday - Sunday:</span>
                    <span className="font-bold text-amber-300">8:00 AM - 5:00 PM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <img 
                src={getMediaUrl('logo', '/public_582d_8769138177dc4f61b94ad786acaa8d4a.png')}
                  alt="IGK Learning Centre Logo" 
                  className="w-10 h-10 mr-3 rounded-full ring-2 ring-amber-500"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">IGK Learning Centre</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {content.footer_tagline || "Honored to be a part of the children's learning journey."}
              </p>
              <div className="flex space-x-6 mt-6">
                <a 
                  href="https://www.facebook.com/IGKLC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-all duration-300 transform hover:scale-125"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com/@ingyinkhittlc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-all duration-300 transform hover:scale-125"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-amber-300 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#home" className="hover:text-amber-400 transition-all duration-300 hover:pl-2 inline-block">Home</a></li>
                <li><a href="#programs" className="hover:text-amber-400 transition-all duration-300 hover:pl-2 inline-block">Programs</a></li>
                <li><a href="#about" className="hover:text-amber-400 transition-all duration-300 hover:pl-2 inline-block">About</a></li>
                <li><a href="#contact" className="hover:text-amber-400 transition-all duration-300 hover:pl-2 inline-block">Contact</a></li>
                <li>
                  <button 
                    onClick={() => navigate('/lms/login')}
                    className="hover:text-amber-400 transition-all duration-300 hover:pl-2 inline-block"
                  >
                    LMS Login
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-amber-300 text-lg">Our Programs</h4>
              <ul className="space-y-2 text-gray-400">
                {programs.slice(0, 6).map((program) => (
                  <li key={program.id}>{program.title}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IGK Learning Centre. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};

export default Index;