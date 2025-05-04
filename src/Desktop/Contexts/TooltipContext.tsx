import React, { createContext } from "react"

export type TooltipProperties = {
    visible: boolean, // Whether or not the tooltip is visible
    x: number, // The x position of the tooltip
    y: number, // The y position of the tooltip
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
                x: action.event!.clientX!,
                y: action.event!.clientY!,
                duration: action.duration,
                data: action.data!,
                dataType: action.dataType!,
            } as TooltipProperties

            break;
        }

        case "HIDE":{
            newTooltipData["visible"] = false
            newTooltipData["duration"] = undefined
            break;
            
        }

    }
    return newTooltipData
}

export type TooltipContextType = {
    tooltipData: TooltipProperties,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipData:{x:0, y:0, duration:undefined ,data:"", dataType: null, visible:false}, tooltipDispatch: ()=>{}})