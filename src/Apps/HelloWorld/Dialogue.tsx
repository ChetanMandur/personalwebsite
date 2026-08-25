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
                // image:{content:"./placecatneo.jpeg"},
                // image:{content:"https://c.tenor.com/4kpF986JjZkAAAAd/tenor.gif"},
                // image:{content:"Warning"},
                // image:{content:"Error"},
                // image:undefined,
                // image:null,

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
                image:{
                    content:"https://media1.tenor.com/m/nAYI--YdBzIAAAAd/fell.gif",
                    style:{borderRadius:"100%", "--size":"6vh"}
                },
                animatedMessage:[
                    {message:"My world", speed:200 , 
                        preFunction:()=>(console.log("hi")), 
                        intraFunction:{
                            3: ()=>{
                                console.log("whaaa");
                                runningAppsDispatch({type:"UPDATE-APP-PROPS",app_running_id: system_alert_id , props: {soundEffect:SystemSounds.Special.VineBoom}})
                            }
                        },
                        postFunction:()=>{
                            console.log("bruh");
                            runningAppsDispatch({type:"UPDATE-APP-PROPS",app_running_id: system_alert_id , props: {soundEffect:SystemSounds.Special.OhMyGod}})
                        }
                    },
                    {message:" ", speed:1000},
                    {message:"\n", speed:1},
                    {message:"Nah just kidding this is just my website", speed:50,
                        postFunction: ()=>{
                                runningAppsDispatch({
                                    type:"UPDATE-APP-PROPS",app_running_id: system_alert_id , props: {
                                        soundEffect:SystemSounds.Special.Bruh,
                                        closeButton: {display:true,text:"Ok.... well bye"},
                                        options:{
                                            "Cool": ()=>{dialogueMaker(runningAppsDispatch,system_alert_id, 2)}
                                        } 
                                    
                                    }
                                })
                        }

                    },
                ],
                closeButton: {display:false,text:"Ok.... well bye"},
                soundEffect: SystemSounds.Win95.Default.Tada,
                skipSoundEffect: SystemSounds.Special.OOTDialogueNext,
                options:{
                } 
            } 
            break
        
        case 2:
            alert_props = {
                title:"Cool",
                animatedMessage:[
                    {message:"Thanks. \n", speed: 50},
                    {message:" ", speed: 2000},
                    {message:"Hey,", speed: 50},
                    {message:" ", speed: 500},
                    {message:"how's your day going?", speed: 50},
                ],
                closeButton: {display:false},
                soundEffect: SystemSounds.Win95.Default.Dings,
                skipSoundEffect: SystemSounds.Special.OOTDialogueNext,
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
        alert_props = {
            title: undefined,
            titleDetails: undefined,
            animatedMessage:undefined,
            soundEffect:undefined,
            skipSoundEffect:undefined,
            image: undefined,
            ...alert_props
        } 
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