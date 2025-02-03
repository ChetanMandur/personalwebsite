import { useContext, useEffect, useState } from "react"
import "./Taskbar.css"

import StartMenu from "./StartMenu/StartMenu"
import { StartMenuContext } from "../Contexts/StartMenuContext";
import { RunningAppsContext } from "../Contexts/RunningAppsContext";
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../Contexts/ContextMenuContext";



export default function Taskbar(){
  const {startMenuOpen, setStartMenuOpen} = useContext(StartMenuContext);
  const {runningAppsData, runningAppsDispatch} = useContext(RunningAppsContext);
  const {contextMenuData,contextMenuDispatch} = useContext(ContextMenuContext)

  const [date, setDate] = useState(new Date())

  const RunningAppArray = Object.entries(runningAppsData)

  useEffect(() =>{
    const dateCheck = setInterval(()=>setDate(new Date()), 1000)

    return () => clearInterval(dateCheck)
  },[])

  let time_hour = date.getHours()
  const time_minute = date.getMinutes()
  // let time_second = date.getSeconds()
  const time_half = time_hour > 12

  if (time_hour <= 12){
    if (time_hour == 0){
      time_hour = 12
    }
  } else{
    time_hour = time_hour - 12
  }

  return(
      <div className="taskbar" onContextMenu={(event)=>{contextMenuPropagation(event);if(contextMenuData.visible){contextMenuDispatch({type:"HIDE"})}}}> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}><img className="common-border" src="https://www.svgrepo.com/show/512467/menu-navigation-grid-1530.svg"/></div>
        {startMenuOpen ? <StartMenu/>:<></>}
        <div className="active-apps" onClick={()=>{setStartMenuOpen(false)}}> 
           {
            RunningAppArray.map((item)=>{ 
              const app_running_id = item[0]
              const running_properties = item[1]

              const context_options: ContextMenuOptions = {Close: ()=>{runningAppsDispatch({type:"DELETE", app_running_id:app_running_id})},}

              if (running_properties.isMinimized){
                context_options["Restore"] = ()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER",forceMinimize:true, app_running_id:app_running_id})}
              } else{
                context_options["Minimize"] = ()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER",forceMinimize:true, app_running_id:app_running_id})}
                if (running_properties.maximizeType == "FULL"){
                  context_options["Unmaximize"] = ()=>{runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})}
  
                }else {
                  context_options["Maximize"] = ()=>{runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id}); runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}
                }
              }

              return(
              <div className="common-border active-app " 
              onContextMenu={(event)=>{contextMenuPropagation(event);contextMenuDispatch({type:"SET", event:event, newOptions:context_options});}} 
              key={Math.random()} 
              onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id});}}> 
                <img className={(running_properties["isMinimized"] ? "icon-minimized" : "icon-unminimized")} src={running_properties.app_properties.icon}  alt="" />
                <div className={"status "+ (running_properties["isMinimized"] ? "" : (running_properties["zIndex"] == 999 ? "status-focused": "status-unfocused"))}/>
               </div>
              )
            })
           }

        </div>
        <div className="time-and-date">
          <div className="common time">{time_hour}<div className="blink">:</div>{time_minute < 10 ? "0":""}{time_minute} {time_half ? "PM" : "AM"}</div>
          <div className="common date">{date.getDate()}/{date.getMonth()+1}/{date.getFullYear()}</div>
        </div>
      </div>
  )
}

