import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, User, Mail, Phone, MessageSquare, Users, Building2, FileText, HelpCircle, CheckCircle } from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const studentName = formData.get('studentName') as string;
    const parentName = formData.get('parentName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const program = formData.get('program') as string;
    const age = formData.get('age') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const additionalInfo = formData.get('additionalInfo') as string;

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

      // Submit form
      const appointmentFormData = new FormData();
      appointmentFormData.append('message', 
        `APPOINTMENT BOOKING REQUEST\n\nStudent Name: ${studentName}\nParent/Guardian Name: ${parentName}\nEmail: ${email}\nPhone: ${phone}\nProgram of Interest: ${program}\nStudent Age: ${age}\nPreferred Date: ${date}\nPreferred Time: ${time}\n\nAdditional Information:\n${additionalInfo || 'None provided'}`
      );
      appointmentFormData.append('sol', solution);

      const response = await fetch('/sgcaptcha/contact', {
        method: 'POST',
        body: appointmentFormData
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
        setCharCount(0);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Appointment form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-200 hover:text-amber-400 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16 px-4 border-b border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-gray-900/10 to-red-900/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center mb-4">
            <Calendar className="w-10 h-10 mr-4 text-amber-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
              Book Your Appointment
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Schedule a personal consultation to discover how IGK Learning Centre can support your child's educational journey. 
            We'll provide a campus tour, discuss programs in detail, and answer all your questions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Benefits & Contact */}
            <div className="space-y-8">
              {/* Why Book an Appointment */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-6">
                  Why Book an Appointment?
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="bg-amber-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 border border-amber-600">
                      <MessageSquare className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-1">Personal Consultation</h4>
                      <p className="text-gray-400 text-sm">Discuss your child's unique needs and goals with our education consultants</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-red-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 border border-red-600">
                      <Building2 className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-1">Campus Tour</h4>
                      <p className="text-gray-400 text-sm">Visit our modern facilities and see the learning environment firsthand</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-amber-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 border border-amber-600">
                      <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-1">Program Details</h4>
                      <p className="text-gray-400 text-sm">Get in-depth information about curriculum, teaching methods, and schedules</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-red-900/30 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 border border-red-600">
                      <HelpCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 mb-1">Ask Questions</h4>
                      <p className="text-gray-400 text-sm">Bring all your questions and concerns - we're here to help you make the right choice</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
                <h3 className="text-2xl font-bold text-amber-300 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-amber-400 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-200 mb-1">Phone</h4>
                      <a href="tel:+66823545362" className="text-gray-400 hover:text-amber-400 transition block">082-354-5362</a>
                      <a href="tel:+66824653236" className="text-gray-400 hover:text-amber-400 transition block">082-465-3236</a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-amber-400 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-200 mb-1">Email</h4>
                      <a href="mailto:info@igklearningcentre.com" className="text-gray-400 hover:text-amber-400 transition">
                        info@igklearningcentre.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-amber-400 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-200 mb-1">Operating Hours</h4>
                      <p className="text-gray-400">Monday - Sunday</p>
                      <p className="text-gray-400 font-bold">8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-10 shadow-2xl border-2 border-gray-600">
                <h2 className="text-3xl font-bold text-amber-300 mb-8">Book Your Visit</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Name */}
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-bold text-amber-300 mb-2">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                      placeholder="Enter student's full name"
                    />
                  </div>

                  {/* Parent/Guardian Name */}
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-bold text-amber-300 mb-2">
                      Parent/Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email & Phone in Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-amber-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-amber-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                        placeholder="082-XXX-XXXX"
                      />
                    </div>
                  </div>

                  {/* Program of Interest */}
                  <div>
                    <label htmlFor="program" className="block text-sm font-bold text-amber-300 mb-2">
                      Program of Interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="program"
                      name="program"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                    >
                      <option value="">Select a program</option>
                      <option value="Montessori Pre-School">Montessori Pre-School</option>
                      <option value="Cambridge International Curriculum">Cambridge International Curriculum</option>
                      <option value="Test Preparation (IGCSE, GED, SAT, TOEFL)">Test Preparation (IGCSE, GED, SAT, TOEFL)</option>
                      <option value="Singapore Math">Singapore Math</option>
                      <option value="Young Learners English (YLE)">Young Learners English (YLE)</option>
                      <option value="Language Programs (Thai, Chinese)">Language Programs (Thai, Chinese)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Student Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-bold text-amber-300 mb-2">
                      Student Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      required
                      min="3"
                      max="25"
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                      placeholder="Enter student's age (3-25)"
                    />
                  </div>

                  {/* Date & Time in Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-bold text-amber-300 mb-2">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-bold text-amber-300 mb-2">
                        Preferred Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="time"
                        name="time"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                      >
                        <option value="">Select a time</option>
                        <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
                        <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                        <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                        <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                        <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-bold text-amber-300 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      rows={4}
                      maxLength={500}
                      onChange={(e) => setCharCount(e.target.value.length)}
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 resize-none text-gray-200"
                      placeholder="Any specific questions or requirements you'd like to discuss? (Optional)"
                    />
                    <div className="text-right text-sm text-gray-400 mt-1">
                      {charCount} / 500 characters
                    </div>
                  </div>

                  {/* Privacy Disclaimer */}
                  <p className="text-xs text-gray-400">
                    By submitting this form, you agree to be contacted by IGK Learning Centre regarding your appointment inquiry.
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-red-500/30 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Appointment
                      </>
                    )}
                  </button>

                  {/* Success/Error Messages */}
                  {submitStatus === 'success' && (
                    <div className="bg-amber-900/30 border-2 border-amber-500 text-amber-300 px-5 py-4 rounded-xl flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Appointment Request Received!</p>
                        <p className="text-sm">Thank you for booking with IGK Learning Centre. We will contact you within 24 hours to confirm your appointment.</p>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="bg-red-900/30 border-2 border-red-500 text-red-300 px-5 py-4 rounded-xl">
                      Sorry, there was an error submitting your appointment request. Please try again or call us directly at 082-354-5362.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* What to Expect Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-12">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-2 text-center">
                <div className="bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-600">
                  <CheckCircle className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-3">1. Confirmation</h3>
                <p className="text-gray-400">We'll contact you within 24 hours to confirm your appointment and answer any initial questions</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl border-2 border-gray-600 hover:border-red-700 transition-all duration-300 transform hover:-translate-y-2 text-center">
                <div className="bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600">
                  <Building2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-3">2. Campus Tour</h3>
                <p className="text-gray-400">Visit our facilities and see our classrooms, learning resources, and meet our teaching staff</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl border-2 border-gray-600 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-2 text-center">
                <div className="bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-600">
                  <Users className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-3">3. Consultation</h3>
                <p className="text-gray-400">Discuss your child's educational needs and explore which programs best suit their goals</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl border-2 border-gray-600 hover:border-red-700 transition-all duration-300 transform hover:-translate-y-2 text-center">
                <div className="bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600">
                  <FileText className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-3">4. Next Steps</h3>
                <p className="text-gray-400">Learn about enrollment procedures, schedules, fees, and get all the information you need to enroll</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookAppointment;