
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Activity, Zap, Shield, BarChart3, AlertTriangle, FileUp, ShieldAlert, AlertOctagon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AgencyDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Agency
    const { data: agency } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single()

    const columns = [
        { id: 'pre-check', title: 'Pre-Check', color: 'bg-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' },
        { id: 'in-progress', title: 'Live Now', color: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
        { id: 'review', title: 'Evidence Review', color: 'bg-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' },
        { id: 'archived', title: 'Compliance Vault (Audit-Ready)', color: 'bg-slate-500', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' }
    ]

    const mockActivations = [
        {
            id: 1,
            venue: 'Joe\'s Pub',
            ambassador: 'Sarah Jenkins',
            status: 'pre-check',
            permitValid: true,
            permitExpiresIn: 14,
            spend: 0,
            checks: { poured: false, idLog: false, signage: false }
        },
        {
            id: 2,
            venue: 'The Cellar',
            ambassador: 'Mike Ross',
            status: 'in-progress',
            permitValid: true,
            permitExpiresIn: 45,
            spend: 92, // High spend violation risk
            checks: { poured: true, idLog: true, signage: true }
        },
        {
            id: 3,
            venue: 'Hokie House',
            ambassador: 'Jessica Pearson',
            status: 'review',
            permitValid: true,
            permitExpiresIn: 120,
            spend: 98,
            checks: { poured: true, idLog: true, signage: true }
        }
    ]

    return (
        <div className="h-full flex flex-col bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />

            <div className="p-6 h-full flex flex-col space-y-6 relative z-10">
                <header className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            <h1 className="text-3xl font-bold tracking-tighter text-white uppercase font-mono">
                                Mission Control
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-2 font-mono tracking-wide">
                            <Activity className="w-3 h-3 text-orange-500 animate-pulse" />
                            REGULATORY COMMAND CENTER
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white h-10 px-4 rounded-lg font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                            <FileUp className="w-4 h-4" />
                            Export for ABC
                        </Button>
                        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 shadow-lg border-white/5">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
                            </div>
                            <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest text-glow">SYSTEM: OPTIMAL</span>
                        </div>
                    </div>
                </header>

                {/* Kanban Board */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
                    {columns.map(col => (
                        <div key={col.id} className="flex flex-col h-full glass-panel rounded-xl overflow-hidden shadow-2xl transition-all hover:bg-slate-900/60 flex-1">
                            {/* Column Header */}
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${col.color} ${col.glow}`} />
                                    <span className="font-bold text-slate-200 uppercase tracking-widest text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{col.title}</span>
                                </div>
                                <span className="bg-white/5 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono border border-white/5">
                                    {mockActivations.filter(a => a.status === col.id).length}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                                {mockActivations.filter(a => a.status === col.id).map(card => (
                                    <ActivationCard key={card.id} data={card} />
                                ))}

                                {mockActivations.filter(a => a.status === col.id).length === 0 && (
                                    <div className="h-24 rounded-lg border border-dashed border-white/5 flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest">
                                        No Signals
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ActivationCard({ data }: { data: any }) {
    const isHighSpend = data.spend >= 90
    const isLive = data.status === 'in-progress'
    const isExpiringSoon = data.permitExpiresIn <= 14

    return (
        <Link href={`/dashboard/agency/execution/${data.id}`}>
            <div className={`group relative overflow-hidden rounded-lg bg-slate-900/80 border hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 cursor-pointer ${isHighSpend && isLive ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 hover:border-orange-500/50'}`}>
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:via-orange-500/5 transition-colors duration-500" />

                {isLive && (
                    <div className="absolute top-0 right-0 p-2 z-10">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                        </span>
                    </div>
                )}

                <div className="p-4 relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-bold text-base text-slate-100 group-hover:text-orange-400 transition-colors tracking-tight font-sans">
                                {data.venue}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-5 w-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-300 font-mono font-bold border border-white/10">
                                    {data.ambassador.split(' ')[0][0]}{data.ambassador.split(' ')[1][0]}
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{data.ambassador}</span>
                            </div>
                        </div>
                    </div>

                    {/* Violation Risk Indicator */}
                    {isLive && isHighSpend && (
                        <div className="mb-2 flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 font-bold animate-pulse">
                            <AlertOctagon className="w-3 h-3" />
                            VIOLATION RISK
                        </div>
                    )}

                    {/* Spend Gauge */}
                    {isLive && (
                        <div className="space-y-1.5 mb-3">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>BUDGET UTILIZATION</span>
                                <span className={isHighSpend ? 'text-red-500 font-bold animate-pulse' : 'text-emerald-400'}>
                                    ${data.spend} <span className="text-slate-600">/</span> $100
                                </span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ${isHighSpend ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`}
                                    style={{ width: `${(data.spend / 100) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex gap-1.5">
                            <ComplianceDot active={data.checks.poured} label="Pour" />
                            <ComplianceDot active={data.checks.idLog} label="ID" />
                            <ComplianceDot active={data.checks.signage} label="Sign" />
                        </div>
                        {data.permitValid && (
                            <Badge variant="outline" className={`border-none text-[9px] px-1.5 py-0 h-4 tracking-wider font-mono flex items-center gap-1 ${isExpiringSoon ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                <Shield className="w-2 h-2" />
                                EXP: {data.permitExpiresIn}D
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

function ComplianceDot({ active, label }: { active: boolean, label: string }) {
    return (
        <div className="group relative">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border border-slate-700'}`} />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 bg-black text-[9px] text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                {label}
            </div>
        </div>
    )
}
