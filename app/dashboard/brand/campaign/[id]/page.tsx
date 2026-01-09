
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

    const handleAcceptCounter = async (offerId: string) => {
        // ... (existing logic)
        const { error } = await supabase
            .from('offers')
            .update({ status: 'accepted' })
            .eq('id', offerId)

        if (error) alert('Error: ' + error.message)
        else {
            alert('Counter offer accepted!')
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
                <div className="flex justify-between items-start">
                    <div>
                        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600" onClick={() => router.push('/dashboard/brand')}>
                            &larr; Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                        <p className="text-muted-foreground">{campaign.description}</p>
                        <div className="flex gap-4 mt-4 text-sm font-medium">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Budget: ${campaign.total_budget}</span>
                            <span className={`px-2 py-1 rounded ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                Status: {campaign.status}
                            </span>
                        </div>
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
                            <CardContent className="py-4 border-t bg-orange-50/50">
                                <div className="mb-2">
                                    <span className="text-xs font-bold uppercase text-orange-800">Counter Note:</span>
                                    <p className="text-sm italic text-gray-700">"{offer.bar_notes}"</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm">
                                            Accept Counter
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Accept Counter Offer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will update the agreed price to ${offer.price} (or whatever was negotiated in notes).
                                                Note: In a real app we'd update the price field too if changed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAcceptCounter(offer.id)}>
                                                Confirm Acceptance
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
