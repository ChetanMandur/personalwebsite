import { useState } from "react";
import "./Main.css";
import { AppList } from "./Apps/Apps";

type RunningAppProperties = {
  x: number | null,
  y: number | null,
  titlebarClicked: boolean,
  // ref:
}

const defaultRunningAppProperties = {
  x: null,
  y: null,
  titlebarClicked: false
}

type RunningAppListType = {
  [key:string] : RunningAppProperties
}

function Main() {
  
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningApps, setRunningApps] = useState<RunningAppListType>({})

  const AppListArray = Object.entries(AppList)
  const RunningAppsArray = Object.entries(runningApps)

  function addRunningApp(app_id:string){
    let temp_running_apps = {...runningApps}
    temp_running_apps[app_id] = {...defaultRunningAppProperties}
    setRunningApps(temp_running_apps)
  }

  function deleteRunningApp(app_id:string){
    let temp_running_apps = {...runningApps}
    delete temp_running_apps[app_id]
    setRunningApps(temp_running_apps)
  }

  function updateAppProperty<T extends keyof RunningAppListType>(app_running_id: T,key: keyof RunningAppListType[T], value: any ){

    runningApps[app_running_id][key] = value
  }



  return (
    <div className="main-container">
      <div className="user-space">
        {/* Where each running app is rendered */}
        {
            RunningAppsArray.map((item)=>{
              let app_running_id = item[0]
              let app_running_id_split = app_running_id.split("#")
              let app_id = app_running_id_split[0]
              let running_id = app_running_id_split[1]
              let properties = item[1]
              
              return(
              <div className="app-window" key={app_running_id}>
                <div className="titlebar" >
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
              let app_running_id_split = app_running_id.split("#")
              let app_id = app_running_id_split[0]
              let running_id = app_running_id_split[1]
              let properties = item[1]
              
              return(
              <div className="active-app" key={Math.random()}>
                {AppList[app_id].icon}
              </div>
              // <></>
              )
          })
           }

        </div>
      </div>
    </div>
  );
}

export default Main;
