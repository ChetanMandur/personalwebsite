import { useContext, useLayoutEffect, useRef} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import "./SystemAlert.css"

export type SystemAlertOptions = {
    [key:string]: () => (void)
}

export type SystemAlertCloseButton = {
    display: boolean,
    text?: string
}

export type SystemAlertProps = AppRunningID & {
    message: string,
    options: SystemAlertOptions,
    closeButton: SystemAlertCloseButton,
    soundEffect?: string
}

export default function SystemAlert({message, options, closeButton,soundEffect, app_running_id}:SystemAlertProps){
    options = {...options}
    
    const {runningAppsData,runningAppsDispatch} = useContext(RunningAppsContext)
    const messageRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(()=>{
        
        const current_app_properties = runningAppsData[app_running_id]

        const max_width = window.innerWidth * 0.6
        const max_height = window.innerHeight * 0.3


        let width:number = current_app_properties.width
        let height:number = current_app_properties.height 

        if (messageRef.current!.scrollHeight != messageRef.current!.offsetHeight){
            height += messageRef.current!.scrollHeight * (1/4)
            width += messageRef.current!.scrollHeight * (3/4)
        }

        if (optionsRef.current!.scrollHeight != optionsRef.current!.offsetHeight){
            height += optionsRef.current!.scrollHeight * (4/4)
            width += optionsRef.current!.scrollHeight * (4/4)
        }

        if (max_height < height){
            height = max_height
        }

        if (max_width < width){
            width = max_width
        }

        const x:number = (window.innerWidth/2) - (width/2)
        const y:number = (window.innerHeight/2) - (height/2)

        runningAppsDispatch({type:"WINDOW-DIRECT-RESIZE", app_running_id,width, height})
        runningAppsDispatch({type:"WINDOW-DIRECT-MOVE", app_running_id, x , y})


    },[])

    if (closeButton.display){
            options[(closeButton.text ?? "Close")] = () =>{
                runningAppsDispatch({type:"DELETE", app_running_id})
            }
    }
    

    return (
        <div className="system-alert">
            <audio 
                hidden={true} 
                src={soundEffect ?? "./win95errorClipped.mp3"}
                preload="auto"
                autoPlay
            />
            <div className="message" ref={messageRef}>
                {message}
            </div>
            <div className="options" ref={optionsRef}>
                {
                    Object.entries(options).map((option)=>{
                        return(
                            <div className="option common-border" 
                                key={app_running_id+option[0]}
                                onClick={(event)=>{
                                    event.stopPropagation()
                                    option[1]()
                                }}
                            >
                                {option[0]}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}