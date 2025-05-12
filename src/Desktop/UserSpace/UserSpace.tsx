import "./UserSpace.css"
import { useContext, useRef } from "react"
import { RunningAppsContext} from "../Contexts/RunningAppsContext"
import { StartMenuContext } from "../Contexts/StartMenuContext"
import { RunningApp } from "./RunningApp"




export default function UserSpace(){
  const {runningAppsData,runningAppsDispatch}= useContext(RunningAppsContext)
  const {setStartMenuOpen} = useContext(StartMenuContext)
  const outline_ref = useRef<(HTMLDivElement|null)[]>([]);


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
            Object.entries(runningAppsData).map((item, index)=>{
              const app_running_id = item[0]
              const running_properties = runningAppsData[app_running_id]

              if (running_properties["maximizeType"] != null && running_properties["titlebarClicked"]){
                switch (running_properties["maximizeType"]) {
                  case "FULL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "calc(100% - var(--app-border-size)*1.7)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"0",
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "TL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "0", 
                      left:"0", 

                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "LEFT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                    break;
                  case "BL":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "calc(var(--user-space-height)/2)", 
                      left:"0", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "TR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "RIGHT":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-full)", 
                      top: "0", 
                      left:"50%", 
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                  case "BR":
                    outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                      width: "var(--app-maximized-width-half)", 
                      height: "var(--app-maximized-height-quarter)", 
                      left:"50%",
                      top: "calc((var(--user-space-height)/2)",
                      borderColor:"var(--snap-colour)",
                      backgroundColor:"var(--snap-opacity)"
                    }],{fill:"forwards", duration:100, iterations:1})
                      break;
                }
              } else{
                if (running_properties["maximizeType"] == null){
                  outline_ref.current[index]?.animate([{zIndex: running_properties.zIndex+1,
                    width: running_properties.width+"px",
                     height: running_properties.height+"px", 
                     top: running_properties.y + "px",
                     left: running_properties.x +"px",
                     borderColor:"transparent",
                     backgroundColor:"transparent",
                    }],{fill:"forwards", duration:500, iterations:1})
                } else{
                  outline_ref.current[index]?.animate([{
                     borderColor:"transparent",
                     backgroundColor:"transparent",
                    }],{fill:"forwards", duration:500, iterations:1})
                }
              }
              

              return(
                <div className={app_running_id} key={app_running_id+"appContainer"}>
                  <RunningApp app_running_id={app_running_id} running_properties={running_properties}/>
                  <div className={"outline " + running_properties["maximizeType"]} ref={ref => outline_ref.current[index] = ref}></div>
                </div>
              )
            })
          }
    </div>
  )
}