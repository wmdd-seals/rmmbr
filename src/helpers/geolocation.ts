type Location = [longitude: number, latitude: number]

/**
 * Ask users for the permissiono to use a browser API
 */
async function queryPermission(type: PermissionName): Promise<void> {
    await navigator.permissions.query({ name: type })
}

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
        console.log({ err })
        switch ((err as GeolocationPositionError).code) {
            case 1: // PERMISSION_DENIED
                await queryPermission('geolocation')
                break
            case 2: // POSITION_UNAVAILABLE
                // todo: give error message
                break
            case 3: // TIMEOUT
                // todo: give error message
                break

            default:
                break
        }
        return null
    }
}
