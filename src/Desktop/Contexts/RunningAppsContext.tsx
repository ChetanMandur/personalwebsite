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
  titlebarClickedDepthX: number ,
  titlebarClickedDepthY: number ,

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
  appTitleDetails?: string,
  appTitleName?: string,
}


export type RunningAppListType = {
  [key:string] : RunningAppProperties
}

 export type RunningAppsReducerAction = 
 {type: "ADD", app_name: string, props?: object, app_running_id?: string} |
 {type:"DELETE"} & AppRunningID |
 {type:"UPDATE-APP-FOCUS"} & AppRunningID |
 {type:"UPDATE-APP-TITLE-DETAILS", appTitleDetails: string|undefined} & AppRunningID |
 {type:"UPDATE-APP-TITLE-NAME", appTitleName: string|undefined} & AppRunningID |
 {type:"UPDATE-APP-PROPS", props: object} & AppRunningID |
 {type:"TITLEBAR-CLICKED"} & AppRunningID & ReactPointerEvent |
 {type:"TITLEBAR-UNCLICKED"} & AppRunningID |
 {type:"RESIZE-CLICKED", resizeClickedLocation: RunningAppProperties["resizeClicked"]} & AppRunningID & ReactPointerEvent |
 {type:"RESIZE-UNCLICKED"} & AppRunningID|
 {type:"WINDOW-MOVE", event: PointerEvent} & AppRunningID |
 {type:"WINDOW-RESIZE", event: PointerEvent} & AppRunningID |
 {type:"MINIMIZE-HANDLER", forceMinimize: boolean} & AppRunningID|
 {type:"MAXIMIZE", maximizeType: RunningAppProperties["maximizeType"]} & AppRunningID |
 {type:"WINDOW-DIRECT-MOVE", x?: number, y?: number} & AppRunningID |
 {type:"WINDOW-DIRECT-RESIZE", width?: number, height?: number} & AppRunningID 

/**
 * Given the name of an app, return a default set of properties for the app
 * @param app_name - The name of the app you wish to generate properties for
 * @returns A list of default properties for the app
 */
function DefaultRunningAppPropertiesGenerator(app_name:string): RunningAppProperties {
  const app_properties: AppProperties = AppList[app_name]
  return({
    ref:  createRef<HTMLDivElement>(),
    x: Math.floor(Math.random() *100),
    y: Math.floor(Math.random() *100),
    titlebarClicked: false,
    titlebarClickedDepthX: 0,
    titlebarClickedDepthY: 0,
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
    appTitleDetails: undefined,
    appTitleName: undefined,
  })
}


function focusChange(data:RunningAppListType, app_running_id:string, app_removed:boolean){
  const newData = {...data}

  // If app is removed/minimized
  if (app_removed){
    const second_place:{app_running_id:string,zIndex:number} = {app_running_id:"", zIndex:0}
    for (const i of Object.entries(newData)){
      // Get properties of current app
      const current_app_running_id = i[0]
      const current_app_properties = i[1]
      // If focus of current app is greater than second place, current app is not the removed app, and current app is not minimized
      if (second_place["zIndex"] < current_app_properties["zIndex"] && current_app_running_id != app_running_id! && current_app_properties["isMinimized"] == false){
          // Update second place with i
          second_place["app_running_id"] = current_app_running_id
          second_place["zIndex"] = current_app_properties["zIndex"]
      }
    }

    // If second place exists, update focus to main
    if (second_place["app_running_id"] != "" && second_place["zIndex"] !=0){
      const second_place_app = newData[second_place["app_running_id"]]
      second_place_app["zIndex"] = 999
      newData[second_place["app_running_id"]] = second_place_app
    }
  }
   
  // If app is not removed/minimized
  else{
    // Go thru all the currently running apps
    for (const i of Object.entries(newData)){
      const current_app_running_id = i[0]
      const current_app_properties = i[1]
  
      // If i is the current app, update focus to main
      if (current_app_running_id == app_running_id){
        current_app_properties["zIndex"] = 999
        newData[app_running_id!] = current_app_properties
      }
      // If i is not the current app
      else{ 
        // Check if i is not minimized
        if (current_app_properties["isMinimized"] == false){
          // Reduce focus of i
          current_app_properties["zIndex"] = current_app_properties["zIndex"]-1 
        }
      }

      // Re-apply i 
      newData[current_app_running_id] = current_app_properties
    }
  }

  // Return modified list
  return(newData)

}

export function titlebarTextGenerator(running_properties: RunningAppProperties):string{
  const app_name:string = running_properties.appTitleName ?? running_properties.appProperties.name

  if (running_properties.appTitleDetails != undefined){
    return app_name + " - " + running_properties.appTitleDetails
  } else {
    return app_name
  }
}

export function runningAppsReducer(runningAppsData:RunningAppListType, action:RunningAppsReducerAction):RunningAppListType{
  let newData = {...runningAppsData}
  switch (action.type){

    // Used for added an app to the running apps list
    // Ie. used when opening a new app
    case "ADD": {

      // Create a variable to store the app running id
      let app_running_id: string
      
      // If no predetermined app running id is given, auto generate one 
      if (!action.app_running_id){
        // Generate an app_running_id for the new app
        app_running_id = action.app_name + "#" + (Math.floor(Math.random() *100 ))

        // If by chance the app_running_id is being used, generate a new app_running_id
        while (newData[app_running_id] != undefined){
          app_running_id = action.app_name + "#" + (Math.floor(Math.random() *100 ))
        }
      }

      // If a predetermined app running id is given, use that
      else{
        app_running_id = action.app_running_id
      }

      // Give default properties to the new app 
      newData[app_running_id] = {...DefaultRunningAppPropertiesGenerator(action.app_name)}

      // If any props were given to the app upon opening, apply the props
      newData[app_running_id]["props"] = {...newData[app_running_id!]["props"], ...action.props, app_running_id:app_running_id } 

      // Change focus to the new app
      newData = focusChange(newData, app_running_id!, false)
      break;
    }

    // Used for closing an app
    case "DELETE":{
      // Delete the app from the running apps list
      delete newData[action.app_running_id!]

      // Change focus to the app with the highest focus (not including the app to-be/just removed)
      newData = focusChange(newData, action.app_running_id!, true)
      break;

    }

    // Used for updating the props for an app
    case "UPDATE-APP-PROPS":{
      // Merges new props with existing props
      newData[action.app_running_id]["props"] = {...newData[action.app_running_id!]["props"],...action.props}
      break;
    }

    // Used for when a resize hitbox is pressed in on
    // Ie. when the user clicks the corner/side of a window
    case "RESIZE-CLICKED":{
      // Signifies which hitbox (corner/size) is being clicked on
      newData[action.app_running_id!]["resizeClicked"] = action.resizeClickedLocation!
      
      // The location of the mouse/hitbox when being clicked in on 
      newData[action.app_running_id!]["resizeLocationX"] = action.event!.clientX
      newData[action.app_running_id!]["resizeLocationY"] = action.event!.clientY
      break;
    }

    // Used for when a resize hitbox is pressed off
    // Ie. when the user unclicks the corner/side of a window
    case "RESIZE-UNCLICKED":{
      const current_app = {...newData[action.app_running_id]}

      // Set resizeClicked to null to signifiy that no hitboxes are being clicked on
      current_app["resizeClicked"] = null

      // Force width/height to have a min size of 200
      if (current_app["width"] < 200){
        current_app["width"] = 200
      }
      if (current_app["height"] < 200){
        current_app["height"] = 200
      }

      newData[action.app_running_id] = current_app

      break;
    }

    // Used for minimizing and restoring an app
    case "MINIMIZE-HANDLER":{
      const current_app = {...newData[action.app_running_id!]}

      // If app is minimized
      if (current_app["isMinimized"]){
        // Unminimize it
        current_app["isMinimized"] = false;
        newData[action.app_running_id!] = current_app

        // Update focus w/ app as main focus
        newData = focusChange(newData, action.app_running_id!, false)
      } 
      // If app is not minimized
      else{      
        // If app is in focus or a request to force minimize is present
        if (current_app["zIndex"] == 999 || (action.forceMinimize == true)){
          // Minmize the app
          current_app["isMinimized"] = true;
          newData[action.app_running_id!] = current_app
          // Update focus with next in line (second place)
          newData = focusChange(newData, action.app_running_id!, true)
        } 
        // If app is not in focus and there are is no request to force minimize present
        else{
          // Set app as new focus, and don't minimize
          newData = focusChange(newData, action.app_running_id!, false)
        }
      }
      break;
    }

    // Used to update an app into focus
    case "UPDATE-APP-FOCUS":{
      // Update app into focus (ie. set zIndex to 999 / the top)
      newData = focusChange(newData, action.app_running_id!, false)
      // Make sure the app is not minimized
      newData[action.app_running_id].isMinimized = false;
      break;
    }

    // Used to update an app's additional title
    case "UPDATE-APP-TITLE-DETAILS":{
      newData[action.app_running_id!]["appTitleDetails"] = action.appTitleDetails!
      break;
    }

    // Used to update an app's title name to use a custom name
    case "UPDATE-APP-TITLE-NAME":{
      newData[action.app_running_id!]["appTitleName"] = action.appTitleName!
      break;
    }

    // Used for when an app's title bar is pressed on
    case "TITLEBAR-CLICKED":{
      const current_app = {...newData[action.app_running_id!]}
      
      // Set titlebarClick to true
      current_app["titlebarClicked"] = true

      // Calculate the depth within the titlebar which is clicked
      // Ie. where in the title bar is the user clicked on
      // If the app is currently in a maximized state, need to find the % distance where the titlebar is clicked
      // This is done because when the titlebar is clicked, the app is reverted back to it's original width/height and we want the mouse to be in the same relative position
      // Ie. if the app is fully maximized, and the user clicked in the middle of the titlebar, we want still want the mouse to be in the middle of the titlebar within the OG sizing

      // If app is in a maximized state
      if (current_app["maximizeType"] != null){
        // Remove app from maximized state
        current_app["maximizeType"] = null

        // Find the relative distance clicked within the titlebar
        // Eg. Clicked 50% between the titlebar in the X and Y axis

        // (MouseLocation - AppLocation) / AppSize
        const xRatio = (action.event!.clientX - current_app["ref"].current!.getBoundingClientRect().x ) / current_app["ref"].current!.getBoundingClientRect().width
        const yRatio = (action.event!.clientY - current_app["ref"].current!.getBoundingClientRect().y) / current_app["ref"].current!.getBoundingClientRect().height


        // With the ratio, find the relative positon with the original sizing
        // This sizing is in px
        const width_chunk = current_app["width"]*xRatio
        const height_chunk = current_app["height"]*yRatio 


        // Position the app so that the mouse is clicked within the titlebar at the right location
        current_app["x"] = action.event!.clientX -  width_chunk
        current_app["y"] = action.event!.clientY -  height_chunk

        // Change the depth to the new sizing
        current_app["titlebarClickedDepthX"] = width_chunk
        current_app["titlebarClickedDepthY"] = height_chunk

      } 
      // If the app is not in a maximized state
      else{
        // Find the depth which the titlebar is clicked in
        // MouseLocation - AppLocation
        current_app["titlebarClickedDepthX"] = action.event!.clientX-current_app["ref"].current!.getBoundingClientRect().x
        current_app["titlebarClickedDepthY"] = action.event!.clientY-current_app["ref"].current!.getBoundingClientRect().y
      }

      newData[action.app_running_id!] = current_app
      break;

    }

    // Used when the titlebar is pressed off 
    case "TITLEBAR-UNCLICKED":{
      const current_app = {...newData[action.app_running_id]}

      current_app["titlebarClicked"] = false

      newData[action.app_running_id] = current_app
      break;

    }

    // Used for handling moving/dragging the app window
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
      current_app["x"]= mouseX - current_app["titlebarClickedDepthX"] 
      current_app["y"] =  mouseY - current_app["titlebarClickedDepthY"]

      
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

    // Used for resizing the app window
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

    // Used for setting the app to a maximized state 
    // Or removing from a maximized state
    case "MAXIMIZE":{
      const currentApp = {...newData[action.app_running_id!]}

      // If the app is already in the maximized state, remove it from the state
      if (currentApp["maximizeType"] == action.maximizeType ){
        currentApp["maximizeType"] = null
      } 
      // If the app isn't in a maximized state, or the state is different, update the state
      else{
        currentApp["maximizeType"] = action.maximizeType!
      }

      newData[action.app_running_id!] = currentApp
      break;
    }

    // Used for giving an app window an exact x/y coord to move to
    case "WINDOW-DIRECT-MOVE":{
      const current_app = {...newData[action.app_running_id]}
      
      // Since x/y coords are not mandatory, check if any are given before applying
      if (action.x){
        current_app["x"] = action.x
      }
      if (action.y){
        current_app["y"] = action.y
      }
      
      newData[action.app_running_id] = current_app
      break;
    }

    // Used for giving an app window an exact width/height to resize to
    case "WINDOW-DIRECT-RESIZE":{
      const current_app = {...newData[action.app_running_id]}
      
      // Since width/height are not mandatory, check if any are given before applying
      if (action.width){
        current_app["width"] = action.width
      }
      if (action.height){
        current_app["height"] = action.height
      }
      
      newData[action.app_running_id] = current_app
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
