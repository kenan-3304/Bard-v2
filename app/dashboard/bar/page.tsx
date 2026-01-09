import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'

export default async function BarDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Bar
    const { data: bar } = await supabase
        .from('bars')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single() // Use single for stricter type, assume fixed by now

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
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Bar Dashboard</h1>
                <p className="text-slate-500">Manage incoming offers and active campaigns.</p>
            </div>

            <div className="grid gap-4">
                {offers?.map((offer: any) => (
                    <Card key={offer.id} className="hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{offer.campaigns.brands.name}</p>
                                    <CardTitle className="text-xl text-slate-900">{offer.campaigns.title}</CardTitle>
                                </div>
                                <StatusBadge status={offer.status} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 mb-4 line-clamp-2">{offer.campaigns.description}</p>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                <div className="font-mono font-semibold text-slate-900">${offer.price}</div>
                                <Link href={`/dashboard/bar/offer/${offer.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                    View Details &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {offers?.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500">No active offers.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
