
import "./UserSpace.css"
import { useContext, useRef } from "react"
import { RunningAppProperties, RunningAppsContext, titlebarTextGenerator } from "../Contexts/RunningAppsContext"
import { StartMenuContext } from "../Contexts/StartMenuContext"
import { ContextMenuContext } from "../Contexts/ContextMenuContext"
import { TooltipContext } from "../Contexts/TooltipContext"


type RunningAppPropsType = {
  app_running_id:string,
  running_properties: RunningAppProperties,
}


export function RunningApp({app_running_id, running_properties}:RunningAppPropsType){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {tooltipDispatch} = useContext(TooltipContext)
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
      maximize_class = "app-maximized-height-quarter app-maximized-width-half app-maximized-tl "
      break;
    case "LEFT":
      maximize_class = "app-maximized-width-half app-maximized-left "
      break;
    case "BL":
        maximize_class = "app-maximized-height-quarter app-maximized-width-half app-maximized-bl "
        break;
    case "TR":
      maximize_class = "app-maximized-height-quarter app-maximized-width-half app-maximized-tr "
        break;
    case "RIGHT":
      maximize_class = "app-maximized-width-half app-maximized-right "
        break;
    case "BR":
      maximize_class = "app-maximized-height-quarter app-maximized-width-half app-maximized-br "
        break;
    default:
      maximize_class = " "
  }

  const titlebarText = titlebarTextGenerator(running_properties)
  const isAppFocused = (running_properties["zIndex"] == 999 || running_properties["maximizeType"] != null)

  return(
  <div className={"common-border app-window " + (maximize_class) + (running_properties["isMinimized"] ? "app-minimized " : " ") + (isAppFocused ? "" : "app-unfocused ") } style={app_window_style} onPointerDown={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}} ref={runningAppsData[app_running_id]["ref"]} key={app_running_id+"runningApp"}>
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
        <div className="icon" onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}><img src={running_properties.appProperties.icon}/></div>
        <div className="name" 
          onMouseMove={(event)=>{tooltipDispatch({type:"SET",newData: titlebarText, newDataType:"TEXT", event:event})}}  
          onMouseOut={()=>{tooltipDispatch({type:"HIDE"})}}
          onPointerDown={(event) =>{runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})}}>
            {titlebarText}
        </div>
        <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")}
         onClick={()=>{runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id, forceMinimize:false})}}>-</div>

        <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")} 
        onClick={()=>{runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})}}>[]</div>

        <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")} 
        onClick={()=>{runningAppsDispatch({type:"DELETE", app_running_id:app_running_id})}}>X</div>
      </div>
      <div className="app-content">
        {running_properties.appProperties.app(running_properties.props)}
        {isAppFocused ? <></> : <div className="content-overlay" onDragEnter={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id: app_running_id})}} />}
      </div>
    </div>
  </div> 
  )
}


export default function UserSpace(){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {setStartMenuOpen} = useContext(StartMenuContext)
  const {contextMenuDispatch} = useContext(ContextMenuContext)
  const outline_ref = useRef<(HTMLDivElement|null)[]>([]);


  return(

    <div className="user-space" onPointerDown={()=>{setStartMenuOpen(false)}} onPointerLeave={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerUp={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}); contextMenuDispatch({type:"HIDE"}) }} onPointerMove={(event) => { runningAppsDispatch({type:"WINDOW-MOVE", event:event})}}>
        {/* Where each running app is rendered */}
        {
            Object.entries(runningAppsData).map((item, index)=>{
              const app_running_id = item[0]
              const running_properties = runningAppsData[app_running_id]

              if (running_properties["maximizeType"] != null && running_properties["titlebarClicked"]){
                switch (running_properties["maximizeType"]) {
                  case "FULL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(100% - var(--app-border-size)*1.7)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"0",
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "TL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "0", 
                      left:"0", 

                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "LEFT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "BL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "calc(var(--user-space-height)/2)", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "TR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "RIGHT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "BR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      left:"50%",
                      top: "calc((var(--user-space-height)/2)",
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
                <div className={app_running_id} key={app_running_id+"appContainer"}>
                  <RunningApp app_running_id={app_running_id} running_properties={running_properties}/>
                  <div className={"outline " + running_properties["maximizeType"]} ref={ref => outline_ref.current[index] = ref}></div>
                </div>
              )
            })
          }
    </div>
  )
}