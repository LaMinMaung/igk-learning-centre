import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Globe, Calendar, GraduationCap } from 'lucide-react';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const nationality = formData.get('nationality') as string;
    const dob = formData.get('dob') as string;
    const program = formData.get('program') as string;

    try {
      // Load solver script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/sgcaptcha/solver.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load captcha solver'));
        document.head.appendChild(script);
      });

      // @ts-ignore - sgpowcaptcha is loaded via script
      const pow = new sgpowcaptcha.PoWSolver();
      
      // Get challenge
      const challengeRes = await fetch('/sgcaptcha/challenge');
      const challenge = await challengeRes.text();
      
      // Solve challenge
      const solution = await pow.start(challenge);

      // Submit application
      const applicationData = new FormData();
      applicationData.append('message', 
        `NEW STUDENT APPLICATION\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone/Line: ${phone}\nNationality: ${nationality}\nDate of Birth: ${dob}\nProgram Choice: ${program}`
      );
      applicationData.append('sol', solution);

      const response = await fetch('/sgcaptcha/contact', {
        method: 'POST',
        body: applicationData
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Application form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-gold-100">
      {/* Navigation */}
      <nav className="bg-blue-950 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gold-200 hover:text-gold-400 transition"
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
            <GraduationCap className="w-12 h-12 mr-4" />
            <h1 className="text-4xl sm:text-5xl font-bold">Application Form</h1>
          </div>
          <p className="text-xl text-gold-100 max-w-3xl">
            Start your journey with IGK Learning Centre. Fill out the form below and we'll contact you within 24-48 hours.
          </p>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gold-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-blue-950 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-blue-950 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-blue-950 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone / Line *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="Phone number or Line ID"
                />
              </div>

              <div>
                <label htmlFor="nationality" className="block text-sm font-semibold text-blue-950 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Nationality *
                </label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="Your nationality"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-semibold text-blue-950 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="program" className="block text-sm font-semibold text-blue-950 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Program Choice *
                </label>
                <select
                  id="program"
                  name="program"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select a program</option>
                  <option value="Montessori Pre-School">Montessori Pre-School</option>
                  <option value="Cambridge International Curriculum">Cambridge International Curriculum</option>
                  <option value="Test Preparation">Test Preparation (IGCSE, GED, SAT, TOEFL)</option>
                  <option value="Singapore Math">Singapore Math</option>
                  <option value="Young Learners English (YLE)">Young Learners English (YLE)</option>
                  <option value="Language Programs">Language Programs</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-gold-100 border border-gold-500 text-blue-950 px-4 py-3 rounded-lg">
                  <p className="font-semibold mb-2">Application Received!</p>
                  <p>Thank you for applying to IGK Learning Centre. We will contact you within 24-48 hours.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-500 text-red-800 px-4 py-3 rounded-lg">
                  Sorry, there was an error submitting your application. Please try again or contact us directly at support@igklearningcentre.com
                </div>
              )}
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Calendar className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                <span>We'll review your application and contact you within 24-48 hours</span>
              </li>
              <li className="flex items-start">
                <User className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                <span>Schedule a visit to tour our facilities and meet our team</span>
              </li>
              <li className="flex items-start">
                <GraduationCap className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                <span>Complete enrollment and begin your learning journey</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                <span>For urgent inquiries: 082-354-5362 or support@igklearningcentre.com</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApplicationForm;