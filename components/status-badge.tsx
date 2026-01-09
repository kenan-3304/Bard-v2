
import { Badge } from "@/components/ui/badge"

type Status = 'sent' | 'accepted' | 'rejected' | 'countered' | 'declined' | 'completed' | 'active' | 'draft' | 'archived'

interface StatusBadgeProps {
    status: Status | string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
    let colorClass = ""

    switch (status) {
        case 'sent':
        case 'draft':
            variant = "secondary"
            colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200"
            break
        case 'countered':
            variant = "secondary"
            // Using amber/orange for 'warning' state
            colorClass = "bg-amber-100 text-amber-800 hover:bg-amber-200"
            break
        case 'accepted':
        case 'active':
            variant = "secondary"
            // Using emerald for 'success' state
            colorClass = "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            break
        case 'completed':
            variant = "default"
            // Primary dark for completed/final state
            colorClass = "bg-zinc-900 text-white hover:bg-zinc-800"
            break
        case 'rejected':
        case 'declined':
        case 'archived':
            variant = "destructive"
            break
        default:
            variant = "secondary"
    }

    return (
        <Badge variant={variant} className={`capitalize font-medium ${colorClass} ${className}`}>
            {status}
        </Badge>
    )
}
