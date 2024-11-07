import { useState } from "react";
import "./Main.css";
import { AppList } from "./Apps/Apps";

function Main() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [runningApps, setRunningApps] = useState<string[]>([])

  const AppListArray = Object.entries(AppList)


  return (
    <div className="main-container">
      <div className="user-space">
        {
            runningApps.map((item)=>{
              let app_id = item.split("#")[0]
              
              return(
              <div className="app-window" key={Math.random()}>
                <div className="titlebar">
                  <div className="icon">{AppList[app_id].icon}</div>
                  <div className="name">{AppList[app_id].name}</div>
                  <div className="close" onClick={()=>{setRunningApps(runningApps.filter(app => app != item))}}>X</div>
                </div>
                <div className="content">{AppList[app_id].app()}</div>
              </div>
            )})
          }
      </div>
      <div className="taskbar"> 
        <div className="start-button" onClick={()=>{setStartMenuOpen(!startMenuOpen)}}>😱</div>
        <div className="start-menu" style={{display:startMenuOpen ? "unset":"none"}}>
           {AppListArray.map( (item) => { 
            let app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
            return ( 
            <div className="app-entry" key={app_running_id} onClick={()=>{setRunningApps([...runningApps, app_running_id]); setStartMenuOpen(false)}}> 
              <div className="app-entry-icon"> {item[1].icon}</div>
              <div className="app-entry-name"> {item[1].name}</div>
            </div>
           )
          })}
        </div>
        <div className="active-apps"> 
           {
            runningApps.map((item)=>{ 
              let app_id = item.split("#")[0]
              
              return(
              <div className="active-app" key={Math.random()}>
                {AppList[app_id].icon}
              </div>
            )})
           }

        </div>
      </div>
    </div>
  );
}

export default Main;
