
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        // Redirect with error details from exchangeCodeForSession
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.name}&description=${error.message}`)
    }

    // Check for errors returned by the provider (e.g., access_denied)
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    if (error) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&description=${error_description}`)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=NoCode&description=No authorization code returned from provider`)
}
