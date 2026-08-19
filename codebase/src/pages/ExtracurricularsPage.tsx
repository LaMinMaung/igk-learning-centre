import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Heart, Shield, Palette, CheckCircle, Trophy, Users, Star } from 'lucide-react';

const ExtracurricularsPage = () => {
  const navigate = useNavigate();

  const programs = [
    {
      id: 'sports',
      title: 'Sports Programs',
      icon: <Dumbbell className="w-12 h-12" />,
      description: 'Develop physical fitness, teamwork, and competitive spirit through organized sports activities.',
      activities: [
        {
          name: 'Football',
          details: 'Learn ball control, teamwork, and game strategy in our football program with experienced coaches.',
          benefits: ['Cardiovascular fitness', 'Team coordination', 'Strategic thinking', 'Competitive experience']
        },
        {
          name: 'Badminton',
          details: 'Master racquet skills, agility, and quick reflexes in our badminton training sessions.',
          benefits: ['Hand-eye coordination', 'Agility and speed', 'Individual competition skills', 'Mental focus']
        },
        {
          name: 'Swimming',
          details: 'Build water confidence and swimming techniques from beginner to advanced levels.',
          benefits: ['Full-body workout', 'Water safety skills', 'Endurance building', 'Lifelong skill']
        }
      ],
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'redcross',
      title: 'Red Cross Program',
      icon: <Heart className="w-12 h-12" />,
      description: 'Engage in community service and learn essential first aid skills through our Red Cross partnership.',
      activities: [
        {
          name: 'First Aid Training',
          details: 'Learn life-saving skills including CPR, wound care, and emergency response procedures.',
          benefits: ['Life-saving knowledge', 'Emergency preparedness', 'Confidence in crisis', 'Certified skills']
        },
        {
          name: 'Community Service',
          details: 'Participate in blood donation drives, disaster relief awareness, and health campaigns.',
          benefits: ['Social responsibility', 'Community impact', 'Leadership opportunities', 'Empathy development']
        },
        {
          name: 'Health Education',
          details: 'Understanding public health, hygiene practices, and disease prevention.',
          benefits: ['Health awareness', 'Preventive care knowledge', 'Public speaking', 'Teaching skills']
        }
      ],
      color: 'from-red-600 to-red-700'
    },
    {
      id: 'scout',
      title: 'Scout Program',
      icon: <Shield className="w-12 h-12" />,
      description: 'Build character, leadership, and outdoor skills through the internationally recognized Scout movement.',
      activities: [
        {
          name: 'Leadership Development',
          details: 'Take on increasing responsibilities from patrol member to patrol leader, learning to guide peers.',
          benefits: ['Leadership skills', 'Decision making', 'Responsibility', 'Mentoring abilities']
        },
        {
          name: 'Outdoor Skills',
          details: 'Master camping, hiking, orienteering, knot-tying, and wilderness survival techniques.',
          benefits: ['Self-reliance', 'Nature appreciation', 'Problem-solving', 'Practical skills']
        },
        {
          name: 'Community Projects',
          details: 'Plan and execute service projects benefiting the local community and environment.',
          benefits: ['Project management', 'Teamwork', 'Civic engagement', 'Social impact']
        }
      ],
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'artmusic',
      title: 'Art & Music',
      icon: <Palette className="w-12 h-12" />,
      description: 'Express creativity and develop artistic talents through visual arts and musical performance.',
      activities: [
        {
          name: 'Visual Arts',
          details: 'Explore drawing, painting, sculpture, and mixed media to develop artistic expression.',
          benefits: ['Creative thinking', 'Fine motor skills', 'Self-expression', 'Visual literacy']
        },
        {
          name: 'Music Performance',
          details: 'Learn instruments, vocal techniques, and participate in ensemble performances.',
          benefits: ['Musical literacy', 'Performance confidence', 'Teamwork', 'Cultural appreciation']
        },
        {
          name: 'Creative Projects',
          details: 'Participate in exhibitions, concerts, and collaborative artistic endeavors.',
          benefits: ['Portfolio development', 'Public presentation', 'Collaboration', 'Achievement recognition']
        }
      ],
      color: 'from-purple-600 to-purple-700'
    }
  ];

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
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Trophy className="w-16 h-16" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Extracurricular Programs</h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto mb-8">
            Comprehensive activities designed to develop well-rounded students with diverse skills and experiences 
            for university applications and personal growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <CheckCircle className="w-5 h-5 inline mr-2" />
              <span className="font-semibold">Builds University Portfolio</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <Users className="w-5 h-5 inline mr-2" />
              <span className="font-semibold">Leadership Development</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <Star className="w-5 h-5 inline mr-2" />
              <span className="font-semibold">Character Building</span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Detail */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          {programs.map((program, index) => (
            <div key={program.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gold-200">
              {/* Program Header */}
              <div className={`bg-gradient-to-r ${program.color} text-white p-8`}>
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mr-4">
                    {program.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{program.title}</h2>
                    <p className="text-gold-100 mt-2">{program.description}</p>
                  </div>
                </div>
              </div>

              {/* Program Activities */}
              <div className="p-8">
                <div className="space-y-8">
                  {program.activities.map((activity, idx) => (
                    <div key={idx} className="border-l-4 border-gold-500 pl-6">
                      <h3 className="text-2xl font-bold text-blue-950 mb-3">{activity.name}</h3>
                      <p className="text-gray-600 mb-4">{activity.details}</p>
                      
                      <div className="bg-gradient-to-br from-gold-50 to-white p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-950 mb-3">Key Benefits:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activity.benefits.map((benefit, benefitIdx) => (
                            <div key={benefitIdx} className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-gold-600 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* University Applications Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Extracurriculars Matter for University Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Demonstrates Well-Roundedness</h3>
                <p className="text-gold-100">Universities seek students with diverse interests and skills beyond academics</p>
              </div>
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Shows Leadership & Initiative</h3>
                <p className="text-gold-100">Extracurriculars prove your ability to lead, collaborate, and take responsibility</p>
              </div>
              <div className="text-center">
                <Star className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Builds Character & Skills</h3>
                <p className="text-gold-100">Develop soft skills like teamwork, communication, and time management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gold-50 to-white rounded-2xl p-12 shadow-xl border-2 border-gold-200">
            <h2 className="text-3xl font-bold text-blue-950 mb-4">Ready to Join?</h2>
            <p className="text-xl text-gray-600 mb-8">
              When you enroll in any of our core academic programs, you automatically gain access to all 
              extracurricular activities at no additional cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/apply')}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition transform hover:scale-105 shadow-lg"
              >
                Apply Now
              </button>
              <button
                onClick={() => navigate('/#programs')}
                className="bg-gradient-to-r from-gold-600 to-gold-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-800 transition transform hover:scale-105 shadow-lg"
              >
                View Academic Programs
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExtracurricularsPage;