'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function GiftingPage() {
  const [occasion, setOccasion] = useState('all');
  
  const giftOptions = [
    {
      id: 1,
      name: "First Bloom Gift Set",
      price: "$49.99",
      description: "Perfect for celebrating a first period with love and care",
      image: "/bloom1.png",
      occasions: ["first-period", "teens"],
      bestSeller: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      name: "Monthly Comfort Gift",
      price: "$39.99",
      description: "A thoughtful monthly supply for someone special",
      image: "/bloom1.png",
      occasions: ["birthday", "just-because"],
      bestSeller: false,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      name: "Self-Care Luxury Box",
      price: "$69.99",
      description: "Premium products for ultimate relaxation and care",
      image: "/bloom1.png",
      occasions: ["birthday", "self-care"],
      bestSeller: true,
      color: "from-emerald-500 to-green-500"
    },
    {
      id: 4,
      name: "Teen Support Package",
      price: "$44.99",
      description: "Gentle, educational products perfect for young teens",
      image: "/bloom1.png",
      occasions: ["first-period", "teens"],
      bestSeller: false,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 5,
      name: "Postpartum Care Kit",
      price: "$59.99",
      description: "Thoughtful products for new mothers",
      image: "/bloom1.png",
      occasions: ["new-mom", "postpartum"],
      bestSeller: false,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 6,
      name: "Wellness Warrior Box",
      price: "$54.99",
      description: "For the woman who prioritizes her health and wellness",
      image: "/bloom1.png",
      occasions: ["just-because", "self-care"],
      bestSeller: true,
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const occasionsList = [
    { 
      id: 'all', 
      name: 'All Occasions', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m10 6l6-6m-6-6l6 6" />
        </svg>
      ) 
    },
    { 
      id: 'first-period', 
      name: 'First Period', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ) 
    },
    { 
      id: 'birthday', 
      name: 'Birthday', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 013 15.546M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      ) 
    },
    { 
      id: 'just-because', 
      name: 'Just Because', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ) 
    },
    { 
      id: 'self-care', 
      name: 'Self-Care', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ) 
    },
    { 
      id: 'new-mom', 
      name: 'New Mom', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ) 
    },
    { 
      id: 'teens', 
      name: 'Teens', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
  ];

  const filteredGifts = occasion === 'all' 
    ? giftOptions 
    : giftOptions.filter(gift => gift.occasions.includes(occasion));

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
                href={item === 'Gifting' ? '/gifting' : `/${item.toLowerCase().replace(' ', '-')}`}
                className={`transition-all duration-300 font-medium text-sm uppercase tracking-widest relative group ${
                  item === 'Gifting' 
                    ? 'text-pink-600' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                {item}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ${
                  item === 'Gifting' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
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
            <span className="text-sm font-semibold tracking-widest text-purple-600 uppercase">THOUGHTFUL GIFTING</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-light font-serif mb-6 text-gray-900 leading-tight">
            Gift With <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Heart & Care</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Thoughtful period care gifts that celebrate womanhood and show you truly care. 
            Perfect for every woman and every special occasion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#gifts" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg group"
            >
              Send a Gift Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Link>
            <Link 
              href="/corporate" 
              className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg group"
            >
              Corporate Gifting
            </Link>
          </div>
        </div>
      </section>

      {/* Occasion Filter */}
      <section id="gifts" className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">Find the Perfect Gift</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              For Every <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Special Moment</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Curated gift sets designed to celebrate, comfort, and empower through every stage of womanhood
            </p>
          </div>

          {/* Occasion Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {occasionsList.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setOccasion(occ.id)}
                className={`group px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  occasion === occ.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform -translate-y-1' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <span className={`${occasion === occ.id ? 'text-white' : 'text-purple-500'}`}>
                  {occ.icon}
                </span>
                <span className="font-medium">{occ.name}</span>
              </button>
            ))}
          </div>

          {/* Gift Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGifts.map((gift) => (
              <div key={gift.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                <div className="relative bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                  
                  {/* Gift Image */}
                  <div className="relative mb-6">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                      <div className={`w-full h-full bg-gradient-to-br ${gift.color} flex items-center justify-center`}>
                        <div className="text-white text-4xl font-serif text-center p-8">
                          {gift.name.split(' ').map(word => word[0]).join('')}
                        </div>
                      </div>
                    </div>
                    {gift.bestSeller && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span>Best Seller</span>
                      </div>
                    )}
                  </div>

                  {/* Gift Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                        {gift.name}
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {gift.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl">
                        {gift.price}
                      </span>
                      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold group">
                        Gift Now
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 inline transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-blue-200 shadow-sm mb-6">
              <span className="text-sm font-semibold text-blue-600 tracking-widest uppercase">Simple & Thoughtful</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              How <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Gifting Works</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Sending love and care has never been easier with our seamless gifting process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Choose a Gift",
                description: "Select from our curated gift options for any occasion",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                )
              },
              {
                step: "2",
                title: "Personalize",
                description: "Add a custom message and gift wrapping options",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )
              },
              {
                step: "3",
                title: "We Deliver",
                description: "We'll ship it discreetly with a handwritten note",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )
              }
            ].map((step, index) => (
              <div key={index} className="group text-center">
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{step.step}</div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Gifting */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 text-center border border-purple-100">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-purple-100 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">For Businesses</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Corporate <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Gifting</span>
            </h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto leading-relaxed font-light">
              Show your employees or clients you care with our thoughtful corporate gift options. 
              Customizable packages for teams, events, and special occasions.
            </p>
            <Link 
              href="/corporate" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg inline-flex items-center group"
            >
              Learn About Corporate Gifting
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
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