type Location = [longitude: number, latitude: number]

/**
 *  Get user's location values via geolocation API
 */
export async function getCurrentGeolocation(): Promise<Location | null> {
    if (!navigator.geolocation) {
        // error handling for not having geolocation API
        return null
    }
    try {
        const { coords }: GeolocationPosition = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        return [coords.longitude, coords.latitude]
    } catch (err) {
        switch ((err as GeolocationPositionError).code) {
            case 1: // PERMISSION_DENIED
                break
            case 2: // POSITION_UNAVAILABLE
                break
            case 3: // TIMEOUT
                break

            default:
                break
        }
        return null
    }
}
