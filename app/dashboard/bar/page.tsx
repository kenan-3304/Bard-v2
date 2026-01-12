import { createClient } from '@/lib/supabase-server'
import { OffersFeed } from '@/components/dashboard/OffersFeed'



export const dynamic = 'force-dynamic'

export default async function BarDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Bar (Simple check for ownership)
    const { data: bar } = await supabase
        .from('bars')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single()

    // Get Offers
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
        .eq('status', 'sent')
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Offers</h1>
                <p className="text-slate-500 text-sm font-normal">
                    You have {offers?.length || 0} active offers to review.
                </p>
            </div>
            {/* Future: Filter/Sort controls could go here */}
            <OffersFeed
                offers={offers || []}
                emptyTitle="No new offers at this time"
                emptyDescription="Check back soon!"
            />
        </div>
    )
}
