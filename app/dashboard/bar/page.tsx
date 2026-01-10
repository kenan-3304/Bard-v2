import { createClient } from '@/lib/supabase-server'
import { OffersFeed } from '@/components/dashboard/OffersFeed'

// Mock data for demonstration
const MOCK_OFFERS = [
    {
        id: 'mock-1',
        price: 500,
        status: 'sent',
        type: 'Event',
        image_url: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&q=80&w=800',
        campaigns: {
            title: 'Summer Ale Launch Party',
            description: 'Host a Friday night takeover featuring our new Summer Ale. Includes merch giveaways and social media support.',
            start_date: '2025-06-15',
            end_date: '2025-06-15',
            brands: { name: 'Coastal Brewing Co.' }
        }
    },
    {
        id: 'mock-2',
        price: 1200,
        status: 'accepted',
        type: 'Sponsorship',
        image_url: 'https://images.unsplash.com/photo-1519750566773-a6a6a571712d?auto=format&fit=crop&q=80&w=800',
        campaigns: {
            title: 'Tequila Tuesday Sponsorship',
            description: 'Month-long sponsorship of your Taco Tuesday events. We will provide branded glassware and table tents.',
            start_date: '2025-05-01',
            end_date: '2025-05-31',
            brands: { name: 'Tres Agaves' }
        }
    },
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
    },
    {
        id: 'mock-4',
        price: 750,
        status: 'countered',
        type: 'Event',
        image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800',
        campaigns: {
            title: 'Game Day Watch Party',
            description: 'Sponsor the big game viewing party. Looking for banner placement and drink specials.',
            start_date: '2025-09-10',
            end_date: '2025-09-10',
            brands: { name: 'FanZone Sports' }
        }
    },
    {
        id: 'mock-5',
        price: 2000,
        status: 'sent',
        type: 'Giveaway',
        image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
        campaigns: {
            title: 'Holiday Spirit Week',
            description: 'Full week activation for the holiday season. Custom cocktail menu featuring our spices.',
            start_date: '2025-12-20',
            end_date: '2025-12-27',
            brands: { name: 'Spice Route Spirits' }
        }
    }
]

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
        .order('created_at', { ascending: false })

    // Combine real and mock data
    const offers = [...(realOffers || []), ...MOCK_OFFERS]

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Your Opportunities</h1>
                <p className="text-slate-500 text-sm font-normal">
                    You have {offers?.length || 0} active offers to review.
                </p>
            </div>
            {/* Future: Filter/Sort controls could go here */}
            <OffersFeed offers={offers || []} />
        </div>
    )
}
