'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(offerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Update status
    const { error } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId)

    if (error) {
        return { error: error.message }
    }

    // Revalidate paths to refresh data
    revalidatePath('/dashboard/agency')
    revalidatePath('/dashboard/agency/campaigns')

    return { success: true }
}
