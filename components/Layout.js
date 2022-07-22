import Nav from './Nav'
import Dashboard from './Dashboard'
import { useEffect } from 'react';

function Layout({ children, stats }) {
    
    useEffect(() => {
        document.body.classList.add("bg-black-alt");
        document.body.classList.add("font-sans");
        document.body.classList.add("leading-normal");
        document.body.classList.add("tracking-normal");
    });

    return (
        <>
            <Nav />
            <Dashboard stats={stats} />
            <div>
                <main>
                    {children}
                </main>
            </div>
        </>
    )
}

export default Layout