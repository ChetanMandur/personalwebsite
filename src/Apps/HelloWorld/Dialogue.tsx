import { RunningAppsReducerAction } from "../../Desktop/Contexts/RunningAppsContext";
import SystemSounds from "../../SystemSounds";
import DialogueMaker from "../SystemAlert/DialogueMaker";
/**
 * Generates the `DialogueMaker` for the `HelloWorld` app
 * @param dialogID 
 * @param runningAppsDispatch 
 * @returns 
 */
export function HelloWorldDialogueInitalizer(dialogueID:string, runningAppsDispatch: (value: RunningAppsReducerAction) => void){
    const dialogue = new DialogueMaker(
        {
            dialogueID: dialogueID,
            runningAppsDispatch: runningAppsDispatch,
            dialoguePaths:{
                0:{
                    message:"Some elements take longer for a tooltip to appear \nHover around and be patient my child",
                    closeButton: {enabled:true, text:"Okie Dokie"},
                    soundEffect: SystemSounds.Win95.Default.Chimes,
                    // image:{content:"./placecatneo.jpeg"},
                    // image:{content:"https://c.tenor.com/4kpF986JjZkAAAAd/tenor.gif"},
                    // image:{content:"Warning"},
                    // image:{content:"Error"},
                    // image:undefined,
                    // image:null,

                    options: {
                        "Where am I?": ()=>{
                            dialogue.goTo(1)
                        }
                    } 
                },
                1:{
                    title:"Where am I?",
                    image:{
                        content:"https://media1.tenor.com/m/nAYI--YdBzIAAAAd/fell.gif",
                        style:{borderRadius:"100%", "--size":"6vh"}
                    },
                    animatedMessage:{
                        message: [
                            {message:"My world", speed:200 , 
                                preFunction:()=>(console.log("hi")), 
                                intraFunction:{
                                    3: ()=>{
                                        console.log("whaaa");
                                        dialogue.update({soundEffect:SystemSounds.Special.VineBoom})
                                    }
                                },
                                postFunction:()=>{
                                    console.log("bruh");
                                    dialogue.update({soundEffect: SystemSounds.Special.OhMyGod})
                                }
                            },
                            {message:"\n", speed:500},
                            {message:"Nah just kidding this is just my website", speed:50,
                                postFunction: ()=>{
                                        dialogue.update({
                                            soundEffect: SystemSounds.Special.Bruh,
                                            closeButton: {enabled:true,text:"Ok.... well bye"},
                                            options:{
                                                "Cool": ()=>{dialogue.goTo(2)}
                                            } 
                                        })
                                }

                            },
                        ],
                        skip:{
                            enabled: true
                        }
                    },
                    closeButton: {enabled:false,text:"Ok.... well bye"},
                    soundEffect: SystemSounds.Win95.Default.Tada,
                    options:{} 
                },
                2:{
                    title:"Cool",
                    animatedMessage:{
                        message: [
                            {message:"Thanks.", speed: 50},
                            {message:"\n", speed: 1000},
                            {message:"Hey, ", speed: 50},
                            {message:"", speed: 500},
                            {message:"how's your day going?", speed: 50},
                        ],
                        skip:{
                            enabled: true,
                            sound:SystemSounds.Special.OOTDialogueNext
                        }
                    },
                    closeButton: {enabled:false},
                    soundEffect: SystemSounds.Win95.Default.Dings,
                    options:{
                        "Going pretty well, thanks for asking man": ()=>{dialogue.goTo("3a")},
                        "It's going alright":()=>{dialogue.goTo("3b")},
                        "Not good at all":()=>{dialogue.goTo("3c")}
                    } 
                },
                "3a":{
                    title:"= )",
                    message: "No problem, glad it's going well \n Welp I gotta go, don't wanna make more dialogue boxes",
                    closeButton:{enabled: true, text:"Oh ok, well goodbye"},
                    soundEffect: SystemSounds.Special.OhMyGod,
                    options:{}
                },
                "3b":{
                    title:"= |",
                    message:"Sounds good, hope you're enjoying yourself\n I would stick around but I don't wanna make this go on forever\n Click around and enjoy yourself",
                    closeButton:{enabled:true, text:"Ok, goodbye"},
                    soundEffect: SystemSounds.Special.Bruh,
                    options:{}
                },
                "3c":{
                    title:"= (",
                    message:"Welp, we all have those days. I'm no therapist, I can't help you\n Plus I don't wanna keep making these dialogue boxes\n So, goodbye for now",
                    closeButton:{enabled:true, text:"Wow, ok, bye."},
                    soundEffect: SystemSounds.Win95.Default.Chord,
                    options:{}
                }
            }
        }
    )

    return dialogue
}