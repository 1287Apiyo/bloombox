'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const teamMembers = [
    {
      id: 1,
      name: "Delilah Johnson",
      role: "Founder & CEO",
      image: "/bloom1.png",
      description: "Passionate about women's health and cultural heritage"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Product Curator",
      image: "/bloom1.png",
      description: "Expert in sustainable period care products"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Community Manager",
      image: "/bloom1.png",
      description: "Dedicated to building supportive communities"
    },
    {
      id: 4,
      name: "Dr. Amina Bello",
      role: "Medical Advisor",
      image: "/bloom1.png",
      description: "Women's health specialist and educator"
    }
  ];

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Celebration",
      description: "Transforming periods from taboo to celebration",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Care",
      description: "Thoughtful curation with love and attention",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Culture",
      description: "Honoring diverse cultural traditions",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-500/10"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Sustainability",
      description: "Eco-friendly and responsible choices",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-500/10 to-orange-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative w-12 h-12 mr-3 rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-lg">
              <Image
                src="/bloom1.png"
                alt="BloomBox Flower"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-gray-900 text-2xl font-light tracking-tight font-serif bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              BloomBox
            </span>
          </Link>
          
          <nav className="hidden lg:flex space-x-8">
            {['Shop', 'Subscriptions', 'Gifting', 'About'].map((item) => (
              <Link 
                key={item}
                href={item === 'About' ? '/about' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-pink-600 transition-all duration-300 font-medium text-sm uppercase tracking-widest relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-pink-600 transition-all duration-300 p-2 rounded-xl hover:bg-pink-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-pink-600 transition-all duration-300 p-2 rounded-xl hover:bg-pink-50 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                3
              </span>
            </button>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium hover:shadow-pink-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-200/40 via-purple-200/20 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg mb-8">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-sm font-semibold tracking-widest text-purple-600 uppercase">OUR STORY</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-light font-serif mb-6 text-gray-900 leading-tight">
            More Than <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Period Care</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            We're building a movement that celebrates womanhood, honors cultural traditions, 
            and transforms menstrual cycles into moments of empowerment
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/story" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg group"
            >
              Read Our Story
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link 
              href="/impact" 
              className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg group"
            >
              See Our Impact
            </Link>
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="group relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl transform rotate-2 group-hover:rotate-3 transition-transform duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
                <div className="aspect-[4/5] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-serif">
                      DJ
                    </div>
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">Delilah Johnson</h3>
                    <p className="text-purple-600 font-light">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
                  <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">Our Beginning</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900 leading-tight">
                  A Story of <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Love & Legacy</span>
                </h2>
              </div>
              
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg font-light">
                <p className="text-2xl font-serif text-gray-900 italic border-l-4 border-purple-500 pl-6 py-2">
                  "Every woman deserves to feel celebrated, not just comfortable, during her menstrual journey."
                </p>
                
                 <p>
                  BloomBox was born from a beautiful childhood memory—my nanny's gentle guidance during my first period. 
                  While my mother worked tirelessly to provide for us, my nanny became the nurturing presence who transformed 
                  what could have been a confusing experience into a beautiful celebration.
                </p>
                
                <p>
                  She didn't just show me how to use a pad; she created a ritual of care with cake, yogurt, and chocolate. 
                  In that moment, I didn't feel shame or embarrassment—I felt welcomed into womanhood with open arms and 
                  a heart full of love.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-l-4 border-purple-500 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">The Turning Point</h4>
                    <p className="text-gray-700 font-light">
                      That moment of celebration sparked a vision: what if every woman could experience 
                      this level of care and celebration throughout her menstrual journey?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-blue-200 shadow-sm mb-6">
              <span className="text-sm font-semibold text-blue-600 tracking-widest uppercase">Our Purpose</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Why We <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Exist</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              We're here to revolutionize period care by blending modern needs with timeless traditions
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center mb-12 bg-white rounded-2xl p-2 shadow-lg border border-blue-100">
              {[
                { 
                  id: 'mission', 
                  label: 'Our Mission', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) 
                },
                { 
                  id: 'vision', 
                  label: 'Our Vision', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) 
                },
                { 
                  id: 'values', 
                  label: 'Our Values', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ) 
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 font-semibold transition-all duration-300 rounded-xl mx-1 flex items-center space-x-3 min-w-[160px] justify-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform -translate-y-1'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="min-h-96 transition-all duration-500">
              {activeTab === 'mission' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-6 shadow-lg">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-light font-serif mb-6 text-gray-900">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed text-lg font-light mb-6">
                      To transform period care from a monthly chore into a celebration of womanhood. 
                      We create thoughtfully curated packages that honor cultural traditions while 
                      providing comfort, education, and confidence during every menstrual cycle.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">We Believe:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Periods should be empowering, not embarrassing</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Every woman deserves to feel celebrated</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Cultural traditions enrich our modern experiences</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <svg className="w-24 h-24 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-blue-600 font-light text-lg">Transforming period care through celebration and education</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'vision' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="relative order-2 lg:order-1">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <svg className="w-24 h-24 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-purple-600 font-light text-lg">Envisioning a world where every period is celebrated</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 order-1 lg:order-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-6 shadow-lg">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-light font-serif mb-6 text-gray-900">Our Vision</h3>
                    <p className="text-gray-700 leading-relaxed text-lg font-light mb-6">
                      A world where every woman and girl feels proud and empowered during her menstrual journey. 
                      Where cultural celebrations of womanhood are revived, period shame is eliminated, and 
                      sustainable period care is accessible to all.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {['Cultural Revival', 'Global Community', 'Sustainable Future', 'Empowered Generations'].map((item) => (
                        <div key={item} className="bg-purple-50 rounded-lg p-4 text-center">
                          <span className="font-semibold text-purple-900 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'values' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {values.map((value, index) => (
                    <div key={index} className="group relative">
                      <div className={`absolute inset-0 ${value.bgColor} rounded-2xl transform rotate-1 group-hover:rotate-3 transition-transform duration-500`}></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 h-full text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {value.icon}
                        </div>
                        <h4 className="font-bold text-xl mb-4 text-gray-900">{value.title}</h4>
                        <p className="text-gray-700 font-light leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

     {/* Team Section - Redesigned with Circles */}
<section className="py-20 bg-gradient-to-br from-white to-purple-50/20 relative overflow-hidden">
  {/* Background Elements */}
  <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/20 rounded-full blur-xl"></div>
  <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl"></div>
  <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200/20 rounded-full blur-lg"></div>
  
  <div className="container mx-auto px-6 relative">
    <div className="text-center mb-16">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm mb-6">
        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">Our Dream Team</span>
      </div>
      <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
        Meet The <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Hearts & Minds</span>
      </h2>
      <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
        A passionate collective dedicated to transforming period care with love, innovation, and cultural celebration
      </p>
    </div>
    
    {/* Team Grid - Circular Design */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
      {teamMembers.map((member, index) => (
        <div key={member.id} className="group relative text-center">
          {/* Main Card */}
          <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
            
            {/* Circular Avatar Container */}
            <div className="relative mb-8">
              {/* Outer Glow Effect */}
              <div className={`absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                index === 0 ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' :
                index === 1 ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' :
                index === 2 ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20' :
                'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
              }`}></div>
              
              {/* Circular Avatar */}
              <div className={`relative w-32 h-32 mx-auto rounded-full p-1.5 shadow-2xl group-hover:scale-110 transition-transform duration-500 ${
                index === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                index === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                index === 2 ? 'bg-gradient-to-br from-emerald-500 to-green-500' :
                'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                  <div className={`text-3xl font-serif font-bold ${
                    index === 0 ? 'text-purple-600' :
                    index === 1 ? 'text-blue-600' :
                    index === 2 ? 'text-emerald-600' :
                    'text-amber-600'
                  }`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
              
              {/* Role Badge */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg ${
                index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                index === 2 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}>
                {member.role.split(' ')[0]}
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                  {member.name}
                </h3>
                <p className={`text-sm font-medium ${
                  index === 0 ? 'text-purple-600' :
                  index === 1 ? 'text-blue-600' :
                  index === 2 ? 'text-emerald-600' :
                  'text-amber-600'
                }`}>
                  {member.role}
                </p>
              </div>
              
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                {member.description}
              </p>
              
              {/* Social/Contact Icons */}
              <div className="flex justify-center space-x-3 pt-4">
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === 0 ? 'text-purple-500 hover:bg-purple-50' :
                  index === 1 ? 'text-blue-500 hover:bg-blue-50' :
                  index === 2 ? 'text-emerald-500 hover:bg-emerald-50' :
                  'text-amber-500 hover:bg-amber-50'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === 0 ? 'text-purple-500 hover:bg-purple-50' :
                  index === 1 ? 'text-blue-500 hover:bg-blue-50' :
                  index === 2 ? 'text-emerald-500 hover:bg-emerald-50' :
                  'text-amber-500 hover:bg-amber-50'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === 0 ? 'text-purple-500 hover:bg-purple-50' :
                  index === 1 ? 'text-blue-500 hover:bg-blue-50' :
                  index === 2 ? 'text-emerald-500 hover:bg-emerald-50' :
                  'text-amber-500 hover:bg-amber-50'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              index === 0 ? 'bg-purple-400' :
              index === 1 ? 'bg-blue-400' :
              index === 2 ? 'bg-emerald-400' :
              'bg-amber-400'
            }`}></div>
            <div className={`absolute bottom-4 left-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${
              index === 0 ? 'bg-pink-400' :
              index === 1 ? 'bg-cyan-400' :
              index === 2 ? 'bg-green-400' :
              'bg-orange-400'
            }`}></div>
          </div>
        </div>
      ))}
    </div>
    
    
  </div>
</section>

    

     

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative w-8 h-8 mr-2 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/bloom1.png"
                    alt="BloomBox Flower"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-lg font-light font-serif bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BloomBox
                </span>
              </div>
              <p className="text-gray-400 mb-4 text-sm font-light leading-relaxed">
                Celebrating womanhood with care, love, and cultural heritage through thoughtfully curated period care packages.
              </p>
              <div className="flex space-x-2">
                {['facebook', 'twitter', 'instagram', 'pinterest'].map((platform) => (
                  <a key={platform} href="#" className="text-gray-400 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10">
                    <div className="w-4 h-4">
                      {platform.charAt(0).toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Shop",
                links: ["All Products", "Subscription Boxes", "Gift Options", "Corporate Gifting", "First Period Kits"]
              },
              {
                title: "Support",
                links: ["FAQ", "Shipping & Returns", "Contact Us", "Privacy Policy", "Terms of Service"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 text-white">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-light hover:pl-1">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Stay Connected</h3>
              <p className="text-gray-400 mb-3 text-sm font-light">Get exclusive updates and offers</p>
              <div className="flex bg-gray-800 rounded-lg overflow-hidden border border-gray-700 focus-within:border-purple-500 transition-colors duration-300">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-transparent text-white px-3 py-2 focus:outline-none w-full text-sm font-light placeholder-gray-500"
                />
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium">
                  Join
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
            <p className="text-sm font-light">&copy; {new Date().getFullYear()} BloomBox by Delilah. All rights reserved. Made with <span className="text-pink-400">❤️</span> for women everywhere.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}