
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

export default function OfferDetails() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [offer, setOffer] = useState<any>(null)
    const [counterPrice, setCounterPrice] = useState('')

    // ... (keep fetchOffer)

    const handleCounter = async () => {
        if (!counterPrice) return

        const { error } = await supabase
            .from('offers')
            .update({
                status: 'countered',
                counter_price: parseInt(counterPrice),
                bar_notes: counterNotes // Optional notes
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

    // ... (keep other parts)

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {/* ... (keep header parts) */}

            <Card>
                {/* ... (keep card header) */}
                <CardContent className="space-y-6">
                    {/* ... (keep campaign details) */}

                    <div className="pt-6 border-t flex gap-4">
                        {offer.status === 'sent' && !counterMode && (
                            <>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="flex-1 bg-green-600 hover:bg-green-700">Accept Offer</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Accept Offer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will confirm your agreement to the campaign terms and budget of ${offer.price}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                                                Confirm Acceptance
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button variant="outline" className="flex-1" onClick={() => setCounterMode(true)}>Counter Offer</Button>
                            </>
                        )}
                        {/* ... (keep other status checks) */}
                    </div>

                    {counterMode && (
                        <div className="pt-4 border-t space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <h4 className="font-semibold text-amber-800 mb-4">Propose New Terms</h4>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="counterPrice" className="text-amber-900">Desired Price ($)</Label>
                                        <Input
                                            id="counterPrice"
                                            type="number"
                                            value={counterPrice}
                                            onChange={e => setCounterPrice(e.target.value)}
                                            placeholder="e.g. 750"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="counterNotes" className="text-amber-900">Reason (Optional)</Label>
                                        <Textarea
                                            id="counterNotes"
                                            value={counterNotes}
                                            onChange={e => setCounterNotes(e.target.value)}
                                            placeholder="e.g. We have higher than average foot traffic..."
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="ghost" onClick={() => setCounterMode(false)} className="text-amber-900 hover:bg-amber-100">Cancel</Button>
                                        <Button onClick={handleCounter} disabled={!counterPrice} className="bg-amber-600 hover:bg-amber-700 text-white">
                                            Send Counter-Offer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
