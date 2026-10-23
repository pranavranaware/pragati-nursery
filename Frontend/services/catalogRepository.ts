import { fetchApi } from '@/lib/apiClient'
import { categoryList, formatMediaUrl, normalizeImages, products as seedProducts, type Category, type Product } from '@/types/product'

export const PRODUCTS_STORAGE_KEY = 'pragati-products-v1'
export const CATEGORIES_STORAGE_KEY = 'pragati-categories-v1'
export const CATALOG_CHANGED_EVENT = 'pragati-catalog-changed'

const browser = () => typeof window !== 'undefined'
export const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const emit = () => {
  if (browser()) {
    window.dispatchEvent(new Event(CATALOG_CHANGED_EVENT))
    window.dispatchEvent(new Event('pragati-products-changed'))
  }
}

const statusFor = (quantity: number): Product['stock'] =>
  quantity <= 0 ? 'Out of Stock' : quantity <= 5 ? 'Low Stock' : 'In Stock'
const stockStatusFor = (quantity: number): Product['stockStatus'] =>
  quantity <= 0 ? 'OUT_OF_STOCK' : quantity <= 5 ? 'LOW_STOCK' : 'IN_STOCK'

export function mapBackendProduct(bp: any): Product {
  const quantity = bp.stockQuantity ?? (bp.stockStatus === 'OUT_OF_STOCK' ? 0 : bp.stockStatus === 'LOW_STOCK' ? 5 : 24)
  const catObj = typeof bp.category === 'object' && bp.category !== null ? bp.category : null
  const categoryName = catObj ? (catObj.nameEn || catObj.name) : (bp.category || 'All Plants')
  const categorySlug = catObj ? catObj.slug : (bp.categorySlug || 'all-plants')
  const categoryEn = catObj ? (catObj.nameEn || catObj.name) : (bp.categoryEn || categoryName)
  const categoryMr = catObj ? (catObj.nameMr || '') : (bp.categoryMr || '')

  const rawImages = Array.isArray(bp.images) ? bp.images : []
  const mappedImages = rawImages.map((img: any, idx: number) => ({
    id: String(img.id || `image-${idx + 1}`),
    src: formatMediaUrl(img.src || img.url || ''),
    url: formatMediaUrl(img.src || img.url || ''),
    alt: img.alt || bp.nameEn || bp.name || 'Plant image',
    primary: Boolean(img.primary || img.isPrimary),
    isPrimary: Boolean(img.primary || img.isPrimary),
    sortOrder: img.sortOrder ?? idx,
  }))

  const normalizedImgs = normalizeImages({ images: mappedImages, name: bp.nameEn || bp.name })

  return {
    id: Number(bp.id),
    sku: bp.sku || '',
    slug: bp.slug || slugify(bp.nameEn || bp.name || ''),
    nameEn: bp.nameEn || bp.name || '',
    nameMr: bp.nameMr || '',
    name: bp.name || bp.nameEn || '',
    categoryEn,
    categoryMr,
    category: categoryName,
    categorySlug,
    descriptionEn: bp.descriptionEn || bp.description || '',
    descriptionMr: bp.descriptionMr || '',
    description: bp.description || bp.descriptionEn || '',
    price: Number(bp.price) || 0,
    originalPrice: bp.originalPrice ? Number(bp.originalPrice) : undefined,
    badge: bp.badge || undefined,
    stock: statusFor(quantity),
    stockQuantity: quantity,
    stockStatus: stockStatusFor(quantity),
    active: bp.active ?? true,
    rating: bp.rating ? Number(bp.rating) : 4.8,
    reviewCount: bp.reviewCount ? Number(bp.reviewCount) : 42,
    images: normalizedImgs.length ? normalizedImgs : normalizeImages({ image: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73', name: bp.nameEn || bp.name }),
    video: bp.video && bp.video.source && bp.video.source !== 'NONE' ? {
      source: bp.video.source,
      url: formatMediaUrl(bp.video.url),
      thumbnail: bp.video.thumbnail ? formatMediaUrl(bp.video.thumbnail) : undefined,
    } : undefined,
    videoUrl: formatMediaUrl(bp.video?.url || bp.videoUrl),
    info: Array.isArray(bp.info) ? bp.info : [{ label: 'Plant type', value: categoryName }],
    care: Array.isArray(bp.care) ? bp.care.map((item: any) => ({
      id: item.id,
      icon: (item.icon ? String(item.icon).toLowerCase() : 'sun') as 'sun' | 'water' | 'soil',
      label: item.labelEn || item.label || 'Care',
      labelEn: item.labelEn || item.label || '',
      labelMr: item.labelMr || '',
      value: item.valueEn || item.value || '',
      valueEn: item.valueEn || item.value || '',
      valueMr: item.valueMr || '',
    })) : [{ icon: 'sun', label: 'Sunlight', labelEn: 'Sunlight Requirement', value: 'Bright indirect light', valueEn: 'Bright indirect light' }],
  }
}

export function mapBackendCategory(bc: any): Category & { id?: number } {
  const rawImage = bc.image || 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=85'
  return {
    id: bc.id,
    nameEn: bc.nameEn || bc.name || '',
    nameMr: bc.nameMr || '',
    name: bc.name || bc.nameEn || '',
    slug: bc.slug,
    descriptionEn: bc.descriptionEn || bc.description || '',
    descriptionMr: bc.descriptionMr || '',
    description: bc.description || bc.descriptionEn || '',
    image: formatMediaUrl(rawImage),
    status: bc.status,
    productCount: bc.productCount,
  }
}

export const catalogRepository = {
  async fetchAllProducts(): Promise<Product[]> {
    try {
      const res = await fetchApi<any>('/products?size=100')
      const items = Array.isArray(res) ? res : res?.content || []
      if (Array.isArray(items)) {
        return items.map(mapBackendProduct)
      }
    } catch (err) {
      console.warn('API product fetch error:', err)
    }
    return []
  },

  async fetchProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetchApi<any>(`/products/${slug}`)
      if (res) return mapBackendProduct(res)
    } catch {
      // 404 or network error
    }
    return null
  },

  async fetchAllCategories(): Promise<(Category & { id?: number })[]> {
    try {
      const res = await fetchApi<any>('/categories')
      const items = Array.isArray(res) ? res : res?.content || []
      if (Array.isArray(items)) {
        return items.map(mapBackendCategory)
      }
    } catch (err) {
      console.warn('API category fetch error:', err)
    }
    return []
  },

  // Synchronous sync helpers for existing UI components
  getAllProducts(): Product[] {
    return seedProducts.map(p => ({ ...p, stockQuantity: p.stockQuantity ?? 20 }))
  },
  getProductById(id: number): Product | undefined {
    return this.getAllProducts().find((product) => product.id === id)
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getAllProducts().find((product) => product.slug === slug)
  },
  createProduct(input: Partial<Product>): Product {
    emit()
    return input as Product
  },
  updateProduct(id: number, input: Partial<Product>): Product {
    emit()
    return { ...input, id } as Product
  },
  deleteProduct(id: number): Product[] {
    emit()
    return this.getAllProducts().filter(p => p.id !== id)
  },
  getAllCategories(): Category[] {
    return categoryList.slice(1)
  },
  getCategoryBySlug(slug: string): Category | undefined {
    return categoryList.find(c => c.slug === slug)
  },
  async createCategory(category: Category): Promise<Category> {
    const nameEn = category.nameEn || category.name || ''
    const res = await fetchApi<any>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({
        nameEn,
        nameMr: category.nameMr || '',
        name: nameEn,
        slug: category.slug,
        descriptionEn: category.descriptionEn || category.description || '',
        descriptionMr: category.descriptionMr || '',
        description: category.descriptionEn || category.description || '',
        image: category.image,
        status: 'ACTIVE',
      }),
    })
    emit()
    return mapBackendCategory(res)
  },
  async updateCategory(idOrSlug: number | string, category: Category): Promise<Category> {
    let id = typeof idOrSlug === 'number' ? idOrSlug : undefined
    if (!id) {
      const list = await this.fetchAllCategories()
      const found = list.find((c) => c.slug === idOrSlug || c.name === idOrSlug)
      id = found?.id
    }
    const nameEn = category.nameEn || category.name
    const res = await fetchApi<any>(`/admin/categories/${id || idOrSlug}`, {
      method: 'PUT',
      body: JSON.stringify({
        nameEn,
        nameMr: category.nameMr,
        name: nameEn,
        slug: category.slug,
        descriptionEn: category.descriptionEn || category.description,
        descriptionMr: category.descriptionMr,
        description: category.descriptionEn || category.description,
        image: category.image,
        status: 'ACTIVE',
      }),
    })
    emit()
    return mapBackendCategory(res)
  },
  async deleteCategory(idOrSlug: number | string): Promise<Category[]> {
    let id = typeof idOrSlug === 'number' ? idOrSlug : undefined
    if (!id) {
      const list = await this.fetchAllCategories()
      const found = list.find((c) => c.slug === idOrSlug || c.name === idOrSlug)
      id = found?.id
    }
    if (id) {
      await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' })
    }
    emit()
    return await this.fetchAllCategories()
  },
}

export default catalogRepository
