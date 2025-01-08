import React, { createContext } from "react"

type TooltipProperties = {
    x: number,
    y: number,
    visible: boolean,
    dataType: "TEXT"| "IMAGE" | "",
    data:string
}

type TooltipReducerAction = {
    type: "SET" | "HIDE",
    event?: React.MouseEvent<HTMLDivElement, MouseEvent>
    newDataType?: TooltipProperties["dataType"]
    newData?: string
}


export function tooltipReducer(tooltipData: TooltipProperties, action: TooltipReducerAction): TooltipProperties{
    const newTooltipData = {...tooltipData}
    
    switch (action.type){
        case "SET":{
            newTooltipData.visible = true
            newTooltipData.x = action.event?.clientX!
            newTooltipData.y = action.event?.clientY!
            newTooltipData.data = action.newData!
            newTooltipData.dataType = action.newDataType!
            break;
        }

        case "HIDE":{
            newTooltipData.visible = false
            newTooltipData.x = 0
            newTooltipData.y = 0
            newTooltipData.data = ""
            newTooltipData.dataType = ""
            break;
            
        }

    }

    return newTooltipData

}

export type TooltipContextType = {
    tooltipData: TooltipProperties,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipData:{x:0, y:0, visible:false, data:"", dataType:""}, tooltipDispatch: ()=>{}})