import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./SystemAlert.css"

export type SystemAlertProps = AppRunningID & {
    message: string
}

export default function SystemAlert({message, app_running_id}:SystemAlertProps){

    return (
    <div className="system-alert">
        <div className="message">
            {message} {app_running_id}
        </div>
    </div>
    )
}