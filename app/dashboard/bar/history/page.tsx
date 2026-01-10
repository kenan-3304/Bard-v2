
import { createClient } from '@/lib/supabase-server'
import { OffersFeed } from '@/components/dashboard/OffersFeed'

// Mock data (Subset for History)
const MOCK_HISTORY_OFFERS = [
    {
        id: 'mock-3',
        price: 350,
        status: 'completed',
        type: 'DJ Set',
        image_url: 'https://images.unsplash.com/photo-1571266028243-e4733b0ef0cf?auto=format&fit=crop&q=80&w=800',
        campaigns: {
            title: 'Late Night DJ Set',
            description: 'Cover the cost of a DJ for one Saturday night in exchange for exclusive pouring rights on draft.',
            start_date: '2025-04-20',
            end_date: '2025-04-20',
            brands: { name: 'NightOwl Energy' }
        }
    }
]

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Bar
    const { data: bar } = await supabase
        .from('bars')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    // Get Completed Offers
    const { data: realOffers } = await supabase
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
        .in('status', ['completed', 'rejected', 'declined']) // Include all past states
        .order('created_at', { ascending: false })

    const offers = [...(realOffers || []), ...MOCK_HISTORY_OFFERS]

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign History</h1>
                <p className="text-slate-500 text-sm font-normal">
                    You have {offers?.length || 0} past campaigns.
                </p>
            </div>
            {offers && offers.length > 0 ? (
                <OffersFeed offers={offers} />
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No history found.</p>
                </div>
            )}
        </div>
    )
}
