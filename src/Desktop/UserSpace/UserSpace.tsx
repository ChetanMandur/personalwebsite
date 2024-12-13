
import "./UserSpace.css"
import {AppList} from "../../Apps/Apps"
import { useContext, useRef } from "react"
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
  app_window_style["zIndex"]= running_properties.zIndex

  if ((running_properties["maximizeType"] == null) || ( (running_properties["maximizeType"] != null) && (running_properties["titlebarClicked"]))){
    app_window_style["left"] = running_properties.x+"px";
    app_window_style["top"]=running_properties.y+"px"; 
    app_window_style["width"]=(running_properties.width)+"px"; 
    app_window_style["height"]=running_properties.height+"px";
  } 

  let maximize_class = " "
  switch (running_properties["maximizeType"]) {
    case "FULL":
      maximize_class = "app-maximized "
      break;
    case "TL":
      maximize_class = "app-maximized-tl "
      break;
    case "LEFT":
      maximize_class = "app-maximized-left "
      break;
    case "BL":
        maximize_class = "app-maximized-bl "
        break;
    case "TR":
      maximize_class = "app-maximized-tr "
        break;
    case "RIGHT":
      maximize_class = "app-maximized-right "
        break;
    case "BR":
      maximize_class = "app-maximized-br "
        break;
    default:
      maximize_class = " "
  }
  
  return(
  <div className={"common-border app-window " + (maximize_class) + (running_properties["isMinimized"] ? "app-minimized " : " ") + (running_properties["zIndex"]==999 ? "" : "app-unfocused ") } style={app_window_style} onPointerDown={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}} ref={runningAppsTask[app_running_id]["ref"]} key={app_running_id}>
    {running_properties["maximizeType"] == null ? <div className="hitboxes">
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
      <div className="titlebar" onDoubleClick={()=>{runningAppsDispatch({type:"MAXIMIZE", maximizeType:"FULL",app_running_id:app_running_id})}} >
        <div className="icon" onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}><img src={AppList[app_id].icon}/></div>
        <div className="name"  onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}>{AppList[app_id].name}</div>
        <div className={"common-border titlebar-option " + (running_properties["zIndex"]==999 ? "" : "titlebar-option-unfocused")} onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id})}}>-</div>
        <div className={"common-border titlebar-option " + (running_properties["zIndex"]==999 ? "" : "titlebar-option-unfocused")} onClick={()=>{runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})}}>[]</div>
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
  const outline_ref = useRef<(HTMLDivElement|null)[]>([]);


  return(

    <div className="user-space" onPointerDown={()=>{setStartMenuOpen(false)}} onPointerLeave={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerUp={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerMove={(event) => { runningAppsDispatch({type:"WINDOW-MOVE", event:event})}}>
        {/* Where each running app is rendered */}
        {
            Object.entries(runningAppsTask).map((item, index)=>{
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = runningAppsTask[app_running_id]

              if (running_properties["maximizeType"] != null && running_properties["titlebarClicked"]){
                switch (running_properties["maximizeType"]) {
                  case "FULL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(100% - var(--app-border-size)*2)", 
                      height: "calc(100% - var(--taskbar-height) - var(--bar-border-outline-width)*3)", 
                      top: "0", 
                      left:"0",
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "TL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size)* 1.5", 
                      top: "0", 
                      left:"0", 

                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "LEFT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc(100% - var(--taskbar-height) - var(--bar-border-outline-width)*3)", 
                      top: "0", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "BL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size) * 1.5)", 
                      top: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size) * 1.5", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "TR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size)*1.5)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "RIGHT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc(100% - var(--taskbar-height) - var(--bar-border-outline-width)*3)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "BR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(50% - var(--app-border-size)*1.5)", 
                      height: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size)*1.5)", 
                      left:"50%",
                      top: "calc((100% - var(--taskbar-height))/2 - var(--app-border-size)*1.5)",
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                }
              } else{
                if (running_properties["maximizeType"] == null){
                  outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                    width: running_properties.width+"px",
                     height: running_properties.height+"px", 
                     top: running_properties.y + "px",
                     left: running_properties.x +"px",
                     borderColor:"transparent",
                     backgroundColor:"transparent",
                    }],{fill:"forwards", duration:500, iterations:1})
                } else{
                  outline_ref.current[index]?.animate([{
                     borderColor:"transparent",
                     backgroundColor:"transparent",
                    }],{fill:"forwards", duration:500, iterations:1})
                }
              }
              

              return(
                <div className={app_running_id} key={app_running_id}>
                  <RunningApp app_running_id={app_running_id} app_id={app_id} running_properties={running_properties}/>
                  <div className={"outline " + running_properties["maximizeType"]} ref={ref => outline_ref.current[index] = ref}></div>
                </div>
              )
            })
          }
    </div>
  )
}