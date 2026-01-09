
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UploadProofPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [errorMsg, setErrorMsg] = useState('')

    // ... handleFileChange ...

    const executeUpload = async () => {
        if (!file || !attendance) {
            setErrorMsg('Please select a photo and enter attendance.')
            return
        }
        setErrorMsg('')
        setLoading(true)

        try {
            // 1. Upload Image
            const fileExt = file.name.split('.').pop()
            const fileName = `${id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('proofs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Update Offer
            const { error: updateError } = await supabase
                .from('offers')
                .update({
                    status: 'completed',
                    proof_image_path: filePath,
                    estimated_attendance: parseInt(attendance)
                })
                .eq('id', id)

            if (updateError) throw updateError

            // Success: clear state? No need, we redirect.
            router.refresh()
            router.push('/dashboard/bar')

        } catch (error: any) {
            console.error(error)
            setErrorMsg('Error: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Complete Activation</CardTitle>
                    <CardDescription>Upload a photo of the branding in action and estimated reach.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-medium border border-red-200">
                                {errorMsg}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Proof of Activation Photo</Label>
                            <Input type="file" accept="image/*" onChange={handleFileChange} required />
                            <p className="text-xs text-muted-foreground">Make sure the brand logo is visible.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Estimated Attendance</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 150"
                                value={attendance}
                                onChange={e => setAttendance(e.target.value)}
                                required
                            />
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" disabled={loading || !file || !attendance}>
                                    {loading ? 'Uploading...' : 'Submit & Complete'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Activation Completion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to submit this proof? This will mark the offer as completed and notify the brand.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={executeUpload}>
                                        Confirm & Submit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
