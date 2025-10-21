'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Sample product data
  const products = [
    {
      id: 1,
      name: "First Bloom Box",
      description: "Special package for her first period celebration with gentle products and educational materials",
      price: "$49.99",
      category: "starter-kits",
      image: "/bloom1.png",
      featured: true,
      badge: "BESTSELLER",
      rating: 4.9,
      reviewCount: 124,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      name: "Monthly Comfort Kit",
      description: "All essentials for a comfortable period including organic pads and soothing teas",
      price: "$39.99",
      category: "subscriptions",
      image: "/bloom1.png",
      featured: true,
      badge: "POPULAR",
      rating: 4.8,
      reviewCount: 89,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      name: "Eco-Friendly Set",
      description: "Sustainable period products for the conscious woman with reusable options",
      price: "$59.99",
      category: "eco-friendly",
      image: "/bloom1.png",
      featured: true,
      badge: "ECO",
      rating: 4.7,
      reviewCount: 67,
      color: "from-emerald-500 to-green-500"
    },
    {
      id: 4,
      name: "Teen Starter Pack",
      description: "Gentle products perfect for teens just starting their menstrual journey",
      price: "$44.99",
      category: "starter-kits",
      image: "/bloom1.png",
      featured: false,
      badge: "NEW",
      rating: 4.9,
      reviewCount: 42,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 5,
      name: "Premium Luxury Box",
      description: "Indulge with our premium organic cotton products and self-care items",
      price: "$69.99",
      category: "luxury",
      image: "/bloom1.png",
      featured: false,
      badge: "LUXURY",
      rating: 4.8,
      reviewCount: 56,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 6,
      name: "Postpartum Care Kit",
      description: "Specialized care for postpartum recovery with extra-comfort products",
      price: "$54.99",
      category: "specialty",
      image: "/bloom1.png",
      featured: false,
      badge: "SPECIAL",
      rating: 4.9,
      reviewCount: 38,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 7,
      name: "Travel Essentials",
      description: "Compact and discreet products for on-the-go with portable packaging",
      price: "$34.99",
      category: "accessories",
      image: "/bloom1.png",
      featured: false,
      badge: "TRAVEL",
      rating: 4.6,
      reviewCount: 71,
      color: "from-emerald-500 to-green-500"
    },
    {
      id: 8,
      name: "Organic Cotton Collection",
      description: "100% organic cotton products for sensitive skin and eco-conscious users",
      price: "$49.99",
      category: "eco-friendly",
      image: "/bloom1.png",
      featured: false,
      badge: "ORGANIC",
      rating: 4.7,
      reviewCount: 63,
      color: "from-amber-500 to-orange-500"
    },
  ];

  const categories = [
    { 
      id: 'all', 
      name: 'All Products', 
      count: products.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      id: 'starter-kits', 
      name: 'Starter Kits', 
      count: products.filter(p => p.category === 'starter-kits').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'subscriptions', 
      name: 'Subscriptions', 
      count: products.filter(p => p.category === 'subscriptions').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'eco-friendly', 
      name: 'Eco-Friendly', 
      count: products.filter(p => p.category === 'eco-friendly').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'luxury', 
      name: 'Luxury', 
      count: products.filter(p => p.category === 'luxury').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    { 
      id: 'specialty', 
      name: 'Specialty', 
      count: products.filter(p => p.category === 'specialty').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: 'accessories', 
      name: 'Accessories', 
      count: products.filter(p => p.category === 'accessories').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      )
    },
  ];

  const productTypes = [
    { id: 'pads', name: 'Pads', count: 12 },
    { id: 'tampons', name: 'Tampons', count: 8 },
    { id: 'cups', name: 'Menstrual Cups', count: 6 },
    { id: 'panties', name: 'Period Panties', count: 10 },
    { id: 'discs', name: 'Menstrual Discs', count: 4 },
    { id: 'liners', name: 'Liners', count: 15 }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  // Sort products based on selection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return parseFloat(a.price.substring(1)) - parseFloat(b.price.substring(1));
    if (sortBy === 'price-high') return parseFloat(b.price.substring(1)) - parseFloat(a.price.substring(1));
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rating') return b.rating - a.rating;
    // Default: featured first, then by rating
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.rating - a.rating;
  });

  const toggleProductType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
                href={item === 'Shop' ? '/shop' : `/${item.toLowerCase().replace(' ', '-')}`}
                className={`transition-all duration-300 font-medium text-sm uppercase tracking-widest relative group ${
                  item === 'Shop' 
                    ? 'text-pink-600' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                {item}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ${
                  item === 'Shop' ? 'w-full' : 'w-0 group-hover:w-full'
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
            <span className="text-sm font-semibold tracking-widest text-purple-600 uppercase">SHOP COLLECTION</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-light font-serif mb-6 text-gray-900 leading-tight">
            Discover Our <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Period Care</span> Collection
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Thoughtfully curated period care products designed to celebrate womanhood with elegance, comfort, and care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#products" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg group"
            >
              Shop Collection
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>
            <Link 
              href="/subscriptions" 
              className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg group"
            >
              View Subscriptions
            </Link>
          </div>
        </div>
      </section>

        {/* Breadcrumb - ADD THIS SECTION HERE */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-6">
          <nav className="flex items-center text-sm font-light">
            <Link href="/dashboard" className="text-gray-500 hover:text-purple-600 transition-colors duration-300">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Shop</span>
          </nav>
        </div>
      </div>

     

      {/* Main Content */}
      <div id="products" className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-32 shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-xl text-gray-900">Filters</h2>
                <button className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors duration-300">
                  Reset All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-900 text-lg">Categories</h3>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-300 flex justify-between items-center group ${
                          activeCategory === category.id 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-200' 
                            : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`${activeCategory === category.id ? 'text-purple-500' : 'text-gray-400'}`}>
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          activeCategory === category.id 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-900 text-lg">Price Range</h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>$0</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Types */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-900 text-lg">Product Type</h3>
                <div className="space-y-3">
                  {productTypes.map(type => (
                    <label key={type.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => toggleProductType(type.id)}
                          className="rounded-lg text-purple-500 focus:ring-purple-400 border-gray-300 transition-all duration-300"
                        />
                        <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                          {type.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
                        {type.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {/* Header Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-lg">
              <div className="mb-4 lg:mb-0">
                <p className="text-gray-600 font-light">
                  Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{products.length}</span> products
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium hidden sm:block">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300 font-medium text-gray-700 appearance-none cursor-pointer hover:border-gray-300"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="relative bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                    
                    {/* Product Image */}
                    <div className="relative mb-6">
                      <div className="aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                        <div className={`w-full h-full bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                          <div className="text-white text-4xl font-serif text-center p-8">
                            {product.name.split(' ').map(word => word[0]).join('')}
                          </div>
                        </div>
                      </div>
                      {product.badge && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span>{product.badge}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 font-light leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) 
                                  ? 'text-amber-400' 
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 font-medium">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                        <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl">
                          {product.price}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold group/btn flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-16">
              <nav className="flex items-center space-x-2 bg-white rounded-2xl border border-gray-100 p-2 shadow-lg">
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg">1</button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300">2</button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300">3</button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 mb-6 shadow-sm">
            <span className="text-sm font-medium text-purple-600 tracking-widest">STAY CONNECTED</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-light font-serif mb-6 text-gray-900">
            Join the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">BloomBox</span> Community
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Subscribe to our newsletter for exclusive offers, product updates, menstrual wellness tips, and early access to new collections.
          </p>
          
          <div className="max-w-md mx-auto flex bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden focus-within:border-purple-300 focus-within:shadow-purple-100">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow bg-transparent py-4 px-6 focus:outline-none text-gray-700 placeholder-gray-500 font-light"
            />
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold">
              Subscribe
            </button>
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
            <p className="text-sm font-light">&copy; {new Date().getFullYear()} BloomBox by Delilah. All rights reserved. Made with <span className="text-pink-400">love</span> for women everywhere.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}