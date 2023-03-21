export const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK
export const origin = process.env.NEXT_PUBLIC_ORIGIN

export const getNetworkParam = (network: string) => `https://d1t0d7c2nekuk0.cloudfront.net/${network}.json`

export const getBlockfrostUrl = (network: string) => `https://cardano-${network}.blockfrost.io/api/v0`

export const getBlockfrostKey = (network: string) => {
    switch (network) {
        case 'mainnet':
            return 'KWaNkQcrF1erC3u3SZjaFxZiM2M20jFM'
        case 'preview':
            return 'previewf5cTYv6hK1PYwgrnWPobtf0Y3EwMQRrY'
        default:
            return 'KWaNkQcrF1erC3u3SZjaFxZiM2M20jFM'
    }
}
