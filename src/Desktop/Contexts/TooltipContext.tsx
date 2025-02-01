import React, { createContext } from "react"

export type TooltipProperties = {
    x: number,
    y: number,
    visible: boolean,
    dataType: "TEXT"| "IMAGE" | "",
    data:string
}

type TooltipList = {
    [key: string] : TooltipProperties
}

type TooltipReducerAction = {
    type: "SET" | "HIDE",
    tooltipID: string,
    event?: React.MouseEvent<HTMLDivElement, MouseEvent>,
    newDataType?: TooltipProperties["dataType"],
    newData?: string
}


export function tooltipReducer(tooltipData: TooltipList, action: TooltipReducerAction): TooltipList{
    const newTooltipData = {...tooltipData}
    
    switch (action.type){
        case "SET":{
            // const currentToolTip: TooltipProperties = {
            //     visible: true,
            //     x : action.event!.clientX!,
            //     y : action.event!.clientY!,
            //     data : action.newData!,
            //     dataType : action.newDataType!

            // }
            // newTooltipData[action.tooltipID] = currentToolTip
            // newTooltipData[action.tooltipID]["visible"] = true
            // newTooltipData[action.tooltipID]["x"] = action.event!.clientX!
            // newTooltipData[action.tooltipID]["y"] = action.event!.clientY!
            // newTooltipData[action.tooltipID]["data"] = action.newData!
            // newTooltipData[action.tooltipID]["dataType"] = action.newDataType!

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