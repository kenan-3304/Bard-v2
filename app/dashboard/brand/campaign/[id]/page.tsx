
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

    // ... (rest of function)

    {
        offer.status === 'countered' && (
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
        )
    }
    {
        offer.status === 'completed' && (
            <CardContent className="py-4 border-t bg-green-50/50">
                <div className="mb-2">
                    <span className="text-xs font-bold uppercase text-green-800">Status: Activation Complete</span>
                    <p className="text-sm text-gray-700">Proof of activation has been uploaded.</p>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push(`/dashboard/brand/report/${offer.id}`)}>
                    View Activation Report
                </Button>
            </CardContent>
        )
    }
    {
        offer.status === 'sent' && (
            <CardContent className="py-2 text-sm text-gray-400 italic">
                Waiting for response...
            </CardContent>
        )
    }
                    </Card >
                ))
}
{ offers.length === 0 && <p>No offers sent for this campaign.</p> }
            </div >
        </div >
    )
}
