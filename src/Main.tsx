import React, { useState, createRef } from "react";
import "./Main.css";
import { AppList, AppProperties } from "./Apps/Apps";


type RunningAppProperties = {
  ref: React.MutableRefObject<null | HTMLDivElement>,
  x: number ,
  y: number,
  titlebarClicked: boolean,
  titlebarClickedDistanceX: number ,
  titlebarClickedDistanceY: number ,

  width: number,
  height:number,
  resizeClicked: "TL" | "TR" | "BL" | "BR" | "TOP" | "BOT" | "LEFT" | "RIGHT" | null,
  resizeLocationX: number,
  resizeLocationY: number,

  isMaximized: boolean,
  isMinimized: boolean,

  zIndex:number,
}



type RunningAppListType = {
  [key:string] : RunningAppProperties
}

function Main() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningApps, setRunningApps] = useState<RunningAppListType>({})

  const AppListArray = Object.entries(AppList)
  const RunningAppsArray = Object.entries(runningApps)

  function DefaultRunningAppPropertiesGenerator(app_properties: AppProperties): RunningAppProperties {

    return({
      ref:  createRef<HTMLDivElement>(),
      x: Math.floor(Math.random() *100),
      y: Math.floor(Math.random() *100),
      titlebarClicked: false,
      titlebarClickedDistanceX: 0,
      titlebarClickedDistanceY: 0,
      height: app_properties.defaultHeight,
      width: app_properties.defaultWidth,
      resizeClicked: null,
      resizeLocationX: 0,
      resizeLocationY: 0,
      isMaximized: false,
      isMinimized: false,
      zIndex: 999,
    })
  }

  function addRunningApp(app_running_id:string, app_properties:AppProperties){
    console.log("addRunningApp")
    const temp_running_apps = {...runningApps}
    temp_running_apps[app_running_id] = {...DefaultRunningAppPropertiesGenerator(app_properties)}
    updateRunningAppFocus(undefined)
    setRunningApps(temp_running_apps)
  }

  function deleteRunningApp(app_running_id:string){
    console.log("deleteRunningApp")
    const temp_running_apps = {...runningApps}
    delete temp_running_apps[app_running_id]
    setRunningApps(temp_running_apps)
  }

  function updateAppProperty<T extends keyof RunningAppListType>(app_running_id: T, key: keyof RunningAppListType[T], value: RunningAppListType[T][keyof RunningAppListType[T]] ){
    // console.log("updateAppProperty")
    const temp_running_apps = {...runningApps}

    temp_running_apps[app_running_id][key] = value
    setRunningApps(temp_running_apps)
  }


  function titlebarClickedEvent(event:React.PointerEvent<HTMLDivElement>, app_running_id:string){
    console.log("titlebarClickedEvent")
    const current_app = runningApps[app_running_id]
    updateAppProperty(app_running_id, "titlebarClicked", true); 

    if (current_app["isMaximized"]){
      updateAppProperty(app_running_id, "isMaximized", false)

      const xRatio = event.clientX / current_app["ref"].current!.getBoundingClientRect().width
      const yRatio = event.clientY / current_app["ref"].current!.getBoundingClientRect().height

      const width_chunk = current_app["width"]*xRatio
      const height_chunk = current_app["height"]*yRatio 


      updateAppProperty(app_running_id,"x", event.clientX -  width_chunk)
      updateAppProperty(app_running_id,"y", event.clientY - height_chunk)
      updateAppProperty(app_running_id,"titlebarClickedDistanceX", width_chunk   )
      updateAppProperty(app_running_id,"titlebarClickedDistanceY", height_chunk )

    } else{

      updateAppProperty(app_running_id, "titlebarClickedDistanceX", (event.clientX-current_app["ref"].current!.getBoundingClientRect().x))
      updateAppProperty(app_running_id, "titlebarClickedDistanceY", (event.clientY-current_app["ref"].current!.getBoundingClientRect().y))
    }
    
  }

  function titlebarUnClickedEvent(app_running_id:string){
    console.log("titlebarUnClickedEvent")
    updateAppProperty(app_running_id, "titlebarClicked", false)

  }

  function resizeClickedEvent(event:React.PointerEvent<HTMLDivElement>, app_running_id:string, location:RunningAppProperties["resizeClicked"]){
    console.log("resizeClickedEvent")
    updateAppProperty(app_running_id, "resizeClicked", location);
    updateAppProperty(app_running_id, "resizeLocationX", event.clientX);
    updateAppProperty(app_running_id, "resizeLocationY", event.clientY);

  }

  function resizeUnClickedEvent(app_running_id:string){
    console.log("resizeUnClickedEvent")
    updateAppProperty(app_running_id, "resizeClicked", null)
    if (runningApps[app_running_id]["width"] < 200){
      updateAppProperty(app_running_id, "width", 200)
    }
    if (runningApps[app_running_id]["height"] < 200){
      updateAppProperty(app_running_id, "height", 200 )                  
    }

  }

  function windowMoveEvent(event:React.PointerEvent<HTMLDivElement>){
    for (const i of RunningAppsArray){
      const app_running_id = i[0]
      const current_app = runningApps[app_running_id]
      if (current_app["titlebarClicked"]){
        updateAppProperty(app_running_id, "x", event.clientX - current_app["titlebarClickedDistanceX"] )
        updateAppProperty(app_running_id, "y", event.clientY - current_app["titlebarClickedDistanceY"])
      }
      if (runningApps[app_running_id]["resizeClicked"] != null){
        const distanceX = (event.clientX- current_app["resizeLocationX"]); // right is positive
        const distanceY = (event.clientY- current_app["resizeLocationY"]); //down is positive

        let new_x = current_app["x"]
        let new_y = current_app["y"]
        let new_width = current_app["width"]
        let new_height = current_app["height"]

        switch (runningApps[app_running_id]["resizeClicked"]) {
          case "TL":
            new_x += distanceX 
            new_y += distanceY 
            new_width -= distanceX
            new_height -= distanceY
            break;
          case "TR":
            new_y += distanceY 
            new_width += distanceX  
            new_height -= distanceY
            break;
          case "BL":
            new_x += distanceX 
            new_width -= distanceX  
            new_height += distanceY
            break;
          case "BR":
            new_width += distanceX
            new_height += distanceY
            break;
          case "TOP":
            new_y += distanceY
            new_height -= distanceY
            break;

          case "BOT":
            new_height += distanceY
            break;

          case "LEFT":
            new_x += distanceX
            new_width -= distanceX
            break;

          case "RIGHT":
            new_width += distanceX
            break;

        }

        if (new_width >= 200){
          updateAppProperty(app_running_id, "x", new_x)
          updateAppProperty(app_running_id, "width", new_width)
          updateAppProperty(app_running_id, "resizeLocationX", event.clientX);

        }
        if (new_height >= 200){
          updateAppProperty(app_running_id, "y", new_y)
          updateAppProperty(app_running_id, "height", new_height)
          updateAppProperty(app_running_id, "resizeLocationY", event.clientY);

        }


      }
    }

  }

  function updateRunningAppFocus(app_running_id:string | undefined){
    for (const i of RunningAppsArray){
      if (i[0] == app_running_id){
        console.log("hit!", app_running_id)
        updateAppProperty(app_running_id, "zIndex", 999)
      } else {
        updateAppProperty(i[0], "zIndex", i[1]["zIndex"]-1)
      }
    }
  }


  function updateTaskbarMinimizeEvent(app_running_id:string, running_properties:RunningAppProperties){
    let currently_open = 0
    let currently_open_app_running_id = ""
    for (const i of RunningAppsArray){
      if (i[1]["isMinimized"] != true){
        currently_open +=1
        currently_open_app_running_id = i[0]
      }
    }

    if (running_properties.isMinimized){
      updateAppProperty(app_running_id, "isMinimized", false)
      updateRunningAppFocus(app_running_id)
    } else{
      if (currently_open == 1 && currently_open_app_running_id == app_running_id){
        updateAppProperty(app_running_id, "isMinimized", true)
      } else{
        if (running_properties.zIndex != 999){
          updateRunningAppFocus(app_running_id)
        } else{
          updateAppProperty(app_running_id, "isMinimized", true)
        }
      }
    }
  }


  return (
    <div className="main-container">
      <div className="user-space"  onPointerMove={(event) => { windowMoveEvent(event)}}>
        {/* Where each running app is rendered */}
        {
            RunningAppsArray.map((item)=>{
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = item[1]
              const app_window_style : React.CSSProperties = {
                left: running_properties.x+"px",
                top:running_properties.y+"px", 
                width:(running_properties.width)+"px", 
                height:running_properties.height+"px",
                display:"flex",
                zIndex: running_properties.zIndex
              }

              if (running_properties.isMaximized){
                app_window_style["left"] = 0;
                app_window_style["top"] = 0;
                app_window_style["width"] = "100%";
                app_window_style["height"] = "calc(100% - 50px)";
              }

              if (running_properties.isMinimized){
                app_window_style["display"] = "none"
              }
              
              
              return(
              <div className="app-window" onPointerDown={()=>{updateRunningAppFocus(app_running_id)}} ref={runningApps[app_running_id]["ref"]} key={app_running_id}  style={app_window_style }>
                {!running_properties["isMaximized"] ? <div className="hitboxes">
                  <div className="box" id="TopL" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "TL")}}></div>
                  <div className="box" id="TopR" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "TR")}}></div>
                  <div className="box" id="BotL" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "BL")}}></div>
                  <div className="box" id="BotR" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "BR")}}></div>
                  <div className="box" id="Top" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "TOP")}}></div>
                  <div className="box" id="Bot" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "BOT")}}></div>
                  <div className="box" id="Left" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "LEFT")}}></div>
                  <div className="box" id="Right" onPointerUp={()=>{resizeUnClickedEvent(app_running_id)}} onPointerDown={(event)=>{resizeClickedEvent(event, app_running_id, "RIGHT")}}></div>

                  
                </div> : <></>}
                <div className="app">
                  <div className="titlebar" style={{backgroundColor: (running_properties.zIndex==999 ? "blue" : "darkblue")}} >
                    <div className="icon" onClick={()=>{titlebarUnClickedEvent(app_running_id)}} onPointerDown={(event) =>{titlebarClickedEvent(event, app_running_id)}}>{AppList[app_id].icon}</div>
                    <div className="name" onPointerUp={()=>{titlebarUnClickedEvent(app_running_id)}} onPointerDown={(event) =>{titlebarClickedEvent(event, app_running_id)}}>{AppList[app_id].name}</div>
                    <div className="titlebar-option" onClick={()=>{updateAppProperty(app_running_id,"isMinimized", !running_properties.isMinimized)}}>-</div>
                    <div className="titlebar-option" onClick={()=>{updateAppProperty(app_running_id,"isMaximized", !running_properties.isMaximized)}}>[]</div>
                    <div className="titlebar-option" onClick={()=>{deleteRunningApp(app_running_id)}}>X</div>
                  </div>
                  <div className="content" style={{backgroundColor: (running_properties.zIndex==999 ? "blue" : "darkblue")}}>{AppList[app_id].app()}</div>
                </div>
              </div> 
              )
            })
          }
      </div>
      <div className="taskbar"> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}>😱</div>
        <div className="start-menu" style={{display:startMenuOpen ? "unset":"none"}}>
          {/* Where the start menu is genereated */}
           {AppListArray.map( (item) => { 
            const app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
            return ( 
            <div className="app-entry" key={Math.random()} onClick={()=>{addRunningApp(app_running_id, item[1]); setStartMenuOpen(false)}}> 
              <div className="app-entry-icon"> {item[1].icon}</div>
              <div className="app-entry-name"> {item[1].name}</div>
            </div>
             )  
            })}
        </div>
        <div className="active-apps"> 
          {/* Where the taskbar is genereated */}
           {
            RunningAppsArray.map((item)=>{ 
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = item[1]
              
              return(
              <div className="active-app" key={Math.random()} onClick={()=>{updateTaskbarMinimizeEvent(app_running_id,running_properties)}}>
                {AppList[app_id].icon}
              </div>

              )
          })
           }

        </div>
      </div>
    </div>
  );
}

export default Main;
