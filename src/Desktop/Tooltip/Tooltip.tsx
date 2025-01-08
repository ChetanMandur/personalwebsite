import { useContext, useLayoutEffect, useRef, useState } from "react";
import { TooltipContext } from "../Contexts/TooltipContext";
import "./Tooltip.css"

export default function Tooltip(){
    const {tooltipData} = useContext(TooltipContext)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)


    useLayoutEffect(()=>{
        setHeight(tooltipRef.current?.offsetHeight!)

    },[tooltipData])

    const tooltipStyle : React.CSSProperties = (tooltipData.y > window.innerHeight/2)? {
        left: `calc(${tooltipData.x}px + 1.2vh)`,
        top: `calc(${(tooltipData.y - height)}px + 1vh)`,

    } : {
        left: `calc(${tooltipData.x}px + 1.2vh)` ,
        top: `calc(${(tooltipData.y)}px + 1vh)`,
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