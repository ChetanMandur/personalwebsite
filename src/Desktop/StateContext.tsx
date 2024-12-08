import React, { createContext, createRef,  PropsWithChildren,useReducer, useState } from "react";
import { AppProperties } from "../Apps/Apps";

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

  maximizeType: "FULL" | "LEFT" | "RIGHT" | "TL" | "TR" | "BL" | "BR" | null,
  isMinimized: boolean,

  zIndex:number,
}



function DefaultRunningAppPropertiesGenerator(app_properties: AppProperties): RunningAppProperties {

  return({
    ref:  createRef<HTMLDivElement>(),
    x: Math.floor(Math.random() *100),
    y: Math.floor(Math.random() *100),
    titlebarClicked: false,
    titlebarClickedDistanceX: 0,
    titlebarClickedDistanceY: 0,
    height: (window.innerHeight * app_properties.defaultHeightRatio > 200 ? window.innerHeight * app_properties.defaultHeightRatio : 200),
    width: (window.innerWidth * app_properties.defaultWidthRatio > 200 ? window.innerWidth * app_properties.defaultWidthRatio : 200),
    resizeClicked: null,
    resizeLocationX: 0,
    resizeLocationY: 0,
    maximizeType: null,
    isMinimized: false,
    zIndex: 999,
  })
}

export type RunningAppListType = {
  [key:string] : RunningAppProperties
}


export type RunningAppsReducerAction = {
  type: "ADD" | "DELETE" | "UPDATE-APP-FOCUS" | "TITLEBAR-CLICKED" | "TITLEBAR-UNCLICKED" | "RESIZE-CLICKED" | "RESIZE-UNCLICKED" | "WINDOW-MOVE" | "MINIMIZE-HANDLER" | "MAXIMIZE"
  app_running_id?: string,
  running_properties?: RunningAppProperties,
  app_properties?: AppProperties ,
  event?: React.PointerEvent<HTMLDivElement>,
  resizeClickedLocation?: RunningAppProperties["resizeClicked"],
  maximizeType?: RunningAppProperties["maximizeType"]
}

function focusChange(task:RunningAppListType, app_running_id:string, app_removed:boolean){
  const temp_task = {...task}
  

  //if app is removed/minimized
  if (app_removed){
    const second_place:{app_id:string,zIndex:number} = {app_id:"", zIndex:0}
    const temp_task_array = Object.entries(temp_task)
    for (const i of temp_task_array){
      //if focus of i is greater than second place, and i is not the current app
      if (second_place["zIndex"] < i[1]["zIndex"] && i[0] != app_running_id! ){
        // make sure i is not minimized
        if (i[1]["isMinimized"] == false){
          //update second place with i
          second_place["app_id"] = i[0]
          second_place["zIndex"] = i[1]["zIndex"]
        }
      }
    }
    //if second place exists, update focus to main
    if (second_place["app_id"] != "" && second_place["zIndex"] !=0){
      const temp_second_place = {...temp_task[second_place["app_id"]]}
      temp_second_place["zIndex"] = 999
      temp_task[second_place["app_id"]] = temp_second_place
    }

  } 
  //if app is not removed/minimized
  else{
    // Go thru all the currently running apps
    for (const i of Object.entries(temp_task)){
      //Copy i
      const temp_app = {...i[1]}

      // if i is the current app, update focus to main
      if (i[0] == app_running_id){
        temp_app["zIndex"] = 999
        temp_task[app_running_id!] = temp_app
      }
      // if i is not the current app
      else{ 
        //check if i is not minimized
        if (i[1]["isMinimized"] == false){
          //reduce focus of i
          temp_app["zIndex"] = temp_app["zIndex"]-1 
        }
      }

      //Re-apply i 
      temp_task[i[0]] = temp_app
    }
  }

  //Return modified list
  return(temp_task)

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
      let temp_task = {...runningAppsTask}
      delete temp_task[action.app_running_id!]
      temp_task = focusChange(temp_task, action.app_running_id!, true)
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
    case "MINIMIZE-HANDLER":{
      console.log("taskbar-icon-clicked")
      
      let temp_task = {...runningAppsTask}
      
      const current_app = {...temp_task[action.app_running_id!]}

      //if app is minimized
      if (current_app["isMinimized"]){
        //unminimize it
        current_app["isMinimized"] = false;
        temp_task[action.app_running_id!] = current_app

        //update focus w/ app as main focus
        temp_task = focusChange(temp_task, action.app_running_id!, false)
      } 
      // if app is not minimized
      else{      
        // if app is in focus   
        if (current_app["zIndex"] == 999){
          //minmize the app
          current_app["isMinimized"] = true;
          temp_task[action.app_running_id!] = current_app
          //update focus with next in line (second place)
          temp_task = focusChange(temp_task, action.app_running_id!, true)
        } 
        // if app is not in focus
        else{
          temp_task = focusChange(temp_task, action.app_running_id!, false)
        }
      }
      // temp_task[action.app_running_id!] = current_app
      return temp_task
    }
    case "UPDATE-APP-FOCUS":{
      const temp_task = focusChange({...runningAppsTask}, action.app_running_id!, false)
      return temp_task
    }

    case "TITLEBAR-CLICKED":{
      const temp_task = {...runningAppsTask}
      const current_app = {...temp_task[action.app_running_id!]}
      current_app["titlebarClicked"] = true

      
      if (current_app["maximizeType"] != null){
        current_app["maximizeType"] = null
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
          const deadzone = 50;
          const taskbar_height = window.innerHeight * 0.05 
          const mouseX = temp_app.x + temp_app.titlebarClickedDistanceX
          const mouseY = temp_app.y + temp_app.titlebarClickedDistanceY
          console.log(mouseX,mouseY)

          let mouseLocationX = ""
          if ((0 <= mouseX) && (mouseX < deadzone)){
            mouseLocationX = "LEFT"
          }
          else if ((deadzone <= mouseX) && (mouseX < window.innerWidth - deadzone)){
            mouseLocationX = "MIDDLE"
          }
          else if ((window.innerWidth - deadzone <= mouseX) && (mouseX < window.innerWidth)){
            mouseLocationX = "RIGHT"
          }
          
          let mouseLocationY = ""
          if ((0 <= mouseY) && (mouseY < deadzone)){
            mouseLocationY = "TOP"
          }
          else if ((deadzone <= mouseY) && (mouseY < window.innerHeight- deadzone - taskbar_height)){
            mouseLocationY = "MIDDLE"
          }
          else if ((window.innerHeight - deadzone - taskbar_height <= mouseY) && (mouseY < window.innerHeight)){
            mouseLocationY = "BOTTOM"
          }

          if (mouseLocationX == "LEFT"){
            if (mouseLocationY == "TOP"){
              temp_app["maximizeType"] = "TL"
            }
            else if (mouseLocationY == "MIDDLE"){
              temp_app["maximizeType"] = "LEFT"
            }
            else if (mouseLocationY == "BOTTOM"){
              temp_app["maximizeType"] = "BL"
            }
          }
          if (mouseLocationX == "MIDDLE"){
            if (mouseLocationY == "TOP"){
              temp_app["maximizeType"] = "FULL"
            }
          }
          if (mouseLocationX == "RIGHT"){
            if (mouseLocationY == "TOP"){
              temp_app["maximizeType"] = "TR"
            }
            else if (mouseLocationY == "MIDDLE"){
              temp_app["maximizeType"] = "RIGHT"
            }
            else if (mouseLocationY == "BOTTOM"){
              temp_app["maximizeType"] = "BR"
            }
          }

          console.log(temp_app["maximizeType"], mouseLocationX,mouseLocationY)

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
      if (currentApp["maximizeType"] == action.maximizeType ){
        currentApp["maximizeType"] = null
      } else{
        currentApp["maximizeType"] = action.maximizeType!
      }

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

export function StateContext(props:PropsWithChildren){
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningAppsTask, runningAppsDispatch] = useReducer(runningAppsReducer, {})

  return(
    
      <StartMenuContext.Provider value={{startMenuOpen, setStartMenuOpen}}>
        <RunningAppsContext.Provider value = {{runningAppsTask, runningAppsDispatch}}>
         {props.children}
        </RunningAppsContext.Provider>
      </StartMenuContext.Provider>

  )
    
}