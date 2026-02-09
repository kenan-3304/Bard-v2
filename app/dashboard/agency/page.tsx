import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardCheck, Clock, CheckCircle2, MapPin, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AgencyDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get agency
    const { data: agency } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single()

    // Get assigned activations (offers linked to this agency)
    const { data: offers } = await supabase
        .from('offers')
        .select(`
            *,
            campaigns (
                id, title, description, status, activation_type,
                compliance_status, proposed_date, city, state,
                venue_id,
                brands ( name )
            )
        `)
        .eq('bar_id', agency?.id)
        .order('created_at', { ascending: false })

    const activeCount = offers?.filter(o => o.status === 'accepted' || o.status === 'in_progress').length || 0
    const pendingCount = offers?.filter(o => o.status === 'sent').length || 0
    const completedCount = offers?.filter(o => o.status === 'completed').length || 0

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">Pending</span>
            case 'accepted':
                return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-200">Accepted</span>
            case 'in_progress':
                return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">In Progress</span>
            case 'completed':
                return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">Completed</span>
            default:
                return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Activations</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your assigned brand activations.</p>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <ClipboardCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-amber-50 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                            <p className="text-xs text-slate-500">Pending Review</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activation Cards */}
            <div className="space-y-4">
                {offers?.map((offer: any) => {
                    const campaign = offer.campaigns
                    if (!campaign) return null

                    return (
                        <Card key={offer.id} className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                                            {getStatusBadge(offer.status)}
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
                                                    {new Date(campaign.proposed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                            <span className="font-medium text-slate-500">
                                                {campaign.brands?.name}
                                            </span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 capitalize">
                                                {campaign.activation_type?.replace('_', ' ') || 'tasting'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {offer.status === 'sent' && (
                                            <Button size="sm" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white" asChild>
                                                <Link href={`/dashboard/agency/execution/${campaign.id}`}>
                                                    Accept
                                                </Link>
                                            </Button>
                                        )}
                                        {(offer.status === 'accepted' || offer.status === 'in_progress') && (
                                            <Button size="sm" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white" asChild>
                                                <Link href={`/dashboard/agency/execution/${campaign.id}`}>
                                                    Execute
                                                </Link>
                                            </Button>
                                        )}
                                        {offer.status === 'completed' && (
                                            <Button size="sm" variant="outline" className="border-slate-200 text-slate-700" asChild>
                                                <Link href={`/dashboard/agency/execution/${campaign.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {(!offers || offers.length === 0) && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No activations assigned yet.</p>
                        <p className="text-slate-400 text-sm mt-1">Activations will appear here when brands assign them to your agency.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
