import React, { useState, createRef, createContext, useReducer } from "react";
import "./Desktop.css";
import { AppList, AppProperties } from "../Apps/Apps";


export type RunningAppProperties = {
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

type RunningAppsReducerAction = {
  type: "ADD" | "DELETE" | "UPDATE-APP-FOCUS" | "TITLEBAR-CLICKED" | "TITLEBAR-UNCLICKED" | "RESIZE-CLICKED" | "RESIZE-UNCLICKED" | "WINDOW-MOVE" | "TASKBAR-ICON-CLICKED" | "MINIMIZE" | "MAXIMIZE"
  app_running_id?: string,
  running_properties?: RunningAppProperties,
  app_properties?: AppProperties ,
  event?: React.PointerEvent<HTMLDivElement>,
  resizeClickedLocation?: RunningAppProperties["resizeClicked"],
}




function runningAppsReducer(runningAppsTask:RunningAppListType, action:RunningAppsReducerAction):RunningAppListType{
  switch (action.type){
    case "ADD": {
      console.log("ADD")
      const temp_task = {...runningAppsTask}
      temp_task[action.app_running_id!] = {...DefaultRunningAppPropertiesGenerator(action.app_properties!)}
      return(temp_task)
    }
    case "DELETE":{
      const temp_task = {...runningAppsTask}
      delete temp_task[action.app_running_id!]
      return(temp_task)

    }
    case "RESIZE-CLICKED":{
      const temp_task = {...runningAppsTask}
      temp_task[action.app_running_id!]["resizeClicked"] = action.resizeClickedLocation!
      temp_task[action.app_running_id!]["resizeLocationX"] = action.event!.clientX
      temp_task[action.app_running_id!]["resizeLocationY"] = action.event!.clientY

      return temp_task
    }
    case "RESIZE-UNCLICKED":{
      const temp_task = {...runningAppsTask}
      for (const i of Object.entries(temp_task)){
        const current_app = {...temp_task[i[0]]}
        if (current_app["resizeClicked"]){
          current_app["resizeClicked"] = null

          if (current_app["width"] < 200){
            current_app["width"] = 200
          }
          if (current_app["height"] < 200){
            current_app["height"] = 200
          }

          temp_task[i[0]] = current_app
        }

      }
      return ({...temp_task})

    }
    case "TASKBAR-ICON-CLICKED":{
      console.log("taskbar-icon-clicked")
      let currently_open = 0
      let currently_open_app_running_id = ""
      const temp_task = {...runningAppsTask}

      for (const i of Object.entries(runningAppsTask)){
        if (i[1]["isMinimized"] != true){
          currently_open +=1
          currently_open_app_running_id = i[0]
        }
      }


      const current_app = {...temp_task[action.app_running_id!]}

      if (current_app["isMinimized"]){
        current_app["isMinimized"] = false
        for (const i of Object.entries(temp_task)){
          const temp_app = {...temp_task[i[0]]}
          if (i[0] == action.app_running_id){
            current_app["zIndex"] = 999
          } else {
            temp_app["zIndex"] = temp_app["zIndex"]-1
          }
          temp_task[i[0]] = temp_app
        }
      } else{
        if (currently_open == 1 && currently_open_app_running_id == action.app_running_id!){
          current_app["isMinimized"] = true
        } else{
          if (temp_task[action.app_running_id!]["zIndex"] != 999){
            for (const i of Object.entries(temp_task)){
              const temp_app = {...temp_task[i[0]]}
              if (i[0] == action.app_running_id!){
                current_app["zIndex"] = 999
              } else {
                temp_app["zIndex"] = temp_app["zIndex"] - 1
              }
              temp_task[i[0]] = temp_app
            }
          } else{
            current_app["isMinimized"] = true
          }
        }
      }

      temp_task[action.app_running_id!] = current_app
      return temp_task
    }
    case "UPDATE-APP-FOCUS":{
      const temp_task = {...runningAppsTask}
      const current_app = {...temp_task[action.app_running_id!]}
      for (const i of Object.entries(temp_task)){
        const temp_app = temp_task[i[0]]
        if (i[0] == action.app_running_id){
          current_app["zIndex"] = 999
        } else {
          temp_app["zIndex"] = temp_app["zIndex"]-1
        }
        temp_task[i[0]] = temp_app
      }
      temp_task[action.app_running_id!] = current_app
      return temp_task
    }

    case "TITLEBAR-CLICKED":{
      const temp_task = {...runningAppsTask}
      const current_app = {...temp_task[action.app_running_id!]}
      current_app["titlebarClicked"] = true

      
      if (current_app["isMaximized"]){
        current_app["isMaximized"] = false
        const xRatio = action.event!.clientX / current_app["ref"].current!.getBoundingClientRect().width
        const yRatio = action.event!.clientY / current_app["ref"].current!.getBoundingClientRect().height


        const width_chunk = current_app["width"]*xRatio
        const height_chunk = current_app["height"]*yRatio 

        console.log(width_chunk, height_chunk)


        current_app["x"] = action.event!.clientX -  width_chunk
        current_app["y"] = action.event!.clientY -  height_chunk

        current_app["titlebarClickedDistanceX"] = width_chunk
        current_app["titlebarClickedDistanceY"] = height_chunk

      } else{
        current_app["titlebarClickedDistanceX"] = action.event!.clientX-current_app["ref"].current!.getBoundingClientRect().x
        current_app["titlebarClickedDistanceY"] = action.event!.clientY-current_app["ref"].current!.getBoundingClientRect().y
      }

      temp_task[action.app_running_id!] = current_app
      return temp_task

    }
    case "TITLEBAR-UNCLICKED":{
      const temp_task = {...runningAppsTask}
      for (const i of Object.entries(temp_task)){
        const temp_app = {...temp_task[i[0]]}
        if (temp_app["titlebarClicked"]){
          temp_app["titlebarClicked"] = false
        } 
        temp_task[i[0]] = temp_app
      }
      return temp_task

    }

    case "WINDOW-MOVE":{
      const temp_task = {...runningAppsTask}
      for (const i of Object.entries(runningAppsTask)){
        const temp_app_running_id = i[0]
        const temp_app = {...temp_task[temp_app_running_id]}

        

        if (temp_app["titlebarClicked"]){
          temp_app["x"]= action.event!.clientX - temp_app["titlebarClickedDistanceX"] 
          temp_app["y"] =  action.event!.clientY - temp_app["titlebarClickedDistanceY"]
        }

        if (temp_app["resizeClicked"] != null){
          const distanceX = (action.event!.clientX- temp_app["resizeLocationX"]); // right is positive
          const distanceY = (action.event!.clientY- temp_app["resizeLocationY"]); //down is positive

          let new_x = temp_app["x"]
          let new_y = temp_app["y"]
          let new_width = temp_app["width"]
          let new_height = temp_app["height"]

          switch (temp_app["resizeClicked"]) {
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
            temp_app["x"] = new_x
            temp_app["width"] =new_width
            temp_app["resizeLocationX"]= action.event!.clientX

          }
          if (new_height >= 200){
            temp_app["y"]= new_y
            temp_app["height"]=  new_height
            temp_app["resizeLocationY"] = action.event!.clientY
          }

        }
        temp_task[temp_app_running_id] = temp_app

      }
      return temp_task
    }
    case "MAXIMIZE":{
      const temp_task = {...runningAppsTask}
      const currentApp = {...temp_task[action.app_running_id!]}
      currentApp["isMaximized"] = !currentApp["isMaximized"]
      temp_task[action.app_running_id!] = currentApp
      return ({...temp_task})
    }
    case "MINIMIZE":{
      const temp_task = {...runningAppsTask}
      const currentApp = {...temp_task[action.app_running_id!]}
      currentApp["isMinimized"] = !currentApp["isMinimized"]
      temp_task[action.app_running_id!] = currentApp
      return ({...temp_task})
    }

  }
}


const RunningAppsContext = createContext<null|{
  runningAppsTask: RunningAppListType, 
  runningAppsDispatch:  React.Dispatch<RunningAppsReducerAction>
}>(null)

export default function Desktop() {

  
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  // const [runningApps, setRunningApps] = useState<RunningAppListType>({})
  const [runningAppsTask, runningAppsDispatch] = useReducer(runningAppsReducer, {})

  const AppListArray = Object.entries(AppList)
  // const RunningAppsArray = Object.entries(runningAppsTask)
  return (
    <RunningAppsContext.Provider value = {{runningAppsTask, runningAppsDispatch}}>
      <div className="main-container">
      <div className="user-space" onPointerDown={()=>{setStartMenuOpen(false)}} onPointerUp={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerMove={(event) => { runningAppsDispatch({type:"WINDOW-MOVE", event:event})}}>
        {/* Where each running app is rendered */}
        {
            Object.entries(runningAppsTask).map((item)=>{
              const app_running_id = item[0]
              const app_id = app_running_id.split("#")[0]
              const running_properties = runningAppsTask[app_running_id]
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
    </div>
    </RunningAppsContext.Provider>
    
  );
}