import React, { createContext } from "react"


export type ContextMenuOptions = {
    [key:string]: (event?:React.MouseEvent<HTMLDivElement, MouseEvent>)=>(void)
}

export type ContextMenuProperties = {
  x: number ,
  y: number,
  visible:boolean,
  options: ContextMenuOptions
}

export type ContextMenuReducerAction = {
  type: "HIDE" | "SET"
  event?: React.MouseEvent<HTMLDivElement, MouseEvent>,
  newOptions?: ContextMenuOptions,

}


export function contextMenuPropagation(event: React.MouseEvent<HTMLDivElement, MouseEvent>){
  event.stopPropagation();
  event.preventDefault()
}


export function contextMenuReducer(contextMenuData:ContextMenuProperties, action:ContextMenuReducerAction):ContextMenuProperties {
    const temp = {...contextMenuData}
    switch (action.type){
        case "HIDE": 
            temp.visible = false
            break;
        case "SET":
            temp.visible = true
            temp.options = {...action.newOptions}
            temp.x = action.event?.clientX!
            temp.y = action.event?.clientY!
            break;
    }
    return(temp)
}

export type ContextMenuContextType = {
  contextMenuData: ContextMenuProperties, 
  contextMenuDispatch:  React.Dispatch<ContextMenuReducerAction>
}

 export const ContextMenuContext = createContext<ContextMenuContextType>({contextMenuData:{x:0,y:0,visible:false, options:{}}, contextMenuDispatch:()=>{}})
