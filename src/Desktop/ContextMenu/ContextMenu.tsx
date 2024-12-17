import { useContext } from "react"
import { RunningAppsContext } from "../Contexts/RunningApps"
import "./ContextMenu.css"

type ContextMenuOptions = {
    [key:string]: ()=>(void)
}

export default function ContextMenu(){
    const {runningAppsDispatch}=useContext(RunningAppsContext)
    const temp:ContextMenuOptions = {"test":()=>{alert("hi")}, "test2":()=>{console.log("hi")}}
    const temp2 = Object.entries(temp)
    return(
        <div className="context-menu">
            { 
            temp2.map((option, index)=>{

            return(
                <div className="context-menu-option" onClick={option[1]}>
                    {index} {option[0]}
                </div>
            )
            })
            }
        </div>
    )
}