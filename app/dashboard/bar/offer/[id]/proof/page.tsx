
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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

            // 2. Get Public URL (Optional, depending on bucket setting, but path is enough usually)
            // const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath)

            // 3. Update Offer
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
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Uploading...' : 'Submit & Complete'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
