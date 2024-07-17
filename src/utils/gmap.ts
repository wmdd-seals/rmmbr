import { Loader } from '@googlemaps/js-api-loader'
import { Location, Maybe, PromiseMaybe } from './types'

const loader = new Loader({
    apiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAP_API_KEY,
    version: 'weekly',
    libraries: ['places']
})

export async function createMapWithMarkers(
    element: HTMLElement,
    options: { center?: Location; markers: Location[] }
): Promise<void> {
    const { center, markers } = options

    const mapOptions = {
        center: center ? { lng: center[0], lat: center[1] } : null,
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

export async function initAutoComplete(inputElement: HTMLInputElement): Promise<void> {
    const { Autocomplete } = await loader.importLibrary('places')
    new Autocomplete(inputElement)
}

export async function codeAddress(address: string): PromiseMaybe<Location> {
    if (!address) {
        return null
    }

    try {
        const { Geocoder } = await loader.importLibrary('geocoding')
        const { results } = await new Geocoder().geocode({ address: address })
        const location = results[0].geometry.location

        return [location.lng(), location.lat()]
    } catch (err) {
        console.warn(err)

        return null
    }
}

type LocationInfo = {
    country: string
    city: Maybe<string>
}

export async function getLocationInfo(location: Location): PromiseMaybe<LocationInfo> {
    const [lng, lat] = location
    try {
        const { Geocoder } = await loader.importLibrary('geocoding')
        const { results } = await new Geocoder().geocode({ location: { lng, lat } })

        let city: Maybe<string> = null
        let country: Maybe<string> = null

        for (const component of results) {
            if (!city) {
                if (component.types.includes('locality')) {
                    for (const addressComponent of component.address_components) {
                        if (addressComponent.types.includes('locality')) {
                            city = addressComponent.long_name
                            break
                        }
                    }
                }
            }

            if (!country) {
                const isCountry = component.types.includes('country')
                if (isCountry) country = component.address_components[0].long_name
            }

            if (country && city) return { country, city }
        }

        if (!country) return null

        return { country, city }
    } catch (err) {
        console.warn(err)

        return null
    }
}
