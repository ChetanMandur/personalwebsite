import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { TooltipContext } from "../Contexts/TooltipContext";
import "./Tooltip.css"

export default function Tooltip(){
    // Used to get the current data of the tooltip
    const {tooltipData} = useContext(TooltipContext)

    // Used to have a reference to the tooltip (needed when getting height of tooltip)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})


    // Sets the height of the tooltip
    // `useLayoutEffect` allows us to get the final height of the tooltip after the inner contents been rendered
    useLayoutEffect(()=>{
        const height = tooltipRef.current!.offsetHeight!
        const width = tooltipRef.current!.offsetWidth!

        const newTooltipStyle: React.CSSProperties = {}

        // The tooltip's delay before appear
        if (tooltipData.duration != undefined){
            newTooltipStyle["animationDuration"] = tooltipData.duration + "s"
        }


        // The tooltip's vertical position different depending on where the mouse is (relative to the screen)
                // If the mouse is on the bottom half of the screen, the tooltip should appear slightly above the mouse
                // If the mouse is on the top half of the screen, the tooltip should appear slightly below the mouse
        if (tooltipData.y > window.innerHeight/2) {
            newTooltipStyle["top"] = `calc(${(tooltipData.y - height)}px - 0.5vh)`
            newTooltipStyle["maxHeight"] = `calc(100vh - (${(tooltipData.y - height)}px - 0.5vh))`
        }
        else{
            newTooltipStyle["top"] = `calc(${(tooltipData.y)}px + 0.5vh)`
            newTooltipStyle["maxHeight"] = `calc(100vh - (${(tooltipData.y)}px + 0.5vh))`
        }

        // The tooltip's horizontal positon dpending how close to the right edge the mouse is
        if ((window.innerWidth - tooltipData.x) > (width)  ){
            newTooltipStyle["left"] = `calc(${tooltipData.x}px + 1.5vh)`
            newTooltipStyle["maxWidth"] = `calc(100vw - (${tooltipData.x}px + 1.5vh))`
        }
        else{
            newTooltipStyle["left"] = `calc(${tooltipData.x - width}px - 1vh)`
            newTooltipStyle["maxWidth"] = `calc(100vw - (${tooltipData.x - width}px - 1vh))`
        }

        setTooltipStyle(newTooltipStyle)
    },[tooltipData])

    

    return(
        <div className="tooltip" ref={tooltipRef} 
            style={tooltipStyle}
        >
            {
                tooltipData.dataType == "TEXT" ?
                <div className="tooltip-text">
                    {tooltipData.data}
                </div>
                :
                <div className="tooltip-image">
                    <img src={tooltipData.data} alt="" />
                </div>
            }
        </div>

    )
}