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
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}><img src="https://www.svgrepo.com/show/512467/menu-navigation-grid-1530.svg"/></div>
        <div className="start-menu" style={{display:startMenuOpen ? "flex":"none"}}>
          {/* Where the start menu is genereated */}
           {AppListArray.map( (item) => { 
            const app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
            return ( 
            <div className="app-entry" key={Math.random()} onClick={()=>{runningAppsDispatch({type:"ADD", app_running_id:app_running_id, app_properties:item[1]});runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id}); setStartMenuOpen(false)}}> 
              <div className="app-entry-icon"> <img src={item[1].icon}/></div>
              <div className="app-entry-name"> {item[1].name}</div>
            </div>
             )  
            })}
        </div>
        <div className="active-apps" onClick={()=>{setStartMenuOpen(false)}}> 
          {/* Where the taskbar is genereated */}
           {
            Object.entries(runningAppsTask).map((item)=>{ 
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = item[1]


              const iconStyle : React.CSSProperties = {
                borderBottom: ((running_properties["zIndex"] == 999 && !running_properties["isMinimized"]) ? "1px solid white" : "1px solid transparent"),
                filter: ((running_properties["zIndex"] == 999 && !running_properties["isMinimized"]) ? "none" : "brightness(0) saturate(100%) invert(16%) sepia(0%) saturate(1381%) hue-rotate(203deg) brightness(91%) contrast(75%)"),
              }
              
              return(
              <img src={AppList[app_id].icon}  style={iconStyle} className="active-app" key={Math.random()} onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id});}}/>

              )
            })
           }

        </div>
      </div>
  )
}