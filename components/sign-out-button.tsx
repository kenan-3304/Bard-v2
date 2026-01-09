'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/signout/action'

export function SignOutButton({ className }: { className?: string }) {
    return (
        <Button
            variant="outline"
            onClick={() => signOut()}
            className={className}
        >
            Sign Out
        </Button>
    )
}
