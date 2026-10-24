'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, Save, Trash2, Video, UploadCloud } from 'lucide-react'
import { adminCategories, type AdminProduct, type AdminCategory } from '@/data/admin'
import { productEvents, productService, slugify } from '@/services/productService'
import { adminApi } from '@/services/adminService'
import { formatMediaUrl, normalizeImages, type ProductImage, type ProductVideo, type ProductCareItem } from '@/types/product'
import { SuccessFeedback } from '@/components/api-states'

type EditableProduct = AdminProduct & { images?: ProductImage[]; video?: ProductVideo; care?: ProductCareItem[] }

const validUrl = (value: string) => {
  if (!value) return false
  if (value.startsWith('blob:')) return false
  if (value.startsWith('/uploads/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProductForm({ product, initialCategory, returnTo = '/admin/products' }: { product?: EditableProduct; initialCategory?: string; returnTo?: string }) {
  const router = useRouter()
  const existing = product
    ? normalizeImages({ ...product, stock: product.stock <= 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock' })
    : []
  const [sku, setSku] = useState(product?.sku || '')
  const [nameEn, setNameEn] = useState(product?.nameEn || product?.name || '')
  const [nameMr, setNameMr] = useState(product?.nameMr || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [category, setCategory] = useState(product?.category || initialCategory || adminCategories[0]?.name || 'Indoor Plants')
  const [descriptionEn, setDescriptionEn] = useState(product?.descriptionEn || product?.description || '')
  const [descriptionMr, setDescriptionMr] = useState(product?.descriptionMr || '')
  const [price, setPrice] = useState(String(product?.price || ''))
  const [stock, setStock] = useState(String(product ? product.stock : 20))
  const [images, setImages] = useState<ProductImage[]>(existing)
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const [primaryIndex, setPrimaryIndex] = useState(Math.max(0, existing.findIndex((item) => item.primary || item.isPrimary)))
  const [videoType, setVideoType] = useState<ProductVideo['source']>(product?.video?.source || 'NONE')
  const [videoUrl, setVideoUrl] = useState(product?.video?.url || '')
  const [videoPreview, setVideoPreview] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const [categories, setCategories] = useState<AdminCategory[]>(adminCategories)

  useEffect(() => {
    adminApi.categories.list().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setCategories(list)
        if (initialCategory) {
          const matched = list.find((c) =>
            c.slug.toLowerCase() === initialCategory.toLowerCase() ||
            c.name.toLowerCase() === initialCategory.toLowerCase() ||
            String(c.id) === String(initialCategory)
          )
          if (matched) setCategory(matched.name)
        }
      }
    }).catch(() => {})
  }, [initialCategory])

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        if (url?.startsWith('blob:')) {
          try { URL.revokeObjectURL(url) } catch {}
        }
      })
      if (videoPreview?.startsWith('blob:')) {
        try { URL.revokeObjectURL(videoPreview) } catch {}
      }
    }
  }, [imagePreviews, videoPreview])

  const getCareItem = (icon: 'sun' | 'water' | 'soil') => {
    return product?.care?.find((c) => c.icon === icon || c.label?.toLowerCase() === icon.toLowerCase() || (icon === 'sun' && c.label?.toLowerCase().includes('sun')) || (icon === 'water' && c.label?.toLowerCase().includes('water')) || (icon === 'soil' && c.label?.toLowerCase().includes('soil')))
  }

  const sunItem = getCareItem('sun')
  const waterItem = getCareItem('water')
  const soilItem = getCareItem('soil')

  const [sunlightEn, setSunlightEn] = useState(sunItem?.valueEn || sunItem?.value || '')
  const [sunlightMr, setSunlightMr] = useState(sunItem?.valueMr || '')

  const [waterEn, setWaterEn] = useState(waterItem?.valueEn || waterItem?.value || '')
  const [waterMr, setWaterMr] = useState(waterItem?.valueMr || '')

  const [soilEn, setSoilEn] = useState(soilItem?.valueEn || soilItem?.value || '')
  const [soilMr, setSoilMr] = useState(soilItem?.valueMr || '')

  const updateImage = (index: number, key: keyof ProductImage, value: string) =>
    setImages((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)))

  const addImage = () =>
    setImages((current) => [...current, { id: `image-${Date.now()}`, src: '', alt: nameEn || 'Plant image', primary: current.length === 0 }])

  const removeImage = (index: number) =>
    setImages((current) => {
      const target = current[index]
      const targetKey = target?.id || String(index)
      if (imagePreviews[targetKey]?.startsWith('blob:')) {
        try { URL.revokeObjectURL(imagePreviews[targetKey]) } catch {}
        setImagePreviews((prev) => {
          const next = { ...prev }
          delete next[targetKey]
          return next
        })
      }
      if (target?.src?.startsWith('blob:')) {
        try { URL.revokeObjectURL(target.src) } catch {}
      }
      const next = current.filter((_, i) => i !== index)
      if (next.length && !next.some((item) => item.primary)) next[0].primary = true
      return next
    })

  const setPrimary = (index: number) => {
    setPrimaryIndex(index)
    setImages((current) => current.map((item, i) => ({ ...item, primary: i === index, isPrimary: i === index })))
  }

  const moveImage = (index: number, direction: number) =>
    setImages((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const handleImageFileSelect = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image file size must be under ${MAX_MB}MB.`)
      return
    }

    const imageKey = images[index]?.id || String(index)
    if (imagePreviews[imageKey]?.startsWith('blob:')) {
      try { URL.revokeObjectURL(imagePreviews[imageKey]) } catch {}
    }

    // Set blob preview solely for on-screen display; do not set image.src
    const localPreviewUrl = URL.createObjectURL(file)
    setImagePreviews((prev) => ({ ...prev, [imageKey]: localPreviewUrl }))

    try {
      setError('')
      setUploadingIndex(index)
      const uploadedUrl = await adminApi.uploadMediaFile(file)
      try { URL.revokeObjectURL(localPreviewUrl) } catch {}
      setImagePreviews((prev) => {
        const next = { ...prev }
        delete next[imageKey]
        return next
      })
      updateImage(index, 'src', uploadedUrl)
    } catch (err: any) {
      // Clear on failure; never persist a blob: address
      try { URL.revokeObjectURL(localPreviewUrl) } catch {}
      setImagePreviews((prev) => {
        const next = { ...prev }
        delete next[imageKey]
        return next
      })
      updateImage(index, 'src', '')
      setError(err.message || 'Failed to upload image file. Please try again.')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleVideoFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      setError('Only video or image files are allowed.')
      return
    }
    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Video file size must be under ${MAX_MB}MB.`)
      return
    }

    if (videoPreview?.startsWith('blob:')) {
      try { URL.revokeObjectURL(videoPreview) } catch {}
    }

    // Set blob preview solely for on-screen display; do not set videoUrl
    const localPreviewUrl = URL.createObjectURL(file)
    setVideoPreview(localPreviewUrl)
    setVideoType('UPLOAD')

    try {
      setError('')
      setUploadingVideo(true)
      const uploadedUrl = await adminApi.uploadMediaFile(file)
      try { URL.revokeObjectURL(localPreviewUrl) } catch {}
      setVideoPreview('')
      setVideoUrl(uploadedUrl)
    } catch (err: any) {
      // Clear on failure; never persist a blob: address
      try { URL.revokeObjectURL(localPreviewUrl) } catch {}
      setVideoPreview('')
      setVideoUrl('')
      setError(err.message || 'Failed to upload video file. Please try again.')
    } finally {
      setUploadingVideo(false)
    }
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy || uploadingIndex !== null || uploadingVideo) return
    setError('')

    const clean = images.map((item) => ({ ...item, src: item.src.trim(), alt: item.alt.trim() || nameEn.trim() }))
    if (!nameEn.trim()) {
      setError('Product Name (English) is required.')
      return
    }
    if (!product && !nameMr.trim()) {
      setError('Product Name (Marathi) is required for new products.')
      return
    }
    if (Number(price) <= 0 || Number(stock) < 0) {
      setError('Enter a positive price and a valid stock quantity.')
      return
    }

    // Refuse submission if any image src starts with blob:
    if (clean.some((item) => item.src.startsWith('blob:'))) {
      setError('Cannot save product with a temporary preview image (blob:). Please wait for upload to complete or re-upload.')
      return
    }

    // Refuse submission if videoUrl starts with blob:
    if (videoUrl.trim().startsWith('blob:') || videoPreview.startsWith('blob:')) {
      setError('Cannot save product with a temporary preview video (blob:). Please wait for upload to complete or re-upload.')
      return
    }

    if (clean.length === 0 || clean.some((item) => !validUrl(item.src))) {
      setError('Every image needs a valid upload path or URL (e.g. /uploads/... or https://...).')
      return
    }

    if (videoType !== 'NONE' && videoUrl.trim()) {
      if (!validUrl(videoUrl.trim())) {
        setError(videoType === 'INSTAGRAM' ? 'Please enter a valid Instagram reel URL (https://...).' : 'Please provide a valid video URL (https://... or /uploads/...).')
        return
      }
    }

    const matchedCategory = categories.find((c) =>
      c.slug.toLowerCase() === category.toLowerCase() ||
      c.name.toLowerCase() === category.toLowerCase() ||
      String(c.id) === String(category)
    )
    const categoryId = matchedCategory ? matchedCategory.id : 1
    const categoryName = matchedCategory ? matchedCategory.name : category

    const generatedSku = sku.trim() || product?.sku || `PN-${Date.now().toString().slice(-6)}`

    const carePayload: ProductCareItem[] = []
    if (sunlightEn.trim() || sunlightMr.trim()) {
      carePayload.push({
        icon: 'sun',
        label: 'Sunlight',
        labelEn: 'Sunlight Requirement',
        labelMr: 'सूर्यप्रकाशाची गरज',
        value: sunlightEn.trim() || sunlightMr.trim(),
        valueEn: sunlightEn.trim(),
        valueMr: sunlightMr.trim(),
      })
    }
    if (waterEn.trim() || waterMr.trim()) {
      carePayload.push({
        icon: 'water',
        label: 'Watering',
        labelEn: 'Watering Requirement',
        labelMr: 'पाणी देण्याची गरज',
        value: waterEn.trim() || waterMr.trim(),
        valueEn: waterEn.trim(),
        valueMr: waterMr.trim(),
      })
    }
    if (soilEn.trim() || soilMr.trim()) {
      carePayload.push({
        icon: 'soil',
        label: 'Soil',
        labelEn: 'Soil Requirement',
        labelMr: 'मातीची गरज',
        value: soilEn.trim() || soilMr.trim(),
        valueEn: soilEn.trim(),
        valueMr: soilMr.trim(),
      })
    }

    const payload = {
      sku: generatedSku,
      nameEn: nameEn.trim(),
      nameMr: nameMr.trim(),
      name: nameEn.trim(),
      slug: slugify(slug || nameEn),
      category: categoryName,
      categoryId,
      descriptionEn: descriptionEn.trim(),
      descriptionMr: descriptionMr.trim(),
      description: descriptionEn.trim(),
      price: Number(price),
      stock: Number(stock) > 5 ? 'In Stock' as const : Number(stock) > 0 ? 'Low Stock' as const : 'Out of Stock' as const,
      stockQuantity: Number(stock),
      rating: product ? 4.8 : 4.5,
      reviewCount: product ? 1 : 0,
      images: clean.map((item, index) => ({ ...item, id: item.id || `image-${index + 1}`, primary: index === primaryIndex, isPrimary: index === primaryIndex })),
      video: videoType === 'NONE' ? undefined : { source: videoType, url: videoUrl.trim() },
      videoUrl: videoType !== 'NONE' && videoUrl.trim() ? videoUrl.trim() : undefined,
      info: [],
      care: carePayload,
    }

    try {
      setBusy(true)
      if (product) {
        await productService.updateProduct(product.id, payload)
      } else {
        await productService.createProduct(payload)
      }
      productEvents.emit()
      router.push(returnTo.startsWith('/') ? returnTo : '/admin/products')
    } catch (cause) {
      setBusy(false)
      setError(cause instanceof Error ? cause.message : 'Unable to save product.')
    }
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl">
      <Link href={returnTo} className="mb-6 inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:text-primary transition shadow-xs">
        <ArrowLeft className="size-4 text-primary" /> Back
      </Link>
      {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {product && <SuccessFeedback>Editing {product.nameEn || product.name}</SuccessFeedback>}
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-5 font-semibold">Product Information</h2>
            <div className="grid gap-5">
              {/* ENGLISH SECTION */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">ENGLISH</h4>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium">
                    Product Name (English) *
                    <input
                      required
                      value={nameEn}
                      onChange={(e) => {
                        const newName = e.target.value
                        setNameEn(newName)
                        if (!product) setSlug(slugify(newName))
                      }}
                      placeholder="e.g. Rose Plant"
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Description (English)
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Beautiful flowering plant for your garden."
                      rows={4}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>

              {/* MARATHI SECTION */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-4">MARATHI (मराठी)</h4>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium">
                    Product Name (Marathi) {product ? '' : '*'}
                    <input
                      value={nameMr}
                      onChange={(e) => setNameMr(e.target.value)}
                      placeholder="उदा. गुलाबाचे रोप"
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Description (Marathi)
                    <textarea
                      value={descriptionMr}
                      onChange={(e) => setDescriptionMr(e.target.value)}
                      placeholder="उदा. तुमच्या बागेसाठी सुंदर फुलांचे रोप."
                      rows={4}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium">
                  SKU
                  <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PN-10001" className="rounded-xl border bg-background px-3 py-2.5 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Slug
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Price (₹)
                  <input required type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 font-normal" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Category
                {!product && initialCategory ? (
                  <input
                    type="text"
                    readOnly
                    value={category}
                    className="rounded-xl border bg-muted px-3 py-2.5 font-normal cursor-not-allowed outline-none"
                  />
                ) : (
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 font-normal">
                    {categories.map((item) => (
                      <option key={item.id} value={item.name}>{item.nameEn || item.name} {item.nameMr ? `(${item.nameMr})` : ''}</option>
                    ))}
                  </select>
                )}
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Stock quantity
                <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 font-normal" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-5 font-semibold">Plant Care Guide</h2>
            <div className="grid gap-5">
              {/* ENGLISH CARE SECTION */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">ENGLISH</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium">
                    Sunlight Requirement
                    <input
                      placeholder="e.g. 6–8 hours of bright sun"
                      value={sunlightEn}
                      onChange={(e) => setSunlightEn(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Watering Requirement
                    <input
                      placeholder="e.g. Weekly, when top soil is dry"
                      value={waterEn}
                      onChange={(e) => setWaterEn(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Soil Requirement
                    <input
                      placeholder="e.g. Well-draining organic mix"
                      value={soilEn}
                      onChange={(e) => setSoilEn(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>

              {/* MARATHI CARE SECTION */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-4">MARATHI (मराठी)</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium">
                    सूर्यप्रकाशाची गरज
                    <input
                      placeholder="उदा. दररोज ६–८ तास भरपूर सूर्यप्रकाश"
                      value={sunlightMr}
                      onChange={(e) => setSunlightMr(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    पाणी देण्याची गरज
                    <input
                      placeholder="उदा. मातीचा वरचा थर कोरडा झाल्यावर"
                      value={waterMr}
                      onChange={(e) => setWaterMr(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    मातीची गरज
                    <input
                      placeholder="उदा. पाण्याचा योग्य निचरा होणारी सेंद्रिय माती"
                      value={soilMr}
                      onChange={(e) => setSoilMr(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Product Images</h2>
                <p className="mt-1 text-xs text-muted-foreground">Upload image files directly to server.</p>
              </div>
              <button type="button" onClick={addImage} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <ImagePlus className="size-3.5" />Add Image
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              {images.map((image, index) => {
                const imageKey = image.id || String(index)
                const displaySrc = imagePreviews[imageKey] || image.src
                return (
                  <div key={image.id || index} className="rounded-xl border p-3">
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                      {displaySrc && (validUrl(displaySrc) || displaySrc.startsWith('blob:')) ? (
                        <img src={formatMediaUrl(displaySrc)} alt={image.alt} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-muted-foreground">No image uploaded</span>
                      )}
                      {image.primary && (
                        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                          Primary Image
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={image.src}
                        onChange={(e) => {
                          const val = e.target.value
                          if (imagePreviews[imageKey]?.startsWith('blob:')) {
                            try { URL.revokeObjectURL(imagePreviews[imageKey]) } catch {}
                            setImagePreviews((prev) => {
                              const next = { ...prev }
                              delete next[imageKey]
                              return next
                            })
                          }
                          updateImage(index, 'src', val)
                        }}
                        placeholder="Image URL (/uploads/... or https://...)"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-xs"
                      />
                      <label className="cursor-pointer rounded-lg border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:bg-primary/90 whitespace-nowrap inline-flex items-center gap-1">
                        <UploadCloud className="size-3.5" />
                        {uploadingIndex === index ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingIndex === index}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageFileSelect(index, file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    <input value={image.alt} onChange={(e) => updateImage(index, 'alt', e.target.value)} placeholder="Alt text" className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-xs" />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setPrimary(index)} disabled={image.primary} className="rounded-full border px-2.5 py-1.5 text-[11px] font-semibold disabled:bg-muted">
                        {image.primary ? 'Primary' : 'Set primary'}
                      </button>
                      <button type="button" onClick={() => moveImage(index, -1)} className="rounded-full border p-1.5">
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} className="rounded-full border p-1.5">
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => removeImage(index)} className="ml-auto inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1.5 text-[11px] font-semibold text-destructive">
                        <Trash2 className="size-3.5" />Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <Video className="size-4 text-primary" />Product Video <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </h2>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              Video Type
              <select
                value={videoType}
                onChange={(e) => {
                  const newType = e.target.value as ProductVideo['source']
                  if (videoPreview?.startsWith('blob:')) {
                    try { URL.revokeObjectURL(videoPreview) } catch {}
                    setVideoPreview('')
                  }
                  setVideoType(newType)
                  if (newType === 'NONE') {
                    setVideoUrl('')
                  }
                }}
                className="rounded-xl border bg-background px-3 py-2.5 font-normal"
              >
                <option value="NONE">No Video</option>
                <option value="UPLOAD">Video Upload / URL</option>
                <option value="INSTAGRAM">Instagram Reel</option>
              </select>
            </label>
            {videoType !== 'NONE' && (
              <div className="mt-4 grid gap-2 text-sm font-medium">
                <label>{videoType === 'INSTAGRAM' ? 'Instagram Reel URL' : 'Video File or URL'}</label>
                <input
                  value={videoUrl}
                  onChange={(e) => {
                    const val = e.target.value
                    if (videoPreview?.startsWith('blob:')) {
                      try { URL.revokeObjectURL(videoPreview) } catch {}
                      setVideoPreview('')
                    }
                    setVideoUrl(val)
                  }}
                  placeholder={videoType === 'INSTAGRAM' ? 'https://www.instagram.com/reel/...' : '/uploads/... or https://...'}
                  className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                />
                {videoType === 'UPLOAD' && (
                  <label className="mt-2 cursor-pointer rounded-xl border bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/80 inline-flex items-center justify-center gap-2">
                    <UploadCloud className="size-4" />
                    {uploadingVideo ? 'Uploading video file...' : 'Choose Local Video File'}
                    <input
                      type="file"
                      accept="video/*,image/*"
                      disabled={uploadingVideo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleVideoFileSelect(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                )}
                {videoType === 'INSTAGRAM' && videoUrl.trim() && (
                  <div className="mt-2 rounded-xl border bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground">Instagram Reel Linked:</p>
                    <a href={videoUrl.trim()} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all mt-1 block">
                      {videoUrl.trim()}
                    </a>
                  </div>
                )}
                {videoType === 'UPLOAD' && (videoPreview || videoUrl) && (
                  <div className="mt-3 overflow-hidden rounded-xl border bg-black">
                    <video src={formatMediaUrl(videoPreview || videoUrl)} controls className="aspect-video w-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </section>

          <button disabled={busy || uploadingIndex !== null || uploadingVideo} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-60">
            <Save className="size-4" />
            {busy ? 'Saving…' : uploadingIndex !== null || uploadingVideo ? 'Uploading media…' : 'Save product'}
          </button>
        </aside>
      </div>
    </form>
  )
}
