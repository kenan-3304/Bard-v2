
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        description: '',
        total_budget: '',
        start_date: '',
        end_date: '',
        price_per_offer: '', // How much each bar gets (initial offer)
    })

    useEffect(() => {
        async function fetchBars() {
            const { data } = await supabase.from('bars').select('id, name, location')
            if (data) setBars(data)
        }
        fetchBars()
    }, [])

    const handleBarToggle = (barId: string) => {
        setSelectedBars(prev =>
            prev.includes(barId) ? prev.filter(id => id !== barId) : [...prev, barId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
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
                    description: formData.description,
                    total_budget: parseFloat(formData.total_budget || '0'),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
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

            alert('Campaign and Offers created!')
            router.push('/dashboard/brand')
            router.refresh()

        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                    <CardTitle className="text-xl font-bold text-slate-900">Create New Campaign</CardTitle>
                    <CardDescription>Enter the details for your new activation campaign.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Campaign Details Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Campaign Details</h3>

                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-slate-700">Campaign Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Summer Ale Launch 2024"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="max-w-md"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-slate-700">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the campaign goals and requirements..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 max-w-lg">
                                <div className="space-y-3">
                                    <Label htmlFor="total_budget" className="text-slate-700">Total Budget ($)</Label>
                                    <Input
                                        id="total_budget"
                                        type="number"
                                        placeholder="5000"
                                        value={formData.total_budget}
                                        onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="price_per_offer" className="text-slate-700">Offer Price ($) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="price_per_offer"
                                        type="number"
                                        placeholder="500"
                                        value={formData.price_per_offer}
                                        onChange={(e) => setFormData({ ...formData, price_per_offer: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Amount offered to each bar.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 max-w-lg">
                                <div className="space-y-3">
                                    <Label htmlFor="start_date" className="text-slate-700">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="end_date" className="text-slate-700">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bar Selection Section */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Select Bars</h3>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="space-y-3">
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
                                                <label
                                                    htmlFor={bar.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {bar.name}
                                                </label>
                                                <p className="text-xs text-slate-500">{bar.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {bars.length === 0 && <p className="text-sm text-slate-500 italic">No bars available in the network.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading} className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white min-w-[200px]">
                                {loading ? 'Creating Campaign...' : 'Launch Campaign'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
