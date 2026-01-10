'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

export default function CampaignDetails() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [campaign, setCampaign] = useState<any>(null)
    const [offers, setOffers] = useState<any[]>([])

    async function fetchData() {
        // Fetch Campaign
        const { data: campaignData, error: campError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single()

        if (campError) console.error(campError)
        setCampaign(campaignData)

        // Fetch Offers for this campaign
        const { data: offersData, error: offError } = await supabase
            .from('offers')
            .select(`
            *,
            bars ( name, location )
        `)
            .eq('campaign_id', id)
            .order('created_at', { ascending: false })

        if (offError) console.error(offError)
        setOffers(offersData || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [id])

    const handleAcceptCounter = async (offer: any) => {
        // When accepting a counter, we update the main price to match the counter_price
        const { error } = await supabase
            .from('offers')
            .update({
                status: 'accepted',
                price: offer.counter_price
            })
            .eq('id', offer.id)

        if (error) alert('Error: ' + error.message)
        else {
            alert('Counter offer accepted! Price updated to $' + offer.counter_price)
            fetchData()
        }
    }

    const handleCompleteCampaign = async () => {
        const { error } = await supabase
            .from('campaigns')
            .update({ status: 'completed' })
            .eq('id', id)

        if (error) alert('Error: ' + error.message)
        else {
            alert('Campaign successfully completed!')
            router.push('/dashboard/brand')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!campaign) return <div className="p-8">Campaign not found</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                        <p className="text-muted-foreground">{campaign.description}</p>
                        <div className="flex gap-4 mt-4 text-sm font-medium">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Budget: ${campaign.total_budget}</span>
                            <span className={`px-2 py-1 rounded ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                Status: {campaign.status}
                            </span>
                        </div>
                        {/* Deliverables Section */}
                        {campaign.deliverables && campaign.deliverables.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Required Deliverables</h3>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {campaign.deliverables.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {campaign.status !== 'completed' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">End Campaign</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>End this Campaign?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark the campaign as completed. No further offers can be sent or negotiated.
                                        Are you sure you are finished?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCompleteCampaign} className="bg-red-600 hover:bg-red-700">
                                        Confirm Completion
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Offers</h2>
            <div className="grid gap-4">
                {offers.map(offer => (
                    <Card key={offer.id}>
                        <CardHeader className="py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg">{offer.bars?.name}</CardTitle>
                                    <CardDescription>{offer.bars?.location}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-1 
                                    ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            offer.status === 'countered' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-600'}`}>
                                        {offer.status}
                                    </div>
                                    <div className="font-mono font-bold">${offer.price}</div>
                                </div>
                            </div>
                        </CardHeader>
                        {offer.status === 'countered' && (
                            <CardContent className="py-4 border-t bg-amber-50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="bg-amber-100 text-amber-800 text-xs font-bold uppercase px-2 py-1 rounded inline-block mb-2">Counter Proposal</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg text-slate-400 line-through">${offer.price}</span>
                                            <span className="text-2xl font-bold text-slate-900">&rarr; ${offer.counter_price}</span>
                                        </div>
                                    </div>
                                    <div className="text-right max-w-xs">
                                        <p className="text-sm text-slate-600 italic">"{offer.bar_notes}"</p>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800">
                                            Accept New Price (${offer.counter_price})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Accept Counter Offer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You are agreeing to update the contract price from ${offer.price} to <b>${offer.counter_price}</b>.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAcceptCounter(offer)} className="bg-zinc-900">
                                                Confirm Update
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        )}
                        {offer.status === 'completed' && (
                            <CardContent className="py-4 border-t bg-green-50/50">
                                <div className="mb-2">
                                    <span className="text-xs font-bold uppercase text-green-800">Status: Activation Complete</span>
                                    <p className="text-sm text-gray-700">Proof of activation has been uploaded.</p>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push(`/dashboard/brand/report/${offer.id}`)}>
                                    View Activation Report
                                </Button>
                            </CardContent>
                        )}
                        {offer.status === 'sent' && (
                            <CardContent className="py-2 text-sm text-gray-400 italic">
                                Waiting for response...
                            </CardContent>
                        )}
                    </Card>
                ))}
                {offers.length === 0 && <p>No offers sent for this campaign.</p>}
            </div>
        </div>
    )
}
