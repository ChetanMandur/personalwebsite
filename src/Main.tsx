import React, { useState, createRef } from "react";
import "./Main.css";
import { AppList } from "./Apps/Apps";


type RunningAppProperties = {
  ref: React.MutableRefObject<null | HTMLDivElement>,
  x: number | null,
  y: number | null,
  titlebarClicked: boolean,
  titlebarClickedDistanceX: number ,
  titlebarClickedDistanceY: number ,
}



type RunningAppListType = {
  [key:string] : RunningAppProperties
}

function Main() {


  
  
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningApps, setRunningApps] = useState<RunningAppListType>({})

  const AppListArray = Object.entries(AppList)
  const RunningAppsArray = Object.entries(runningApps)

  function DefaultRunningAppPropertiesGenerator(): RunningAppProperties {

    return({
      ref:  createRef<HTMLDivElement>(),
      x: Math.floor(Math.random() *100),
      y: Math.floor(Math.random() *100),
      titlebarClicked: false,
      titlebarClickedDistanceX: 0,
      titlebarClickedDistanceY: 0,
    })
  }

  function addRunningApp(app_id:string){
    console.log("addRunningApp")
    let temp_running_apps = {...runningApps}
    temp_running_apps[app_id] = {...DefaultRunningAppPropertiesGenerator()}
    setRunningApps(temp_running_apps)
  }

  function deleteRunningApp(app_id:string){
    console.log("deleteRunningApp")
    let temp_running_apps = {...runningApps}
    delete temp_running_apps[app_id]
    setRunningApps(temp_running_apps)
  }

  function updateAppProperty<T extends keyof RunningAppListType>(app_running_id: T,key: keyof RunningAppListType[T], value: any){
    console.log("updateAppProperty")
    let temp_running_apps = {...runningApps}

    temp_running_apps[app_running_id][key] = value
    setRunningApps(temp_running_apps)
  }


  function titlebarClickedEvent(event:React.PointerEvent<HTMLDivElement>, app_running_id:string){
    console.log("titlebarClickedEvent")
    updateAppProperty(app_running_id, "titlebarClicked", true); 

    updateAppProperty(app_running_id, "titlebarClickedDistanceX", (event.clientX-runningApps[app_running_id]["ref"].current?.getBoundingClientRect().x!))
    updateAppProperty(app_running_id, "titlebarClickedDistanceY", (event.clientY-runningApps[app_running_id]["ref"].current?.getBoundingClientRect().y!))
  }

  function titlebarUnClickedEvent(){
    console.log("titlebarUnClickedEvent")
    for (const i of RunningAppsArray){
      if (runningApps[i[0]]["titlebarClicked"]){
        updateAppProperty(i[0], "titlebarClicked", false)
      }
    }
  }

  function windowMoveEvent(event:React.PointerEvent<HTMLDivElement>){
    for (const i of RunningAppsArray){
      if (runningApps[i[0]]["titlebarClicked"]){
        updateAppProperty(i[0], "x", event.clientX - runningApps[i[0]]["titlebarClickedDistanceX"] )
        updateAppProperty(i[0], "y", event.clientY - runningApps[i[0]]["titlebarClickedDistanceY"])
      }
    }

  }



  return (
    <div className="main-container">
      <div className="user-space" onPointerUp={()=>{titlebarUnClickedEvent()}} onPointerMove={(event) => { windowMoveEvent(event)}}>
        {/* Where each running app is rendered */}
        {
            RunningAppsArray.map((item)=>{
              let app_running_id = item[0]
              let app_id = app_running_id.split("#")[0]
              let properties = item[1]
              
              return(
              <div className="app-window" ref={runningApps[app_running_id]["ref"]} key={app_running_id}  style={(properties.x != null && properties.y !=null) ? {left: properties.x+"px", top:properties.y+"px"} : {}}>
                <div className="titlebar" onPointerDown={(event) =>{titlebarClickedEvent(event, app_running_id)}} >
                  <div className="icon">{AppList[app_id].icon}</div>
                  <div className="name">{AppList[app_id].name}</div>
                  <div className="close" onClick={()=>{deleteRunningApp(app_running_id)}}>X</div>
                </div>
                <div className="content">{AppList[app_id].app()}</div>
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
            let app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
            return ( 
            <div className="app-entry" key={Math.random()} onClick={()=>{addRunningApp(app_running_id); setStartMenuOpen(false)}}> 
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
              let app_running_id = item[0]
              let app_id = app_running_id.split("#")[0]

              
              return(
              <div className="active-app" key={Math.random()}>
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
