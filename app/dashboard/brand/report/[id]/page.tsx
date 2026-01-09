
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, Share2, Award, Users, DollarSign } from 'lucide-react'

export default function CampaignReport() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [offer, setOffer] = useState<any>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('offers')
                .select(`
                    *,
                    campaigns (
                        title,
                        total_budget,
                        brands ( name )
                    ),
                    bars ( name, location )
                `)
                .eq('id', id)
                .single()

            if (error) {
                console.error(error)
                return
            }
            setOffer(data)

            if (data.proof_image_path) {
                // Get Public URL
                const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(data.proof_image_path)
                setImageUrl(publicUrl)
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-12 text-center text-gray-500">Generating Report...</div>
    if (!offer) return <div className="p-12 text-center text-red-500">Report not found.</div>

    // Mock AI Impact Statement
    const impactStatement = `${offer.bars.name} successfully activated the "${offer.campaigns.title}" campaign, engaging approximately ${offer.estimated_attendance} patrons. This event significantly amplified ${offer.campaigns.brands.name}'s visibility in the ${offer.bars.location} area, driving strong brand association and trial.`

    const costPerHead = (offer.price / offer.estimated_attendance).toFixed(2)

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-6 print:hidden">
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900">
                    &larr; Back to Campaign
                </Button>
            </div>

            <div className="max-w-4xl mx-auto bg-white shadow-sm border border-slate-200 print:shadow-none print:border-none">

                {/* Header: Clean & Professional */}
                <div className="border-b border-slate-200 p-12">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">Activation Report</div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{offer.campaigns.title}</h1>
                            <p className="text-lg text-slate-600">
                                Executed by <span className="font-semibold text-slate-900 border-b-2 border-slate-200">{offer.bars.name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">{offer.campaigns.brands.name}</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider">Official Partner</div>
                        </div>
                    </div>
                </div>

                <div className="p-12">
                    {/* Impact Statement: The "Journalistic" Element */}
                    <div className="mb-12 max-w-2xl">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Executive Summary</h3>
                        <blockquote className="text-xl font-serif italic text-slate-800 leading-relaxed border-l-2 border-slate-900 pl-6">
                            "{impactStatement}"
                        </blockquote>
                    </div>

                    {/* Proof Photo: The Evidence */}
                    <div className="mb-12">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Visual Verification</h3>
                        <div className="border-4 border-slate-100 bg-slate-50 p-4">
                            <div className="aspect-video relative bg-slate-200 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Activation Proof" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic">No Image Available</div>
                                )}
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-slate-400 font-mono">
                                <span>ID: {offer.id.split('-')[0]}</span>
                                <span>DATE: {new Date(offer.created_at).toLocaleDateString().toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid: The Data */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-12">
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reach</div>
                            <div className="text-3xl font-bold text-slate-900">{offer.estimated_attendance}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cost / Engagement</div>
                            <div className="text-3xl font-bold text-slate-900">${costPerHead}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Investment</div>
                            <div className="text-3xl font-bold text-slate-900">${offer.price}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                            <div className="text-xs font-bold bg-slate-900 text-white px-2 py-1 inline-block uppercase tracking-wider">Completed</div>
                        </div>
                    </div>

                    {/* Footer Actions (Screen Only) */}
                    <div className="mt-16 flex gap-4 print:hidden">
                        <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50" onClick={() => window.print()}>
                            <Download className="w-4 h-4" /> Print / Save PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
