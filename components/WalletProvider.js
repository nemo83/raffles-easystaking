import { createContext, useContext, useState } from "react";

const Context = createContext();

export function WalletProvider({ children }) {
    const [walletApi, setWalletApi] = useState(null);
    return (
        <Context.Provider value={[walletApi, setWalletApi]}>{children}</Context.Provider>
    );
}

export function useWalletContext() {
    return useContext(Context);
}