
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
    const [counterMode, setCounterMode] = useState(false)
    const [counterNotes, setCounterNotes] = useState('')
    const [aiProcessing, setAiProcessing] = useState(false)

    async function fetchOffer() {
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
        fetchOffer()
    }, [id])

    const handleAccept = async () => {
        // Confirmation is now handled by UI

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
        setAiProcessing(true)

        // Mock AI Call
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network
        const professionalNotes = `We would very much like to participate, however, due to expected volume, we request an adjustment to the budget: ${counterNotes}`

        const { error } = await supabase
            .from('offers')
            .update({
                status: 'countered',
                bar_notes: professionalNotes
            })
            .eq('id', id)

        setAiProcessing(false)

        if (error) alert('Error: ' + error.message)
        else {
            alert('Counter-offer sent!')
            fetchOffer()
            router.refresh()
            router.push('/dashboard/bar')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!offer) return <div className="p-8">Offer not found</div>

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.push('/dashboard/bar')}>
                &larr; Back to Dashboard
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <div>
                            <CardDescription className="uppercase tracking-widest text-xs font-bold mb-2">Offer from {offer.campaigns.brands.name}</CardDescription>
                            <CardTitle className="text-3xl">{offer.campaigns.title}</CardTitle>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">${offer.price}</div>
                            <div className="text-sm text-gray-500 uppercase">{offer.status}</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Campaign Details</h3>
                        <p className="text-gray-600">{offer.campaigns.description}</p>
                        <div className="mt-4 flex gap-4 text-sm text-gray-500">
                            <div>Start: {new Date(offer.campaigns.start_date).toLocaleDateString()}</div>
                            <div>End: {new Date(offer.campaigns.end_date).toLocaleDateString()}</div>
                        </div>
                    </div>

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
                        {offer.status === 'accepted' && (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push(`/dashboard/bar/offer/${id}/proof`)}>
                                Upload Proof of Activation
                            </Button>
                        )}
                        {offer.status === 'completed' && (
                            <div className="w-full text-center p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                                <p className="font-semibold">Activation Complete!</p>
                                <p className="text-sm">Proof uploaded. Payment processing.</p>
                            </div>
                        )}
                    </div>

                    {counterMode && (
                        <div className="pt-4 border-t space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-1">AI Counter-Offer Agent</h4>
                                <p className="text-sm text-blue-600 mb-3">
                                    Type your requirements (e.g., "Need $200 more"). I will rewrite it professionally before sending.
                                </p>
                                <Label>Your Notes</Label>
                                <Textarea
                                    value={counterNotes}
                                    onChange={e => setCounterNotes(e.target.value)}
                                    placeholder="e.g. Can we bump it to $750?"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="ghost" onClick={() => setCounterMode(false)}>Cancel</Button>
                                    <Button onClick={handleCounter} disabled={aiProcessing || !counterNotes}>
                                        {aiProcessing ? ' rewriting...' : 'Send Counter-Offer'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
