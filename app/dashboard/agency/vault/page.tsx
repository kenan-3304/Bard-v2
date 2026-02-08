
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, AlertTriangle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'

export const dynamic = 'force-dynamic'

export default async function AgencyVault() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Mock Data
    const mockPermits = [
        { id: 1, name: 'Sarah Jenkins', permit: 'VA-ABC-2991', expires: '2026-03-15', status: 'valid' },
        { id: 2, name: 'Mike Ross', permit: 'VA-ABC-1102', expires: '2026-02-10', status: 'expiring' }, // < 15 days
        { id: 3, name: 'Jessica Pearson', permit: 'VA-ABC-4491', expires: '2025-12-20', status: 'expired' },
    ]

    const expiringCount = mockPermits.filter(p => p.status !== 'valid').length

    return (
        <div className="p-8 h-full flex flex-col space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <BackButton />

            <header className="flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white">The Vault</h1>
                    <p className="text-slate-400 mt-2 font-light">Compliance Archives & Permit Management</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Permit
                </Button>
            </header>

            {/* Alerts */}
            {expiringCount > 0 && (
                <div className="bg-orange-500/5 backdrop-blur-md border border-orange-500/20 rounded-xl p-6 flex items-start gap-4 text-orange-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <ShieldAlert className="w-6 h-6 text-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-100 text-lg">Compliance Alert</h4>
                        <p className="text-orange-200/70 mt-1">
                            Action required for <span className="font-bold text-white">{expiringCount} ambassadors</span>. Permits are expiring soon or expired.
                        </p>
                    </div>
                </div>
            )}

            <Card className="bg-slate-900/40 backdrop-blur border-white/5 flex-1 shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-white/5 bg-white/5 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium text-slate-200">Ambassador Permits</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input placeholder="Search name or permit #" className="pl-10 bg-slate-950/50 border-white/10 text-slate-200 focus:ring-orange-500/50 placeholder:text-slate-600 h-10 rounded-lg" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Ambassador</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Permit Number</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Expiration Date</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {mockPermits.map((permit) => (
                                    <tr key={permit.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">{permit.name}</td>
                                        <td className="px-6 py-4 font-mono text-slate-400">{permit.permit}</td>
                                        <td className="px-6 py-4 text-slate-400">{permit.expires}</td>
                                        <td className="px-6 py-4">
                                            {permit.status === 'valid' && <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Valid</Badge>}
                                            {permit.status === 'expiring' && <Badge variant="outline" className="bg-orange-500/5 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">Expiring</Badge>}
                                            {permit.status === 'expired' && <Badge variant="outline" className="bg-red-500/5 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Expired</Badge>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-white/10">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Historical Archives (Placeholder) */}
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur border-dashed">
                <CardContent className="py-12 flex flex-col items-center text-center">
                    <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">Compliance Archive</h3>
                    <p className="text-slate-500 max-w-sm mt-1">All past activation records are securely stored here for 2 years (audit readiness).</p>
                </CardContent>
            </Card>
        </div>
    )
}
