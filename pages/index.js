export default function Home() {
  return (
    <div>
      Hello world
    </div>
  )
}

export async function getServerSideProps(context) {
  console.log('hello world')
  const res = await fetch(`https://lottery.easystaking.online/raffles/stats`)
  const stats = await res.json()
  return {
      props: {
          stats
      }
  }
}