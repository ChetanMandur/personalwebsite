import { useContext, useLayoutEffect, useRef, useState } from "react";
import { TooltipContext } from "../Contexts/TooltipContext";
import "./Tooltip.css"

export default function Tooltip(){
    // Used to get the current data of the tooltip
    const {tooltipData} = useContext(TooltipContext)

    // Used to have a reference to the tooltip (needed when getting height of tooltip)
    const tooltipRef = useRef<HTMLDivElement>(null)

    // State for storing the height of the tooltip
    const [height, setHeight] = useState(0)


    // Sets the height of the tooltip
    // `useLayoutEffect` allows us to get the final height of the tooltip after the inner contents been rendered
    useLayoutEffect(()=>{
        setHeight(tooltipRef.current!.offsetHeight!)

    },[tooltipData])

    // The tooltip's position different depending on where the mouse is (relative to the screen)
        // If the mouse is on the bottom half of the screen, the tooltip should appear slightly above the mouse
        // If the mouse is on the top half of the screen, the tooltip should appear slightly below the mouse
    const tooltipStyle : React.CSSProperties = (tooltipData.y > window.innerHeight/2) ? 
        {
            // Bottom half of screen
            top: `calc(${(tooltipData.y - height)}px - 0.5vh)`,
            maxHeight: `calc(100vh - (${(tooltipData.y - height)}px - 0.5vh))`,
        } 
        : 
        {
            // Top half of screen`
            top: `calc(${(tooltipData.y)}px + 0.5vh)`,
            maxHeight: `calc(100vh - (${(tooltipData.y)}px + 0.5vh))`,
        }

    return(
        <div className="tooltip" ref={tooltipRef} style={{
            ...tooltipStyle, 
            left:`calc(${tooltipData.x}px + 1.5vh)`,
            maxWidth: `calc(100vw - (${tooltipData.x}px + 1.5vh))`}}>
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