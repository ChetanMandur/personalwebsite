import {RunningAppProperties} from "../Desktop"
import "./RunningApp.css"
import {AppList} from "../../Apps/Apps"


type RunningAppPropsType = {
  app_running_id:string,
  running_properties: RunningAppProperties
}


export default function RunningApp({app_running_id, running_properties}:RunningAppPropsType){
  console.log(app_running_id, running_properties)
  return(
  <></>
  )
}