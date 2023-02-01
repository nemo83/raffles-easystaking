import { createContext, useContext, useState } from "react";

const Context = createContext();

export function WalletProvider({ children }) {
    const [baseAddress, setBaseAddress] = useState(null);
    return (
        <Context.Provider value={[baseAddress, setBaseAddress]}>{children}</Context.Provider>
    );
}

export function useWalletContext() {
    return useContext(Context);
}