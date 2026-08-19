import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, ArrowLeft, CheckCircle, Globe, MessageCircle, Users } from 'lucide-react';

const LanguagesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-gold-100">
      {/* Navigation */}
      <nav className="bg-blue-950 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gold-100 hover:text-gold-400 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-red-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Languages className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Language Programs</h1>
          </div>
          <p className="text-xl text-gold-100 max-w-3xl">
            Comprehensive language instruction in Thai, Chinese, and other languages with qualified instructors.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Languages:</span> Thai, Chinese & More
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Level:</span> All Ages
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Schedule:</span> Flexible
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* About the Program */}
            <div>
              <h2 className="text-3xl font-bold text-blue-950 mb-6">Multilingual Education</h2>
              <p className="text-gray-700 mb-4">
                In today's interconnected world, knowing multiple languages opens doors to new opportunities, 
                cultures, and perspectives. Our language programs are designed to help students of all ages 
                develop practical communication skills in Thai, Chinese (Mandarin), and other languages.
              </p>
              <p className="text-gray-700 mb-4">
                We employ communicative teaching methods that emphasize real-world language use. Students engage 
                in speaking, listening, reading, and writing activities that prepare them for authentic interactions 
                in their target language.
              </p>
              <p className="text-gray-700">
                Our qualified instructors, including native speakers, create an immersive learning environment 
                that builds confidence and fluency. Whether you're learning for academic purposes, career advancement, 
                or personal enrichment, we tailor our programs to your goals.
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gold-200">
              <h3 className="text-2xl font-bold text-blue-950 mb-6">What Makes Us Different</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MessageCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-950">Communicative Approach</h4>
                    <p className="text-gray-600">Focus on practical conversation and real-world language use</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-950">Qualified Teachers</h4>
                    <p className="text-gray-600">Learn from native speakers and experienced language teachers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-950">Cultural Immersion</h4>
                    <p className="text-gray-600">Learn language alongside cultural context and customs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-gold-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-950">Flexible Scheduling</h4>
                    <p className="text-gray-600">Group classes and private lessons to fit your schedule</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Programs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Available Languages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Thai */}
              <div className="bg-gradient-to-br from-white to-gold-100 p-8 rounded-xl shadow-lg border border-gold-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Languages className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-700 mb-4">Thai Language</h3>
                <p className="text-gray-600 mb-4">
                  Learn to speak, read, and write Thai for everyday communication and cultural understanding in Thailand.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Speaking & Conversation</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Reading & Writing</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Cultural Context</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Native Instructors</span>
                  </li>
                </ul>
              </div>

              {/* Chinese */}
              <div className="bg-gradient-to-br from-white to-gold-100 p-8 rounded-xl shadow-lg border border-gold-200">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-4">
                  <Languages className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="text-2xl font-bold text-gold-700 mb-4">Chinese (Mandarin)</h3>
                <p className="text-gray-600 mb-4">
                  Master Mandarin Chinese with comprehensive instruction in speaking, listening, reading, and writing.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span>Pinyin & Pronunciation</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span>Character Recognition</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span>HSK Test Preparation</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span>Business Chinese Available</span>
                  </li>
                </ul>
              </div>

              {/* Other Languages */}
              <div className="bg-gradient-to-br from-white to-gold-100 p-8 rounded-xl shadow-lg border border-gold-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-700 mb-4">Other Languages</h3>
                <p className="text-gray-600 mb-4">
                  We offer instruction in additional languages based on demand and availability. Contact us for details.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Spanish</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Japanese</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>French</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gold-500 mr-2" />
                    <span>Custom Requests</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Learning Levels */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Proficiency Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border border-red-200 text-center">
                <h3 className="text-xl font-bold text-red-700 mb-3">Beginner</h3>
                <p className="text-gray-600">
                  Start from zero with basic vocabulary and simple phrases
                </p>
              </div>
              <div className="bg-gradient-to-br from-gold-50 to-white p-6 rounded-xl border border-gold-200 text-center">
                <h3 className="text-xl font-bold text-gold-700 mb-3">Elementary</h3>
                <p className="text-gray-600">
                  Build foundational skills for everyday conversations
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border border-red-200 text-center">
                <h3 className="text-xl font-bold text-red-700 mb-3">Intermediate</h3>
                <p className="text-gray-600">
                  Develop fluency and tackle more complex topics
                </p>
              </div>
              <div className="bg-gradient-to-br from-gold-50 to-white p-6 rounded-xl border border-gold-200 text-center">
                <h3 className="text-xl font-bold text-gold-700 mb-3">Advanced</h3>
                <p className="text-gray-600">
                  Master nuances and achieve near-native proficiency
                </p>
              </div>
            </div>
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Our Language Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video bg-gradient-to-br from-red-100 to-gold-100 rounded-xl flex items-center justify-center border border-gold-200">
                <div className="text-center text-gray-500">
                  <Languages className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Class Sessions</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gold-100 to-red-100 rounded-xl flex items-center justify-center border border-gold-200">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Conversation Practice</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-red-100 to-gold-100 rounded-xl flex items-center justify-center border border-gold-200">
                <div className="text-center text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Cultural Activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Language Journey</h2>
            <p className="text-xl text-gold-100 mb-8 max-w-2xl mx-auto">
              Whether for travel, work, or personal growth, learning a new language opens doors to new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/#contact')}
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gold-100 transition transform hover:scale-105"
              >
                Enroll Now
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                View All Programs
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LanguagesPage;