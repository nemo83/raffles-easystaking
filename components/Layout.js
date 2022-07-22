import Nav from './Nav'
import Dashboard from './Dashboard'

function Layout({ children }) {
    return (
        <>
        <Nav/>
        <Dashboard/>
        <div>
            <main>
                {children}
            </main>
        </div>
        </>
    )
}

export default Layout