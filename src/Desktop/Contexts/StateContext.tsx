import {PropsWithChildren,useReducer, useState } from "react";
import { StartMenuContext } from "./StartMenu";
import { RunningAppsContext, runningAppsReducer } from "./RunningApps";
import { ContextMenuContext, contextMenuReducer } from "./ContextMenuData";

export function StateContext(props:PropsWithChildren){
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningAppsData, runningAppsDispatch] = useReducer(runningAppsReducer, {})
  const [contextMenuData, contextMenuDispatch] = useReducer(contextMenuReducer, {x:0,y:0,visible:false, options:{}})

  return(
    
      <StartMenuContext.Provider value={{startMenuOpen, setStartMenuOpen}}>
        <RunningAppsContext.Provider value = {{runningAppsData, runningAppsDispatch}}>
          <ContextMenuContext.Provider value={{contextMenuData,contextMenuDispatch}}>
            {props.children}
          </ContextMenuContext.Provider>
        </RunningAppsContext.Provider>
      </StartMenuContext.Provider>

  )
    
}