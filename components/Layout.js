import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

const Nav = dynamic(() => import('./Nav.tsx'), { ssr: false })

function Layout({ children }) {

    useEffect(() => {
        document.body.classList.add("bg-black-alt");
        document.body.classList.add("font-sans");
        document.body.classList.add("leading-normal");
        document.body.classList.add("tracking-normal");
    });

    return (
        <>
            <Nav />
            <div className="container w-11/12 pt-20 mx-auto md:w-4/6">
                {children}
            </div>
        </>
    )
}

export default Layout