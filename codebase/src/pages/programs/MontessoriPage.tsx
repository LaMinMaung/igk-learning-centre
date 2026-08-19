import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, CheckCircle, Users, Heart, Star } from 'lucide-react';

const MontessoriPage = () => {
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
            <BookOpen className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Montessori Pre-School</h1>
          </div>
          <p className="text-xl text-light-100 max-w-3xl">
            Nurturing young minds through the Montessori method, fostering independence, creativity, and a love for learning from nursery to kindergarten.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Age Range:</span> 2-6 years
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Level:</span> Nursery - Kindergarten
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <span className="font-semibold">Duration:</span> Full Academic Year
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
              <h2 className="text-3xl font-bold text-dark-navy-950 mb-6">About Our Montessori Program</h2>
              <p className="text-gray-700 mb-4">
                Our Montessori Pre-School program is designed to cultivate each child's natural desire to learn. 
                Following the proven Montessori methodology, we create a nurturing environment where children develop 
                at their own pace while building essential life skills.
              </p>
              <p className="text-gray-700 mb-4">
                Children engage in hands-on learning activities that promote cognitive development, fine motor skills, 
                social interaction, and emotional growth. Our specially trained teachers guide students through 
                self-directed exploration and discovery.
              </p>
              <p className="text-gray-700">
                We believe that early childhood education sets the foundation for lifelong learning. Our Montessori 
                approach respects each child's individuality while fostering independence, confidence, and a genuine 
                love for learning.
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-light-200">
              <h3 className="text-2xl font-bold text-dark-navy-950 mb-6">Program Highlights</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Heart className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Child-Centered Learning</h4>
                    <p className="text-gray-600">Individual learning pace and personalized attention for each student</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Hands-On Activities</h4>
                    <p className="text-gray-600">Specially designed Montessori materials for sensory and cognitive development</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Social Development</h4>
                    <p className="text-gray-600">Mixed-age classrooms promoting peer learning and collaboration</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BookOpen className="w-6 h-6 text-accent-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-dark-navy-950">Certified Teachers</h4>
                    <p className="text-gray-600">Montessori-trained educators dedicated to early childhood development</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum Areas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Curriculum Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">Practical Life</h3>
                <p className="text-gray-600">
                  Daily living activities that develop coordination, concentration, independence, and order
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">Sensorial</h3>
                <p className="text-gray-600">
                  Materials that refine the senses and develop observation, comparison, and classification skills
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-200">
                <h3 className="text-xl font-bold text-primary-700 mb-3">Language</h3>
                <p className="text-gray-600">
                  Phonetic awareness, vocabulary building, reading readiness, and writing preparation
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-xl border border-accent-200">
                <h3 className="text-xl font-bold text-accent-700 mb-3">Mathematics</h3>
                <p className="text-gray-600">
                  Concrete materials introducing number concepts, counting, and basic mathematical operations
                </p>
              </div>
            </div>
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-dark-navy-950 mb-8 text-center">Our Learning Environment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Classroom Photo</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-xl flex items-center justify-center border border-accent-200">
                <div className="text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Students Learning</p>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center border border-primary-200">
                <div className="text-center text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Enroll Your Child?</h2>
            <p className="text-xl text-light-100 mb-8 max-w-2xl mx-auto">
              Join our Montessori family and give your child the gift of a strong educational foundation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/#contact')}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-light-100 transition transform hover:scale-105"
              >
                Contact Us
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

export default MontessoriPage;