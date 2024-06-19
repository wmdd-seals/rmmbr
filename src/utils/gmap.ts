import { Loader } from '@googlemaps/js-api-loader'

type LatLng = {
    lat: number
    lng: number
}

const loader = new Loader({
    apiKey: import.meta.env?.VITE_PUBLIC_GOOGLE_MAP_API_KEY,
    version: 'weekly',
    libraries: ['places']
})

export class GMap {
    private maps: google.maps.Map | null | undefined = null

    private constructor(element: HTMLElement, latLng: LatLng) {
        void this.initMap(element, latLng)
    }

    private async initMap(element: HTMLElement, latLng: LatLng): Promise<void> {
        const mapOptions = {
            center: latLng,
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

    public async putMarker(latLngs: LatLng[]): Promise<void> {
        try {
            const { AdvancedMarkerElement } = await loader.importLibrary('marker')

            latLngs.forEach(xy => {
                new AdvancedMarkerElement({
                    position: xy,
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
