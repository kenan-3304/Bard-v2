import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

export default async function VenueNetworkPage() {
    const supabase = await createClient()

    const { data: venues } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Venue Network</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Discover and connect with premium venues for your next activation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues?.map((venue: any) => (
                    <Card key={venue.id} className="group hover:shadow-lg transition-all duration-300 bg-white border-slate-200 overflow-hidden rounded-xl">
                        <div className="bg-slate-100 aspect-video w-full relative">
                            {venue.image_url ? (
                                <img
                                    src={venue.image_url}
                                    alt={venue.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <MapPin className="w-8 h-8 opacity-20" />
                                </div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-[#0D9488] transition-colors">
                                        {venue.name}
                                    </h3>
                                    <div className="flex items-center text-xs text-slate-500 mt-1 truncate">
                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                        {venue.location || venue.city || 'Virginia'}
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 flex-shrink-0 text-[10px] uppercase tracking-wider font-semibold border border-slate-200">
                                    Venue
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 border-dashed">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Capacity</span>
                                    <span className="font-semibold text-slate-900">{venue.capacity || 'N/A'}</span>
                                </div>
                                {venue.peak_nights && venue.peak_nights.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center">Peak Nights</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {venue.peak_nights.map((night: string) => (
                                                <span key={night} className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium uppercase tracking-wide">
                                                    {night}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {(!venues || venues.length === 0) && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No venues in the network yet.</p>
                </div>
            )}
        </div>
    )
}
