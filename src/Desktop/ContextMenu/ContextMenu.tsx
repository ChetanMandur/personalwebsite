import { useContext } from "react"
import "./ContextMenu.css"
import { ContextMenuContext } from "../Contexts/ContextMenuData"



export default function ContextMenu(){
    const {contextMenuData}=useContext(ContextMenuContext)

    return(
        <div className="context-menu" style={{left:contextMenuData.x, top:contextMenuData.y}}>
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