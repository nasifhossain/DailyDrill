import { createContext } from "react";

export const AppContext = createContext(null);
function AppContextProvider({ children }) {
    



  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}
export default AppContextProvider;
