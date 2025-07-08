import { createContext, createRef } from "react";
import { AppList, AppProperties } from "../../Apps/Apps";

export type AppRunningID = {
  app_running_id: string
}

type ReactPointerEvent = {
  event: React.PointerEvent<HTMLDivElement>
}

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
  props:object,

  appProperties: AppProperties,
  appAdditionalTitle?: string,
}


export type RunningAppListType = {
  [key:string] : RunningAppProperties
}

 export type RunningAppsReducerAction = 
 {type: "ADD", app_name: string, props?: object} |
 {type:"DELETE"} & AppRunningID |
 {type:"UPDATE-APP-FOCUS"} & AppRunningID |
 {type:"UPDATE-APP-ADDITIONAL-TITLE", appAdditionalTitle: string|undefined} & AppRunningID |
 {type:"UPDATE-APP-PROPS", props: object} & AppRunningID |
 {type:"TITLEBAR-CLICKED"} & AppRunningID & ReactPointerEvent |
 {type:"TITLEBAR-UNCLICKED"} & AppRunningID |
 {type:"RESIZE-CLICKED", resizeClickedLocation: RunningAppProperties["resizeClicked"]} & AppRunningID & ReactPointerEvent |
 {type:"RESIZE-UNCLICKED"} & AppRunningID|
 {type:"WINDOW-MOVE", event: PointerEvent} & AppRunningID |
 {type:"WINDOW-RESIZE", event: PointerEvent} & AppRunningID |
 {type:"MINIMIZE-HANDLER", forceMinimize: boolean} & AppRunningID|
 {type:"MAXIMIZE", maximizeType: RunningAppProperties["maximizeType"]}  & AppRunningID 
  

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
    props:{...app_properties.props},
    appProperties: app_properties,
    appAdditionalTitle: undefined,
  })
}


function focusChange(data:RunningAppListType, app_running_id:string, app_removed:boolean){
  const newData = {...data}
  

  //if app is removed/minimized
  if (app_removed){
    const second_place:{app_running_id:string,zIndex:number} = {app_running_id:"", zIndex:0}
    for (const i of Object.entries(newData)){
      //if focus of i is greater than second place, i is not the current app, and  i is not minimized
      if (second_place["zIndex"] < i[1]["zIndex"] && i[0] != app_running_id! && i[1]["isMinimized"] == false){
          //update second place with i
          second_place["app_running_id"] = i[0]
          second_place["zIndex"] = i[1]["zIndex"]
        
      }
    }
    //if second place exists, update focus to main
    if (second_place["app_running_id"] != "" && second_place["zIndex"] !=0){
      const second_place_app = {...newData[second_place["app_running_id"]]}
      second_place_app["zIndex"] = 999
      newData[second_place["app_running_id"]] = second_place_app
    }
  }
   
  //if app is not removed/minimized
  else{
    // Go thru all the currently running apps
    for (const i of Object.entries(newData)){
      //Copy i
      const temp_app = {...i[1]}

      // if i is the current app, update focus to main
      if (i[0] == app_running_id){
        temp_app["zIndex"] = 999
        newData[app_running_id!] = temp_app
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
      newData[i[0]] = temp_app
    }
  }

  //Return modified list
  return(newData)

}

export function titlebarTextGenerator(running_properties: RunningAppProperties):string{
  if (running_properties.appAdditionalTitle != undefined){
    return running_properties.appProperties.name + " - " + running_properties.appAdditionalTitle
  } else {
    return running_properties.appProperties.name
  }
}

export function runningAppsReducer(runningAppsData:RunningAppListType, action:RunningAppsReducerAction):RunningAppListType{
  let newData = {...runningAppsData}
  switch (action.type){
    case "ADD": {
      const app_running_id = action.app_name + "#" + (Math.floor(Math.random() *100 ))
      const app_properties = AppList[action.app_name!]
      newData[app_running_id] = {...DefaultRunningAppPropertiesGenerator(app_properties)}
      newData[app_running_id]["props"] = {...newData[app_running_id!]["props"], ...action.props, app_running_id:app_running_id } 

      newData = focusChange({...newData}, app_running_id!, false)
      break;
    }
    case "DELETE":{
      delete newData[action.app_running_id!]
      newData = focusChange(newData, action.app_running_id!, true)
      break;

    }
    case "UPDATE-APP-PROPS":{
      newData[action.app_running_id]["props"] = {...newData[action.app_running_id!]["props"],...action.props}
      break;
    }
    case "RESIZE-CLICKED":{
      newData[action.app_running_id!]["resizeClicked"] = action.resizeClickedLocation!
      newData[action.app_running_id!]["resizeLocationX"] = action.event!.clientX
      newData[action.app_running_id!]["resizeLocationY"] = action.event!.clientY
      break;
    }
    case "RESIZE-UNCLICKED":{
      const current_app = {...newData[action.app_running_id]}

      current_app["resizeClicked"] = null

      if (current_app["width"] < 200){
        current_app["width"] = 200
      }

      if (current_app["height"] < 200){
        current_app["height"] = 200
      }

      newData[action.app_running_id] = current_app

      break;
    }

    case "MINIMIZE-HANDLER":{
      const current_app = {...newData[action.app_running_id!]}

      //if app is minimized
      if (current_app["isMinimized"]){
        //unminimize it
        current_app["isMinimized"] = false;
        newData[action.app_running_id!] = current_app

        //update focus w/ app as main focus
        newData = focusChange(newData, action.app_running_id!, false)
      } 
      // if app is not minimized
      else{      
        // if app is in focus   
        if (current_app["zIndex"] == 999 || (action.forceMinimize == true)){
          //minmize the app
          current_app["isMinimized"] = true;
          newData[action.app_running_id!] = current_app
          //update focus with next in line (second place)
          newData = focusChange(newData, action.app_running_id!, true)
        } 
        // if app is not in focus
        else{
          newData = focusChange(newData, action.app_running_id!, false)
        }
      }
      break;
    }
    case "UPDATE-APP-FOCUS":{
      newData = focusChange({...runningAppsData}, action.app_running_id!, false)
      newData[action.app_running_id].isMinimized = false;
      break;
    }

    case "UPDATE-APP-ADDITIONAL-TITLE":{
      // console.log("UPDATE-APP-ADDITIONAL-TITLE", action.appAdditionalTitle!)
      newData[action.app_running_id!]["appAdditionalTitle"] = action.appAdditionalTitle!
      break;
    }

    case "TITLEBAR-CLICKED":{
      const current_app = {...newData[action.app_running_id!]}
      current_app["titlebarClicked"] = true

      
      if (current_app["maximizeType"] != null){
        current_app["maximizeType"] = null
        const xRatio = (action.event!.clientX - current_app["ref"].current!.getBoundingClientRect().x ) / current_app["ref"].current!.getBoundingClientRect().width
        const yRatio = (action.event!.clientY - current_app["ref"].current!.getBoundingClientRect().y) / current_app["ref"].current!.getBoundingClientRect().height


        const width_chunk = current_app["width"]*xRatio
        const height_chunk = current_app["height"]*yRatio 


        current_app["x"] = action.event!.clientX -  width_chunk
        current_app["y"] = action.event!.clientY -  height_chunk

        current_app["titlebarClickedDistanceX"] = width_chunk
        current_app["titlebarClickedDistanceY"] = height_chunk

      } else{
        current_app["titlebarClickedDistanceX"] = action.event!.clientX-current_app["ref"].current!.getBoundingClientRect().x
        current_app["titlebarClickedDistanceY"] = action.event!.clientY-current_app["ref"].current!.getBoundingClientRect().y
      }

      newData[action.app_running_id!] = current_app
      break;

    }
    case "TITLEBAR-UNCLICKED":{
      const current_app = {...newData[action.app_running_id]}

      current_app["titlebarClicked"] = false

      newData[action.app_running_id] = current_app
      break;

    }

    case "WINDOW-MOVE":{
      // If the titlebar isn't being held, the window move function should not be doing any calculations
      // Useful for the case where the user's mouse leaves the browser when moving a window
      if (!newData[action.app_running_id]["titlebarClicked"]){
        break
      }

      // Get app related to running id
      const current_app = {...newData[action.app_running_id]}

      // Get mouse x and y
      const mouseX = action.event!.clientX
      const mouseY = action.event!.clientY

      // Update app's x and y position based on mouse
      current_app["x"]= mouseX - current_app["titlebarClickedDistanceX"] 
      current_app["y"] =  mouseY - current_app["titlebarClickedDistanceY"]

      
      // On x-axis, there are 3 sections the mouse can be at: left, middle, and right
      const xSectionWidth = 20; // Size of left&right section
      const xBorder1 = xSectionWidth // Left/middle border
      const xBorder2 = window.innerWidth - xSectionWidth // Middle/right border

      let mouseLocationX = ""
      if ((0 <= mouseX) && (mouseX < xBorder1)){
        mouseLocationX = "LEFT"
      }
      else if ((xBorder1 <= mouseX) && (mouseX < xBorder2)){
        mouseLocationX = "MIDDLE"
      }
      else if ((xBorder2 <= mouseX) && (mouseX <= window.innerWidth)){
        mouseLocationX = "RIGHT"
      }
      
      // Userspace height
      const user_space_height = parseFloat(window.getComputedStyle(document.getElementById("user-space")!).height)

      // On y-axis, there are 3 sections the mouse can be at: top, middle, and bottom
      const ySectionHeight = 20; // Size of top&bottom section
      const yBorder1 = ySectionHeight // Top/middle border
      const yBorder2 = user_space_height - ySectionHeight // Middle/bottle border

      let mouseLocationY = ""
      if ((0 <= mouseY) && (mouseY < yBorder1)){
        mouseLocationY = "TOP"
      }
      else if ((yBorder1 <= mouseY) && (mouseY < yBorder2)){
        mouseLocationY = "MIDDLE"
      }
      else if ((yBorder2 <= mouseY) && (mouseY <= window.innerHeight)){
        mouseLocationY = "BOTTOM"
      }

      // Based on x and y section, determine the part of the screen the mouse is at
      if (mouseLocationX == "LEFT"){
        if (mouseLocationY == "TOP"){
          current_app["maximizeType"] = "TL"
        }
        else if (mouseLocationY == "MIDDLE"){
          current_app["maximizeType"] = "LEFT"
        }
        else if (mouseLocationY == "BOTTOM"){
          current_app["maximizeType"] = "BL"
        }
      }
      if (mouseLocationX == "MIDDLE"){
        if (mouseLocationY == "TOP"){
          current_app["maximizeType"] = "FULL"
        } else {
          current_app["maximizeType"] = null
        }
      }
      if (mouseLocationX == "RIGHT"){
        if (mouseLocationY == "TOP"){
          current_app["maximizeType"] = "TR"
        }
        else if (mouseLocationY == "MIDDLE"){
          current_app["maximizeType"] = "RIGHT"
        }
        else if (mouseLocationY == "BOTTOM"){
          current_app["maximizeType"] = "BR"
        }
      }

      // Apply properties to the app
      newData[action.app_running_id] = current_app
      break
    }

    case "WINDOW-RESIZE":{
      // If a resize hitbox isn't being held, the window resize function should not be doing any calculations
      // Useful for the case where the user's mouse leaves the browser when resizing a window
      if (!newData[action.app_running_id]["resizeClicked"]){
        break
      }

      const current_app = {...newData[action.app_running_id]}
      // Get mouse X and Y
      const mouseX = action.event!.clientX
      const mouseY = action.event!.clientY

      // Calculate the distance the mouse has moved
      const distanceX = (mouseX - current_app["resizeLocationX"]); // right is positive
      const distanceY = (mouseY - current_app["resizeLocationY"]); //down is positive

      // Setup variables for the app's next x, y, width, and height
      let new_x = current_app["x"]
      let new_y = current_app["y"]
      let new_width = current_app["width"]
      let new_height = current_app["height"]

      // Based on which resize section is grabbed, calculate the app's new x, y, width, and/or height
      switch (current_app["resizeClicked"]) {
          // If the top left is grabbed, that means the x,y, width, and height can changed
          case "TL":
            new_x += distanceX 
            new_y += distanceY 
            new_width -= distanceX
            new_height -= distanceY
            break;

          // If the top right is grabbed, that means the y, width, and height can be changed
          case "TR":
            new_y += distanceY 
            new_width += distanceX  
            new_height -= distanceY
            break;

          // If the bottom left is grabbed, that means the x, width, and height can be changed
          case "BL":
            new_x += distanceX 
            new_width -= distanceX  
            new_height += distanceY
            break;

          // If the bottom right is grabbed, that means the width and height can be changed
          case "BR":
            new_width += distanceX
            new_height += distanceY
            break;

          // If the top is grabbed, that means the y and height can be changed
          case "TOP":
            new_y += distanceY
            new_height -= distanceY
            break;

          // If the bottom is grabbed, that means the height can be changed
          case "BOT":
            new_height += distanceY
            break;

          // If the left is grabbed, that means the x and width can be changed
          case "LEFT":
            new_x += distanceX
            new_width -= distanceX
            break;

          // If the right is grabbed, that means the width can be changed
          case "RIGHT":
            new_width += distanceX
            break;
        }

        // Get app's min width and height
        const appMinWidth = parseFloat(window.getComputedStyle(document.getElementById("user-space")!).getPropertyValue("--app-min-width"))
        const appMinHeight = parseFloat(window.getComputedStyle(document.getElementById("user-space")!).getPropertyValue("--app-min-height"))

        // Needs a constraint on the width to prevent changes when min-width is hit
        if (new_width >= appMinWidth){
          current_app["x"] = new_x
          current_app["width"] =new_width
          current_app["resizeLocationX"]= action.event!.clientX
        }

        // Needs a constraint on the height to prevent changes when min-height is hit
        if (new_height >= appMinHeight){
          current_app["y"]= new_y
          current_app["height"]=  new_height
          current_app["resizeLocationY"] = action.event!.clientY
        }



      newData[action.app_running_id] = current_app
      break
    }

    case "MAXIMIZE":{
      const currentApp = {...newData[action.app_running_id!]}
      if (currentApp["maximizeType"] == action.maximizeType ){
        currentApp["maximizeType"] = null
      } else{
        currentApp["maximizeType"] = action.maximizeType!
      }

      newData[action.app_running_id!] = currentApp
      break;
    }

  }
  return (newData)
}

export type RunningAppsContextType = {
  runningAppsData: RunningAppListType, 
  runningAppsDispatch:  React.Dispatch<RunningAppsReducerAction>
}

 export const RunningAppsContext = createContext<RunningAppsContextType>({runningAppsData:{}, runningAppsDispatch:()=>{}})
