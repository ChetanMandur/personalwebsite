import React, { createContext } from "react"


export type ContextMenuOptions = {
    [key:string]: (event?:React.MouseEvent)=>(void)
}

export type ContextMenuProperties = {
  x: number , // The x location of the ContextMenu
  y: number, // The y location of the ContextMenu
  visible:boolean, // Whether or not the ContextMenu is currently visible
  source: string|undefined, // (Optional) The source of the ContextMenu
  options: ContextMenuOptions // The options/buttons of the ContextMenu
}

export type ContextMenuReducerAction = 
  { type: "SET", // For the "SET" action
    source?:string, // (Optional) the source of the ContextMenu
    event: React.MouseEvent,  // The MouseEvent given with 'onContextMenu' event listener
    options: ContextMenuOptions // The list of options/buttons to be within the ContextMenu
  } 
  | 
  {
    type:"HIDE" //For the "HIDE" action
  }

export function contextMenuPropagation(event: React.MouseEvent){
  event.stopPropagation();
  event.preventDefault()
}

export function contextMenuReducer(contextMenuData:ContextMenuProperties, action:ContextMenuReducerAction):ContextMenuProperties {
    const temp = {...contextMenuData}
    switch (action.type){
        case "HIDE": 
            temp.visible = false
            temp.source = undefined
            break;
        case "SET":
            temp.visible = true
            temp.source = action.source
            temp.options = {...action.options}
            temp.x = action.event.clientX!
            temp.y = action.event.clientY!
            break;
    }
    return(temp)
}

export type ContextMenuContextType = {
  contextMenuData: ContextMenuProperties, 
  contextMenuDispatch:  React.Dispatch<ContextMenuReducerAction>
}

 export const ContextMenuContext = createContext<ContextMenuContextType>({contextMenuData:{x:0,y:0,visible:false,source:undefined, options:{}}, contextMenuDispatch:()=>{}})
