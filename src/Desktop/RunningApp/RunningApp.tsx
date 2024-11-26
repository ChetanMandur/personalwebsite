import {RunningAppProperties, RunningAppsContext, RunningAppsContextType} from "../Desktop"
import "./RunningApp.css"
import {AppList} from "../../Apps/Apps"
import { useContext } from "react"


type RunningAppPropsType = {
  app_running_id:string,
  running_properties: RunningAppProperties,
  app_id: string
}


export default function RunningApp({app_running_id, running_properties, app_id}:RunningAppPropsType){
  const {runningAppsTask,runningAppsDispatch}= useContext(RunningAppsContext)

  const app_window_style : React.CSSProperties = {
    left: running_properties.x+"px",
    top:running_properties.y+"px", 
    width:(running_properties.width)+"px", 
    height:running_properties.height+"px",
    display:"flex",
    zIndex: running_properties.zIndex
  }

  if (running_properties["isMaximized"]){
    app_window_style["left"] = 0;
    app_window_style["top"] = 0;
    app_window_style["width"] = "100%";
    app_window_style["height"] = "calc(100% - 50px)";
  }

  if (running_properties["isMinimized"]){
    app_window_style["display"] = "none"
  }
  
  
  return(
  <div className="app-window"  onPointerDown={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}} ref={runningAppsTask[app_running_id]["ref"]} key={app_running_id}  style={app_window_style }>
    {!running_properties["isMaximized"] ? <div className="hitboxes">
      <div className="box" id="TopL"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TL"})}}></div>
      <div className="box" id="TopR"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TR"})}}></div>
      <div className="box" id="BotL"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BL"})}}></div>
      <div className="box" id="BotR"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BR"})}}></div>
      <div className="box" id="Top"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TOP"})}}></div>
      <div className="box" id="Bot"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BOT"})}}></div>
      <div className="box" id="Left"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"LEFT"})}}></div>
      <div className="box" id="Right"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"RIGHT"})}}></div>

      
    </div> : <></>}
    <div className="app">
      <div className="titlebar" style={{backgroundColor: (running_properties.zIndex==999 ? "blue" : "darkblue")}} >
        <div className="icon" onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}>{AppList[app_id].icon}</div>
        <div className="name"  onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}>{AppList[app_id].name}</div>
        <div className="titlebar-option" onClick={()=>{runningAppsDispatch({type:"MINIMIZE", app_running_id:app_running_id})}}>-</div>
        <div className="titlebar-option" onClick={()=>{runningAppsDispatch({type:"MAXIMIZE", app_running_id:app_running_id})}}>[]</div>
        <div className="titlebar-option" onClick={()=>{runningAppsDispatch({type:"DELETE", app_running_id:app_running_id})}}>X</div>
      </div>
      <div className="content" style={{backgroundColor: (running_properties.zIndex==999 ? "blue" : "darkblue")}}>{AppList[app_id].app}</div>
    </div>
  </div> 
  )
}