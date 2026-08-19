import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, CheckCircle, Calculator, Languages, Award } from 'lucide-react';

const SingaporeMathPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-white to-light-100">
      {/* Navigation */}
      <nav className="bg-dark-navy-950 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-light-100 hover:text-accent-400 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Globe className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Singapore Math & YLE</h1>
          </div>
          <p className="text-xl text-light-100 max-w-3xl">
            World-renowned Singapore Math program combined with Young Learners English (YLE) to build strong mathematical and language foundations.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Programs:</span> Singapore Math + YLE
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Level:</span> All Ages
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Recognition:</span> Cambridge YLE
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Singapore Math Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Singapore Math Method</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">What is Singapore Math?</h3>
                <p className="text-gray-700 mb-4">
                  Singapore Math is a world-leading mathematics teaching approach that has consistently ranked Singapore 
                  students at the top of international assessments. The method emphasizes deep understanding of 
                  mathematical concepts rather than memorization.
                </p>
                <p className="text-gray-700 mb-4">
                  Using the Concrete-Pictorial-Abstract (CPA) approach, students progress from hands-on learning with 
                  physical objects to visual representations and finally to abstract mathematical symbols. This ensures 
                  a solid foundation in problem-solving and critical thinking.
                </p>
                <p className="text-gray-700">
                  Our Singapore Math program develops strong number sense, mental math abilities, and mathematical 
                  reasoning that benefits students throughout their academic journey.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-dark-navy-950 mb-6">Key Features</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calculator className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">CPA Approach</h4>
                      <p className="text-gray-600">Concrete-Pictorial-Abstract methodology for deep understanding</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">Problem-Solving Focus</h4>
                      <p className="text-gray-600">Emphasis on critical thinking and analytical skills</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">World-Class Curriculum</h4>
                      <p className="text-gray-600">Based on Singapore's top-ranked education system</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">Proven Results</h4>
                      <p className="text-gray-600">Consistently high achievement in mathematics assessments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YLE Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Young Learners English (YLE)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-dark-navy-950 mb-6">Cambridge YLE Exams</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Languages className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">Starters (Pre A1)</h4>
                      <p className="text-gray-600">Introduction to written and spoken English for young beginners</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Languages className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">Movers (A1)</h4>
                      <p className="text-gray-600">Next step in language learning journey with broader topics</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Languages className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-dark-navy-950">Flyers (A2)</h4>
                      <p className="text-gray-600">Foundation for further English language learning and exams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">Cambridge Assessment English</h3>
                <p className="text-gray-700 mb-4">
                  Our Young Learners English program follows the Cambridge Assessment English framework, providing 
                  children aged 7-12 with a fun and motivating path to learning English.
                </p>
                <p className="text-gray-700 mb-4">
                  The YLE exams are designed to assess all four language skills - reading, writing, listening, and 
                  speaking - in an age-appropriate and encouraging way. Students receive certificates and 'shields' 
                  for each skill area, celebrating their achievement.
                </p>
                <p className="text-gray-700">
                  These internationally recognized qualifications provide a solid foundation for future Cambridge 
                  English exams and build confidence in English communication.
                </p>
              </div>
            </div>
          </div>

          {/* Learning Areas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">What Students Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">Mathematical Reasoning</h3>
                <p className="text-gray-600">
                  Develop strong problem-solving skills through the Singapore Math method's unique approach to numbers and operations
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">English Communication</h3>
                <p className="text-gray-600">
                  Build confidence in reading, writing, listening, and speaking English through Cambridge YLE curriculum
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">Visual Learning</h3>
                <p className="text-gray-600">
                  Master bar modeling and other visual tools that make complex mathematical concepts easy to understand
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">International Certification</h3>
                <p className="text-gray-600">
                  Earn Cambridge YLE certificates recognized worldwide as proof of English language proficiency
                </p>
              </div>
            </div>
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Learning in Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <Calculator className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Math Lessons</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-xl flex items-center justify-center border border-accent-200">
                <div className="text-center text-gray-500">
                  <Languages className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>English Classes</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>YLE Exams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Build Strong Foundations</h2>
            <p className="text-xl text-light-100 mb-8 max-w-2xl mx-auto">
              Enroll in our Singapore Math and YLE programs to give your child world-class education in mathematics and English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/#contact')}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-light-100 transition transform hover:scale-105"
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

export default SingaporeMathPage;