import { useContext } from "react"
import "./Taskbar.css"

import { AppList } from "../../Apps/Apps"
import { StartMenuContext, RunningAppsContext } from "../StateContext"



export default function Taskbar(){
  const AppListArray = Object.entries(AppList)
  const {startMenuOpen, setStartMenuOpen} = useContext(StartMenuContext)
  const {runningAppsTask, runningAppsDispatch} = useContext(RunningAppsContext)

  return(
    <div className="taskbar"> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}>😱</div>
        <div className="start-menu" style={{display:startMenuOpen ? "unset":"none"}}>
          {/* Where the start menu is genereated */}
           {AppListArray.map( (item) => { 
            const app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
            return ( 
            <div className="app-entry" key={Math.random()} onClick={()=>{runningAppsDispatch({type:"ADD", app_running_id:app_running_id, app_properties:item[1]});runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id}); setStartMenuOpen(false)}}> 
              <div className="app-entry-icon"> {item[1].icon}</div>
              <div className="app-entry-name"> {item[1].name}</div>
            </div>
             )  
            })}
        </div>
        <div className="active-apps"> 
          {/* Where the taskbar is genereated */}
           {
            Object.entries(runningAppsTask).map((item)=>{ 
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              // const running_properties = item[1]
              
              return(
              <div className="active-app" key={Math.random()} onClick={()=>{runningAppsDispatch({type:"TASKBAR-ICON-CLICKED", app_running_id:app_running_id});}}>
                {AppList[app_id].icon}
              </div>

              )
          })
           }

        </div>
      </div>
  )
}