
import { createClient } from '@/lib/supabase-server'
import { OffersFeed } from '@/components/dashboard/OffersFeed'



export const dynamic = 'force-dynamic'

export default async function ActiveCampaignsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Bar
    const { data: bar } = await supabase
        .from('bars')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    // Get Active Offers
    const { data: offers } = await supabase
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
        .eq('bar_id', bar?.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Active Campaigns</h1>
                <p className="text-slate-500 text-sm font-normal">
                    You have {offers?.length || 0} active campaigns running.
                </p>
            </div>
            {offers && offers.length > 0 ? (
                <OffersFeed offers={offers} />
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No active campaigns yet.</p>
                </div>
            )}
        </div>
    )
}
