'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, X, AlertCircle, Loader2, UploadCloud } from 'lucide-react'
import { AdminLayout, SectionCard, StatusBadge, buttonClass } from '@/components/admin'
import { adminApi, type AdminCategory } from '@/services/adminService'
import { ConfirmDialog, SuccessFeedback } from '@/components/api-states'
import { formatMediaUrl } from '@/types/product'

type Draft = {
  id?: number
  nameEn: string
  nameMr: string
  name: string
  slug: string
  descriptionEn: string
  descriptionMr: string
  description: string
  image: string
  status: AdminCategory['status']
  productCount: number
}

const blank: Draft = { nameEn: '', nameMr: '', name: '', slug: '', descriptionEn: '', descriptionMr: '', description: '', image: '', status: 'ACTIVE', productCount: 0 }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [remove, setRemove] = useState<AdminCategory | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleCategoryImageFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files (.jpg, .png, .webp) are allowed.')
      return
    }
    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image file size must be under ${MAX_MB}MB.`)
      return
    }

    const localPreviewUrl = URL.createObjectURL(file)
    setDraft((prev) => (prev ? { ...prev, image: localPreviewUrl } : null))

    try {
      setError(null)
      setUploadingImage(true)
      const uploadedUrl = await adminApi.uploadMediaFile(file)
      try { URL.revokeObjectURL(localPreviewUrl) } catch {}
      setDraft((prev) => (prev ? { ...prev, image: uploadedUrl } : null))
    } catch (err: any) {
      setError(err.message || 'Failed to upload category image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleClearImage = () => {
    if (draft?.image?.startsWith('blob:')) {
      try { URL.revokeObjectURL(draft.image) } catch {}
    }
    setDraft((prev) => (prev ? { ...prev, image: '' } : null))
  }

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catList, prodList] = await Promise.all([
        adminApi.categories.list(),
        adminApi.products.list(),
      ])

      const merged = catList.map((c) => {
        const count = prodList.filter(
          (p) =>
            p.category === c.name ||
            p.categoryEn === c.nameEn ||
            p.category.toLowerCase().replace(/\s+/g, '-') === c.slug ||
            p.category.toLowerCase().replace(/_/g, '-') === c.slug.replace(/_/g, '-')
        ).length
        return { ...c, productCount: count }
      })

      setCategories(merged)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    window.addEventListener('pragati-catalog-changed', loadCategories)
    return () => window.removeEventListener('pragati-catalog-changed', loadCategories)
  }, [])

  const save = async () => {
    if (!draft) return
    const nameEn = draft.nameEn.trim() || draft.name.trim()
    const nameMr = draft.nameMr.trim()
    const slug = draft.slug.trim()

    if (!nameEn) {
      setError('Category Name (English) is required.')
      return
    }

    if (!draft.id && !nameMr) {
      setError('Category Name (Marathi) is required for new categories.')
      return
    }

    if (!slug) {
      setError('Category Slug is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...draft,
        nameEn,
        nameMr,
        name: nameEn,
        descriptionEn: draft.descriptionEn.trim() || draft.description.trim(),
        descriptionMr: draft.descriptionMr.trim(),
        description: draft.descriptionEn.trim() || draft.description.trim(),
        slug,
      }
      if (draft.id) {
        await adminApi.categories.update(draft.id, payload)
      } else {
        await adminApi.categories.create(payload)
      }
      setDraft(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      await loadCategories()
    } catch (err: any) {
      setError(err.message || 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!remove) return
    setError(null)
    try {
      await adminApi.categories.remove(remove.id)
      setRemove(null)
      await loadCategories()
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.')
      setRemove(null)
    }
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Organize the catalog so customers can discover plants easily."
      action={
        <button onClick={() => setDraft({ ...blank })} className={buttonClass}>
          <Plus className="size-4" /> Add Category
        </button>
      }
    >
      {saved && <SuccessFeedback>Category changes saved successfully to backend.</SuccessFeedback>}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
          <button onClick={loadCategories} className="ml-auto underline font-semibold">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Loading categories from server...</p>
        </div>
      ) : (
        <SectionCard title={`${categories.length} Catalog categories`}>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="overflow-hidden rounded-2xl border bg-background">
                <img src={formatMediaUrl(category.image)} alt={`${category.name} category`} className="h-32 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{category.nameEn || category.name}</h3>
                      {category.nameMr && (
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">{category.nameMr}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">/{category.slug}</p>
                    </div>
                    <StatusBadge status={category.status} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{category.descriptionEn || category.description}</p>
                  {category.descriptionMr && (
                    <p className="mt-1 line-clamp-2 text-xs text-emerald-800/80 dark:text-emerald-300/80">{category.descriptionMr}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">{category.productCount} products</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.slug}`}
                        className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
                      >
                        Manage Plants
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDraft({
                            id: category.id,
                            nameEn: category.nameEn || category.name || '',
                            nameMr: category.nameMr || '',
                            name: category.name || category.nameEn || '',
                            slug: category.slug,
                            descriptionEn: category.descriptionEn || category.description || '',
                            descriptionMr: category.descriptionMr || '',
                            description: category.description || category.descriptionEn || '',
                            image: category.image || '',
                            status: category.status,
                            productCount: category.productCount,
                          })}
                          className="rounded-lg p-2 hover:bg-muted"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setRemove(category)}
                          className="rounded-lg p-2 text-destructive hover:bg-muted"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {draft && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{draft.id ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setDraft(null)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              {/* ENGLISH SECTION */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">ENGLISH</h4>
                <div className="grid gap-3">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Category Name (English) *
                    <input
                      value={draft.nameEn}
                      onChange={(e) => {
                        const newName = e.target.value
                        setDraft({
                          ...draft,
                          nameEn: newName,
                          name: newName,
                          slug: !draft.id && !draft.slug ? newName.toLowerCase().replace(/\s+/g, '-') : draft.slug,
                        })
                      }}
                      placeholder="e.g. Indoor Plants"
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Description (English)
                    <textarea
                      value={draft.descriptionEn}
                      onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value, description: e.target.value })}
                      placeholder="e.g. Plants suitable for indoor spaces"
                      rows={2}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>

              {/* MARATHI SECTION */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3">MARATHI (मराठी)</h4>
                <div className="grid gap-3">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Category Name (Marathi) {draft.id ? '' : '*'}
                    <input
                      value={draft.nameMr}
                      onChange={(e) => setDraft({ ...draft, nameMr: e.target.value })}
                      placeholder="उदा. घरातील रोपे"
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Description (Marathi)
                    <textarea
                      value={draft.descriptionMr}
                      onChange={(e) => setDraft({ ...draft, descriptionMr: e.target.value })}
                      placeholder="उदा. घरामध्ये ठेवण्यासाठी योग्य रोपे"
                      rows={2}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Slug *
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                />
              </label>
              <div className="grid gap-2 text-sm font-medium">
                <label>Category Image</label>
                {draft.image && (
                  <div className="relative aspect-video max-h-48 overflow-hidden rounded-xl border bg-muted">
                    <img src={formatMediaUrl(draft.image)} alt="Category preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute right-2 top-2 z-20 rounded-full bg-background/80 p-1.5 text-foreground hover:bg-background hover:text-destructive transition shadow-xs"
                      aria-label="Remove category image"
                      title="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer rounded-xl border bg-muted px-4 py-2.5 text-xs font-semibold hover:bg-muted/80 inline-flex items-center justify-center gap-2">
                  <UploadCloud className="size-4 text-primary" />
                  {uploadingImage ? 'Uploading image...' : 'Choose Local Image File'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingImage}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCategoryImageFileSelect(file)
                    }}
                  />
                </label>
                <input
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  placeholder="Or enter image URL (https://… or /uploads/…)"
                  className="rounded-xl border bg-background px-3 py-2.5 text-xs font-normal"
                />
              </div>
              <label className="flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-medium">
                Active
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft['status'] })}
                  className="rounded-lg border bg-background px-2 py-1"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive / archived</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDraft(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold" disabled={saving}>
                Cancel
              </button>
              <button onClick={save} className={buttonClass} disabled={saving}>
                {saving ? 'Saving...' : 'Save category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {remove && (
        <ConfirmDialog
          title="Delete this category?"
          description={`Are you sure you want to delete ${remove.name}? This will update the server database.`}
          onCancel={() => setRemove(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AdminLayout>
  )
}
