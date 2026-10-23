export type ProductImage = { id?: string; src: string; url?: string; alt: string; primary?: boolean; isPrimary?: boolean; sortOrder?: number }
export type ProductVideo = { source: 'NONE' | 'UPLOAD' | 'INSTAGRAM'; url?: string; thumbnail?: string }
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export const getStockStatus = (stock: Product['stock'] | number): StockStatus => typeof stock === 'number' ? (stock <= 0 ? 'OUT_OF_STOCK' : stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK') : stock === 'Out of Stock' ? 'OUT_OF_STOCK' : stock === 'Low Stock' ? 'LOW_STOCK' : 'IN_STOCK'
export const stockLabel: Record<StockStatus, string> = { IN_STOCK: 'In stock', LOW_STOCK: 'Only a few left', OUT_OF_STOCK: 'Out of stock' }

export type ProductCareItem = {
  id?: number
  icon: 'sun' | 'water' | 'soil'
  label: string
  labelEn?: string
  labelMr?: string
  value: string
  valueEn?: string
  valueMr?: string
}

export type Product = {
  id: number
  slug: string
  nameEn?: string
  nameMr?: string
  name: string
  categoryEn?: string
  categoryMr?: string
  category: string
  categorySlug: string
  descriptionEn?: string
  descriptionMr?: string
  description: string
  price: number
  originalPrice?: number
  badge?: string
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock'
  stockQuantity?: number
  stockStatus?: StockStatus
  sku?: string
  active?: boolean
  rating: number
  reviewCount: number
  images: ProductImage[]
  video?: ProductVideo
  videoUrl?: string
  info: { label: string; value: string }[]
  care: ProductCareItem[]
}

export type CartItem = { product: Product; quantity: number }
export type Category = {
  id?: number
  nameEn?: string
  nameMr?: string
  name: string
  slug: string
  descriptionEn?: string
  descriptionMr?: string
  description: string
  image: string
  status?: string
  productCount?: number
}

export function getLocalizedName(
  item: { nameEn?: string | null; nameMr?: string | null; name?: string | null } | null | undefined,
  lang: 'en' | 'mr' | string
): string {
  if (!item) return ''
  if (lang === 'mr') {
    return item.nameMr && item.nameMr.trim() !== ''
      ? item.nameMr
      : (item.nameEn && item.nameEn.trim() !== '' ? item.nameEn : (item.name || ''))
  }
  return item.nameEn && item.nameEn.trim() !== '' ? item.nameEn : (item.name || '')
}

export function getLocalizedDescription(
  item: { descriptionEn?: string | null; descriptionMr?: string | null; description?: string | null } | null | undefined,
  lang: 'en' | 'mr' | string
): string {
  if (!item) return ''
  if (lang === 'mr') {
    return item.descriptionMr && item.descriptionMr.trim() !== ''
      ? item.descriptionMr
      : (item.descriptionEn && item.descriptionEn.trim() !== '' ? item.descriptionEn : (item.description || ''))
  }
  return item.descriptionEn && item.descriptionEn.trim() !== '' ? item.descriptionEn : (item.description || '')
}

export function getLocalizedCategoryName(
  item: { categoryEn?: string | null; categoryMr?: string | null; category?: string | null; nameEn?: string | null; nameMr?: string | null; name?: string | null } | null | undefined,
  lang: 'en' | 'mr' | string
): string {
  if (!item) return ''
  if (lang === 'mr') {
    if (item.categoryMr && item.categoryMr.trim() !== '') return item.categoryMr
    if (item.categoryEn && item.categoryEn.trim() !== '') return item.categoryEn
    if (item.category && item.category.trim() !== '') return item.category
    return getLocalizedName(item, lang)
  }
  if (item.categoryEn && item.categoryEn.trim() !== '') return item.categoryEn
  if (item.category && item.category.trim() !== '') return item.category
  return getLocalizedName(item, lang)
}

export function formatMediaUrl(url?: string | null): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (clean.startsWith('/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'
    try {
      const parsed = new URL(apiBase)
      return `${parsed.origin}${clean}`
    } catch {
      const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '')
      return `${backendOrigin}${clean}`
    }
  }
  return trimmed
}

export const normalizeImages = (product: Partial<Product> & { image?: string; imageUrl?: string }): ProductImage[] => { const raw = Array.isArray(product.images) ? product.images : []; const legacy = product.image || product.imageUrl; const source = raw.length ? raw : legacy ? [{ src: legacy, alt: product.name || 'Plant image' }] : []; const unique = source.filter((item, index, list) => item?.src && list.findIndex((candidate) => candidate.src === item.src) === index).map((item, index) => ({ ...item, id: item.id || `image-${index + 1}`, src: formatMediaUrl(item.src || item.url || ''), url: formatMediaUrl(item.src || item.url || ''), alt: item.alt || product.name || 'Plant image', primary: Boolean(item.primary || item.isPrimary), sortOrder: index })); if (unique.length && !unique.some((item) => item.primary)) unique[0].primary = true; const primary = unique.findIndex((item) => item.primary); unique.forEach((item, index) => { item.primary = index === (primary < 0 ? 0 : primary) }); return unique }
export const primaryImage = (product: Partial<Product> & { image?: string; imageUrl?: string }) => normalizeImages(product)[0]
export const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`
export const discountPercent = (product: Product) => product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

export const categoryList: Category[] = [
  { name: 'All Plants', slug: 'all-plants', description: 'Find the perfect plants to bring more life to your home and garden.', image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Fruit Plants', slug: 'fruit-plants', description: 'Healthy fruit plants for your garden and farm.', image: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Flower Plants', slug: 'flower-plants', description: 'Bring colour, fragrance and gentle joy into every corner.', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Tree Plants', slug: 'tree-plants', description: 'Grow something lasting with sturdy trees for open spaces.', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Indoor Plants', slug: 'indoor-plants', description: 'Easy, beautiful greens made for rooms, desks and shelves.', image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Outdoor Plants', slug: 'outdoor-plants', description: 'Hardy companions for balconies, patios and gardens.', image: 'https://images.unsplash.com/photo-1599598425947-330e6a7d1b0c?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Ornamental Plants', slug: 'ornamental-plants', description: 'Distinctive foliage and form for a more considered garden.', image: 'https://images.unsplash.com/photo-1597055181300-3e7d6b5b3d2d?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Medicinal Plants', slug: 'medicinal-plants', description: 'Traditional greens for a thoughtful home garden.', image: 'https://images.unsplash.com/photo-1611909023032-2d6b313b2b5b?auto=format&fit=crop&w=1600&q=85' },
]

const img = (src: string, alt: string): ProductImage => ({ src: `${src}?auto=format&fit=crop&w=1100&q=88`, alt })

export const products: Product[] = [
  { id: 1, slug: 'mango-plant', name: 'Mango Plant', category: 'Fruit Plants', categorySlug: 'fruit-plants', description: 'A cheerful young mango plant, nurtured for a strong start in your garden or sunny balcony.', price: 250, originalPrice: 300, badge: 'Bestseller', stock: 'In Stock', rating: 4.9, reviewCount: 84, images: [img('https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73', 'Young mango plant in a nursery pot'), img('https://images.unsplash.com/photo-1485955900006-10f4d324d411', 'Healthy mango leaves'), img('https://images.unsplash.com/photo-1463320726281-696a485928c7', 'Mango tree foliage')], info: [{ label: 'Plant type', value: 'Fruit plant' }, { label: 'Plant height', value: '1.5–2 ft' }, { label: 'Sunlight', value: 'Bright, direct light' }, { label: 'Water requirement', value: 'Moderate' }, { label: 'Suitable for', value: 'Garden, balcony' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', labelEn: 'Sunlight Requirement', labelMr: 'सूर्यप्रकाशाची गरज', value: '6–8 hours of bright light', valueEn: '6–8 hours of bright light', valueMr: 'दररोज ६–८ तास भरपूर सूर्यप्रकाश' }, { icon: 'water', label: 'Water', labelEn: 'Watering Requirement', labelMr: 'पाणी देण्याची गरज', value: 'When the top soil feels dry', valueEn: 'When the top soil feels dry', valueMr: 'मातीचा वरचा थर कोरडा झाल्यावर पाणी द्यावे' }, { icon: 'soil', label: 'Soil', labelEn: 'Soil Requirement', labelMr: 'मातीची गरज', value: 'Well-draining, fertile mix', valueEn: 'Well-draining, fertile mix', valueMr: 'पाण्याचा योग्य निचरा होणारी सेंद्रिय माती' }] },
  { id: 2, slug: 'monstera-deliciosa', name: 'Monstera Deliciosa', category: 'Indoor Plants', categorySlug: 'indoor-plants', description: 'A sculptural indoor favourite with generous leaves that bring instant character to a room.', price: 499, originalPrice: 699, badge: 'Bestseller', stock: 'In Stock', rating: 4.8, reviewCount: 126, images: [img('https://images.unsplash.com/photo-1509423350716-97f9360b4e09', 'Monstera deliciosa plant indoors'), img('https://images.unsplash.com/photo-1485955900006-10f4d324d411', 'Close view of monstera leaves')], info: [{ label: 'Plant type', value: 'Indoor foliage' }, { label: 'Plant height', value: '1–2 ft' }, { label: 'Sunlight', value: 'Bright, indirect light' }, { label: 'Water requirement', value: 'Moderate' }, { label: 'Suitable for', value: 'Home, office' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Bright, indirect light' }, { icon: 'water', label: 'Water', value: 'Weekly, less in winter' }, { icon: 'soil', label: 'Soil', value: 'Airy, well-draining mix' }] },
  { id: 3, slug: 'peace-lily', name: 'Peace Lily', category: 'Flower Plants', categorySlug: 'flower-plants', description: 'Soft white blooms and rich green leaves make this an easy, elegant addition to your home.', price: 349, badge: 'Easy care', stock: 'In Stock', rating: 4.7, reviewCount: 62, images: [img('https://images.unsplash.com/photo-1593691509543-c55fb32e5cee', 'Peace lily with white flowers'), img('https://images.unsplash.com/photo-1497250681960-ef046c08a56e', 'Peace lily in a ceramic pot')], info: [{ label: 'Plant type', value: 'Flowering indoor plant' }, { label: 'Plant height', value: '1–1.5 ft' }, { label: 'Sunlight', value: 'Low to medium indirect' }, { label: 'Water requirement', value: 'Regular' }, { label: 'Suitable for', value: 'Home, office' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Soft, indirect light' }, { icon: 'water', label: 'Water', value: 'Keep soil lightly moist' }, { icon: 'soil', label: 'Soil', value: 'Rich, moisture-retentive mix' }] },
  { id: 4, slug: 'fiddle-leaf-fig', name: 'Fiddle Leaf Fig', category: 'Indoor Plants', categorySlug: 'indoor-plants', description: 'A statement plant with broad, glossy leaves for a quiet, architectural corner.', price: 899, originalPrice: 1099, badge: 'New arrival', stock: 'Low Stock', rating: 4.6, reviewCount: 31, images: [img('https://images.unsplash.com/photo-1463320726281-696a485928c7', 'Fiddle leaf fig plant'), img('https://images.unsplash.com/photo-1509423350716-97f9360b4e09', 'Fiddle leaf fig leaves')], info: [{ label: 'Plant type', value: 'Indoor foliage' }, { label: 'Plant height', value: '2–3 ft' }, { label: 'Sunlight', value: 'Bright, indirect light' }, { label: 'Water requirement', value: 'Moderate' }, { label: 'Suitable for', value: 'Living room, office' }, { label: 'Availability', value: 'Limited stock' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Bright, filtered light' }, { icon: 'water', label: 'Water', value: 'When soil is dry on top' }, { icon: 'soil', label: 'Soil', value: 'Loose, well-draining mix' }] },
  { id: 5, slug: 'snake-plant', name: 'Snake Plant', category: 'Indoor Plants', categorySlug: 'indoor-plants', description: 'A resilient, upright plant that is happy on a desk, shelf or sunny floor.', price: 299, badge: 'Easy care', stock: 'In Stock', rating: 4.9, reviewCount: 98, images: [img('https://images.unsplash.com/photo-1599598425947-330e6a7d1b0c', 'Snake plant in a pot'), img('https://images.unsplash.com/photo-1509423350716-97f9360b4e09', 'Snake plant foliage')], info: [{ label: 'Plant type', value: 'Indoor foliage' }, { label: 'Plant height', value: '1–1.5 ft' }, { label: 'Sunlight', value: 'Low to bright indirect' }, { label: 'Water requirement', value: 'Low' }, { label: 'Suitable for', value: 'Desk, shelf, home' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Low to bright indirect light' }, { icon: 'water', label: 'Water', value: 'Allow soil to fully dry' }, { icon: 'soil', label: 'Soil', value: 'Cactus or sandy mix' }] },
  { id: 6, slug: 'bougainvillea', name: 'Bougainvillea', category: 'Flower Plants', categorySlug: 'flower-plants', description: 'A sun-loving flowering plant with lively colour for balconies and garden walls.', price: 425, originalPrice: 499, badge: 'Seasonal', stock: 'In Stock', rating: 4.8, reviewCount: 45, images: [img('https://images.unsplash.com/photo-1497250681960-ef046c08a56e', 'Bougainvillea flowering plant'), img('https://images.unsplash.com/photo-1593691509543-c55fb32e5cee', 'Pink bougainvillea flowers')], info: [{ label: 'Plant type', value: 'Flowering outdoor' }, { label: 'Plant height', value: '1–2 ft' }, { label: 'Sunlight', value: 'Full sun' }, { label: 'Water requirement', value: 'Moderate' }, { label: 'Suitable for', value: 'Balcony, garden' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'At least 6 hours of sun' }, { icon: 'water', label: 'Water', value: 'Deeply, when soil dries' }, { icon: 'soil', label: 'Soil', value: 'Sandy, well-draining soil' }] },
  { id: 7, slug: 'neem-tree', name: 'Neem Tree', category: 'Tree Plants', categorySlug: 'tree-plants', description: 'A young neem tree for open gardens, nurtured with patience and room to grow.', price: 325, badge: 'Native pick', stock: 'In Stock', rating: 4.8, reviewCount: 27, images: [img('https://images.unsplash.com/photo-1463320726281-696a485928c7', 'Young tree in a garden'), img('https://images.unsplash.com/photo-1485955900006-10f4d324d411', 'Green tree canopy')], info: [{ label: 'Plant type', value: 'Tree plant' }, { label: 'Plant height', value: '2–3 ft' }, { label: 'Sunlight', value: 'Full sun' }, { label: 'Water requirement', value: 'Moderate' }, { label: 'Suitable for', value: 'Garden, farm' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Full sun outdoors' }, { icon: 'water', label: 'Water', value: 'Regular while establishing' }, { icon: 'soil', label: 'Soil', value: 'Fertile garden soil' }] },
  { id: 8, slug: 'tulsi-plant', name: 'Tulsi Plant', category: 'Medicinal Plants', categorySlug: 'medicinal-plants', description: 'A fragrant, familiar green for a balcony, window or small home garden.', price: 149, badge: 'Everyday favourite', stock: 'In Stock', rating: 4.9, reviewCount: 112, images: [img('https://images.unsplash.com/photo-1611909023032-2d6b313b2b5b', 'Tulsi plant in a terracotta pot'), img('https://images.unsplash.com/photo-1604848698030-c434ba08ece1', 'Fresh herb leaves')], info: [{ label: 'Plant type', value: 'Herb plant' }, { label: 'Plant height', value: '0.5–1 ft' }, { label: 'Sunlight', value: 'Bright morning light' }, { label: 'Water requirement', value: 'Regular' }, { label: 'Suitable for', value: 'Balcony, windowsill' }, { label: 'Availability', value: 'Ready to dispatch' }], care: [{ icon: 'sun', label: 'Sunlight', value: 'Bright morning sunlight' }, { icon: 'water', label: 'Water', value: 'Keep soil lightly moist' }, { icon: 'soil', label: 'Soil', value: 'Rich, organic mix' }] },
]

export const getProduct = (slug: string) => products.find((product) => product.slug === slug)
export const getCategory = (slug: string) => categoryList.find((category) => category.slug === slug)
export const getCategoryProducts = (slug: string) => products.filter((product) => product.categorySlug === slug)

export const heroImage = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=90'
export const productImage = img

export default products
