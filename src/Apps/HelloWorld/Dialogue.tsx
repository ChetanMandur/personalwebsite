import { RunningAppsReducerAction } from "../../Desktop/Contexts/RunningAppsContext";
import SystemSounds from "../../SystemSounds";

import { SystemAlertProps } from "../SystemAlert/SystemAlert";

export function dialogueMaker(
    runningAppsDispatch: (value: RunningAppsReducerAction) => void,
    system_alert_id:string,
    dialogOption:string|number,
){
    let alert_props: SystemAlertProps |undefined;

    switch (dialogOption) {
        case 0:
            alert_props = {
                message:"Some elements take longer for a tooltip to appear \nHover around and be patient my child", 
                closeButton: {display:true, text:"Okie Dokie"},
                soundEffect: SystemSounds.Win95.Default.Chimes,
                options: {
                    "Where am I?": ()=>{
                    dialogueMaker(runningAppsDispatch, system_alert_id, 1)
                    }
                } 
            } 
            break;
        case 1:
            alert_props = {
                title:"Where am I?",
                message: "My world",
                closeButton: {display:true,text:"Ok.... well bye"},
                soundEffect: SystemSounds.Win95.Default.Tada,
                options:{
                "Cool": ()=>{dialogueMaker(runningAppsDispatch,system_alert_id, 2)}
                } 
            } 
            break
        
        case 2:
            alert_props = {
                title:"Cool",
                message:"Thanks.\n Hey, how's your day going?",
                closeButton: {display:false},
                soundEffect: SystemSounds.Win95.Default.Dings,
                options:{
                    "Going pretty well, thanks for asking man": ()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3a")},
                    "It's going alright":()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3b")},
                    "Not good at all":()=>{dialogueMaker(runningAppsDispatch,system_alert_id, "3c")}
                } 
            } 
            break
        
        case "3a":
            alert_props = {
                title:"= )",
                message: "No problem, glad it's going well \n Welp I gotta go, don't wanna make more dialogue boxes",
                closeButton:{display: true, text:"Oh ok, well goodbye"},
                soundEffect: SystemSounds.Special.OhMyGod,
                options:{}
            } 
            break

        case "3b":
            alert_props = {
                title:"= |",
                message:"Sounds good, hope you're enjoying yourself\n I would stick around but I don't wanna make this go on forever\n Click around and enjoy yourself",
                closeButton:{display:true, text:"Ok, goodbye"},
                soundEffect: SystemSounds.Special.Bruh,

                options:{}
            } 
            break;

        case "3c":
            alert_props = {
                title:"= (",
                message:"Welp, we all have those days. I'm no therapist, I can't help you\n Plus I don't wanna keep making these dialogue boxes\n So, goodbye for now",
                closeButton:{display:true, text:"Wow, ok, bye."},
                soundEffect: SystemSounds.Win95.Default.Chord,
                options:{}
            } 
            break;
    
        default:
            break
    }

    if (alert_props){
        if (dialogOption == 0){
            runningAppsDispatch({
                type: "ADD",
                app_name:"SystemAlert",
                app_running_id: system_alert_id,
                props: alert_props
            })
        }
        else{
            runningAppsDispatch({
                type:"UPDATE-APP-PROPS",
                app_running_id: system_alert_id,
                props: alert_props
            })
        }
    }
}