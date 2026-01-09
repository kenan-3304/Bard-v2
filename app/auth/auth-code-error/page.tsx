
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-red-600">Authentication Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>There was an issue signing you in. Expected an authorization code but received a token or nothing.</p>
                    <p className="text-sm text-gray-500">
                        This might happen if the authentication flow was misconfigured (Implicit vs PKCE).
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/login">Try Again</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
