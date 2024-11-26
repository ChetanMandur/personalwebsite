import React, { useState, createRef, createContext, useReducer } from "react";
import "./Desktop.css";
import {AppProperties } from "../Apps/Apps";
import RunningApp from "./RunningApp/RunningApp";
import Taskbar from "./Taskbar/Taskbar";


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

export type RunningAppListType = {
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

export type RunningAppsReducerAction = {
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

export type RunningAppsContextType = {
  runningAppsTask: RunningAppListType, 
  runningAppsDispatch:  React.Dispatch<RunningAppsReducerAction>
}

export const RunningAppsContext = createContext<RunningAppsContextType>({runningAppsTask:{}, runningAppsDispatch:()=>{}})

export type StartMenuContextType = {
  startMenuOpen: boolean,
  setStartMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export const StartMenuContext = createContext<StartMenuContextType>({startMenuOpen: false, setStartMenuOpen: ()=>{}})

export default function Desktop() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningAppsTask, runningAppsDispatch] = useReducer(runningAppsReducer, {})
  const RunningAppsArray = Object.entries(runningAppsTask)
  
  return (
    <RunningAppsContext.Provider value = {{runningAppsTask, runningAppsDispatch}}>
      <StartMenuContext.Provider value={{startMenuOpen, setStartMenuOpen}}>
        <div className="main-container">
          <div className="user-space" onPointerDown={()=>{setStartMenuOpen(false)}} onPointerUp={()=>{runningAppsDispatch({type:"RESIZE-UNCLICKED"}); runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) }} onPointerMove={(event) => { runningAppsDispatch({type:"WINDOW-MOVE", event:event})}}>
            {/* Where each running app is rendered */}
            {
                RunningAppsArray.map((item)=>{
                  const app_running_id = item[0]
                  const app_id = app_running_id.split("#")[0]
                  const running_properties = runningAppsTask[app_running_id]
                  return(<RunningApp key={app_running_id} app_running_id={app_running_id} app_id={app_id} running_properties={running_properties}/>)
                })
              }
          </div>
          <Taskbar/>
        </div>  
      </StartMenuContext.Provider>
    </RunningAppsContext.Provider>
    
  );
}