import { useContext } from "react"
import "./Taskbar.css"

import { AppList } from "../../Apps/Apps"
import { StartMenuContext, RunningAppsContext } from "../StateContext"



export default function Taskbar(){
  const {startMenuOpen, setStartMenuOpen} = useContext(StartMenuContext)
  const {runningAppsTask, runningAppsDispatch} = useContext(RunningAppsContext)


  const AppListArray = Object.entries(AppList)
  const RunningAppArray = Object.entries(runningAppsTask)

  return(
    <div className="taskbar"> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}><img className="bar-button" src="https://www.svgrepo.com/show/512467/menu-navigation-grid-1530.svg"/></div>
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
            RunningAppArray.map((item)=>{ 
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = item[1]

              const iconStyle : React.CSSProperties = {
                filter: ((!running_properties["isMinimized"]) ? "brightness(0) saturate(100%)" : "brightness(0) saturate(100%) invert(36%) sepia(11%) saturate(0%) hue-rotate(188deg) brightness(91%) contrast(94%)"),
              }

              const statusStyle : React.CSSProperties = (running_properties["isMinimized"] ? {} : ( (running_properties["zIndex"] == 999 ) 
                ? {
                  width:"4px",
                  backgroundColor:"white"
                } : 
                  {
                  width:"60%",
                  backgroundColor:"darkgrey"
                }))
                
              return(
              <div className="bar-button active-app " key={Math.random()} onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id});}}> 
                <img style={iconStyle} src={AppList[app_id].icon}  alt="" />
                <div style={statusStyle} className="status"/>
               </div>
              )
            })
           }

        </div>
      </div>
  )
}