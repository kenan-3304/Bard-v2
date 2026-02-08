
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, CheckCircle2, Clock, DollarSign, FileSignature, ArrowLeft, Users } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import Link from 'next/link'
import { SampleCounter } from '@/components/agency/sample-counter'

export const dynamic = 'force-dynamic'

export default async function ExecutionMode({ params }: { params: { id: string } }) {
    // In a real app, we fetch the activation by ID

    // Mock Data for Prototype
    const activation = {
        id: params.id,
        venue: 'Joe\'s Pub',
        brand: 'Virginia Black Whiskey',
        startTime: '20:00',
        endTime: '23:00',
        dailyLimit: 100,
        currentSpend: 85.50
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background text-foreground relative flex flex-col overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />

            <div className="p-4 flex-1 space-y-6 pb-32 relative z-10">
                <Link href="/dashboard/agency" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Mission Control
                </Link>

                {/* Header */}
                <div className="text-center space-y-4 pt-4">
                    <div className="inline-flex items-center justify-center p-6 bg-slate-900/80 rounded-full mb-2 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative backdrop-blur-md">
                        <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping opacity-20 delay-1000" />
                        <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight uppercase font-mono">Execution Mode</h1>
                        <p className="text-slate-400 font-medium text-lg mt-1">{activation.venue}</p>
                        <p className="text-orange-500 text-sm mt-1 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            Live Activation
                        </p>
                    </div>
                </div>

                {/* Timer & Limits */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-xl p-4 text-center border-l-2 border-l-orange-500/50">
                        <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Time Remaining</Label>
                        <div className="text-2xl font-mono font-bold text-white mt-1 animate-pulse">01:45:00</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center border-l-2 border-l-emerald-500/50">
                        <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Daily Budget</Label>
                        <div className={`text-2xl font-mono font-bold mt-1 ${activation.currentSpend > 90 ? 'text-orange-500' : 'text-emerald-500'}`}>
                            ${activation.currentSpend.toFixed(0)} <span className="text-sm text-slate-600 font-normal">/ {activation.dailyLimit}</span>
                        </div>
                    </div>
                </div>

                {/* Sample Counter (NEW) */}
                <SampleCounter />

                {/* Requirement: Bartender Presence Verified */}
                <div className="glass-panel rounded-xl overflow-hidden relative group border-orange-500/20">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <div className="p-4 pb-2">
                        <div className="text-lg text-white flex items-center justify-between font-bold">
                            <span className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Users className="w-5 h-5 text-orange-500" />
                                </div>
                                Bartender Presence Verified
                            </span>
                            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-1 rounded border border-orange-500/20 font-mono">REQUIRED</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Take a clear photo of the bartender or manager on duty. Must show face.
                        </p>
                        <div className="h-48 bg-black/40 rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900/60 hover:border-orange-500/50 transition-all group/upload active:scale-95 duration-200">
                            <div className="p-4 bg-slate-800 rounded-full mb-3 group-hover/upload:bg-orange-500/20 transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 group-hover/upload:text-orange-500 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-slate-400 group-hover/upload:text-slate-200">Tap to Capture Evidence</span>
                        </div>
                    </div>
                </div>

                {/* Requirement: Digital Affidavit */}
                <div className="glass-card rounded-xl">
                    <div className="p-4 pb-2">
                        <div className="text-lg text-white flex items-center gap-3 font-bold">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <FileSignature className="w-5 h-5 text-slate-400" />
                            </div>
                            Digital Affidavit
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed font-mono bg-black/20 p-3 rounded border border-white/5">
                            "I certify that only retail staff poured alcohol and no patrons were served more than 1.5oz of spirits total."
                        </p>
                        <label className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-orange-600 focus:ring-orange-500 focus:ring-offset-0" />
                            <span className="text-sm font-medium text-slate-200">I Acknowledge & Sign</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-white/10 z-50 flex gap-3 max-w-md mx-auto pb-safe-offset-4">
                <Button variant="outline" className="flex-1 bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white h-14 rounded-xl text-xs uppercase tracking-wider font-bold transition-all data-[state=active]:bg-white/20">
                    Pause
                </Button>
                <Button className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)] text-sm transition-all active:scale-95">
                    Success Verify & Submit
                </Button>
            </div>
        </div>
    )
}
