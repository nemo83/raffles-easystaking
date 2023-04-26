import { friendly_name_key } from '../../constants/lottery'
import toast from 'react-hot-toast'

export async function participate(friendlyName: string, baseAddress: string) {

    localStorage.setItem(friendly_name_key, friendlyName)

    const body = JSON.stringify({ payment_address: baseAddress })

    fetch('https://lottery.easystaking.online/raffles', {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((response) => {
        return new Promise((resolve) => response.json()
            .then((json) => resolve({
                status: response.status,
                ok: response.ok,
                json
            })))
    }).then(({ status, ok, json }) => {

        const message = json
        switch (status) {
            case 200:
                const numRaffles = json.length
                toast.success(`Congrats! You joined ${numRaffles} Raflles!`)
                break
            default:
                console.error('Error:', message);
                toast.error(`Error: ${message}`)
        }
    })

}