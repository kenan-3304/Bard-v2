
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
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [attendance, setAttendance] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    // Function to handle the actual upload logic
    const executeUpload = async () => {
        if (!file || !attendance) {
            alert('Please select a photo and enter attendance.')
            return
        }

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

            alert('Activation completed successfully!')
            router.push('/dashboard/bar')
            router.refresh()

        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
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
