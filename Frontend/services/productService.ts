import { fetchApi } from '@/lib/apiClient'
import { catalogRepository, mapBackendProduct, slugify } from '@/services/catalogRepository'
import { categoryService as canonicalCategoryService } from '@/services/categoryService'
import type { Product } from '@/types/product'

export { slugify }

export const productService = {
  async getProducts(params?: { search?: string; category?: string; sort?: string; page?: number; size?: number }): Promise<Product[]> {
    try {
      const query = new URLSearchParams()
      if (params?.search) query.append('search', params.search)
      if (params?.category && params.category !== 'all-plants') query.append('category', params.category)
      if (params?.sort) query.append('sort', params.sort)
      if (params?.page !== undefined) query.append('page', String(params.page))
      query.append('size', String(params?.size || 100))

      const res = await fetchApi<any>(`/products?${query.toString()}`)
      const raw = res?.data ?? res
      const items = raw?.content || (Array.isArray(raw) ? raw : [])
      if (Array.isArray(items)) {
        return items.map(mapBackendProduct)
      }
    } catch (err) {
      console.warn('API getProducts error:', err)
    }
    return []
  },

  async getProductById(id: number): Promise<Product | undefined> {
    try {
      const res = await fetchApi<any>(`/admin/products/${id}`)
      const data = res?.data ?? res
      if (data && data.name) return mapBackendProduct(data)
    } catch {
      // 404 or network error
    }
    return undefined
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const res = await fetchApi<any>(`/products/${slug}`)
      const data = res?.data ?? res
      if (data) return mapBackendProduct(data)
    } catch {
      // 404 or network error
    }
    return undefined
  },

  async createProduct(input: Partial<Product> & { categoryId?: number }): Promise<Product> {
    const nameEn = input.nameEn || input.name || ''
    const slug = slugify(input.slug || nameEn || 'plant')
    const payload = {
      sku: input.sku || `PN-${Date.now().toString().slice(-6)}`,
      slug,
      nameEn,
      nameMr: input.nameMr || '',
      name: nameEn,
      categoryId: input.categoryId || 1,
      descriptionEn: input.descriptionEn || input.description || '',
      descriptionMr: input.descriptionMr || '',
      description: input.descriptionEn || input.description || '',
      price: input.price,
      originalPrice: input.originalPrice,
      badge: input.badge,
      stockQuantity: input.stockQuantity ?? (input.stock === 'Out of Stock' ? 0 : input.stock === 'Low Stock' ? 5 : 20),
      active: input.active ?? true,
      images: input.images?.map((img, i) => ({
        src: img.src || img.url,
        alt: img.alt || nameEn,
        primary: i === 0,
        sortOrder: i,
      })) || [{ src: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73', alt: nameEn, primary: true, sortOrder: 0 }],
      video: input.video?.source !== 'NONE' ? input.video : null,
      info: input.info || [],
      care: input.care?.map(c => ({ ...c, icon: c.icon.toUpperCase() })) || [],
    }

    const res = await fetchApi<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = res?.data ?? res
    return mapBackendProduct(data)
  },

  async updateProduct(id: number, input: Partial<Product> & { categoryId?: number }): Promise<Product> {
    const nameEn = input.nameEn || input.name
    const payload = {
      sku: input.sku,
      slug: input.slug ? slugify(input.slug) : undefined,
      nameEn,
      nameMr: input.nameMr,
      name: nameEn,
      categoryId: input.categoryId,
      descriptionEn: input.descriptionEn || input.description,
      descriptionMr: input.descriptionMr,
      description: input.descriptionEn || input.description,
      price: input.price,
      originalPrice: input.originalPrice,
      badge: input.badge,
      stockQuantity: input.stockQuantity,
      active: input.active,
      images: input.images?.map((img, i) => ({
        src: img.src || img.url,
        alt: img.alt || nameEn || 'Plant',
        primary: i === 0,
        sortOrder: i,
      })),
      video: input.video?.source !== 'NONE' ? input.video : null,
      info: input.info,
      care: input.care?.map(c => ({ ...c, icon: c.icon.toUpperCase() })),
    }

    const res = await fetchApi<any>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    const data = res?.data ?? res
    return mapBackendProduct(data)
  },

  async deleteProduct(id: number): Promise<void> {
    await fetchApi(`/admin/products/${id}`, { method: 'DELETE' })
  },

  reset: () => catalogRepository.getAllProducts(),
}

export const categoryService = {
  getCategories: () => canonicalCategoryService.getAll().map((category) => ({
    ...category,
    productCount: catalogRepository.getAllProducts().filter((product) => product.categorySlug === category.slug).length,
  })),
}

export const productEvents = {
  emit: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pragati-products-changed'))
    }
  },
}

export { PRODUCTS_STORAGE_KEY } from '@/services/catalogRepository'
export default productService
