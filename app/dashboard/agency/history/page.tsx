import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { History, MapPin, Calendar, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    const { data: offers } = await supabase
        .from('offers')
        .select(`
            *,
            campaigns (
                id, title, description, activation_type,
                proposed_date, city, state,
                brands ( name )
            )
        `)
        .eq('bar_id', agency?.id)
        .in('status', ['completed', 'rejected', 'declined'])
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">History</h1>
                <p className="text-slate-500 text-sm mt-1">
                    {offers?.length || 0} completed activations
                </p>
            </div>

            <div className="space-y-4">
                {offers?.map((offer: any) => {
                    const campaign = offer.campaigns
                    if (!campaign) return null

                    return (
                        <Card key={offer.id} className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200 capitalize">
                                                {offer.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1">{campaign.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {campaign.city || campaign.state || 'Virginia'}
                                            </span>
                                            {campaign.proposed_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(campaign.proposed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                            <span className="font-medium text-slate-500">{campaign.brands?.name}</span>
                                        </div>
                                    </div>
                                    {offer.status === 'completed' && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {(!offers || offers.length === 0) && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No completed activations yet.</p>
                </div>
            )}
        </div>
    )
}
