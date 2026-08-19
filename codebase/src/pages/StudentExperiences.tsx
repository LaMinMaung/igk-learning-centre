import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Quote, Star, Award, TrendingUp } from 'lucide-react';

const StudentExperiences = () => {
  const navigate = useNavigate();

  const students = [
    {
      name: 'Emma Johnson',
      program: 'Cambridge International Curriculum',
      year: 'Year 9 Graduate, 2023',
      achievement: 'Achieved 8 A* grades in IGCSE',
      testimonial: "IGK Learning Centre transformed my academic journey. The Cambridge curriculum challenged me to think critically and independently. The teachers didn't just teach subjects; they taught me how to learn, how to question, and how to analyze. The small class sizes meant I received personalized attention whenever I needed help. Now I'm studying at an international school with confidence, and I owe so much of my success to the foundation IGK gave me.",
      highlights: [
        'Top student in Mathematics and Science',
        'Member of the school debate team',
        'Now studying at Bangkok International School'
      ]
    },
    {
      name: 'Michael Lee',
      program: 'SAT Preparation Program',
      year: 'SAT Class of 2023',
      achievement: 'SAT Score: 1480/1600',
      testimonial: "When I started SAT prep at IGK, I was scoring around 1200. The structured approach, practice tests, and personalized feedback helped me identify my weak areas and improve systematically. Mr. Chen's strategies for the math section were game-changing, and the reading comprehension techniques actually made sense. I improved by 280 points over 12 weeks! The best part was the supportive environment - we studied together, helped each other, and celebrated our progress. IGK made test prep actually enjoyable.",
      highlights: [
        'Improved from 1200 to 1480 in 12 weeks',
        'Perfect score on Math section (800)',
        'Accepted to University of California, Berkeley'
      ]
    },
    {
      name: 'Sophia Patel',
      program: 'Montessori Pre-School & Cambridge Primary',
      year: 'Student since 2018',
      achievement: 'Cambridge Primary Checkpoint: Distinction',
      testimonial: "I started at IGK when I was just 3 years old in the Montessori program. I still remember the colorful materials and how much fun learning was! When I moved to the Cambridge curriculum, the transition was smooth because the Montessori foundation gave me independence and curiosity. Now in Year 6, I love science experiments and creative writing. My teachers know me so well - they understand how I learn best and push me just the right amount. IGK feels like a second home, and I can't imagine studying anywhere else.",
      highlights: [
        '6 years at IGK Learning Centre',
        'Science fair winner (2023)',
        'Young author - published short story in school magazine'
      ]
    },
    {
      name: 'David Wong',
      program: 'Test Preparation & Language Programs',
      year: 'TOEFL & Chinese Language Student',
      achievement: 'TOEFL iBT: 112/120, HSK Level 4',
      testimonial: "As an international student planning to study in the US, I needed strong English and wanted to learn Chinese for business opportunities. IGK's TOEFL program was incredibly thorough - the practice tests were harder than the real exam, which prepared me perfectly. The language program with native Chinese instructors helped me reach HSK Level 4 in just one year. What impressed me most was how teachers coordinated across programs, ensuring my workload was manageable. The cultural understanding I gained goes beyond just language skills.",
      highlights: [
        'Bilingual proficiency in English and Chinese',
        'Accepted to Cornell University',
        'Won regional Mandarin speech competition'
      ]
    }
  ];

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
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Star className="w-12 h-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Student Success Stories</h1>
          <p className="text-xl text-light-100 max-w-3xl mx-auto">
            Real stories from students who have grown, learned, and achieved their goals with IGK Learning Centre
          </p>
        </div>
      </section>

      {/* Student Stories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            {students.map((student, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-light-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Student Profile */}
                  <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-8 text-white">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center">
                      <GraduationCap className="w-16 h-16" />
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">{student.name}</h3>
                    <p className="text-light-100 text-center mb-4">{student.year}</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                      <p className="text-sm font-semibold mb-2">Program</p>
                      <p className="text-light-100">{student.program}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 mr-2" />
                        <p className="text-sm font-semibold">Achievement</p>
                      </div>
                      <p className="text-light-100">{student.achievement}</p>
                    </div>
                  </div>

                  {/* Testimonial & Highlights */}
                  <div className="lg:col-span-2 p-8">
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <Quote className="w-8 h-8 text-primary-300 mr-2" />
                        <h4 className="text-xl font-bold text-dark-navy-950">Their Journey</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic">
                        "{student.testimonial}"
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-4">
                        <TrendingUp className="w-6 h-6 text-accent-600 mr-2" />
                        <h4 className="text-lg font-bold text-dark-navy-950">Key Highlights</h4>
                      </div>
                      <ul className="space-y-3">
                        {student.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start">
                            <Star className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
            <p className="text-xl text-light-100 mb-8 max-w-2xl mx-auto">
              Join IGK Learning Centre and become part of our community of successful learners
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/book-appointment')}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-light-100 transition transform hover:scale-105"
              >
                Book a Visit
              </button>
              <button
                onClick={() => navigate('/#programs')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Explore Programs
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentExperiences;