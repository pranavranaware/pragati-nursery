'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart-provider'
import { addressService, type BackendAddress } from '@/services/addressService'
import { createRealOrder, createRazorpayOrder, verifyRazorpayPayment } from '@/services/orderService'
import { deliveryFee, type CheckoutValues, type PaymentMethod } from '@/types/order'
import { formatPrice } from '@/types/product'
import { getAuthToken } from '@/lib/apiClient'
import { addRememberedOrderRef } from '@/lib/customerOrdersStorage'
import { pincodeService } from '@/services/pincodeService'
import { useLanguage } from '@/lib/language'

const initial: CheckoutValues = {
  fullName: '',
  mobile: '',
  email: '',
  address: '',
  area: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  landmark: '',
  paymentMethod: 'ONLINE',
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  const { items, subtotal, clear } = useCart()
  const router = useRouter()
  const [values, setValues] = useState<CheckoutValues>(initial)
  const [addresses, setAddresses] = useState<BackendAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeError, setPincodeError] = useState<string | null>(null)
  const [localities, setLocalities] = useState<string[]>([])
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: number
    orderNumber: string
    guestCheckoutToken?: string
  } | null>(null)

  const delivery = deliveryFee(subtotal)
  const isAuthenticated = Boolean(getAuthToken())

  useEffect(() => {
    const pin = (values.pincode || '').trim()
    if (!/^\d{6}$/.test(pin)) {
      setPincodeLoading((prev) => (prev ? false : prev))
      setPincodeError((prev) => (prev !== null ? null : prev))
      setLocalities((prev) => (prev.length > 0 ? [] : prev))
      return
    }

    const timer = setTimeout(async () => {
      setPincodeLoading(true)
      setPincodeError(null)
      try {
        const res = await pincodeService.lookupPincode(pin)
        if (res.success) {
          setValues((prev) => ({
            ...prev,
            state: res.state || prev.state,
            district: res.district || prev.district,
            city: res.city || prev.city,
          }))
          setLocalities(res.localities || [])
          setErrors((prev) => {
            const next = { ...prev }
            delete next.pincode
            delete next.state
            delete next.city
            return next
          })
        } else {
          setPincodeError(res.errorMessage || t('pincodeNotFound'))
          setLocalities([])
        }
      } catch (e) {
        setPincodeError(t('pincodeNotFound'))
      } finally {
        setPincodeLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [values.pincode, t])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setUseNewAddress(true)
      return
    }

    addressService
      .getAddresses()
      .then((list) => {
        setAddresses(list)
        const def = list.find((a) => a.isDefault) || list[0]
        if (def) {
          setSelectedAddressId(def.id)
          setValues((prev) => ({
            ...prev,
            fullName: def.fullName,
            mobile: def.mobile,
            email: def.email || '',
            address: def.address,
            area: def.area || '',
            city: def.city,
            district: def.district || '',
            state: def.state,
            pincode: def.pincode,
            landmark: def.landmark || '',
          }))
        } else {
          setUseNewAddress(true)
        }
      })
      .catch(() => setUseNewAddress(true))
  }, [router])

  const set = (key: keyof CheckoutValues, rawValue: string) => {
    let value = rawValue
    if (key === 'mobile') {
      value = rawValue.replace(/\D/g, '').slice(0, 10)
    } else if (key === 'email') {
      value = rawValue.trimStart()
    }

    setValues((v) => ({ ...v, [key]: value }))

    if (errors[key]) {
      let isFixed = false
      const trimmed = value.trim()
      if (key === 'fullName') isFixed = trimmed.length > 0
      else if (key === 'mobile') isFixed = /^[6-9]\d{9}$/.test(trimmed)
      else if (key === 'email') isFixed = !trimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.toLowerCase())
      else if (key === 'address') isFixed = trimmed.length > 0
      else if (key === 'city') isFixed = trimmed.length > 0
      else if (key === 'state') isFixed = trimmed.length > 0
      else if (key === 'pincode') isFixed = /^\d{6}$/.test(trimmed)

      if (isFixed) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    }
  }

  const validate = () => {
    const next: Record<string, string> = {}
    const fullName = (values.fullName || '').trim()
    const mobile = (values.mobile || '').trim()
    const email = (values.email || '').trim().toLowerCase()
    const address = (values.address || '').trim()
    const city = (values.city || '').trim()
    const state = (values.state || '').trim()
    const pincode = (values.pincode || '').trim()

    if (!fullName) {
      next.fullName = 'Please enter your full name.'
    }

    if (!mobile) {
      next.mobile = 'Please enter a valid 10-digit Indian mobile number.'
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      next.mobile = 'Please enter a valid 10-digit Indian mobile number.'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email address.'
    }

    if (!address) {
      next.address = 'Please enter your delivery address.'
    }
    if (!city) {
      next.city = 'Please enter your city.'
    }
    if (!state) {
      next.state = 'Please enter your state.'
    }
    if (!pincode) {
      next.pincode = 'Please enter a 6-digit pincode.'
    } else if (!/^\d{6}$/.test(pincode)) {
      next.pincode = 'Please enter a 6-digit pincode.'
    }

    setErrors(next)

    const errorKeys = Object.keys(next)
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0]
      const element = document.getElementById(`input-${firstKey}`)
      if (element) {
        element.focus()
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }
    return true
  }

  const submit = async () => {
    if (busy || !items.length) return

    const token = getAuthToken()
    if (useNewAddress || !selectedAddressId || !token) {
      if (!validate()) return
    }

    setBusy(true)

    try {
      let activeOrderId: number
      let activeOrderNumber: string
      let activeGuestToken: string | undefined

      const normalizedAddress = {
        fullName: (values.fullName || '').trim(),
        mobile: (values.mobile || '').trim(),
        email: (values.email || '').trim().toLowerCase(),
        address: (values.address || '').trim(),
        area: (values.area || '').trim(),
        city: (values.city || '').trim(),
        district: (values.district || '').trim(),
        state: (values.state || '').trim(),
        pincode: (values.pincode || '').trim(),
        landmark: (values.landmark || '').trim(),
      }

      // Handle ONLINE Payment Flow
      if (pendingOrder) {
        activeOrderId = pendingOrder.orderId
        activeOrderNumber = pendingOrder.orderNumber
        activeGuestToken = pendingOrder.guestCheckoutToken
      } else {
        let orderRes
        if (token) {
          let targetAddressId = selectedAddressId
          if (useNewAddress || !targetAddressId) {
            const newAddr = await addressService.createAddress({
              ...normalizedAddress,
              isDefault: true,
            })
            targetAddressId = newAddr.id
          }
          if (!targetAddressId) {
            setErrors((prev) => ({ ...prev, global: 'Please select or create a valid delivery address.' }))
            setBusy(false)
            return
          }
          orderRes = await createRealOrder({ addressId: targetAddressId, paymentMethod: values.paymentMethod })
        } else {
          const guestItems = items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          }))
          orderRes = await createRealOrder({
            paymentMethod: values.paymentMethod,
            address: normalizedAddress,
            items: guestItems,
          })
        }

        activeOrderId = orderRes.orderId
        activeOrderNumber = orderRes.orderNumber
        activeGuestToken = orderRes.guestCheckoutToken
        setPendingOrder({
          orderId: orderRes.orderId,
          orderNumber: orderRes.orderNumber,
          guestCheckoutToken: orderRes.guestCheckoutToken,
        })

        if (values.paymentMethod === 'COD') {
          if (orderRes.guestCheckoutToken) {
            addRememberedOrderRef(orderRes.orderNumber, orderRes.guestCheckoutToken)
          }
          await clear()
          sessionStorage.setItem('pragati-order-number', orderRes.orderNumber)
          router.push(`/order-success?orderNumber=${orderRes.orderNumber}`)
          return
        }
      }

      const razorpayOrder = await createRazorpayOrder(activeOrderId, activeGuestToken)
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        setErrors((prev) => ({ ...prev, global: 'Failed to load Razorpay SDK. Please check your internet connection.' }))
        setBusy(false)
        return
      }

      const options = {
        key: razorpayOrder.razorpayKeyId,
        amount: razorpayOrder.amountInPaise,
        currency: razorpayOrder.currency,
        name: 'Pragati Nursery',
        description: `Order #${razorpayOrder.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            if (activeGuestToken) {
              addRememberedOrderRef(activeOrderNumber, activeGuestToken)
            }
            await clear()
            sessionStorage.setItem('pragati-order-number', activeOrderNumber)
            setPendingOrder(null)
            router.push(`/order-success?orderNumber=${activeOrderNumber}`)
          } catch (err: any) {
            setErrors((prev) => ({ ...prev, global: err.message || 'Payment verification failed.' }))
            setBusy(false)
          }
        },
        modal: {
          ondismiss: function () {
            setBusy(false)
          },
        },
        prefill: {
          name: values.fullName.trim(),
          contact: values.mobile.trim(),
          email: values.email.trim().toLowerCase(),
        },
        theme: { color: '#2d5a27' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        setErrors((prev) => ({ ...prev, global: `Payment failed: ${resp.error.description || 'Transaction cancelled.'}` }))
        setBusy(false)
      })
      rzp.open()

    } catch (err: any) {
      setErrors((prev) => ({ ...prev, global: err.message || 'Failed to place order. Please try again.' }))
      setBusy(false)
    }
  }

  if (!items.length) {
    return (
      <main className="min-h-screen bg-background px-5 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="font-serif text-4xl">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">Add a few plants before checking out.</p>
          <Link href="/shop" className="mt-7 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Explore Plants
          </Link>
        </div>
      </main>
    )
  }

  const field = (key: keyof CheckoutValues, label: string, required = false, type = 'text') => (
    <label className="flex flex-col gap-1.5 text-sm font-medium w-full min-w-0">
      <span className="flex items-center justify-between">
        <span>
          {label} {required && <span className="text-destructive">*</span>}
        </span>
        {key === 'pincode' && pincodeLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-normal">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            {t('pincodeLoading')}
          </span>
        )}
      </span>
      <input
        id={`input-${key}`}
        type={type}
        inputMode={key === 'mobile' || key === 'pincode' ? 'numeric' : undefined}
        maxLength={key === 'mobile' ? 10 : key === 'pincode' ? 6 : undefined}
        value={String(values[key] ?? '')}
        onChange={(e) => set(key, e.target.value)}
        onBlur={() => {
          if (key === 'email' && values.email) {
            set('email', values.email.trim().toLowerCase())
          }
        }}
        className={`w-full max-w-full min-w-0 rounded-2xl border bg-background px-3.5 py-3 sm:px-4 sm:py-3.5 text-sm outline-none focus:ring-2 transition ${
          errors[key]
            ? 'border-destructive focus:ring-destructive/30'
            : 'border-border focus:ring-primary/30'
        }`}
      />
      {errors[key] && <span role="alert" className="text-xs font-normal text-destructive mt-0.5">{errors[key]}</span>}
      {key === 'pincode' && pincodeError && !errors.pincode && (
        <span role="alert" className="text-xs font-normal text-amber-600 dark:text-amber-400 mt-0.5">{pincodeError}</span>
      )}
    </label>
  )

  return (
    <main className="min-h-screen bg-background px-3.5 sm:px-5 py-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 transition shadow-xs">
          ← Back to cart
        </Link>
        <h1 className="mt-6 sm:mt-8 font-serif text-3xl sm:text-5xl">Checkout</h1>
        {errors.global && (
          <div role="alert" className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {errors.global}
          </div>
        )}

        <div className="mt-8 sm:mt-10 grid gap-8 sm:gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6 sm:gap-8">
            <section className="rounded-3xl bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl">Delivery address</h2>

              {addresses.length > 0 && !useNewAddress ? (
                <div className="mt-5 sm:mt-6 flex flex-col gap-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressSelect"
                        checked={selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id)
                          setValues((prev) => ({
                            ...prev,
                            fullName: addr.fullName,
                            mobile: addr.mobile,
                            email: addr.email || '',
                            address: addr.address,
                            area: addr.area || '',
                            city: addr.city,
                            district: addr.district || '',
                            state: addr.state,
                            pincode: addr.pincode,
                            landmark: addr.landmark || '',
                          }))
                        }}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1 break-words">
                        <span className="font-semibold">{addr.fullName}</span> ({addr.mobile})
                        {addr.isDefault && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground break-words">
                          {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(true)
                      setSelectedAddressId(null)
                      setValues((v) => ({ ...v, ...initial }))
                    }}
                    className="mt-2 text-left text-sm font-semibold text-primary"
                  >
                    + Add a new delivery address
                  </button>
                </div>
              ) : (
                <div className="mt-5 sm:mt-6 grid gap-4 sm:grid-cols-2">
                  {field('fullName', 'Full name', true)}
                  {field('mobile', 'Mobile number', true, 'tel')}
                  {field('email', 'Email address', false, 'email')}
                  {field('address', 'Address', true)}
                  {field('pincode', 'Pincode', true, 'text')}
                  {field('state', 'State', true)}
                  {field('district', 'District')}
                  {field('city', 'City', true)}
                  <div className="flex flex-col gap-1.5 w-full min-w-0 sm:col-span-2">
                    {field('area', 'Area / Locality')}
                    {localities.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground w-full sm:w-auto">{t('selectLocality')}:</span>
                        {localities.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => set('area', loc)}
                            className={`rounded-full px-2.5 py-1 text-xs transition border ${
                              values.area === loc
                                ? 'bg-primary text-primary-foreground border-primary font-medium'
                                : 'bg-card text-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {field('landmark', 'Landmark')}

                  {addresses.length > 0 && (
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUseNewAddress(false)
                          if (addresses.length > 0) setSelectedAddressId(addresses[0].id)
                        }}
                        className="text-sm font-semibold text-primary"
                      >
                        ← Choose from saved addresses
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl">Payment method</h2>
              <div className="mt-5 grid gap-3">
                <PaymentOption
                  value="ONLINE"
                  selected={values.paymentMethod}
                  set={(v) => set('paymentMethod', v)}
                  title="Online Payment (Razorpay)"
                  description="Pay securely using UPI, Google Pay, Credit/Debit cards, or net banking."
                />
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-card p-4 sm:p-6">
            <h2 className="font-serif text-xl sm:text-2xl">{t('orderSummary')}</h2>
            <div className="mt-5 sm:mt-6 flex flex-col gap-3.5 sm:gap-4 text-sm">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between gap-3">
                  <span className="min-w-0 flex-1 break-words">
                    {i.product.name} × {i.quantity}
                  </span>
                  <span className="shrink-0 font-semibold">{formatPrice(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span>{t('deliveryCharges')}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{t('deliveryToBeDetermined')}</span>
                </div>
                <div className="mt-4 flex justify-between text-base font-semibold">
                  <span>{t('totalPayableNow')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-muted/60 p-3.5 text-xs leading-relaxed text-muted-foreground border border-border/60">
                <p>{t('deliveryNotice')}</p>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={busy}
              className="mt-6 w-full rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Processing Order...' : values.paymentMethod === 'ONLINE' ? 'Pay & Place Order' : 'Place Order (COD)'}
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}

function PaymentOption({
  value,
  selected,
  set,
  title,
  description,
}: {
  value: PaymentMethod
  selected: PaymentMethod
  set: (value: PaymentMethod) => void
  title: string
  description: string
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
        selected === value ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <input type="radio" checked={selected === value} onChange={() => set(value)} className="mt-1" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm font-normal text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}
