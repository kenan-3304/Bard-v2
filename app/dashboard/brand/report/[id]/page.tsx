
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
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    &larr; Back to Campaign
                </Button>
            </div>
            <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-blue-200 font-bold tracking-widest uppercase text-sm mb-2">Campaign Impact Report</div>
                            <h1 className="text-5xl font-extrabold mb-4">{offer.campaigns.title}</h1>
                            <div className="flex items-center gap-2 text-xl opacity-90">
                                <Award className="w-6 h-6 text-yellow-400" />
                                <span>Executed by <span className="font-bold underline decoration-yellow-400">{offer.bars.name}</span></span>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <h2 className="text-3xl font-bold">{offer.campaigns.brands.name}</h2>
                            <p className="text-blue-200">Official Partner</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Column: Visual Proof */}
                    <div className="p-8 bg-gray-50 flex flex-col justify-center">
                        <div className="relative group rounded-xl overflow-hidden shadow-lg border-4 border-white transform transition hover:scale-[1.01] duration-500">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Activation Proof" className="w-full h-auto object-cover" />
                            ) : (
                                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-400 italic">No Image Available</div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                <p className="font-bold text-lg">On-Site Activation</p>
                                <p className="text-sm opacity-80">{new Date(offer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4 justify-center">
                            <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" /> Download
                            </Button>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                <Share2 className="w-4 h-4" /> Share Report
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Metrics & Executive Summary */}
                    <div className="p-10 flex flex-col gap-8">

                        {/* Executive Summary Card */}
                        <div className="bg-blue-50/50 p-6 rounded-lg border-l-4 border-blue-600">
                            <h3 className="text-blue-900 font-bold uppercase text-xs mb-2 tracking-wider">Executive Summary</h3>
                            <p className="text-lg text-blue-900 leading-relaxed font-medium italic">
                                "{impactStatement}"
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                AI Analysis Generated
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div>
                            <h3 className="text-gray-400 font-bold uppercase text-xs mb-4 tracking-wider">Performance Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Total Reach</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{offer.estimated_attendance}</div>
                                    <div className="text-xs text-green-600 font-medium">+15% vs Proj.</div> {/* Mocked projection diff */}
                                </div>
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Cost Per Enagagement</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">${costPerHead}</div>
                                    <div className="text-xs text-gray-400 font-medium">Budget: ${offer.price}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
