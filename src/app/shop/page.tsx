'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  catalogProducts,
  formatProductPrice,
  productCategories,
  type CatalogProduct,
  type ProductCategory,
} from '@/data/catalog';
import {
  addProductToCart,
  subscribeToCart,
  subscribeToCategories,
  subscribeToProducts,
  updateCartItemQuantity,
  type CartSummary,
} from '@/lib/firestore';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';
import { useAuth } from '../components/AuthProvider';

const emptyCart: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

const shopImages = {
  hero: '/products/candle.jpg',
  pads: '/products/kot.jpg',
  marvelPads: '/products/marvel.jpg',
  sunnyPads: '/products/kot.jpg',
  menstrualCare: '/products/menscups.jpg',
  tampons: '/products/tampons.jpg',
  periodPanties: '/products/pps.jpg',
  wetWipes: '/products/wet-wipes.png',
  tissues: '/products/pocket.jpg',
  faceMasks: '/products/facemasks.jpg',
  accessories: '/products/adbags.jpg',
  candles: '/products/candle.jpg',
  bodyCare: '/products/bathbombs.jpg',
  heatTherapy: '/products/waterbottles.jpg',
  stationery: '/products/candle.jpg',
  flowers: '/mockups/bloombox-gift-flowers.png',
  default: '/bloom1.png',
} as const;

const categoryVisuals: Record<string, { image: string; accent: string; line: string }> = {
  pads: {
    image: shopImages.pads,
    accent: 'bg-[#ae2f34]',
    line: 'Everyday, super, and night flow support.',
  },
  'menstrual-cups': {
    image: shopImages.menstrualCare,
    accent: 'bg-[#006a65]',
    line: 'Reusable cup options by size.',
  },
  tampons: {
    image: shopImages.tampons,
    accent: 'bg-[#76574e]',
    line: 'Compact options for regular and heavy flow.',
  },
  'period-panties': {
    image: shopImages.periodPanties,
    accent: 'bg-[#8c1520]',
    line: 'Comfortable reusable underwear.',
  },
  hygiene: {
    image: shopImages.wetWipes,
    accent: 'bg-[#00504c]',
    line: 'Wipes, tissues, masks, and daily extras.',
  },
  accessories: {
    image: shopImages.accessories,
    accent: 'bg-[#795950]',
    line: 'Useful carry items and discreet storage.',
  },
  'self-care': {
    image: shopImages.candles,
    accent: 'bg-[#ae2f34]',
    line: 'Candles, steamers, bath bombs, and scrubs.',
  },
  'heat-therapy': {
    image: shopImages.heatTherapy,
    accent: 'bg-[#6d0010]',
    line: 'Heat support for cramps and comfort.',
  },
  stationery: {
    image: shopImages.stationery,
    accent: 'bg-[#76574e]',
    line: 'Journals and greeting cards for gifting.',
  },
  flowers: {
    image: shopImages.flowers,
    accent: 'bg-[#006a65]',
    line: 'Kenyan flowers for custom bundles.',
  },
};

const shopBundles = [
  {
    title: 'Period essentials',
    text: 'Pads, cups, tampons, wipes, and tissues for everyday planning.',
    image: shopImages.sunnyPads,
    categoryId: 'pads',
  },
  {
    title: 'Comfort add-ons',
    text: 'Heat therapy, candles, bath items, and quiet self-care extras.',
    image: shopImages.heatTherapy,
    categoryId: 'self-care',
  },
  {
    title: 'Gift-ready pieces',
    text: 'Flowers, cards, journals, and box details for thoughtful delivery.',
    image: shopImages.flowers,
    categoryId: 'flowers',
  },
];

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function getCatalogImage(productId: string, categoryId: string) {
  if (productId.startsWith('pads-marvel-girl')) return shopImages.marvelPads;
  if (productId.startsWith('pads-sunny-girl')) return shopImages.sunnyPads;
  if (productId.startsWith('tampons')) return shopImages.tampons;
  if (productId.startsWith('scented-candles')) return shopImages.candles;
  if (productId.startsWith('bath-bombs') || productId.startsWith('shower-steamers')) return shopImages.bodyCare;
  if (productId.startsWith('hot-water-bottles')) return shopImages.heatTherapy;
  if (productId.startsWith('wet-wipes')) return shopImages.wetWipes;
  if (productId.startsWith('pocket-tissues')) return shopImages.tissues;
  if (productId.startsWith('face-masks')) return shopImages.faceMasks;
  if (productId.startsWith('pad-bags')) return shopImages.accessories;
  if (
    productId.startsWith('body-scrub') ||
    productId.startsWith('shaving-cream')
  ) {
    return shopImages.bodyCare;
  }

  return categoryVisuals[categoryId]?.image ?? shopImages.default;
}

function normalizeProductImage(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    image: product.image || getCatalogImage(product.id, product.categoryId),
  };
}

function ProductMetaIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CartDrawer({
  cart,
  isOpen,
  onClose,
  onCheckout,
  userId,
}: {
  cart: CartSummary;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  userId?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-stone-950/45" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-stone-300 bg-white">
        <div className="flex items-center justify-between border-b border-stone-300 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Cart</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">{cart.itemCount} items ready</h2>
          </div>
          <button type="button" onClick={onClose} className="border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.items.length === 0 ? (
            <div className="border border-[#e0bfbd] bg-[#fff5f0] p-6 text-sm leading-6 text-stone-700">
              Your cart is empty. Start with an essential, then add comfort or gifting details.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="border border-stone-300 bg-white p-4">
                  <div className="grid grid-cols-[76px_1fr] gap-4">
                    <div className="relative aspect-square overflow-hidden border border-stone-200 bg-stone-100">
                      <Image
                        src={item.image || getCatalogImage(item.productId, item.categoryId)}
                        alt={item.productName}
                        fill
                        sizes="76px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold leading-5 text-stone-950">{item.productName}</h3>
                          <p className="mt-1 text-sm text-stone-500">
                            {item.brand} / {item.variant}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-rose-700">
                          {item.priceNote ?? (item.price === null ? 'Price pending' : money(item.price))}
                        </p>
                      </div>

                      <div className="mt-4 flex w-fit items-center border border-stone-300">
                        <button
                          type="button"
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity - 1)}
                          className="h-9 w-9 text-stone-700 disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity + 1)}
                          className="h-9 w-9 text-stone-700 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone-300 px-6 py-5">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-stone-950">{money(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="mt-4 w-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go to checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>(catalogProducts.map(normalizeProductImage));
  const [categories, setCategories] = useState<ProductCategory[]>(productCategories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;

    try {
      unsubscribeProducts = subscribeToProducts(
        (nextProducts) => setProducts(nextProducts.map(normalizeProductImage)),
        (error) => {
          setCatalogError(`Using the built-in catalog because Firestore could not load products: ${error.message}`);
        },
      );
      unsubscribeCategories = subscribeToCategories(setCategories, () => setCategories(productCategories));
    } catch (error) {
      setCatalogError(`Using the built-in catalog because Firestore is not ready: ${getMessage(error)}`);
    }

    return () => {
      unsubscribeProducts?.();
      unsubscribeCategories?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCart(emptyCart);
      return;
    }

    return subscribeToCart(user.uid, setCart, (error) => {
      setCatalogError(`Cart could not load: ${error.message}`);
    });
  }, [user]);

  const catalogMaxPrice = useMemo(() => Math.max(2500, ...products.map((product) => product.price ?? 0)), [products]);

  useEffect(() => {
    setMaxPrice(catalogMaxPrice);
  }, [catalogMaxPrice]);

  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', name: 'All', count: products.length },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        count: products.filter((product) => product.categoryId === category.id).length,
      })),
    ];
  }, [categories, products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
        const matchesPrice = product.price === null || product.price <= maxPrice;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.brand.toLowerCase().includes(normalizedSearch) ||
          product.variant.toLowerCase().includes(normalizedSearch) ||
          product.searchKeywords.includes(normalizedSearch);

        return matchesCategory && matchesPrice && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
        if (sortBy === 'price-high') return (b.price ?? -1) - (a.price ?? -1);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [activeCategory, maxPrice, products, searchTerm, sortBy]);

  const handleAddToCart = async (product: CatalogProduct) => {
    setCatalogError('');
    setNotice('');

    if (!user) {
      router.push('/login');
      return;
    }

    setAddingProductId(product.id);

    try {
      await addProductToCart(user.uid, normalizeProductImage(product));
      setNotice(`${product.name} added to your cart. Open the cart when you are ready to checkout.`);
    } catch (error) {
      setCatalogError(`Could not add item: ${getMessage(error)}`);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (cart.items.length === 0) {
      setNotice('Your cart is empty.');
      return;
    }

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader cartCount={cart.itemCount} onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        userId={user?.uid}
      />

      <main>
        <section className="relative overflow-hidden border-b border-stone-300 bg-[#14090c]">
          <Image
            src={shopImages.hero}
            alt="BloomBox care package with flowers and candles"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-[#14090c]/78" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1fr] lg:py-20">
            <div className="self-end border-l-8 border-[#ae2f34] bg-[#fff5f0] p-6 sm:p-8">
              <Eyebrow>Shop BloomBox</Eyebrow>
              <h1 className="mt-5 max-w-xl font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Build a care box that feels considered.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                Shop period care, comfort add-ons, flowers, and gifting extras with clear prices and parcel delivery in mind.
              </p>
              <div className="mt-8 grid grid-cols-3 border border-stone-300 bg-white">
                <div className="border-r border-stone-300 p-4">
                  <p className="text-2xl font-semibold text-[#ae2f34]">{products.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Items</p>
                </div>
                <div className="border-r border-stone-300 p-4">
                  <p className="text-2xl font-semibold text-[#ae2f34]">{categories.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Categories</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-semibold text-[#ae2f34]">{cart.itemCount}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">In cart</p>
                </div>
              </div>
            </div>

            <div className="self-end border border-stone-300 bg-white p-4 shadow-[10px_10px_0_#e0bfbd]">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search pads, candles, flowers..."
                  className="border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="featured">Featured first</option>
                  <option value="rating">Highest rated</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Pads', 'Menstrual cups', 'Candles', 'Flowers'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchTerm(term)}
                    className="border border-[#e0bfbd] bg-[#fff5f0] px-3 py-1.5 text-xs font-semibold text-[#584140] hover:border-[#ae2f34] hover:text-[#ae2f34]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#191c1d]">Popular ways to shop</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">Fast starting points for essentials, comfort, and gifting.</p>
            </div>
            <button type="button" onClick={() => setIsCartOpen(true)} className="w-fit border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#ae2f34] hover:text-white">
              Go to checkout
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {shopBundles.map((bundle) => (
              <button
                type="button"
                key={bundle.title}
                onClick={() => setActiveCategory(bundle.categoryId)}
                className="group grid border border-stone-300 bg-white text-left transition hover:border-[#ae2f34]"
              >
                <span className="relative block aspect-[5/2] overflow-hidden bg-stone-100">
                  <Image src={bundle.image} alt={bundle.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                </span>
                <span className="block p-4">
                  <span className="font-serif text-xl font-semibold text-[#ae2f34]">{bundle.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-stone-600">{bundle.text}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 sm:px-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-stone-300 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-950">Filters</h2>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchTerm('');
                    setMaxPrice(catalogMaxPrice);
                  }}
                  className="text-sm font-semibold text-rose-700"
                >
                  Reset
                </button>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Category</p>
                <div className="space-y-2">
                  {categoryFilters.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition ${
                        activeCategory === category.id
                          ? 'border-[#ae2f34] bg-[#fff5f0] font-semibold text-[#8c1520]'
                          : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-stone-500">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Max price</p>
                <input
                  type="range"
                  min="0"
                  max={catalogMaxPrice}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(parseInt(event.target.value, 10))}
                  className="w-full accent-rose-700"
                />
                <div className="mt-2 flex justify-between text-sm text-stone-500">
                  <span>KSh 0</span>
                  <span>{money(maxPrice)}</span>
                </div>
              </div>

              <div className="mt-7 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-600">
                <p className="font-semibold text-stone-950">Parcel delivery flow</p>
                <p className="mt-2">Add items, review your cart, then enter delivery and payment details at checkout.</p>
              </div>
            </div>
          </aside>

          <div>
            {catalogError ? (
              <div className="mb-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                {catalogError}
              </div>
            ) : null}

            {notice ? (
              <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                {notice}
              </div>
            ) : null}

            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-stone-300 pb-4 sm:flex-row sm:items-center">
              <p className="text-sm text-stone-600">
                Showing <span className="font-semibold text-stone-950">{visibleProducts.length}</span> of {products.length}
              </p>
              <Link href="/subscriptions" className="text-sm font-semibold text-rose-700 hover:text-rose-900">
                Explore subscriptions
              </Link>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="border border-stone-300 bg-white p-10 text-center">
                <h2 className="text-2xl font-semibold text-stone-950">No products found</h2>
                <p className="mt-2 text-stone-600">Try a different category or clear the search.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <article key={product.id} className="group overflow-hidden border border-stone-300 bg-white transition hover:border-[#ae2f34]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <Image
                        src={product.image || getCatalogImage(product.id, product.categoryId)}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <span className={`absolute inset-x-0 top-0 h-2 ${categoryVisuals[product.categoryId]?.accent ?? 'bg-stone-800'}`} />
                      {product.badge ? (
                        <span className="absolute left-4 top-4 bg-white px-3 py-1 text-xs font-semibold text-stone-900">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="border border-[#e0bfbd] bg-[#fff5f0] px-3 py-1 text-xs font-semibold text-[#8c1520]">{product.categoryName}</span>
                        <span className="border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">{product.brand}</span>
                      </div>

                      <h3 className="mt-4 text-lg font-semibold leading-6 text-stone-950">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
                      <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                        <ProductMetaIcon />
                        {product.stockStatus === 'on-demand' ? 'On demand' : product.stockStatus === 'pending-price' ? 'Price to confirm' : 'Ready to add'}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Price</p>
                          <p className="mt-1 text-xl font-semibold text-stone-950">{formatProductPrice(product)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingProductId === product.id}
                          className="bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {addingProductId === product.id ? 'Adding...' : product.stockStatus === 'pending-price' ? 'Request' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
