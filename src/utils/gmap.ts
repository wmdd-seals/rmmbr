import { Loader } from '@googlemaps/js-api-loader'
import { Location } from './types'

const loader = new Loader({
    apiKey: import.meta.env?.VITE_PUBLIC_GOOGLE_MAP_API_KEY,
    version: 'weekly',
    libraries: ['places']
})

export class GMap {
    private maps: google.maps.Map | null | undefined = null

    public constructor() {}

    public async initMap(element: HTMLElement, loc: Location): Promise<void> {
        const mapOptions = {
            center: {
                lng: loc[0],
                lat: loc[1]
            },
            zoom: 15,
            mapId: 'rmmbr_map'
        }
        try {
            const { Map } = await loader.importLibrary('maps')
            this.maps = new Map(element, mapOptions)
        } catch (err) {
            // todo: error handling
            console.error(err)
        }
    }

    public async putMarker(locations: Location[]): Promise<void> {
        try {
            const { AdvancedMarkerElement } = await loader.importLibrary('marker')

            locations.forEach(location => {
                new AdvancedMarkerElement({
                    position: {
                        lat: location[1],
                        lng: location[0]
                    },
                    map: this.maps,
                    title: 'hello'
                })
            })
        } catch (err) {
            // todo: error handling
            console.error(err)
        }
    }
}
