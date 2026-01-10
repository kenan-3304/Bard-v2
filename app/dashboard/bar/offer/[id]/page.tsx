'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CheckCircle2, ChevronRight, Download, ExternalLink, Calendar, Info } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

// Mock data (Shared with Dashboard)
const MOCK_OFFERS = [
    {
        id: 'mock-1',
        price: 500,
        status: 'sent',
        campaigns: {
            title: 'Summer Ale Launch Party',
            description: 'Host a Friday night takeover featuring our new Summer Ale. Includes merch giveaways and social media support.',
            start_date: '2025-06-15',
            end_date: '2025-06-15',
            brands: { name: 'Coastal Brewing Co.' }
        }
    },
    {
        id: 'mock-2',
        price: 1200,
        status: 'accepted',
        campaigns: {
            title: 'Tequila Tuesday Sponsorship',
            description: 'Month-long sponsorship of your Taco Tuesday events. We will provide branded glassware and table tents.',
            start_date: '2025-05-01',
            end_date: '2025-05-31',
            brands: { name: 'Tres Agaves' }
        }
    },
    {
        id: 'mock-3',
        price: 350,
        status: 'completed',
        campaigns: {
            title: 'Late Night DJ Set',
            description: 'Cover the cost of a DJ for one Saturday night in exchange for exclusive pouring rights on draft.',
            start_date: '2025-04-20',
            end_date: '2025-04-20',
            brands: { name: 'NightOwl Energy' }
        }
    },
    {
        id: 'mock-4',
        price: 750,
        status: 'countered',
        campaigns: {
            title: 'Game Day Watch Party',
            description: 'Sponsor the big game viewing party. Looking for banner placement and drink specials.',
            start_date: '2025-09-10',
            end_date: '2025-09-10',
            brands: { name: 'FanZone Sports' }
        }
    },
    {
        id: 'mock-5',
        price: 2000,
        status: 'sent',
        campaigns: {
            title: 'Holiday Spirit Week',
            description: 'Full week activation for the holiday season. Custom cocktail menu featuring our spices.',
            start_date: '2025-12-20',
            end_date: '2025-12-27',
            brands: { name: 'Spice Route Spirits' }
        }
    }
]

export default function OfferDetails() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [offer, setOffer] = useState<any>(null)
    const [counterPrice, setCounterPrice] = useState('')
    const [counterMode, setCounterMode] = useState(false)
    const [counterNotes, setCounterNotes] = useState('')

    async function fetchOffer() {
        // 1. Check Mock Data First
        const mockOffer = MOCK_OFFERS.find(o => o.id === id)
        if (mockOffer) {
            setOffer(mockOffer)
            setLoading(false)
            return
        }

        // 2. Fetch from DB
        const { data } = await supabase
            .from('offers')
            .select(`
            *,
            campaigns (
                title,
                description,
                start_date,
                end_date,
                brands ( name )
            )
        `)
            .eq('id', id)
            .single()

        if (data) setOffer(data)
        setLoading(false)
    }

    useEffect(() => {
        if (id) fetchOffer()
    }, [id])

    const handleAccept = async () => {
        const { error } = await supabase
            .from('offers')
            .update({ status: 'accepted' })
            .eq('id', id)

        if (error) alert('Error: ' + error.message)
        else {
            alert('Offer accepted!')
            fetchOffer()
            router.refresh()
            router.push('/dashboard/bar')
        }
    }

    const handleCounter = async () => {
        if (!counterPrice) return
        const { error } = await supabase
            .from('offers')
            .update({
                status: 'countered',
                counter_price: parseInt(counterPrice),
                bar_notes: counterNotes
            })
            .eq('id', id)
        if (error) alert('Error: ' + error.message)
        else {
            alert('Counter-offer sent!')
            fetchOffer()
            router.refresh()
            router.push('/dashboard/bar')
        }
    }

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Deal...</div>
    if (!offer) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Offer not found</div>

    const brandName = offer.campaigns.brands.name
    const initials = brandName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    const dateRange = `${new Date(offer.campaigns.start_date).toLocaleDateString()} - ${new Date(offer.campaigns.end_date).toLocaleDateString()}`

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 1. Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -ml-2" onClick={() => router.push('/dashboard/bar')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Offers
                    </Button>
                    <div className="text-sm text-slate-400 font-mono">ID: {offer.id.slice(0, 8)}</div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT COLUMN: Deal Context (8 cols) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Header Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-start gap-6">
                            {/* Brand Logo Avatar */}
                            <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{offer.campaigns.title}</h1>
                                    <StatusBadge status={offer.status} />
                                </div>
                                <div className="text-slate-500 flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-slate-700">{brandName}</span>
                                    <span>•</span>
                                    <span>{dateRange}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Campaign Objective</h3>
                            <p className="text-slate-600 leading-relaxed max-w-2xl">
                                {offer.campaigns.description}
                                <br /><br />
                                This partnership aims to drive brand awareness and trial through on-premise activation.
                            </p>
                        </div>
                    </div>

                    {/* The Deal Terms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 1. What You Get (Receivables) */}
                        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6">
                            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2">
                                What You Receive
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-emerald-700 font-bold text-xs">$</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">${offer.price.toLocaleString()} payment</div>
                                        <p className="text-xs text-slate-500">Paid upon completion of proof</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Branded Merch Kit</div>
                                        <p className="text-xs text-slate-500">Coasters, glassware, and table tents provided</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* 2. What You Give (Deliverables) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                Required Deliverables
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 font-medium">Display signage in high-traffic area</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 font-medium">Feature product on "Specials" menu</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 font-medium">1x Social Post tagging {brandName}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 font-medium">Upload photo proof of activation</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Additional Info / Legal */}
                    <div className="bg-slate-100 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-slate-500 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            By accepting this offer, you agree to fulfill the deliverables listed above within the campaign dates.
                            Payment is released net-30 days after proof of performance is verified.
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN: Decision Panel (4 cols) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Deal Value</p>
                                <div className="text-3xl font-black text-slate-900">${offer.price.toLocaleString()}</div>
                            </div>

                            <CardContent className="p-6 space-y-4">
                                {counterMode ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div>
                                            <Label className="text-slate-900 font-semibold mb-2 block">Proposed Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                                <Input
                                                    type="number"
                                                    value={counterPrice}
                                                    onChange={e => setCounterPrice(e.target.value)}
                                                    className="pl-7"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-slate-900 font-semibold mb-2 block">Reason</Label>
                                            <Textarea
                                                value={counterNotes}
                                                onChange={e => setCounterNotes(e.target.value)}
                                                placeholder="e.g. Higher foot traffic expectation..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button variant="ghost" onClick={() => setCounterMode(false)} className="flex-1 text-slate-600">Cancel</Button>
                                            <Button onClick={handleCounter} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">Send</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {offer.status === 'sent' && (
                                            <div className="space-y-3">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-black text-white rounded-lg shadow-sm">
                                                            Accept Deal
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Agreement</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                You are accepting the deal for {offer.campaigns.title} at ${offer.price}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Review Terms</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleAccept} className="bg-slate-900">Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCounterMode(true)}
                                                    className="w-full h-12 font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                                                >
                                                    Counter Offer
                                                </Button>

                                                <Button variant="ghost" className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 text-sm">
                                                    Decline Opportunity
                                                </Button>
                                            </div>
                                        )}

                                        {offer.status === 'accepted' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-100 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Deal Accepted
                                                </div>
                                                <Button
                                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                                                    onClick={() => router.push(`/dashboard/bar/offer/${id}/proof`)}
                                                >
                                                    Upload Proof
                                                </Button>
                                                <Button variant="outline" className="w-full">
                                                    <Download className="w-4 h-4 mr-2" /> Download Brief
                                                </Button>
                                            </div>
                                        )}

                                        {offer.status === 'completed' && (
                                            <div className="bg-slate-100 text-slate-500 p-6 rounded-lg text-center font-medium border border-slate-200">
                                                Activation Completed
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-center text-slate-400">
                                Questions? <a href="#" className="underline hover:text-slate-600">Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
