import React, { createContext } from "react"


export type ContextMenuOptions = {
    [key:string]: (event?:React.MouseEvent)=>(void)
}

export type ContextMenuProperties = {
  x: number ,
  y: number,
  visible:boolean,
  source: string|undefined,
  options: ContextMenuOptions
}

export type ContextMenuReducerAction = {type: "SET",source?:string, event: React.MouseEvent, newOptions: ContextMenuOptions} | {type:"HIDE"}

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
            temp.options = {...action.newOptions}
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
