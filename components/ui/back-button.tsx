'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    className?: string
    label?: string
}

export function BackButton({ className, label = "Back" }: BackButtonProps) {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            onClick={() => router.back()}
            className={cn(
                "group flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-4 pl-0 pr-4",
                className
            )}
        >
            <div className="p-1 rounded-full border border-white/5 bg-white/5 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </Button>
    )
}
