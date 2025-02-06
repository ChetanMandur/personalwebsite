import React, { createContext } from "react"

export type TooltipProperties = {
    x: number,
    y: number,
    visible: boolean,
    dataType: "TEXT"| "IMAGE" ,
    data:string
}

type TooltipList = {
    [key: string] : TooltipProperties
}

type TooltipReducerAction = 
{type: "SET", tooltipID: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>, newDataType: TooltipProperties["dataType"], newData: string} |
{type: "HIDE", tooltipID: string, }

export function tooltipReducer(tooltipData: TooltipList, action: TooltipReducerAction): TooltipList{
    const newTooltipData = {...tooltipData}
    
    switch (action.type){
        case "SET":{
            newTooltipData[action.tooltipID]= {
                visible: true,
                x: action.event!.clientX!,
                y: action.event!.clientY!,
                data: action.newData!,
                dataType: action.newDataType!
            } as TooltipProperties

            break;
        }

        case "HIDE":{
            delete newTooltipData[action.tooltipID]
            break;
            
        }

    }
    return newTooltipData
}

export type TooltipContextType = {
    tooltipList: TooltipList,
    tooltipDispatch: React.Dispatch<TooltipReducerAction>
}

export const TooltipContext = createContext<TooltipContextType>({tooltipList:{}, tooltipDispatch: ()=>{}})