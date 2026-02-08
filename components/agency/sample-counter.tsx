
'use client'

import { useState } from 'react'
import { Plus, Minus, Wine, Beer, Martini } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SampleCounter() {
    const [counts, setCounts] = useState({
        spirits: 0,
        wine: 0,
        beer: 0
    })

    const increment = (type: keyof typeof counts) => {
        setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }))
    }

    const decrement = (type: keyof typeof counts) => {
        if (counts[type] > 0) {
            setCounts(prev => ({ ...prev, [type]: prev[type] - 1 }))
        }
    }

    return (
        <div className="glass-panel rounded-xl p-4 border-orange-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold font-mono tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    SAMPLE LOG
                </h3>
                <span className="text-[10px] text-slate-500 font-mono uppercase">VA ABC COMPLIANCE</span>
            </div>

            <div className="space-y-3">
                <CounterRow
                    label="Spirits"
                    subLabel="0.5 oz"
                    icon={<Martini className="w-4 h-4 text-purple-400" />}
                    count={counts.spirits}
                    onIncrement={() => increment('spirits')}
                    onDecrement={() => decrement('spirits')}
                />
                <CounterRow
                    label="Wine"
                    subLabel="2.0 oz"
                    icon={<Wine className="w-4 h-4 text-rose-400" />}
                    count={counts.wine}
                    onIncrement={() => increment('wine')}
                    onDecrement={() => decrement('wine')}
                />
                <CounterRow
                    label="Beer"
                    subLabel="4.0 oz"
                    icon={<Beer className="w-4 h-4 text-amber-400" />}
                    count={counts.beer}
                    onIncrement={() => increment('beer')}
                    onDecrement={() => decrement('beer')}
                />
            </div>
        </div>
    )
}

function CounterRow({ label, subLabel, icon, count, onIncrement, onDecrement }: any) {
    return (
        <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-md border border-white/5">
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-200 font-mono">{label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{subLabel}</div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDecrement}
                    className="h-8 w-8 rounded text-slate-400 hover:text-white hover:bg-white/10"
                    disabled={count === 0}
                >
                    <Minus className="w-4 h-4" />
                </Button>
                <div className="w-8 text-center font-mono font-bold text-lg text-white">
                    {count}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onIncrement}
                    className="h-8 w-8 rounded bg-white/5 text-orange-500 hover:text-orange-400 hover:bg-white/10 border border-orange-500/20"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
