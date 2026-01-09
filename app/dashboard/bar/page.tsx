
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default async function BarDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please login</div>

    // Get Bar ID for this user
    const { data: bar } = await supabase
        .from('bars')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!bar) return <div>No Bar Profile found.</div>

    // Fetch Offers
    const { data: offers } = await supabase
        .from('offers')
        .select(`
        *,
        campaigns (
            title,
            brand_id,
            brands ( name )
        )
    `)
        .eq('bar_id', bar.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Bar Dashboard</h1>
                    <p className="text-muted-foreground">Manage incoming offers</p>
                </div>
            </div>

            <div className="grid gap-4">
                {offers?.map((offer) => (
                    <Card key={offer.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* @ts-ignore - Supabase types are inferred */}
                                    <CardTitle>{offer.campaigns?.title}</CardTitle>
                                    {/* @ts-ignore */}
                                    <CardDescription>From: {offer.campaigns?.brands?.name}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium uppercase inline-block mb-1">
                                        {offer.status}
                                    </div>
                                    <div className="font-bold text-lg">${offer.price}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-end">
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/bar/offer/${offer.id}`}>View Details</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {offers?.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No active offers. Wait for brands to reach out!
                    </div>
                )}
            </div>
        </div>
    )
}
