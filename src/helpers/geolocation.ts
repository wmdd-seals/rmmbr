type Location = () => Promise<[number, number] | null>

/**
 *  Get user's location values via geolocation API
 * @returns [number, number] or null
 */
export const getPosition: Location = async () => {
    if (!navigator.geolocation) {
        return null
    }
    let result = null

    const locationResolver = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    await locationResolver
        .then(position => {
            result = [
                (position as GeolocationPosition).coords.longitude,
                (position as GeolocationPosition).coords.latitude
            ]
        })
        .catch((error: GeolocationPositionError) => {
            switch (error.code) {
                case 1: // PERMISSION_DENIED
                    break
                case 2: // POSITION_UNAVAILABLE
                    break
                case 3: // TIMEOUT
                    break

                default:
                    break
            }
            console.error({ error })
            result = null
        })

    return result
}
