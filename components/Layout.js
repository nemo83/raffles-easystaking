import Dashboard from './Dashboard'
import { useEffect, useState } from 'react';
import OpenRaffles from './OpenRaffles';
import MyRaffles from './MyRaffles';
import ClosedRaffles from './ClosedRaffles';
import RecentWinners from './RecentWinners';

import dynamic from 'next/dynamic';

const Nav = dynamic(() => import('./Nav'), { ssr: false })

function Layout() {

    const [baseAddress, setBaseAddress] = useState(null)

    useEffect(() => {
        document.body.classList.add("bg-black-alt");
        document.body.classList.add("font-sans");
        document.body.classList.add("leading-normal");
        document.body.classList.add("tracking-normal");
    });

    return (
        <>
            <Nav exportBaseAddress={setBaseAddress} />
            <div className="container w-4/6 pt-20 mx-auto">

                <Dashboard />
                {baseAddress ? (
                    <MyRaffles baseAddress={baseAddress} />
                ) : null}
                <OpenRaffles />
                <RecentWinners />
                <ClosedRaffles />
            </div>
        </>
    )
}

export default Layout