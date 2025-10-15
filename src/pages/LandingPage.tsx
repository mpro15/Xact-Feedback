import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, ArrowRight, Check, Star, Shield, 
  Zap, Clock, Users, BarChart3, Mail, FileText,
  Globe, HeadphonesIcon, Award, TrendingUp
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Feedback',
      description: 'Generate personalized, constructive feedback for every candidate automatically'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track hiring trends, response rates, and candidate satisfaction metrics'
    },
    {
      icon: Mail,
      title: 'Automated Email Campaigns',
      description: 'Send branded feedback emails with tracking and analytics built-in'
    },
    {
      icon: Zap,
      title: 'ATS Integration',
      description: 'Seamlessly connect with your existing Applicant Tracking System'
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description: 'Professional, branded PDF reports for candidates to keep and share'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with enterprise-grade security and privacy protection'
    }
  ];

  const testimonials = [
    {
      company: 'TechCorp',
      logo: '🚀',
      quote: 'Xact Feedback transformed our candidate experience. We saw a 40% increase in positive employer reviews.',
      author: 'Sarah Johnson',
      role: 'Head of Talent'
    },
    {
      company: 'InnovateLabs',
      logo: '⚡',
      quote: 'The AI-generated feedback is incredibly accurate and saves our team hours every week.',
      author: 'Michael Chen',
      role: 'Engineering Manager'
    },
    {
      company: 'GrowthCo',
      logo: '📈',
      quote: 'Our candidates now receive meaningful feedback within 24 hours. Game changer for our recruitment process.',
      author: 'Emma Davis',
      role: 'Recruitment Director'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Candidates Helped' },
    { number: '500+', label: 'Companies Trust Us' },
    { number: '95%', label: 'Candidate Satisfaction' },
    { number: '24hrs', label: 'Average Response Time' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Xact Feedback</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/customer-signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Transform Recruitment
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Rejections into Growth
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Provide meaningful, AI-powered feedback to every candidate. Build your employer brand while helping candidates grow professionally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/customer-signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-xl hover:shadow-2xl flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Candidate Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI technology with human insight to create meaningful feedback experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Companies
            </h2>
            <p className="text-xl text-gray-600">
              See how companies are transforming their recruitment process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-4">{testimonial.logo}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.company}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm text-gray-500">
                  <div className="font-medium">{testimonial.author}</div>
                  <div>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Recruitment Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies providing meaningful feedback to candidates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/customer-signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-xl flex items-center justify-center"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              30-day free trial
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Xact Feedback</span>
              </div>
              <p className="text-gray-400 mb-6">
                Transforming recruitment rejections into growth opportunities for candidates worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Xact Feedback. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
