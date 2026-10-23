import { fetchApi } from '@/lib/apiClient'
import { catalogRepository, mapBackendCategory, mapBackendProduct } from '@/services/catalogRepository'
import type { Category, Product } from '@/types/product'

export const categoryService = {
  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const res = await fetchApi<any>(`/categories/${slug}`)
      if (res) return mapBackendCategory(res)
      return null
    } catch {
      return null
    }
  },

  async products(slug: string): Promise<Product[]> {
    try {
      const res = await fetchApi<any>(`/categories/${slug}/products`)
      const items = res?.content || res || []
      if (Array.isArray(items)) {
        return items.map(mapBackendProduct)
      }
    } catch {
      // API error or empty
    }
    return []
  },

  async productCount(slug: string): Promise<number> {
    const list = await this.products(slug)
    return list.length
  },

  getAll: () => catalogRepository.getAllCategories(),
  fetchAll: async () => await catalogRepository.fetchAllCategories(),
  create: (category: Category) => catalogRepository.createCategory(category),
  update: (slug: string, category: Category) => catalogRepository.updateCategory(slug, category),
  delete: (slug: string) => catalogRepository.deleteCategory(slug),
}

export function categoryProducts(category: { slug: string }) {
  return catalogRepository.getAllProducts().filter((product) => product.categorySlug === category.slug)
}

export function deleteCategoryProduct(category: { slug: string }, productId: number) {
  return categoryProducts(category).filter((product) => product.id !== productId)
}

export default categoryService
