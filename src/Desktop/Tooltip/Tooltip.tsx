import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TooltipContext } from "../Contexts/TooltipContext";
import "./Tooltip.css"

export default function Tooltip(){
    // Used to get the current data of the tooltip
    const {tooltipDispatch,tooltipData} = useContext(TooltipContext)

    // Used to have a reference to the tooltip (needed when getting height of tooltip)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

    useEffect(()=>{
        const hide = () =>{
            tooltipDispatch({type:"HIDE"})
        }
        tooltipData.mouseEvent!.target.addEventListener("mouseout", hide, {once:true})
        tooltipData.mouseEvent!.target.addEventListener("mouseleave", hide, {once:true})
        tooltipData.mouseEvent!.target.addEventListener("focus", hide, {once:true})
    },[])

    useLayoutEffect(()=>{

        const newTooltipStyle: React.CSSProperties = {}

        // The tooltip's delay before appear
        if (tooltipData.duration != undefined){
            newTooltipStyle["animationDuration"] = tooltipData.duration + "s"
        }

        // If mouse is on the bottom half of the screen
        if (tooltipData.y > window.innerHeight/2) {
            newTooltipStyle["bottom"] = `calc(${window.innerHeight - tooltipData.y}px)`
            newTooltipStyle["maxHeight"] = `calc(${tooltipData.y}px)`
        }

        // If mouse is on the top half of the screen
        else{
            newTooltipStyle["top"] = `calc(${tooltipData.y}px )`
            newTooltipStyle["maxHeight"] = `calc(${window.innerHeight -tooltipData.y}px )`
        }

        // If mouse is not near the right edge of the screen
        if ((window.innerWidth - tooltipData.x) > (window.innerWidth * 0.1)  ){
            newTooltipStyle["left"] = `calc(${tooltipData.x}px + 1.5vh )`
            newTooltipStyle["maxWidth"] = `calc(${ window.innerWidth - tooltipData.x}px)`
        }
        
        // If mouse is near the right edge of the screen
        else{
            newTooltipStyle["right"] = `calc(${window.innerWidth - tooltipData.x}px + 1vh )`
            newTooltipStyle["maxWidth"] = `calc(${tooltipData.x}px)`
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