
import "./UserSpace.css"
import {AppList} from "../../Apps/Apps"
import { useContext } from "react"
import { RunningAppProperties, RunningAppsContext, StartMenuContext } from "../StateContext"


type RunningAppPropsType = {
  app_running_id:string,
  running_properties: RunningAppProperties,
  app_id: string
}


export function RunningApp({app_running_id, running_properties, app_id}:RunningAppPropsType){
  const {runningAppsTask,runningAppsDispatch}= useContext(RunningAppsContext)
  const app_window_style : React.CSSProperties = {}


  //This is the only part of CSS that is determined in code
  if (!running_properties["isMaximized"]){
    app_window_style["left"] = running_properties.x+"px";
    app_window_style["top"]=running_properties.y+"px", 
    app_window_style["width"]=(running_properties.width)+"px", 
    app_window_style["height"]=running_properties.height+"px",
    app_window_style["zIndex"]= running_properties.zIndex
  }
  
  return(
  <div className={"common-border app-window " + (running_properties["isMaximized"] ? "app-maximized ": " ") + (running_properties["isMinimized"] ? "app-minimized " : " ") + (running_properties["zIndex"]==999 ? "" : "app-unfocused ") } style={app_window_style} onPointerDown={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}} ref={runningAppsTask[app_running_id]["ref"]} key={app_running_id}>
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
      <div className="titlebar" >
        <div className="icon" onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}><img src={AppList[app_id].icon}/></div>
        <div className="name"  onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}>{AppList[app_id].name}</div>
        <div className={"common-border titlebar-option " + (running_properties["zIndex"]==999 ? "" : "titlebar-option-unfocused")} onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id})}}>-</div>
        <div className={"common-border titlebar-option " + (running_properties["zIndex"]==999 ? "" : "titlebar-option-unfocused")} onClick={()=>{runningAppsDispatch({type:"MAXIMIZE", app_running_id:app_running_id})}}>[]</div>
        <div className={"common-border titlebar-option " + (running_properties["zIndex"]==999 ? "" : "titlebar-option-unfocused")} onClick={()=>{runningAppsDispatch({type:"DELETE", app_running_id:app_running_id})}}>X</div>
      </div>
      <div className="content">
        {running_properties["zIndex"] == 999 ? <></> : <div className="content-overlay"/>}
        {AppList[app_id].app}
      </div>
    </div>
  </div> 
  )
}


export default function UserSpace(){
  const {runningAppsTask,runningAppsDispatch}= useContext(RunningAppsContext)
  const {setStartMenuOpen} = useContext(StartMenuContext)


  return(

    <div className="user-space" onPointerDown={()=>{setStartMenuOpen(false)}} onPointerUp={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerMove={(event) => { runningAppsDispatch({type:"WINDOW-MOVE", event:event})}}>
        {/* Where each running app is rendered */}
        {
            Object.entries(runningAppsTask).map((item)=>{
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = runningAppsTask[app_running_id]
              return(<RunningApp key={app_running_id} app_running_id={app_running_id} app_id={app_id} running_properties={running_properties}/>)
            })
          }
    </div>
  )
}