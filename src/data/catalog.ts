export type CurrencyCode = 'KES';

export type StockStatus = 'available' | 'on-demand' | 'pending-price';

export type ProductCategory = {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  iconName: string;
};

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  variant: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number | null;
  priceNote?: string;
  currency: CurrencyCode;
  stockStatus: StockStatus;
  image: string;
  color: string;
  badge?: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  searchKeywords: string[];
  isActive: boolean;
};

const productImages = {
  pads: '/products/sunny.jpg',
  marvelPads: '/products/marvel.jpg',
  sunnyPads: '/products/sunny.jpg',
  menstrualCare: '/products/menscups.jpg',
  tampons: '/products/tampons.jpg',
  periodPanties: '/products/pps.jpg',
  wetWipes: '/products/wet-wipes.png',
  tissues: '/products/pocket.jpg',
  faceMasks: '/products/facemasks.jpg',
  accessories: '/products/adbags.jpg',
  candle: '/products/candle.jpg',
  bodyCare: '/products/bathbombs.jpg',
  heatTherapy: '/products/waterbottles.jpg',
  stationery: '/products/candle.jpg',
  flowers: '/mockups/bloombox-gift-flowers.png',
  default: '/bloom1.png',
} as const;

function getProductImage(id: string, categoryId: string) {
  if (id.startsWith('pads-marvel-girl')) return productImages.marvelPads;
  if (id.startsWith('pads-sunny-girl')) return productImages.sunnyPads;
  if (id.startsWith('tampons')) return productImages.tampons;
  if (id.startsWith('scented-candles')) return productImages.candle;
  if (id.startsWith('bath-bombs') || id.startsWith('shower-steamers')) return productImages.bodyCare;
  if (id.startsWith('hot-water-bottles')) return productImages.heatTherapy;
  if (id.startsWith('wet-wipes')) return productImages.wetWipes;
  if (id.startsWith('pocket-tissues')) return productImages.tissues;
  if (id.startsWith('face-masks')) return productImages.faceMasks;
  if (id.startsWith('pad-bags')) return productImages.accessories;
  if (id.startsWith('body-scrub') || id.startsWith('shaving-cream')) {
    return productImages.bodyCare;
  }

  switch (categoryId) {
    case 'pads':
      return productImages.pads;
    case 'menstrual-cups':
      return productImages.menstrualCare;
    case 'tampons':
      return productImages.tampons;
    case 'period-panties':
      return productImages.periodPanties;
    case 'hygiene':
      return productImages.wetWipes;
    case 'accessories':
      return productImages.accessories;
    case 'self-care':
      return productImages.candle;
    case 'heat-therapy':
      return productImages.heatTherapy;
    case 'stationery':
      return productImages.stationery;
    case 'flowers':
      return productImages.flowers;
    default:
      return productImages.default;
  }
}

export const productCategories: ProductCategory[] = [
  {
    id: 'pads',
    name: 'Pads',
    description: 'Everyday, super, and night pads from trusted brands.',
    order: 1,
    color: 'bg-rose-700',
    iconName: 'box',
  },
  {
    id: 'menstrual-cups',
    name: 'Menstrual Cups',
    description: 'Reusable cups in small, medium, and large sizes.',
    order: 2,
    color: 'bg-teal-700',
    iconName: 'heart',
  },
  {
    id: 'tampons',
    name: 'Tampons',
    description: 'Compact tampon options for regular and heavy flow.',
    order: 3,
    color: 'bg-sky-700',
    iconName: 'spark',
  },
  {
    id: 'period-panties',
    name: 'Period Panties',
    description: 'Comfortable reusable underwear options.',
    order: 4,
    color: 'bg-pink-700',
    iconName: 'shield',
  },
  {
    id: 'hygiene',
    name: 'Hygiene',
    description: 'Wipes, tissues, masks, and personal-care essentials.',
    order: 5,
    color: 'bg-blue-700',
    iconName: 'check',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Useful extras for discreet carrying and daily care.',
    order: 6,
    color: 'bg-orange-700',
    iconName: 'bag',
  },
  {
    id: 'self-care',
    name: 'Self-Care',
    description: 'Candles, steamers, bath bombs, scrubs, and grooming extras.',
    order: 7,
    color: 'bg-fuchsia-700',
    iconName: 'gift',
  },
  {
    id: 'heat-therapy',
    name: 'Heat Therapy',
    description: 'Hot water bottles for cramps and comfort.',
    order: 8,
    color: 'bg-red-700',
    iconName: 'flame',
  },
  {
    id: 'stationery',
    name: 'Stationery',
    description: 'Journals and greeting cards for thoughtful gifting.',
    order: 9,
    color: 'bg-violet-700',
    iconName: 'journal',
  },
  {
    id: 'flowers',
    name: 'Flowers',
    description: 'Kenyan flowers for gifting and custom bundles.',
    order: 10,
    color: 'bg-emerald-700',
    iconName: 'flower',
  },
];

const categoryById = new Map(productCategories.map((category) => [category.id, category]));

function keywords(...values: string[]) {
  return values
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function createProduct(
  id: string,
  categoryId: string,
  brand: string,
  variant: string,
  price: number | null,
  options: Partial<Omit<CatalogProduct, 'id' | 'sku' | 'categoryId' | 'categoryName' | 'brand' | 'variant' | 'price' | 'currency' | 'image' | 'color' | 'searchKeywords' | 'isActive'>> = {},
): CatalogProduct {
  const category = categoryById.get(categoryId);

  if (!category) {
    throw new Error(`Unknown product category: ${categoryId}`);
  }

  const cleanBrand = brand.trim();
  const productName = cleanBrand ? `${cleanBrand} ${category.name} - ${variant}` : `${category.name} - ${variant}`;
  const tags = options.tags ?? [category.name, cleanBrand, variant].filter(Boolean);

  return {
    id,
    sku: `BB-${id.toUpperCase().replace(/-/g, '-')}`,
    name: options.name ?? productName,
    brand: cleanBrand || 'BloomBox',
    variant,
    categoryId,
    categoryName: category.name,
    description:
      options.description ??
      `${variant} ${category.name.toLowerCase()}${cleanBrand ? ` by ${cleanBrand}` : ''} for BloomBox care packages.`,
    price,
    ...(options.priceNote !== undefined ? { priceNote: options.priceNote } : {}),
    currency: 'KES',
    stockStatus: options.stockStatus ?? (price === null ? 'pending-price' : 'available'),
    image: getProductImage(id, categoryId),
    color: category.color,
    ...(options.badge !== undefined ? { badge: options.badge } : {}),
    featured: options.featured ?? false,
    rating: options.rating ?? 4.8,
    reviewCount: options.reviewCount ?? 0,
    tags,
    searchKeywords: keywords(category.name, cleanBrand, variant, options.name ?? '', ...(options.tags ?? [])),
    isActive: true,
  };
}

export const catalogProducts: CatalogProduct[] = [
  createProduct('pads-kotex-regular', 'pads', 'Kotex', 'Regular', 155, { badge: 'POPULAR', featured: true, reviewCount: 18 }),
  createProduct('pads-kotex-super', 'pads', 'Kotex', 'Super', 280, { reviewCount: 15 }),
  createProduct('pads-kotex-night', 'pads', 'Kotex', 'Night', 300, { badge: 'NIGHT', reviewCount: 12 }),
  createProduct('pads-marvel-girl-regular', 'pads', 'Marvel Girl', 'Regular', 80, { badge: 'VALUE', reviewCount: 10 }),
  createProduct('pads-marvel-girl-super', 'pads', 'Marvel Girl', 'Super', 80, { reviewCount: 9 }),
  createProduct('pads-marvel-girl-night', 'pads', 'Marvel Girl', 'Night', 100, { reviewCount: 11 }),
  createProduct('pads-sunny-girl-regular', 'pads', 'Sunny Girl', 'Regular', 80, { reviewCount: 10 }),
  createProduct('pads-sunny-girl-super', 'pads', 'Sunny Girl', 'Super', 80, { reviewCount: 8 }),
  createProduct('pads-sunny-girl-night', 'pads', 'Sunny Girl', 'Night', 100, { reviewCount: 8 }),
  createProduct('menstrual-cups-small', 'menstrual-cups', 'BloomBox', 'Small', 350, { badge: 'REUSABLE', featured: true, reviewCount: 16 }),
  createProduct('menstrual-cups-medium', 'menstrual-cups', 'BloomBox', 'Medium', 450, { badge: 'REUSABLE', reviewCount: 14 }),
  createProduct('menstrual-cups-large', 'menstrual-cups', 'BloomBox', 'Large', 550, { badge: 'REUSABLE', reviewCount: 12 }),
  createProduct('tampons-kotex-regular', 'tampons', 'Kotex', 'Regular', 350, { reviewCount: 10 }),
  createProduct('tampons-kotex-heavy', 'tampons', 'Kotex', 'Heavy', 360, { reviewCount: 7 }),
  createProduct('period-panties-new-bikini-cut', 'period-panties', 'New', 'Bikini cut', 250, { featured: true, reviewCount: 17 }),
  createProduct('period-panties-new-basic-high-cut', 'period-panties', 'New', 'Basic high cut', 150, { reviewCount: 13 }),
  createProduct('wet-wipes-kim-fay-single-packs', 'hygiene', 'Kim Fay', 'Single packs', 20, {
    name: 'Kim Fay Wet Wipes - Single Pack',
    reviewCount: 6,
  }),
  createProduct('pocket-tissues-kim-fay-10-pack', 'hygiene', 'Kim Fay', '10 in a pack', 220, {
    name: 'Kim Fay Pocket Tissues - 10 Pack',
    reviewCount: 6,
  }),
  createProduct('pocket-tissues-kim-fay-single-packs', 'hygiene', 'Kim Fay', 'Single packs', 20, {
    name: 'Kim Fay Pocket Tissues - Single Pack',
    reviewCount: 5,
  }),
  createProduct('pad-bags-new-regular', 'accessories', 'New', 'Regular', 500, {
    name: 'BloomBox Pad Bag - Regular',
    badge: 'NEW',
    reviewCount: 4,
  }),
  createProduct('face-masks-new-regular', 'hygiene', 'New', 'Regular', 50, {
    name: 'Face Mask - Regular',
    reviewCount: 3,
  }),
  createProduct('scented-candles-new-250ml', 'self-care', 'New', '250ml', 300, {
    name: 'Scented Candle - 250ml',
    badge: 'SELF-CARE',
    featured: true,
    reviewCount: 9,
  }),
  createProduct('scented-candles-new-300ml', 'self-care', 'New', '300ml', 400, {
    name: 'Scented Candle - 300ml',
    reviewCount: 7,
  }),
  createProduct('scented-candles-new-500ml', 'self-care', 'New', '500ml', 550, {
    name: 'Scented Candle - 500ml',
    reviewCount: 7,
  }),
  createProduct('shower-steamers-new-regular', 'self-care', 'New', 'Regular', 150, {
    name: 'Shower Steamer - Regular',
    reviewCount: 5,
  }),
  createProduct('bath-bombs-new-regular', 'self-care', 'New', 'Regular', 300, {
    name: 'Bath Bomb - Regular',
    reviewCount: 5,
  }),
  createProduct('hot-water-bottles-with-cloth-new-500ml', 'heat-therapy', 'New', '500ml', 800, {
    name: 'Hot Water Bottle with Cloth - 500ml',
    badge: 'COMFORT',
    featured: true,
    reviewCount: 11,
  }),
  createProduct('hot-water-bottles-with-cloth-new-1l', 'heat-therapy', 'New', '1L', 1800, {
    name: 'Hot Water Bottle with Cloth - 1L',
    reviewCount: 8,
  }),
  createProduct('hot-water-bottles-with-cloth-new-2l', 'heat-therapy', 'New', '2L', 2200, {
    name: 'Hot Water Bottle with Cloth - 2L',
    reviewCount: 7,
  }),
  createProduct('body-scrub-new-250ml', 'self-care', 'New', '250ml', 500, {
    name: 'Body Scrub - 250ml',
    reviewCount: 6,
  }),
  createProduct('body-scrub-new-500ml', 'self-care', 'New', '500ml', 700, {
    name: 'Body Scrub - 500ml',
    reviewCount: 5,
  }),
  createProduct('shaving-cream-50ml', 'self-care', 'BloomBox', '50ml', null, {
    name: 'Shaving Cream - 50ml',
    priceNote: 'Price pending',
    tags: ['Shaving cream', 'Grooming', 'Self-care'],
  }),
  createProduct('shaving-cream-100ml', 'self-care', 'BloomBox', '100ml', null, {
    name: 'Shaving Cream - 100ml',
    priceNote: 'Price pending',
    tags: ['Shaving cream', 'Grooming', 'Self-care'],
  }),
  createProduct('journal-new-4x6', 'stationery', 'New', '4x6', 2500, {
    name: 'BloomBox Journal - 4x6',
    badge: 'GIFT',
    reviewCount: 4,
  }),
  createProduct('greeting-cards-new-simple', 'stationery', 'New', 'Simple', 150, {
    name: 'Greeting Card - Simple',
    reviewCount: 3,
  }),
  createProduct('greeting-cards-new-stamped', 'stationery', 'New', 'Stamped', 250, {
    name: 'Greeting Card - Stamped',
    reviewCount: 3,
  }),
  createProduct('flowers-kenyan-on-demand', 'flowers', 'Kenyan', 'On demand', 450, {
    name: 'Kenyan Flowers - On Demand',
    priceNote: 'From KSh 450',
    stockStatus: 'on-demand',
    badge: 'ON DEMAND',
    featured: true,
    reviewCount: 5,
  }),
];

export function formatProductPrice(product: Pick<CatalogProduct, 'currency' | 'price' | 'priceNote'>) {
  if (product.priceNote) {
    return product.priceNote;
  }

  if (product.price === null) {
    return 'Price pending';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}
