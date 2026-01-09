'use client'

import { useState, useEffect } from 'react'
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete'
import { useJsApiLoader } from '@react-google-maps/api'
import { MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface PlacesAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSelect?: (address: string, lat?: number, lng?: number) => void
    onOptionSelect?: (mainText: string, secondaryText: string) => void
    placeholder?: string
    className?: string
}

const libraries: ('places')[] = ['places']

export default function PlacesAutocomplete({
    value,
    onChange,
    onSelect,
    onOptionSelect,
    placeholder = "Search for a location...",
    className
}: PlacesAutocompleteProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    })

    if (loadError) {
        return <div className="text-red-500 text-sm p-2">Error loading Maps: {loadError.message}</div>
    }

    if (!isLoaded) {
        return (
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <Input
                    disabled
                    placeholder="Loading maps..."
                    className={`pl-10 h-11 ${className}`}
                />
                <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 animate-spin" />
            </div>
        )
    }

    return <PlacesAutocompleteContent value={value} onChange={onChange} onSelect={onSelect} onOptionSelect={onOptionSelect} placeholder={placeholder} className={className} />
}

function PlacesAutocompleteContent({
    value,
    onChange,
    onSelect,
    onOptionSelect,
    placeholder,
    className
}: PlacesAutocompleteProps) {
    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
        defaultValue: value,
        initOnMount: !!value, // Initialize with custom value if present
    })

    // Sync external value changes if needed (optional, strictly controlled vs internal state)
    // For this use case, we primarily drive from internal state but allow init
    useEffect(() => {
        if (value && value !== inputValue) {
            setValue(value, false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])


    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        onChange(e.target.value)
    }

    const handleSelect = async (description: string, main_text?: string, secondary_text?: string) => {
        setValue(description, false)
        clearSuggestions()
        onChange(description)

        if (onOptionSelect && main_text) {
            onOptionSelect(main_text, secondary_text || '')
        }

        try {
            const results = await getGeocode({ address: description })
            const { lat, lng } = await getLatLng(results[0])
            if (onSelect) {
                onSelect(description, lat, lng)
            }
        } catch (error) {
            console.error('Error: ', error)
        }
    }

    return (
        <div className="relative group">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 z-10" />
            <Input
                value={inputValue}
                onChange={handleInput}
                disabled={false}
                placeholder={placeholder}
                className={`pl-10 h-11 ${className}`}
            />

            {status === 'OK' && (
                <ul className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg border border-gray-100 max-h-60 overflow-auto py-1 text-sm">
                    {data.map(({ place_id, description, structured_formatting }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description, structured_formatting?.main_text, structured_formatting?.secondary_text)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center gap-2"
                        >
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium">{structured_formatting?.main_text || description}</span>
                                {structured_formatting?.secondary_text && (
                                    <span className="text-xs text-gray-500">{structured_formatting.secondary_text}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
