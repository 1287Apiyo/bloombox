'use client';

import Link from 'next/link';
import Image from "next/image";
import { useState } from 'react';

export default function SubscriptionsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<number | null>(null);

  const subscriptionPlans = [
    {
      id: 1,
      name: "Monthly Comfort",
      price: "$34.99/month",
      description: "Perfect for regular needs with flexibility",
      features: [
        "Curated monthly box",
        "Free delivery",
        "Ability to skip any month",
        "5% discount on add-ons"
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      name: "Quarterly Saver",
      price: "$99.99/quarter",
      description: "Save with our quarterly plan",
      features: [
        "Box every 3 months",
        "Free delivery",
        "10% discount on products",
        "1 free specialty item per box"
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      name: "Annual Bloom",
      price: "$349.99/year",
      description: "Maximum savings for committed customers",
      features: [
        "12 monthly boxes",
        "Free express delivery",
        "15% discount on all products",
        "2 free specialty items per box",
        "Free gift wrapping"
      ],
      popular: false,
      color: "from-emerald-500 to-green-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const faqItems = [
    {
      id: 1,
      question: "What is BloomBox?",
      answer: "BloomBox is the ultimate gift-giver for women. We curate thoughtful care packages designed to bring comfort during your period and other meaningful moments in life."
    },
    {
      id: 2,
      question: "How do I place an order?",
      answer: "Simply create an account, browse our colorful pages, choose what you'd like, fill in your delivery details, and check out."
    },
    {
      id: 3,
      question: "Do I have to create an account to use BloomBox?",
      answer: "An account is required if you'd like to subscribe or be part of our community. However, for a one-time purchase, you can shop directly from the website as a guest."
    },
    {
      id: 4,
      question: "Can I gift someone else?",
      answer: "Yes! You can select from our pre-arranged gift packages or create your own. Once you complete payment, just provide the recipient's details and we'll deliver your gift with love."
    },
    {
      id: 5,
      question: "Can I create my own package?",
      answer: "Absolutely! Browse through our listed items, pick what you'd like, and let us know where to deliver your custom package."
    },
    {
      id: 6,
      question: "Is my information safe on your website?",
      answer: "Yes. BloomBox is duly registered under Kenyan law, including registration with the Office of the Data Commissioner of Kenya. Your information is handled securely and responsibly."
    },
    {
      id: 7,
      question: "How do I get my monthly packages delivered?",
      answer: "Once you subscribe to your preferred bundle, you'll receive monthly notifications confirming delivery details. You'll also be able to confirm or update your drop-off location."
    },
    {
      id: 8,
      question: "How do I join the BloomBox community?",
      answer: "Follow us on our social media platforms to connect, share, and engage in meaningful discussions with other women."
    },
    {
      id: 9,
      question: "What impact does BloomBox have on the environment?",
      answer: "We use eco-friendly, recyclable packaging to extend the experience of receiving your gift. We also offer reusable menstrual solutions, which help reduce both costs for women and the number of single-use pads that end up in landfills."
    },
    {
      id: 10,
      question: "What impact does BloomBox have in the community?",
      answer: "BloomBox exists to bring joy and care to women, because happy women are healthy women. We also run a donation program where generous contributors can help gift underprivileged girls and women."
    }
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

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
                href={item === 'Subscriptions' ? '/subscriptions' : `/${item.toLowerCase().replace(' ', '-')}`}
                className={`transition-all duration-300 font-medium text-sm uppercase tracking-widest relative group ${
                  item === 'Subscriptions' 
                    ? 'text-pink-600' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                {item}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ${
                  item === 'Subscriptions' ? 'w-full' : 'w-0 group-hover:w-full'
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
            <span className="text-sm font-semibold tracking-widest text-purple-600 uppercase">SMART SAVINGS</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-light font-serif mb-6 text-gray-900 leading-tight">
            Never Run Out <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Again</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Choose a subscription plan that works for you and enjoy the convenience of regular deliveries 
            with exclusive savings and thoughtful surprises every month.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#plans" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg group"
            >
              View Subscription Plans
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link 
              href="/gifting" 
              className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg group"
            >
              Gift a Subscription
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="plans" className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">Choose Your Plan</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Flexible <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Subscription</span> Options
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Select the perfect plan for your needs and enjoy the convenience of regular deliveries with exclusive member benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="group relative"
                onMouseEnter={() => setActivePlan(plan.id)}
                onMouseLeave={() => setActivePlan(null)}
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} rounded-3xl transform group-hover:scale-105 transition-transform duration-500 opacity-5 group-hover:opacity-10`}></div>
                
                <div className={`relative bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}>
                  
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  {/* Plan Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {plan.icon}
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                        {plan.name}
                      </h3>
                      <div className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl mb-2">
                        {plan.price}
                      </div>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700 font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white'
                    } group`}>
                      <span className="flex items-center justify-center space-x-2">
                        <span>Select Plan</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-blue-200 shadow-sm mb-6">
              <span className="text-sm font-semibold text-blue-600 tracking-widest uppercase">Member Benefits</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Why <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Subscribe?</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Enjoy exclusive benefits designed to make your menstrual journey more comfortable and convenient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Never Run Out",
                description: "Automatic deliveries ensure you always have what you need, when you need it",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                ),
                title: "Exclusive Savings",
                description: "Save up to 25% compared to one-time purchases with our subscription plans",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Flexible & Safe",
                description: "Skip any month or cancel anytime - no commitments or hidden fees",
                color: "from-emerald-500 to-green-500"
              }
            ].map((benefit, index) => (
              <div key={index} className="group text-center">
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-xl mb-4 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-widest uppercase">Common Questions</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
              Frequently Asked <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Everything you need to know about BloomBox subscriptions and how they work
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq) => (
              <div 
                key={faq.id} 
                className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset rounded-2xl transition-all duration-300 hover:bg-purple-50/50"
                >
                  <h3 className="font-semibold text-lg text-gray-900 pr-8">{faq.question}</h3>
                  <svg 
                    className={`w-5 h-5 text-purple-500 transition-transform duration-300 flex-shrink-0 ${
                      openFaq === faq.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`px-8 overflow-hidden transition-all duration-300 ${
                    openFaq === faq.id ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-700 leading-relaxed font-light">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-pink-500/5 to-transparent"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6">
            Ready to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Bloom?</span>
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-purple-200 font-light">
            Join thousands of women who have transformed their menstrual experience with BloomBox subscriptions
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="#plans" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl hover:shadow-3xl text-lg inline-flex items-center justify-center group border-2 border-transparent hover:border-purple-300"
            >
              Start Your Subscription
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-900 transition-all duration-300 transform hover:-translate-y-1 text-lg inline-flex items-center justify-center group hover:border-white"
            >
              Contact Support
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