import { useContext } from "react"
import "./Taskbar.css"

import { AppList } from "../../Apps/Apps"
import { StartMenuContext, RunningAppsContext } from "../StateContext"
import StartMenu from "./StartMenu/StartMenu"



export default function Taskbar(){
  const {startMenuOpen, setStartMenuOpen} = useContext(StartMenuContext)
  const {runningAppsTask, runningAppsDispatch} = useContext(RunningAppsContext)

  const RunningAppArray = Object.entries(runningAppsTask)

  return(
    <div className="taskbar"> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}><img className="common-border" src="https://www.svgrepo.com/show/512467/menu-navigation-grid-1530.svg"/></div>
        {startMenuOpen ? <StartMenu/>:<></>}
        <div className="active-apps" onClick={()=>{setStartMenuOpen(false)}}> 
           {
            RunningAppArray.map((item)=>{ 
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = item[1]

              return(
              <div className="common-border active-app " key={Math.random()} onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id});}}> 
                <img className={(running_properties["isMinimized"] ? "icon-minimized" : "icon-unminimized")} src={AppList[app_id].icon}  alt="" />
                <div className={"status "+ (running_properties["isMinimized"] ? "" : (running_properties["zIndex"] == 999 ? "status-focused": "status-unfocused"))}/>
               </div>
              )
            })
           }

        </div>
      </div>
  )
}