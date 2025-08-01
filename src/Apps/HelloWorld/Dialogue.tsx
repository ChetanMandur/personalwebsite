import { RunningAppsReducerAction } from "../../Desktop/Contexts/RunningAppsContext";
import { SystemAlertOptions, SystemAlertProps } from "../SystemAlert/SystemAlert";

export function dialogueMaker(
    runningAppsDispatch: (value: RunningAppsReducerAction) => void,
    system_alert_id:string,
    dialogOption:string|number,
){
    switch (dialogOption) {
        case 0:
            runningAppsDispatch({type:"ADD", app_name:"SystemAlert", app_running_id: system_alert_id,
                props: {
                    message:"Some elements take longer for a tooltip to appear \nHover around and be patient my child", 
                    closeButton: {display:true, text:"Okie Dokie"},
                    soundEffect: "./iknow.mp4",
                    options: {
                        "Where am I?": ()=>{
                        dialogueMaker(runningAppsDispatch, system_alert_id, 1)
                        }
                    } as SystemAlertOptions
                } as SystemAlertProps
            })
            break;
        case 1:
            runningAppsDispatch({
                type: "UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props: {
                  message: "My world",
                  closeButton: {text:"Ok.... well bye"},
                  options:{
                    "Cool": ()=>{dialogueMaker(runningAppsDispatch,system_alert_id, 2)}
                  } as SystemAlertOptions
                } as SystemAlertProps
            })
            break
        
        case 2:
            runningAppsDispatch({
                type:"UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props:{
                    message:"Thanks.\n Hey, how's your day going?",
                    options:{
                        "Going pretty well, thanks for asking man": ()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3a")},
                        "It's going alright":()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3b")},
                        "Not good at all":()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3c")}
                    } as SystemAlertOptions
                } as SystemAlertProps
            })
            break
        
        case "3a":
            runningAppsDispatch({
                type:"UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props: {
                    message: "No problem, glad it's going well \n Welp I gotta go, don't wanna make more dialogue boxes",
                    closeButton:{display: true, text:"Oh ok, well goodbye"},
                    options:{}
                } as SystemAlertProps
            })
            break

        case "3b":
            runningAppsDispatch({
                type:"UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props:{
                    message:"Sounds good, hope you're enjoying yourself\n I would stick around but I don't wanna make this go on forever\n Click around and enjoy yourself",
                    closeButton:{display:true, text:"Ok, goodbye"},
                    options:{}
                } as SystemAlertProps
            })
            break;

        case "3c":
            runningAppsDispatch({
                type:"UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props:{
                    message:"Welp, we all have those days. I'm no therapist, I can't help you\n Plus I don't wanna keep making these dialogue boxes\n So, goodbye for now",
                    closeButton:{display:true, text:"Wow, ok, bye."},
                    options:{}
                } as SystemAlertProps
            })
            break;
    
        default:
            break
    }
}