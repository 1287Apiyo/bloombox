'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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

// ---------- No animations – calm static page ----------

const emptyCart: CartSummary = { items: [], itemCount: 0, subtotal: 0 };

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

const categoryVisuals: Record<string, { image: string; accent: string }> = {
  pads: { image: shopImages.pads, accent: 'bg-[#ae2f34]' },
  'menstrual-cups': { image: shopImages.menstrualCare, accent: 'bg-[#006a65]' },
  tampons: { image: shopImages.tampons, accent: 'bg-[#76574e]' },
  'period-panties': { image: shopImages.periodPanties, accent: 'bg-[#8c1520]' },
  hygiene: { image: shopImages.wetWipes, accent: 'bg-[#00504c]' },
  accessories: { image: shopImages.accessories, accent: 'bg-[#795950]' },
  'self-care': { image: shopImages.candles, accent: 'bg-[#ae2f34]' },
  'heat-therapy': { image: shopImages.heatTherapy, accent: 'bg-[#6d0010]' },
  stationery: { image: shopImages.stationery, accent: 'bg-[#76574e]' },
  flowers: { image: shopImages.flowers, accent: 'bg-[#006a65]' },
};

// ---------- Helpers ----------
function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function money(value: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
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
  if (productId.startsWith('body-scrub') || productId.startsWith('shaving-cream')) return shopImages.bodyCare;
  return categoryVisuals[categoryId]?.image ?? shopImages.default;
}

function normalizeProductImage(product: CatalogProduct): CatalogProduct {
  return { ...product, image: product.image || getCatalogImage(product.id, product.categoryId) };
}

// ---------- Cart Drawer (kept simple & quiet) ----------
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
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/30"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-stone-200 bg-white pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ae2f34]">Cart</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">{cart.itemCount} items ready</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {cart.items.length === 0 ? (
            <div className="rounded-md border border-[#e0bfbd] bg-[#fff5f0] p-5 text-sm leading-6 text-stone-700 sm:p-6">
              Your cart is empty. Start with an essential, then add comfort or gifting details.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="rounded-md border border-stone-200 bg-white p-3 sm:p-4">
                  <div className="grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[76px_1fr] sm:gap-4">
                    <div className="relative aspect-square overflow-hidden rounded-md border border-stone-200 bg-stone-100">
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
                          <h3 className="font-semibold leading-5 text-stone-900">{item.productName}</h3>
                          <p className="mt-1 text-sm text-stone-500">
                            {item.brand} / {item.variant}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#ae2f34]">
                          {item.priceNote ?? (item.price === null ? 'Price pending' : money(item.price))}
                        </p>
                      </div>

                      <div className="mt-4 flex w-fit items-center overflow-hidden rounded-md border border-stone-200">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.productName} quantity`}
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity - 1)}
                          className="h-9 w-9 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.productName} quantity`}
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity + 1)}
                          className="h-9 w-9 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
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

        <div className="border-t border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-stone-900">{money(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="mt-4 w-full rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go to checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

// ---------- Main Shop Page (calm, minimal) ----------
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

  // Firestore subscriptions
  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;
    try {
      unsubscribeProducts = subscribeToProducts(
        (nextProducts) => setProducts(nextProducts.map(normalizeProductImage)),
        (error) => setCatalogError(`Using the built-in catalog because Firestore could not load products: ${error.message}`)
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
    return subscribeToCart(user.uid, setCart, (error) => setCatalogError(`Cart could not load: ${error.message}`));
  }, [user]);

  const catalogMaxPrice = useMemo(() => Math.max(2500, ...products.map((p) => p.price ?? 0)), [products]);
  useEffect(() => setMaxPrice(catalogMaxPrice), [catalogMaxPrice]);

  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', name: 'All', count: products.length },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: products.filter((p) => p.categoryId === cat.id).length,
      })),
    ];
  }, [categories, products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products
      .filter((p) => {
        const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
        const matchesPrice = p.price === null || p.price <= maxPrice;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          p.name.toLowerCase().includes(normalizedSearch) ||
          p.brand.toLowerCase().includes(normalizedSearch) ||
          p.variant.toLowerCase().includes(normalizedSearch) ||
          p.searchKeywords.includes(normalizedSearch);
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

  const activeCategoryLabel = categoryFilters.find((c) => c.id === activeCategory)?.name ?? 'All';

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
      setNotice(`${product.name} added to your cart.`);
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
    <div className="shop-page min-h-screen bg-[#fafaf9] text-stone-900">
      <SiteHeader cartCount={cart.itemCount} onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        userId={user?.uid}
      />

      <main className="pb-20 sm:pb-16">
        {/* ---------- COMPACT MOBILE SHOP BAR ---------- */}
        <section className="sticky top-[var(--bb-header-offset,60px)] z-30 border-b border-stone-200 bg-white lg:static lg:z-auto">
          <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-8 sm:py-4 lg:hidden">
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 rounded-full border border-stone-200 bg-[#fafaf9] px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-[#ae2f34]"
              />
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative shrink-0 rounded-full bg-[#ae2f34] px-3.5 py-2.5 text-sm font-semibold text-white"
              >
                Cart
                {cart.itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#14090c] px-1 text-[10px] font-bold text-white">
                    {cart.itemCount}
                  </span>
                ) : null}
              </button>
            </div>
            <div className="bb-mobile-scroll mt-2.5 flex gap-1.5 pb-0.5">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat.id
                      ? 'bg-[#ae2f34] text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop hero */}
          <div className="hidden border-b border-stone-200 lg:block">
            <div className="mx-auto grid max-w-7xl gap-8 px-8 py-12 lg:grid-cols-[1fr_380px] lg:items-center lg:py-16">
              <div>
                <Eyebrow>Shop BloomBox</Eyebrow>
                <h1 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight text-[#191c1d] sm:text-5xl">
                  Choose what goes into this month’s box.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
                  Browse essentials, comfort add-ons, and small gifts. Everything you add goes to your cart and then to checkout.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search pads, candles, flowers..."
                    className="flex-1 rounded-md border border-stone-200 bg-[#fafaf9] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#ae2f34]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="rounded-md bg-[#ae2f34] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]"
                  >
                    Cart ({cart.itemCount})
                  </button>
                </div>
              </div>
              <div className="relative h-80 overflow-hidden rounded-md bg-stone-100">
                <Image
                  src={shopImages.hero}
                  alt="BloomBox care package"
                  fill
                  sizes="380px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FILTER + PRODUCT GRID ---------- */}
        <section className="mx-auto grid max-w-7xl gap-4 px-2 py-3 sm:gap-8 sm:px-8 sm:py-10 lg:grid-cols-[280px_1fr]">

          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <div className="rounded-md border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setSearchTerm(''); setMaxPrice(catalogMaxPrice); }}
                  className="rounded px-2 py-1 text-sm font-medium text-[#ae2f34] hover:bg-[#fff5f0]"
                >
                  Reset
                </button>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Category</p>
                <div className="space-y-1">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex h-10 w-full items-center justify-between rounded-md px-3 text-left text-sm transition ${
                        activeCategory === cat.id
                          ? 'bg-[#fff5f0] font-medium text-[#8c1520]'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-stone-400">{cat.count}</span>
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
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-[#ae2f34]"
                />
                <div className="mt-2 flex justify-between text-sm text-stone-500">
                  <span>KSh 0</span>
                  <span>{money(maxPrice)}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product list — Carrefour-style dense grid on mobile */}
          <div>
            {catalogError && (
              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 sm:mb-5 sm:p-4">
                {catalogError}
              </div>
            )}
            {notice && (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900 sm:mb-5 sm:p-4">
                {notice}
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-2 px-1 sm:mb-6 sm:flex-row sm:gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[#ae2f34] sm:tracking-[0.16em]">
                  {activeCategoryLabel}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500 sm:text-sm">
                  {visibleProducts.length} of {products.length}
                </p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="max-w-[48%] rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-600 outline-none focus:border-[#ae2f34] sm:max-w-none sm:px-4 sm:py-2 sm:text-sm"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="name">A–Z</option>
              </select>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="rounded-md border border-stone-200 bg-white p-8 text-center sm:p-10">
                <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">No products found</h2>
                <p className="mt-2 text-sm text-stone-600">Try a different category or clear the search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className="flex min-h-full flex-col overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    {/* Square image like grocery apps */}
                    <div className="relative aspect-square overflow-hidden bg-stone-50">
                      <Image
                        src={product.image || getCatalogImage(product.id, product.categoryId)}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 220px, (min-width: 768px) 30vw, 48vw"
                        className="object-cover"
                      />
                      {product.stockStatus === 'pending-price' ? (
                        <span className="absolute left-1.5 top-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-900 sm:left-2 sm:top-2 sm:text-[10px]">
                          Request
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-2 sm:p-3.5">
                      <p className="hidden text-[10px] font-medium uppercase tracking-wide text-stone-400 sm:block">
                        {product.brand}
                      </p>
                      <h3 className="line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-snug text-stone-900 sm:mt-1 sm:min-h-0 sm:text-base sm:leading-6">
                        {product.name}
                      </h3>
                      <p className="mt-1 hidden line-clamp-2 text-sm leading-5 text-stone-500 sm:block">
                        {product.description}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-1.5 pt-2 sm:pt-4">
                        <p className="min-w-0 text-sm font-bold leading-tight text-[#ae2f34] sm:text-lg sm:text-stone-900">
                          {formatProductPrice(product)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingProductId === product.id}
                          aria-label={`Add ${product.name} to cart`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ae2f34] text-base font-bold leading-none text-white transition hover:bg-[#8c1520] disabled:opacity-60 sm:h-auto sm:w-auto sm:rounded-md sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
                        >
                          <span className="sm:hidden">{addingProductId === product.id ? '…' : '+'}</span>
                          <span className="hidden sm:inline">
                            {addingProductId === product.id
                              ? 'Adding...'
                              : product.stockStatus === 'pending-price'
                                ? 'Request'
                                : 'Add'}
                          </span>
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