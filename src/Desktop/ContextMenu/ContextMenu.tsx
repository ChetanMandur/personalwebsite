import React, { useContext, useLayoutEffect, useRef, useState } from "react"
import "./ContextMenu.css"
import { ContextMenuContext } from "../Contexts/ContextMenuData"



export default function ContextMenu(){
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const {contextMenuData}=useContext(ContextMenuContext)
    const [height, setHeight] = useState(0)

    useLayoutEffect(()=>{
        setHeight(contextMenuRef.current?.offsetHeight!)  
    },[])

    const contextStyle :React.CSSProperties = (contextMenuData.y > window.innerHeight/2)? {
        left: contextMenuData.x,
        top: contextMenuData.y - height,

    } : {
        left: contextMenuData.x,
        top: contextMenuData.y,
    }


    return(
        <div className="context-menu" ref={contextMenuRef} style={contextStyle}>
            { 
            Object.entries(contextMenuData.options).map((option, index)=>{

            return(
                <div key={index} className="context-menu-option" onClick={option[1]}>
                    {index} {option[0]}
                </div>
            )
            })
            }
        </div>
    )
}