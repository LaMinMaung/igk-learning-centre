import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, CheckCircle, Target, BookOpen, TrendingUp } from 'lucide-react';

const TestPrepPage = () => {
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
            <Award className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Test Preparation Programs</h1>
          </div>
          <p className="text-xl text-light-100 max-w-3xl">
            Expert preparation for IGCSE, GED, Pre-GED, SAT, and TOEFL with proven strategies and comprehensive study materials.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Duration:</span> 8-16 weeks
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Level:</span> Secondary & High School
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Success Rate:</span> 95%+
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
              <h2 className="text-3xl font-bold text-dark-navy-950 mb-6">Achieve Your Target Score</h2>
              <p className="text-gray-700 mb-4">
                Our test preparation programs are designed to help students excel in internationally recognized 
                examinations. We combine proven test-taking strategies with comprehensive content review to 
                maximize your performance on test day.
              </p>
              <p className="text-gray-700 mb-4">
                Whether you're preparing for IGCSE, GED, SAT, or TOEFL, our experienced instructors provide 
                personalized guidance, practice tests, and targeted feedback to help you achieve your goals. 
                We understand the unique challenges of each exam and tailor our approach accordingly.
              </p>
              <p className="text-gray-700">
                With flexible schedules, small class sizes, and extensive practice materials, we ensure that 
                every student receives the support they need to succeed.
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-light-200">
              <h3 className="text-2xl font-bold text-dark-navy-950 mb-6">What Sets Us Apart</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Target className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Proven Strategies</h4>
                    <p className="text-gray-600">Test-taking techniques that actually work, backed by years of success</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BookOpen className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Comprehensive Materials</h4>
                    <p className="text-gray-600">Updated study guides, practice tests, and online resources</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Progress Tracking</h4>
                    <p className="text-gray-600">Regular assessments to monitor improvement and adjust strategies</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Expert Instructors</h4>
                    <p className="text-gray-600">Experienced teachers who know these exams inside and out</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Programs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Our Test Prep Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* IGCSE */}
              <div className="bg-gradient-to-br from-white to-light-100 p-8 rounded-xl shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">IGCSE Preparation</h3>
                <p className="text-gray-600 mb-4">
                  Cambridge IGCSE exam preparation covering all major subjects with comprehensive study materials 
                  and mock examinations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Full Subject Coverage</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Mock Examinations</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Exam Techniques</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Individual Support</span>
                  </li>
                </ul>
              </div>

              {/* GED */}
              <div className="bg-gradient-to-br from-white to-light-100 p-8 rounded-xl shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">GED & Pre-GED</h3>
                <p className="text-gray-600 mb-4">
                  Complete GED preparation covering all four test subjects: Reasoning Through Language Arts, 
                  Mathematical Reasoning, Science, and Social Studies.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>All 4 Test Subjects</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Practice Tests</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Pre-GED Foundation</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Flexible Scheduling</span>
                  </li>
                </ul>
              </div>

              {/* SAT */}
              <div className="bg-gradient-to-br from-white to-light-100 p-8 rounded-xl shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">SAT Preparation</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive SAT prep covering Evidence-Based Reading & Writing and Math sections with 
                  proven test-taking strategies.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Reading & Writing</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Math (Calculator & No Calculator)</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Full-Length Practice Tests</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Score Improvement Focus</span>
                  </li>
                </ul>
              </div>

              {/* TOEFL */}
              <div className="bg-gradient-to-br from-white to-light-100 p-8 rounded-xl shadow-lg border border-light-200">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">TOEFL Preparation</h3>
                <p className="text-gray-600 mb-4">
                  Complete TOEFL iBT preparation covering Reading, Listening, Speaking, and Writing with 
                  intensive practice and feedback.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>All 4 Skills: R/L/S/W</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Computer-Based Practice</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Speaking & Writing Feedback</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-2" />
                    <span>Score Band Targeting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Test Prep in Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Study Sessions</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-xl flex items-center justify-center border border-accent-200">
                <div className="text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Practice Tests</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Success Stories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Exam?</h2>
            <p className="text-xl text-light-100 mb-8 max-w-2xl mx-auto">
              Join our test preparation programs and achieve the scores you need for your academic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/#contact')}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-light-100 transition transform hover:scale-105"
              >
                Get Started
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

export default TestPrepPage;