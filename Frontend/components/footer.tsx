'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/language'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-[#062A0D] px-4 sm:px-6 pt-12 sm:pt-16 pb-8 text-[#FAF7F2] lg:px-8 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 border-t border-white/10 pt-8 sm:pt-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-1 lg:col-span-1">
          <Link href="/" className="inline-block rounded-2xl bg-white/95 px-3.5 py-2 transition-all hover:bg-white hover:shadow-md" title="Pragati Nursery - Home">
            <Image
              src="/pragati-nursery-logo.png"
              alt="Pragati Nursery Logo"
              width={160}
              height={96}
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>
          <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-[#FAF7F2]/80 font-normal">
            {t('footerBrandDesc')}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A373]">{t('explore')}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-xs sm:text-sm text-[#FAF7F2]/85 font-medium">
            <Link href="/shop" className="hover:text-white transition-colors py-0.5">{t('shopPlants')}</Link>
            <Link href="/#categories" className="hover:text-white transition-colors py-0.5">{t('collections')}</Link>
            <Link href="/about" className="hover:text-white transition-colors py-0.5">{t('aboutUs')}</Link>
            <Link href="/contact" className="hover:text-white transition-colors py-0.5">{t('contactUs')}</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A373]">Policies</p>
          <div className="mt-4 flex flex-col gap-2.5 text-xs sm:text-sm text-[#FAF7F2]/85 font-medium">
            <Link href="/privacy-policy" className="hover:text-white transition-colors py-0.5">{t('privacyPolicy')}</Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors py-0.5">{t('termsAndConditions')}</Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors py-0.5">{t('shippingPolicy')}</Link>
            <Link href="/cancellation-refund-policy" className="hover:text-white transition-colors py-0.5">{t('cancellationPolicy')}</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A373]">{t('contact')}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-xs sm:text-sm text-[#FAF7F2]/85 font-normal">
            <span className="leading-relaxed">Shahajirao Tanpure Farm, Vadgaon Tanpura, Tal. Karjat, Dist. Ahilyanagar, Maharashtra</span>
            <a href="mailto:info@pragatinursery.com" className="hover:text-white transition-colors break-all font-medium py-0.5">info@pragatinursery.com</a>
            <a href="tel:9822101088" className="hover:text-white transition-colors font-medium py-0.5">+91 9822101088</a>
            <span className="text-xs text-[#FAF7F2]/60">Mon–Sat, 9:00 AM – 6:00 PM IST</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 sm:mt-16 max-w-7xl border-t border-white/15 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#FAF7F2]/60 text-center sm:text-left">
        <p>© 2026 Pragati Nursery. All rights reserved.</p>
        <p>
          Designed & Developed by{' '}
          <a
            href="https://www.linkedin.com/in/pranav-ranaware-14697432b/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#FAF7F2]/90 hover:text-white hover:underline transition-colors"
          >
            Pranav Ranaware
          </a>
        </p>
        <p>{t('copyright')}</p>
      </div>
    </footer>
  )
}
