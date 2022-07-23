import Nav from './Nav'
import Dashboard from './Dashboard'
import { useEffect } from 'react';
import OpenRaffles from './OpenRaffles';
import ClosedRaffles from './ClosedRaffles';
import RecentWinners from './RecentWinners';

function Layout() {

    useEffect(() => {
        document.body.classList.add("bg-black-alt");
        document.body.classList.add("font-sans");
        document.body.classList.add("leading-normal");
        document.body.classList.add("tracking-normal");
    });

    return (
        <>
            <Nav />
            <div className="container w-full pt-20 mx-auto">

                <Dashboard />
                <OpenRaffles />
                <RecentWinners />
                <ClosedRaffles />
            </div>
        </>
    )
}

export default Layout