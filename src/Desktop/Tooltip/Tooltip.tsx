import { useLayoutEffect, useRef, useState } from "react";
import { TooltipProperties } from "../Contexts/TooltipContext";
import "./Tooltip.css"

export default function Tooltip({tooltipData}:{tooltipData:TooltipProperties}){
    // const {tooltipData} = useContext(TooltipContext)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)


    useLayoutEffect(()=>{
        setHeight(tooltipRef.current!.offsetHeight!)

    },[tooltipData])

    const tooltipStyle : React.CSSProperties = (tooltipData.y > window.innerHeight/2)? {
        // Bottom half of screen
        left: `calc(${tooltipData.x}px + 1.5vh)`,
        maxWidth: `calc(100vw - (${tooltipData.x}px + 1.5vh))`,

        top: `calc(${(tooltipData.y - height)}px - 0.5vh)`,
        maxHeight: `calc(100vh - (${(tooltipData.y - height)}px - 0.5vh))`,


    } : {
        // Top half of screen
        left: `calc(${tooltipData.x}px + 1.5vh)` ,
        maxWidth: `calc(100vw - (${tooltipData.x}px + 1.5vh))`,


        top: `calc(${(tooltipData.y)}px + 0.5vh)`,
        maxHeight: `calc(100vh - (${(tooltipData.y)}px + 0.5vh))`,
    }

    return(
        <div className="tooltip" ref={tooltipRef} style={tooltipStyle}>
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