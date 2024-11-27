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

  isMaximized: boolean,
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
    case "MINIMIZE-HANDLER":{
      console.log("taskbar-icon-clicked")
      
      let temp_task = {...runningAppsTask}

      const current_app = {...temp_task[action.app_running_id!]}

      //if app is minimized
      if (current_app["isMinimized"]){
        //unminimize it
        current_app["isMinimized"] = false;

        //update focus w/ app as main focus
        for (const i of Object.entries(temp_task)){
          // if i is the current app, update focus to main
          if (i[0] == action.app_running_id){
            current_app["zIndex"] = 999
          }
          // if i is another running app
          else{ 
            //check if i is not minimized
            if (i[1]["isMinimized"] == false){
              //reduce focus of i
              const temp_app = {...i[1]}
              temp_app["zIndex"] = temp_app["zIndex"]-1 
              temp_task[i[0]] = temp_app
            }
          }
        }
      } 
      // if app is not minimized
      else{      
        // if app is in focus   
        if (current_app["zIndex"] == 999){
          //minmize the app
          current_app["isMinimized"] = true
          //find app with second highest focus
          let second_place:{app_id:string,zIndex:number} = {app_id:"", zIndex:0}
          const temp_task_array = Object.entries(temp_task)
          for (const i of temp_task_array){
            //if focus of i is greater than second place, and i is not the current app
            if (second_place["zIndex"] < i[1]["zIndex"] && i[0] != action.app_running_id! ){
              // make sure i is not minimized
              if (i[1]["isMinimized"] == false){
                //update second place with i
                second_place["app_id"] = i[0]
                second_place["zIndex"] = i[1]["zIndex"]
              }
            }
          }
          //if second place exists, update focus to amin
          if (second_place["app_id"] != "" && second_place["zIndex"] !=0){
            const temp_second_place = {...temp_task[second_place["app_id"]]}
            temp_second_place["zIndex"] = 999
            temp_task[second_place["app_id"]] = temp_second_place
          }
          
        } 
        // if app is not in focus
        else{
          //update focus w/ app as main focus
          for (const i of Object.entries(temp_task)){
            //if i is app, update focus to main
            if (i[0] == action.app_running_id){
              current_app["zIndex"] = 999
            } 
            // if i isnt app
            else{
              // if i isnt minimized
              if (i[1]["isMinimized"] == false){
                //reduce focus of i
                const temp_app = {...i[1]}
                temp_app["zIndex"] = temp_app["zIndex"]-1 
                temp_task[i[0]] = temp_app
              }
            }
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