import {PropsWithChildren,useReducer, useState } from "react";
import { StartMenuContext } from "./StartMenu";
import { RunningAppsContext, runningAppsReducer } from "./RunningApps";

export function StateContext(props:PropsWithChildren){
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningAppsTask, runningAppsDispatch] = useReducer(runningAppsReducer, {})

  return(
    
      <StartMenuContext.Provider value={{startMenuOpen, setStartMenuOpen}}>
        <RunningAppsContext.Provider value = {{runningAppsTask, runningAppsDispatch}}>
         {props.children}
        </RunningAppsContext.Provider>
      </StartMenuContext.Provider>

  )
    
}