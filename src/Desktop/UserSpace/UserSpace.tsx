import "./UserSpace.css"
import { useContext, useEffect} from "react"
import { RunningAppsContext} from "../Contexts/RunningAppsContext"
import { StartMenuContext } from "../Contexts/StartMenuContext"
import { RunningApp } from "./RunningApp"
import { SystemAlertProps } from "../../Apps/SystemAlert/SystemAlert"
import SystemSounds from "../../SystemSounds"




export default function UserSpace(){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {setStartMenuOpen} = useContext(StartMenuContext)

  useEffect(()=>{
    // 'ADD' from `runningAppsDispatch` (with pre-defined `app_running_id`)
    runningAppsDispatch({
      type:"ADD",
      app_name:"SystemAlert",
      app_running_id:"OnBootAlert",
      props:{
        message:
        `
Welcome to my website!
This website is not feature complete.
Please consider this an early preview of the website.
I hope you enjoy!
        `,
        closeButton:{enabled:true, text:"okie dokie"},
        title:"Welcome!",
        titleDetails:"Hope you enjoy your stay :)",
        image:{
          content:"./happyface.png",
        },
        soundEffect:SystemSounds.Win95.Default.Tada
      } as SystemAlertProps
    })

    return () =>{
      // 'DELETE` from `runningAppsDispatch
      runningAppsDispatch({
        type:"DELETE",
        app_running_id:"OnBootAlert"
      })
    }
  },[runningAppsDispatch])

  return(

    <div className="user-space" 
      id="user-space"
      onPointerDown={()=>{
        setStartMenuOpen(false)
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