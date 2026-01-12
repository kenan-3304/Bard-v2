'use client'

import { OfferCard } from '@/components/dashboard/OfferCard'
import { FileQuestion } from 'lucide-react'

interface OffersFeedProps {
    offers: any[] // Using any for now to match strict Supabase types from page, but practically it matches OfferCardProps['offer']
    emptyTitle?: string
    emptyDescription?: string
}

export function OffersFeed({ offers, emptyTitle, emptyDescription }: OffersFeedProps) {

    if (!offers || offers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <FileQuestion className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {emptyTitle || "No active offers found"}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    {emptyDescription || "When brands send you sponsorship opportunities, they will appear here as actionable cards."}
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {offers.map((offer) => (
                <div key={offer.id} className="h-full">
                    <OfferCard offer={offer} />
                </div>
            ))}
        </div>
    )
}
