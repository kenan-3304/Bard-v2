
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Store, Beer } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // State 1: Not Authenticated
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome to Deal OS
          </h1>
          <p className="text-xl text-muted-foreground">
            The operating system for bars and brands to connect and grow.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // State 3: Authenticated with Role
  if (profile?.role) {
    if (profile.role === 'brand') {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Welcome back, {profile.role}!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/dashboard/brand">Go to Brand Dashboard</Link>
              </Button>
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </main>
      )
    } else {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Welcome back, {profile.role}!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/dashboard/bar">Go to Bar Dashboard</Link>
              </Button>
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </main>
      )
    }
  }

  // State 2: Authenticated without Role (Selection)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="absolute top-4 right-4">
        <SignOutButton />
      </div>
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Choose your path</h1>
        <p className="text-muted-foreground">Tell us who you are to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/onboard/bar" className="group">
          <Card className="h-full transition-all hover:border-black hover:shadow-lg cursor-pointer">
            <CardHeader className="text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <CardTitle>I own a Bar</CardTitle>
              <CardDescription>Manage your venue, capacity, and peak nights.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/onboard/brand" className="group">
          <Card className="h-full transition-all hover:border-black hover:shadow-lg cursor-pointer">
            <CardHeader className="text-center">
              <Beer className="w-12 h-12 mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform" />
              <CardTitle>I represent a Brand</CardTitle>
              <CardDescription>Showcase your products and connect with bars.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </main>
  )
}
