import React, { createContext } from "react"

export type TooltipProperties = {
    x: number,
    y: number,
    visible: boolean,
    dataType: "TEXT"| "IMAGE" | null ,
    data:string
}

type TooltipReducerAction = 
{type: "SET", event: React.MouseEvent<HTMLDivElement, MouseEvent>, newDataType: TooltipProperties["dataType"], newData: string} |
{type: "HIDE"}

export function tooltipReducer(tooltipData: TooltipProperties, action: TooltipReducerAction): TooltipProperties{
    let newTooltipData: TooltipProperties = {...tooltipData}
    switch (action.type){
        case "SET":{
            // console.log("tooltip SET")

            newTooltipData = {
                visible: true,
                x: action.event!.clientX!,
                y: action.event!.clientY!,
                data: action.newData!,
                dataType: action.newDataType!,
            } as TooltipProperties

            break;
        }

        case "HIDE":{
            // console.log("tooltip HIDE")
            
            newTooltipData["visible"] = false
            break;
            
        }

    }
    return newTooltipData
}

export type TooltipContextType = {
    tooltipData: TooltipProperties,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipData:{x:0, y:0, data:"", dataType: null, visible:false}, tooltipDispatch: ()=>{}})