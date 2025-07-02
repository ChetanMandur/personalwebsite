import "./RunningApp.css"

import { useContext, useEffect, useRef} from "react"

import { RunningAppProperties, RunningAppsContext, titlebarTextGenerator } from "../Contexts/RunningAppsContext"
import { TooltipContext } from "../Contexts/TooltipContext"


type RunningAppPropsType = {
  app_running_id:string,
  running_properties: RunningAppProperties,
}



export function RunningApp({app_running_id, running_properties}:RunningAppPropsType){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {tooltipDispatch} = useContext(TooltipContext)
  const outlineRef = useRef<HTMLDivElement>(null);
  
  useEffect(()=>{
    const pointerOutHandler = (event:PointerEvent) => {
      if (event.relatedTarget == null || (event.relatedTarget as HTMLElement).tagName == "HTML"){
          runningAppsDispatch({type:"TITLEBAR-UNCLICKED", app_running_id: app_running_id})
      }
    }

    window.addEventListener("pointerout", pointerOutHandler)

    return ()=>{
      window.removeEventListener("pointerout", pointerOutHandler)
    }
  },[])

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


  // Handles the animation for the outline when hovering maximize sections
  const animation_speed = 250

  // When app is maximized in a section and the titlebar is being clicked (ie. User is able to drop into section)
  if (running_properties["maximizeType"] != null && running_properties["titlebarClicked"]){
    switch (running_properties["maximizeType"]) {
      case "FULL":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "100%",
          height: "100%", 
          top: "0", 
          left:"0",
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
        break;
      case "TL":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "50%", 
          top: "0", 
          left:"0", 
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
        break;
      case "LEFT":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "100%", 
          top: "0", 
          left:"0", 
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
        break;
      case "BL":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "50%", 
          top: "50%", 
          left:"0", 
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
          break;
      case "TR":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "50%", 
          top: "0", 
          left:"50%", 
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
          break;
      case "RIGHT":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "100%", 
          top: "0", 
          left:"50%", 
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
          break;
      case "BR":
        outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
          width: "50%", 
          height: "50%", 
          left:"50%",
          top: "50%",
          borderColor:"var(--snap-colour)",
          backgroundColor:"var(--snap-opacity)"
        }],{fill:"forwards", duration:animation_speed, iterations:1})
          break;
    }
  } 
  // When app is neither in a maximize state or the titlebar is clicked
  else{
    // If the app is no longer being hovered in a maximize section
    if (running_properties["maximizeType"] == null && running_properties["titlebarClicked"] ){
      outlineRef.current?.animate([{zIndex: running_properties.zIndex+1,
        width: running_properties.width+"px",
          height: running_properties.height+"px", 
          top: running_properties.y + "px",
          left: running_properties.x +"px",
          borderColor:"transparent",
          backgroundColor:"transparent",
        }],{fill:"forwards", duration:animation_speed, iterations:1})
    } 
    // If the app has been dropped in a maximized state
    else if (running_properties["maximizeType"] != null && !running_properties["titlebarClicked"] ){
      outlineRef.current?.animate([{
          borderColor:"transparent",
          backgroundColor:"transparent",
        }],{fill:"forwards", duration:animation_speed, iterations:1})
    }
  }

  const titlebarText = titlebarTextGenerator(running_properties)
  const isAppFocused = (running_properties["zIndex"] == 999 || running_properties["maximizeType"] != null)

  return(
    <>
      <div className={"outline " + running_properties["maximizeType"]} ref={outlineRef}/>
      <div className={"common-border app-window " + (maximize_class) + (running_properties["isMinimized"] ? "app-minimized " : " ") + (isAppFocused ? "" : "app-unfocused ") } style={app_window_style} onPointerDown={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id})}} ref={runningAppsData[app_running_id]["ref"]} key={app_running_id+"runningApp"}>
          {running_properties["maximizeType"] == null && running_properties["titlebarClicked"] == false ? 
          <div className="hitboxes">
              <div className="box" id="TopL"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TL"})}}></div>
              <div className="box" id="TopR"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TR"})}}></div>
              <div className="box" id="BotL"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BL"})}}></div>
              <div className="box" id="BotR"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BR"})}}></div>
              <div className="box" id="Top"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"TOP"})}}></div>
              <div className="box" id="Bot"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"BOT"})}}></div>
              <div className="box" id="Left"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"LEFT"})}}></div>
              <div className="box" id="Right"  onPointerDown={(event)=>{runningAppsDispatch({type:"RESIZE-CLICKED",app_running_id:app_running_id, event:event, resizeClickedLocation:"RIGHT"})}}></div>
          </div> 
          : 
          <></>
          }
          <div className="app">
              <div className="titlebar" 
                onDoubleClick={()=>{runningAppsDispatch({type:"MAXIMIZE", maximizeType:"FULL",app_running_id:app_running_id})}} 
                onPointerDown={(event) =>{
                  runningAppsDispatch({type:"TITLEBAR-CLICKED", app_running_id:app_running_id, event:event})
                  document.addEventListener("pointerup", ()=>{
                    runningAppsDispatch({type:"TITLEBAR-UNCLICKED", app_running_id: app_running_id})
                  }, {once:true})
                }}

              >
                  <div className="icon">
                    <img src={running_properties.appProperties.icon}/>
                  </div>
                  <div className="name" 
                    onMouseMove={(event)=>{tooltipDispatch({type:"SET",data: titlebarText, dataType:"TEXT", event:event})}} 
                  >
                    {titlebarText}
                  </div>

                  <div className="titlebar-options"
                    onPointerDown={(event)=>{event.stopPropagation()}}
                  >
                    <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")}
                      onClick={()=>{
                            runningAppsDispatch({type:"MINIMIZE-HANDLER", app_running_id:app_running_id, forceMinimize:false})
                        }}
                    >
                      -
                    </div>

                    <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")} 
                      onClick={()=>{
                            runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})
                        }}
                    >
                      []
                    </div>

                    <div className={"common-border titlebar-option " + (isAppFocused ? "" : "titlebar-option-unfocused")} 
                      onClick={()=>{runningAppsDispatch({type:"DELETE", app_running_id:app_running_id})}}>
                      X
                    </div>
                  </div>

              </div>
              <div className="app-content">
                  <div className="content-container">
                    {running_properties.appProperties.app(running_properties.props)}
                    {isAppFocused ? <></> : <div className="content-overlay" onDragEnter={()=>{runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id: app_running_id})}} />}
                  </div>
              </div>
          </div>
      </div> 
    </>
  )
}