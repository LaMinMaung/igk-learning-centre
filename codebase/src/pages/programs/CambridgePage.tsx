import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, CheckCircle, Globe, BookOpen, Award } from 'lucide-react';

const CambridgePage = () => {
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
            <GraduationCap className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Cambridge International Curriculum</h1>
          </div>
          <p className="text-xl text-light-100 max-w-3xl">
            Comprehensive Cambridge (UK) International Curriculum preparing students for global academic success from Year 1 to Year 9.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Level:</span> Year 1 to Year 9
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Curriculum:</span> Cambridge UK
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Recognition:</span> International
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
              <h2 className="text-3xl font-bold text-dark-navy-950 mb-6">World-Class Education Standards</h2>
              <p className="text-gray-700 mb-4">
                Our Cambridge International Curriculum provides students with a globally recognized education that 
                prepares them for success anywhere in the world. Following the UK's rigorous academic standards, 
                we deliver comprehensive instruction from Year 1 through Year 9.
              </p>
              <p className="text-gray-700 mb-4">
                The Cambridge curriculum is designed to be flexible and challenging, encouraging students to develop 
                critical thinking skills, creativity, and a deep understanding of core subjects. Our experienced 
                teachers use innovative teaching methods to engage students and foster a love of learning.
              </p>
              <p className="text-gray-700">
                Students benefit from internationally benchmarked assessments and qualifications that are recognized 
                by universities and employers worldwide, opening doors to future academic and career opportunities.
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-light-200">
              <h3 className="text-2xl font-bold text-dark-navy-950 mb-6">Program Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">International Standards</h4>
                    <p className="text-gray-600">Globally recognized curriculum accepted by top universities worldwide</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Critical Thinking</h4>
                    <p className="text-gray-600">Emphasis on analytical skills and independent learning</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BookOpen className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Comprehensive Subjects</h4>
                    <p className="text-gray-600">Balanced curriculum covering all core academic areas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Regular Assessments</h4>
                    <p className="text-gray-600">Continuous evaluation and progress tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Areas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Core Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">English Language</h3>
                <p className="text-gray-600">
                  Reading, writing, speaking, and listening skills with emphasis on literature and communication
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">Mathematics</h3>
                <p className="text-gray-600">
                  Number, algebra, geometry, statistics, and problem-solving with real-world applications
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">Science</h3>
                <p className="text-gray-600">
                  Biology, chemistry, and physics with practical experiments and scientific inquiry
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">Humanities</h3>
                <p className="text-gray-600">
                  History and geography developing understanding of societies and the world
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">ICT</h3>
                <p className="text-gray-600">
                  Information and communication technology skills for the digital age
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">Arts & PE</h3>
                <p className="text-gray-600">
                  Creative expression through art and music, plus physical education
                </p>
              </div>
            </div>
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Our Cambridge Classrooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Science Lab</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-xl flex items-center justify-center border border-accent-200">
                <div className="text-center text-gray-500">
                  <GraduationCap className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Classroom Learning</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Student Projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Global Education Journey</h2>
            <p className="text-xl text-light-100 mb-8 max-w-2xl mx-auto">
              Give your child access to world-class education with the Cambridge International Curriculum.
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

export default CambridgePage;