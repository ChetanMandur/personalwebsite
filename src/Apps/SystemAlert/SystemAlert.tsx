import { useContext } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import "./SystemAlert.css"

export type SystemAlertOptions = {
    [key:string]: (app_running_id:string) => (void)
}

export type SystemAlertProps = AppRunningID & {
    message: string
    options: SystemAlertOptions
    closeButton: boolean
}

export default function SystemAlert({message, options, closeButton, app_running_id}:SystemAlertProps){
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    if (closeButton){
        options["Close"] = () =>{
            runningAppsDispatch({type:"DELETE", app_running_id})
        }
    }

    return (
        <div className="system-alert">
            <div className="message">
                {message}
            </div>
            <div className="options">
                {
                    Object.entries(options).map((option)=>{

                        return(
                            <div className="option common-border" 
                                onClick={(event)=>{
                                    event.stopPropagation()
                                    option[1](app_running_id)
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