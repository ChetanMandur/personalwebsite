import { useContext } from "react"
import "./StartMenu.css"
import { AppList } from "../../../Apps/Apps"
import { StartMenuContext, RunningAppsContext } from "../../StateContext"





export default function StartMenu(){
  const {setStartMenuOpen} = useContext(StartMenuContext)
  const {runningAppsDispatch} = useContext(RunningAppsContext)


  const AppListArray = Object.entries(AppList)

  return(<div className="start-menu">
    <div className="app-list">
      {AppListArray.map( (item) => { 
        const app_running_id = item[0] + "#" + (Math.floor(Math.random() *100 ))
        return ( 
        <div className="app-entry" key={Math.random()} onClick={()=>{runningAppsDispatch({type:"ADD", app_running_id:app_running_id, app_properties:item[1]});runningAppsDispatch({type:"UPDATE-APP-FOCUS", app_running_id:app_running_id}); setStartMenuOpen(false)}}> 
          <div className="app-entry-icon"> <img src={item[1].icon}/></div>
          <div className="app-entry-name"> {item[1].name}</div>
        </div>
        )  
        })}
    </div>
    <div className="side-panel">
      <div className="profile-details">
        {/* <img className="common-border profile-picture" src="https://avatars.githubusercontent.com/u/25832939?v=4" alt="" /> */}
        {/* <img className="common-border profile-picture" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Doolhofzwam_%28Daedalea_quercina%29_30-11-2022._%28d.j.b%29.jpg/2560px-Doolhofzwam_%28Daedalea_quercina%29_30-11-2022._%28d.j.b%29.jpg" alt="" /> */}
        <img className="common-border profile-picture" src="https://placecats.com/neo/300/200" alt="" />
        <div className="profile-name">Chetan Mandur</div>
      </div>
      <div className="actions">
        <div className="common-border action-button"> <img src="https://www.svgrepo.com/show/486698/image.svg" alt="" /> Photos</div>
        <div className="common-border action-button"> <img src="https://www.svgrepo.com/show/486906/video-file.svg" alt="" /> Videos</div>
        <div className="common-border action-button"> <img src="https://www.svgrepo.com/show/486674/folder-open.svg" alt="" /> Documents</div>
        <div className="common-border action-button"> <img src="https://www.svgrepo.com/show/435417/settings.svg" alt="" />Settings</div>

      </div>
    </div>
  </div>
  )
}