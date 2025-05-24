import "./UserSpace.css"
import { useContext} from "react"
import { RunningAppsContext} from "../Contexts/RunningAppsContext"
import { StartMenuContext } from "../Contexts/StartMenuContext"
import { RunningApp } from "./RunningApp"




export default function UserSpace(){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {setStartMenuOpen} = useContext(StartMenuContext)


  return(

    <div className="user-space" 
      onPointerDown={()=>{
        setStartMenuOpen(false)
      }} 
      onPointerLeave={()=>{
        runningAppsDispatch({type:"RESIZE-UNCLICKED"});
        runningAppsDispatch({type:"TITLEBAR-UNCLICKED"}) 
      }} 
      onPointerUp={()=>{
        runningAppsDispatch({type:"RESIZE-UNCLICKED"});
        runningAppsDispatch({type:"TITLEBAR-UNCLICKED"});
      }} 
      onPointerMove={(event) => {
        runningAppsDispatch({type:"WINDOW-MOVE", event:event})
      }}
    >
        {/* Where each running app is rendered */}
        {
          Object.entries(runningAppsData).map((item)=>{
            const app_running_id = item[0]
            const running_properties = runningAppsData[app_running_id]

            return(
              <div className={app_running_id} key={app_running_id+"appContainer"}>
                <RunningApp app_running_id={app_running_id} running_properties={running_properties}/>
              </div>
            )
          })
        }
    </div>
  )
}