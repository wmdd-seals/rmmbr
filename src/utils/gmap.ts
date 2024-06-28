import { Loader } from '@googlemaps/js-api-loader'
import { Location } from './types'

const loader = new Loader({
    apiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAP_API_KEY,
    version: 'weekly',
    libraries: ['places']
})

export async function createMapWithMarkers(element: HTMLElement, center: Location, markers: Location[]): Promise<void> {
    const mapOptions = {
        center: {
            lng: center[0],
            lat: center[1]
        },
        zoom: 15,
        mapId: 'rmmbr_map'
    }

    const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('marker')
    ])

    const map = new Map(element, mapOptions)

    markers.forEach(location => {
        new AdvancedMarkerElement({
            position: {
                lat: location[1],
                lng: location[0]
            },
            map
        })
    })
}

export const [{ Autocomplete }, { Geocoder }] = await Promise.all([
    loader.importLibrary('places'),
    loader.importLibrary('geocoding')
])

export async function codeAddress(address: string): Promise<google.maps.LatLng | void> {
    if (!address) {
        console.error('The address value was null or undefined')
        return
    }
    try {
        const { results } = await new Geocoder().geocode({ address: address })
        const location = results[0].geometry.location
        return location
    } catch (err) {
        console.error(err)
        return
    }
}
