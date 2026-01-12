'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowRight, Star, Gift, Music } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'

interface OfferCardProps {
    offer: {
        id: string
        price: number
        status: string
        type?: string
        image_url?: string
        logo_url?: string
        campaigns: {
            title: string
            description: string
            start_date: string
            end_date: string
            brands: {
                name: string
            }
        }
    }
}

// Simple deterministic color map for brands (Demo purpose)
// In prod, this would likely come from the DB as a hex code
const BRAND_COLORS: Record<string, string> = {
    'Coastal Brewing Co.': 'bg-amber-500',
    'Tres Agaves': 'bg-emerald-600',
    'NightOwl Energy': 'bg-slate-900',
    'FanZone Sports': 'bg-blue-600',
    'Spice Route Spirits': 'bg-orange-700',
}

export function OfferCard({ offer }: OfferCardProps) {
    const brandName = offer.campaigns.brands.name
    const initials = brandName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    // Get brand accented color
    const brandAccentClass = BRAND_COLORS[brandName] || 'bg-slate-400'

    // Format dates
    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBD'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const dateRange = `${formatDate(offer.campaigns.start_date)} - ${formatDate(offer.campaigns.end_date)}`
    const offerType = offer.type || "Sponsorship"

    const TypeIcon = () => {
        if (offerType.toLowerCase().includes('event')) return <Calendar className="w-3 h-3 mr-1" />
        if (offerType.toLowerCase().includes('giveaway')) return <Gift className="w-3 h-3 mr-1" />
        if (offerType.toLowerCase().includes('dj')) return <Music className="w-3 h-3 mr-1" />
        return <Star className="w-3 h-3 mr-1" />
    }

    return (
        <Card className="group flex flex-col h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">



            <div className="flex flex-col h-full"> {/* Push content right to accommodate border */}

                {/* 1. Header (Logo & Status) */}
                <div className="px-6 py-5 flex justify-between items-start border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        {/* Logo Avatar */}
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                            {initials}
                        </div>
                        <div>
                            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
                                {brandName}
                            </div>
                            <div className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                {offerType}
                            </div>
                        </div>
                    </div>

                    <StatusBadge status={offer.status} />
                </div>

                {/* 2. Body (Value & Title) */}
                <CardContent className="px-6 py-5 flex flex-col flex-1 gap-4">

                    {/* Value Emphasis */}
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                ${offer.price.toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-slate-400">total value</span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 space-y-2">
                        <Link href={`/dashboard/bar/offer/${offer.id}`} className="block">
                            <h3 className="text-[15px] font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                {offer.campaigns.title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                            <Calendar className="w-3 h-3" />
                            <span>{dateRange}</span>
                        </div>
                    </div>

                    {/* 3. Footer (CTA) */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50/50">
                        <Link
                            href={`/dashboard/bar/offer/${offer.id}`}
                            className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5"
                        >
                            View Details <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                </CardContent>
            </div>
        </Card>
    )
}
