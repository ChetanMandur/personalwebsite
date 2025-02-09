import { useContext } from "react"
import "./StartMenu.css"
import { AppList } from "../../../Apps/Apps"
import { StartMenuContext } from "../../Contexts/StartMenuContext"
import { RunningAppsContext } from "../../Contexts/RunningAppsContext"
import { FileExplorerProps } from "../../../Apps/FileExplorer/FileExplorer"
import { HelloWorldProps } from "../../../Apps/HelloWorld/HelloWorld"

export default function StartMenu(){
  const {setStartMenuOpen} = useContext(StartMenuContext)
  const {runningAppsDispatch} = useContext(RunningAppsContext)


  const AppListArray = Object.entries(AppList)

  return(<div className="start-menu">
    <div className="app-list">
      {AppListArray.map( (item) => { 
        return ( 
        <div className="app-entry" key={item[0]+"startMenuEntry"} onClick={()=>{runningAppsDispatch({type:"ADD", app_name:item[0]});setStartMenuOpen(false)}}> 
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
        <div className="common-border action-button" onClick={()=>{runningAppsDispatch({type:"ADD", app_name:"FileExplorer", props:{path:"Photos"} as FileExplorerProps}); setStartMenuOpen(false)}}> <img src="https://www.svgrepo.com/show/486698/image.svg" alt="" /> Photos</div>
        <div className="common-border action-button" onClick={()=>{runningAppsDispatch({type:"ADD", app_name:"FileExplorer", props:{path:"Videos"} as FileExplorerProps}); setStartMenuOpen(false)}}> <img src="https://www.svgrepo.com/show/486906/video-file.svg" alt="" /> Videos</div>
        <div className="common-border action-button" onClick={()=>{runningAppsDispatch({type:"ADD", app_name:"FileExplorer", props:{path:"Documents"} as FileExplorerProps}); setStartMenuOpen(false)}}> <img src="https://www.svgrepo.com/show/486674/folder-open.svg" alt="" /> Documents</div>
        <div className="common-border action-button" onClick={()=>{runningAppsDispatch({type:"ADD", app_name:"HelloWorld", props:{name:"I dont have settings app yet", ohmylord:"dont yell at me"} as HelloWorldProps}); setStartMenuOpen(false)}}> <img src="https://www.svgrepo.com/show/435417/settings.svg" alt="" />Settings</div>

      </div>
    </div>
  </div>
  )
}