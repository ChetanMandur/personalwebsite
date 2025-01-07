import { createContext } from "react"

export type StartMenuContextType = {
  startMenuOpen: boolean,
  setStartMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export const StartMenuContext = createContext<StartMenuContextType>({startMenuOpen: false, setStartMenuOpen: ()=>{}})
