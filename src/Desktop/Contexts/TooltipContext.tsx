import React, { createContext } from "react"

export type TooltipProperties = {
    visible: boolean, // Whether or not the tooltip is visible
    mouseEvent: React.MouseEvent | null, // The mouse event related to the tooltip
    duration: number|undefined, // (Optional) How long, in seconds, it takes for the tooltip to appear
    dataType: "TEXT"| "IMAGE" | null , // The type of data the tooltip contains
    data:string // The tooltip data
}

type TooltipReducerAction = 
    {
        type: "SET", 
        event: React.MouseEvent<HTMLDivElement, MouseEvent>, 
        duration?: number,
        dataType: TooltipProperties["dataType"], 
        data: string
    } 
    |
    {
        type: "HIDE"
    }

export function tooltipReducer(tooltipData: TooltipProperties, action: TooltipReducerAction): TooltipProperties{
    let newTooltipData: TooltipProperties = {...tooltipData}
    switch (action.type){
        case "SET":{
            newTooltipData = {
                visible: true,
                mouseEvent: action.event,
                duration: action.duration,
                data: action.data!,
                dataType: action.dataType!,
            } as TooltipProperties

            break;
        }

        case "HIDE":{
            newTooltipData["visible"] = false
            newTooltipData["duration"] = undefined
            newTooltipData["mouseEvent"] = null
            break;
            
        }

    }
    return newTooltipData
}

export type TooltipContextType = {
    tooltipData: TooltipProperties,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipData:{mouseEvent:null,duration:undefined ,data:"", dataType: null, visible:false}, tooltipDispatch: ()=>{}})