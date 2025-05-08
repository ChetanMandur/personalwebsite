import React, { createContext } from "react"

export type TooltipProperties = {
    visible: boolean, // Whether or not the tooltip is visible
    event: React.MouseEvent | null, // The mouse event related to the tooltip
    source: string | undefined, // (Optional) The source of the tooltip, used to define where the tooltip is from
    duration: number|undefined, // (Optional) How long, in seconds, it takes for the tooltip to appear
    dataType: "TEXT"| "IMAGE" | null , // The type of data the tooltip contains
    data:string // The tooltip data
}

type TooltipReducerAction = 
    {
        type: "SET", 
        event: React.MouseEvent<HTMLDivElement, MouseEvent>, 
        source?: string,
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
                event: action.event,
                source: action.source,
                duration: action.duration,
                data: action.data!,
                dataType: action.dataType!,
            } as TooltipProperties

            break;
        }

        case "HIDE":{
            newTooltipData["visible"] = false
            newTooltipData["duration"] = undefined
            newTooltipData["event"] = null
            newTooltipData["source"] = undefined
            break;
            
        }

    }
    return newTooltipData
}

export type TooltipContextType = {
    tooltipData: TooltipProperties,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipData:{event:null,source:undefined,duration:undefined ,data:"", dataType: null, visible:false}, tooltipDispatch: ()=>{}})