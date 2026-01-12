
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Bar {
    id: string
    name: string
    location: string
}

export default function NewCampaign() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [bars, setBars] = useState<Bar[]>([])
    const [selectedBars, setSelectedBars] = useState<string[]>([])
    const [formData, setFormData] = useState({
        title: '',
        promo_text: '',
        total_budget: '',
        start_date: '',
        end_date: '',
        price_per_offer: '', // How much each bar gets (initial offer)
    })
    const [brandAssets, setBrandAssets] = useState<File | null>(null)

    useEffect(() => {
        async function fetchBars() {
            const { data } = await supabase.from('bars').select('id, name, location')
            if (data) setBars(data)
        }
        fetchBars()
    }, [])

    const [deliverables, setDeliverables] = useState<string[]>(['Display signage in high-traffic area', 'Feature product on "Specials" menu', 'Upload photo proof of activation'])
    const [newDeliverable, setNewDeliverable] = useState('')

    const addDeliverable = () => {
        if (newDeliverable.trim()) {
            setDeliverables([...deliverables, newDeliverable.trim()])
            setNewDeliverable('')
        }
    }

    const removeDeliverable = (index: number) => {
        setDeliverables(deliverables.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Compliance Check Mock
            const bannedWords = ['free', 'unlimited', '2-for-1']
            const lowerText = formData.promo_text.toLowerCase()
            const violation = bannedWords.find(word => lowerText.includes(word))

            if (violation) {
                alert(`Compliance Alert: usage of "${violation}" violates VA ABC regulations. Please revise.`)
                setLoading(false)
                return
            }

            // Simulate Network Delay (Launch Logic)
            await new Promise(resolve => setTimeout(resolve, 2000))

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Get Brand ID
            const { data: brand } = await supabase
                .from('brands')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!brand) throw new Error('Brand not found')

            // 2. Create Campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .insert({
                    brand_id: brand.id,
                    title: formData.title,
                    description: formData.promo_text,
                    total_budget: parseFloat(formData.total_budget || '0'),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    deliverables: deliverables, // Insert deliverables
                    status: 'active'
                })
                .select()
                .single()

            if (campaignError) throw campaignError

            // 3. Create Offers
            const offersToCreate = selectedBars.map(barId => ({
                campaign_id: campaign.id,
                bar_id: barId,
                price: parseFloat(formData.price_per_offer || '0'),
                status: 'sent',
                bar_notes: '' // Empty initially
            }))

            if (offersToCreate.length > 0) {
                const { error: offersError } = await supabase
                    .from('offers')
                    .insert(offersToCreate)

                if (offersError) throw offersError
            }

            // Success
            // alert('Campaign Launched Successfully!') // Optional: Remove alert since we redirect, user asked for green success message but redirect is fine or we can toast. Using alert for now as mock.
            router.push('/dashboard/brand')
            router.refresh()

        } catch (error: any) {
            alert('Error: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-6">
            <div className="mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Command Center
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* The Builder Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Launch New Campaign</h1>
                        <p className="text-slate-500">Create your offer and launch it to the network.</p>
                    </div>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                            <CardTitle className="text-xl font-bold text-slate-900">Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">

                            {/* Title & Promo Text */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-slate-700 font-semibold">Campaign Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Summer Ale Launch 2024"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="h-12 text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="promo_text" className="text-slate-700 font-semibold">Promo Text</Label>
                                    <Textarea
                                        id="promo_text"
                                        placeholder="Enter the promotional copy for the campaign..."
                                        value={formData.promo_text}
                                        onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })}
                                        rows={4}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-slate-500">This text will be checked for compliance.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assets" className="text-slate-700 font-semibold">Brand Assets</Label>
                                    <Input
                                        id="assets"
                                        type="file"
                                        onChange={(e) => setBrandAssets(e.target.files ? e.target.files[0] : null)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Financials Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="total_budget" className="text-slate-700 font-semibold">Total Budget ($)</Label>
                                    <Input
                                        id="total_budget"
                                        type="number"
                                        placeholder="5000"
                                        value={formData.total_budget}
                                        onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price_per_offer" className="text-slate-700 font-semibold">Offer per Bar ($)</Label>
                                    <Input
                                        id="price_per_offer"
                                        type="number"
                                        placeholder="500"
                                        value={formData.price_per_offer}
                                        onChange={(e) => setFormData({ ...formData, price_per_offer: e.target.value })}
                                        className="font-mono font-bold text-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date" className="text-slate-700 font-semibold">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date" className="text-slate-700 font-semibold">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Deliverables Builder */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <Label className="text-slate-900 font-bold block">Required Deliverables</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a requirement (e.g. 'Post 3 Stories')"
                                        value={newDeliverable}
                                        onChange={(e) => setNewDeliverable(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                                    />
                                    <Button type="button" onClick={addDeliverable} variant="secondary" className="bg-slate-200 text-slate-900 hover:bg-slate-300">Add</Button>
                                </div>
                                <ul className="space-y-2">
                                    {deliverables.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-slate-200 shadow-sm text-sm">
                                            <span className="font-medium text-slate-700">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeDeliverable(index)}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bar Selection */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <Label className="text-slate-900 font-bold block">Select Partner Bars</Label>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
                                    <div className="space-y-2">
                                        {bars.map(bar => (
                                            <div key={bar.id} className="flex items-center space-x-3 bg-white p-3 rounded border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
                                                <Checkbox
                                                    id={bar.id}
                                                    checked={selectedBars.includes(bar.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedBars([...selectedBars, bar.id])
                                                        else setSelectedBars(selectedBars.filter(id => id !== bar.id))
                                                    }}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label htmlFor={bar.id} className="text-sm font-bold text-slate-900 cursor-pointer">{bar.name}</label>
                                                    <p className="text-xs text-slate-500">{bar.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-600">
                                    <span>Selected: {selectedBars.length} bars</span>
                                    <span>Est. Cost: <span className="font-mono font-bold">${(parseFloat(formData.price_per_offer || '0') * selectedBars.length).toLocaleString()}</span></span>
                                </div>
                            </div>

                        </CardContent>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-lg bg-zinc-900 hover:bg-black text-white shadow-lg shadow-zinc-900/20">
                                {loading ? (
                                    <>
                                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Launching Campaign...
                                    </>
                                ) : 'Launch Campaign'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
