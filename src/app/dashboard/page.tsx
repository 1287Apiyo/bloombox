'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Sample product data
  const featuredProducts = [
    {
      id: 1,
      name: "First Bloom Box",
      description: "Special package for her first period celebration",
      price: "$49.99",
      image: "/bloom1.png",
      badge: "BESTSELLER"
    },
    {
      id: 2,
      name: "Monthly Comfort Kit",
      description: "All essentials for a comfortable period",
      price: "$39.99",
      image: "/bloom1.png",
      badge: "POPULAR"
    },
    {
      id: 3,
      name: "Eco-Friendly Set",
      description: "Sustainable period products for the conscious woman",
      price: "$59.99",
      image: "/bloom1.png",
      badge: "ECO"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah J.",
      text: "BloomBox made my daughter's first period a celebration rather than a confusion. Thank you!",
      role: "Mother"
    },
    {
      id: 2,
      name: "Michelle K.",
      text: "The monthly subscription takes away the stress of remembering to buy supplies. Love the thoughtful extras!",
      role: "Regular Customer"
    },
    {
      id: 3,
      name: "Grace A.",
      text: "As someone who struggled with period shame, BloomBox helped me embrace my womanhood with pride.",
      role: "Student"
    }
  ];

  const slides = [
    {
      title: "Celebrate Womanhood With Every Cycle",
      subtitle: "Thoughtful period care packages delivered to your doorstep",
      image: "/bloom1.png",
      cta: "Explore Our Boxes",
      gradient: "from-purple-600/20 to-pink-500/20"
    },
    {
      title: "Gift The Women In Your Life",
      subtitle: "Show your love and support with our specially curated boxes",
      image: "/bloom1.png",
      cta: "Send a Gift",
      gradient: "from-rose-600/20 to-orange-500/20"
    },
    {
      title: "Sustainable Period Care",
      subtitle: "Eco-friendly options for the conscious woman",
      image: "/bloom1.png",
      cta: "Shop Eco Products",
      gradient: "from-emerald-600/20 to-teal-500/20"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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

      {/* Hero Slider */}
      <div className="relative h-[75vh] min-h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover scale-110"
                priority={index === 0}
              />
              <div className={`absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent`}></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} mix-blend-overlay`}></div>
            </div>
            
            <div className="container mx-auto px-6 h-full flex items-center relative z-10">
              <div className="max-w-2xl text-white">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-light tracking-widest">NEW COLLECTION</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-light font-serif mb-6 leading-tight animate-fade-in-up">
                  {slide.title}
                </h1>
                <p className="text-xl lg:text-2xl mb-8 leading-relaxed text-gray-100 font-light max-w-lg">
                  {slide.subtitle}
                </p>
                <Link 
                  href={
                    slide.cta === "Explore Our Boxes" ? "/shop" : 
                    slide.cta === "Send a Gift" ? "/gifting" : 
                    slide.cta === "Shop Eco Products" ? "/shop?filter=eco" : "/shop"
                  }
                  className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-1 shadow-2xl hover:shadow-2xl text-lg font-semibold group border-2 border-white hover:border-pink-200"
                >
                  {slide.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

       {/* Features Section - Redesigned */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest">WHY CHOOSE BLOOMBOX</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              More Than <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Period Care</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              We're building a movement that celebrates womanhood and transforms menstrual cycles into moments of empowerment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Thoughtful Curation",
                description: "Every item is carefully selected to bring comfort and joy during your cycle",
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Flexible Options",
                description: "One-time purchases or customizable subscriptions that fit your lifestyle",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Discreet Delivery",
                description: "Elegantly packaged with care and complete privacy guaranteed",
                color: "from-emerald-500 to-green-500",
                bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-500/10"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Premium Quality",
                description: "Only the highest quality, body-safe products for your comfort and health",
                color: "from-amber-500 to-orange-500",
                bgColor: "bg-gradient-to-br from-amber-500/10 to-orange-500/10"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 ${feature.bgColor} rounded-2xl transform rotate-1 group-hover:rotate-3 transition-transform duration-500`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 h-full text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-700 font-light leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest">FEATURED COLLECTION</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Signature Boxes</span>
            </h2>
            <p className="text-gray-600 text-lg font-light">Carefully curated packages for every need and celebration</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="group relative">
                <div className={`absolute inset-0 rounded-3xl transform group-hover:scale-105 transition-transform duration-500 ${
                  index === 0 ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' :
                  index === 1 ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' :
                  'bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                }`}></div>
                <div className="relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group-hover:-translate-y-3 border border-gray-100">
                  <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-emerald-500 to-green-500'
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <button className="bg-white/90 backdrop-blur-sm text-purple-600 p-3 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-110 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-xl mb-3 text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 mb-6 text-sm font-light leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-2xl bg-clip-text text-transparent ${
                        index === 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                        index === 1 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                        'bg-gradient-to-r from-emerald-600 to-green-600'
                      }`}>
                        {product.price}
                      </span>
                      <button className={`px-6 py-3 rounded-xl text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium group ${
                        index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
                        'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                      }`}>
                        <span className="flex items-center">
                          Add to Cart
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link 
              href="/shop" 
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl text-lg font-semibold group border-2 border-transparent hover:border-purple-200"
            >
              Explore All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Redesigned */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-100 mb-6">
              <span className="text-sm font-semibold text-amber-600 tracking-widest">LOVED BY THOUSANDS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Hear From Our <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Community</span>
            </h2>
            <p className="text-gray-600 text-lg font-light">Join thousands of women who have transformed their period experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="group relative">
                <div className={`absolute inset-0 rounded-2xl transform rotate-1 group-hover:rotate-3 transition-transform duration-500 ${
                  index === 0 ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' :
                  index === 1 ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' :
                  'bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                }`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 h-full">
                  <div className="flex items-center mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 text-white font-semibold text-xl shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-emerald-500 to-green-500'
                    }`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 font-light">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 font-light italic relative">
                    <span className="absolute -top-2 -left-2 text-purple-200 text-2xl">"</span>
                    {testimonial.text}
                    <span className="absolute -bottom-2 -right-2 text-purple-200 text-2xl">"</span>
                  </p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-purple-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "50K+", label: "Boxes Delivered" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "15+", label: "Products" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-5xl lg:text-6xl font-light mb-4 transition-all duration-500 group-hover:scale-110 group-hover:text-purple-100">
                  {stat.number}
                </div>
                <div className="text-purple-100 font-light text-sm uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
   
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