export default function Home() {
  return (
    <div>
      Hello world
    </div>
  )
}

// export async function getServerSideProps(context) {

//   // Stats
//   const statsRes = await fetch(`https://lottery.easystaking.online/raffles/stats`)
//   const stats = await statsRes.json()

//   //Raffles
//   const rafflesRes = await fetch(`https://lottery.easystaking.online/raffles`)
//   const allRaffles = await rafflesRes.json()

//   const openRaffles = allRaffles.filter(raffle => !raffle.is_closed)
//   const closedRaffles = allRaffles.filter(raffle => raffle.is_closed).slice(0, 10)

//   //Winners
//   const winnersRes = await fetch(`https://lottery.easystaking.online/winners`)
//   const winners = await winnersRes.json()
//   const recentWinners = winners.slice(0, 10)

//   return {
//     props: {
//       stats,
//       openRaffles,
//       closedRaffles,
//       recentWinners
//     }
//   }
// }