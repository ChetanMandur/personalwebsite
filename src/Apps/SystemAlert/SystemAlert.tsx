import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import "./SystemAlert.css"
import SystemSounds from "../../SystemSounds"
import { AnimatedText, AnimatedTextBox } from "../../Desktop/AnimatedTextBox/AnimatedTextBox"

/**
 * Typing used to represent the button options available in the alert
 * The information is structured in a dictionary style, and contains:
 * - `key` 
 *   - Represented as a string
 *   - Used to distinguish each button
 *   - Value also used as the buttons text
 * - `value`
 *   - Represented as an arrow function with a void return
 *   - Called when button is pressed
 */
export type SystemAlertOptions = {
    [key:string]: () => (void)
}

/**
 * Typing used to determine properties of the close button  
 * The information contains:
 * -  `display` - A boolean to determine whether or not the button should appear
 * - `text` - An optional string variable for the text on the close button, used if you want the button to have different text
 */
export type SystemAlertCloseButton = {
    display: boolean,
    text?: string
}

/**
 * Typing used to represent all the different props used by the component  
 * The information contains:  
 * - `title` - An optional string variable for the alert's title 
 * - `titleDetails` - An optional string variable for the alert's title detail
 * - `message` - A string for the alert's message, ie the text being displayed
 * - `options` - An object used to hold the different buttons/options used by the alert
 * - `closeButton` - An object used to hold the properties of the close button
 * - `soundEffect` - A variable used to indicate the sound effect used by the alert
 *   - Can either be one of the predefined sounds in 'SystemSounds' or just a URL in string format
 */
export type SystemAlertProps = {
    title?: "Warning" | "Error" | string & {}, 
    titleDetails?: string,
    options: SystemAlertOptions,
    closeButton: SystemAlertCloseButton,
    soundEffect?: typeof SystemSounds|string|null,
    image?: null | {
        content: string & {} | "Warning" | "Error",
        style?: React.CSSProperties & { [key: `--${string}`]: string | number | undefined };

    } 
} & (
    {
        message: string,
        animatedMessage?: never,
        skipAnimationData?: never
    } 
    | 
    {
        message?: never,
        animatedMessage: AnimatedText,
        skipAnimationData: {
            enabled: true,
            sound?:typeof SystemSounds|string
        }
        |
        {
            enabled: false,
            sound?: never
        }
    }
)

/**
 * App used to display alerts
 * 
 * Meant to be used in place of the browser's native `alert()` call
 * 
 * @param props - Takes props listed in `SystemAlertProps`
 * @returns Component
 */
export default function SystemAlert({title,titleDetails, message,animatedMessage ,options, closeButton, image, soundEffect,skipAnimationData, app_running_id}:SystemAlertProps & AppRunningID){
    // options = {...options}

    // Used to check app props and update app properties
    const {runningAppsData,runningAppsDispatch} = useContext(RunningAppsContext)

    // Used to check the calculated size of the app 
    const messageRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)

    // Used to play/restart the sound
    const audioRef = useRef<HTMLAudioElement>(null)

    const [skipAnimation, setSkipAnimation] = useState(false)

    const animationCompletedEvent = useCallback(()=>{
        console.log("animation complete")
        runningAppsDispatch({
            type:"UPDATE-APP-PROPS",
            app_running_id,
            props:{
                skipAnimationData:{
                    enabled:false
                }
            }
        })
        return undefined
    },[app_running_id, runningAppsDispatch])

    const animatedTextAddedEvent = useCallback(()=>{
        const scrollHeight = messageRef.current!.scrollHeight
        const scrollTop = messageRef.current!.scrollTop
        const scrollBottom = (scrollHeight - scrollTop)
        const clientHeight = messageRef.current!.clientHeight

        const bottom = scrollBottom - clientHeight


        if (bottom <= clientHeight*0.3){
            messageRef.current!.scrollTop = messageRef.current!.scrollHeight
        }
        
        return undefined
    },[])

    // Used to resize the app based on the size of its content
    // Run each time the props are changed
    useLayoutEffect(()=>{
        const current_app_properties = runningAppsData[app_running_id]

        // Max width/height of the app
        // Arbitrary but think these values work nice
        const max_width = window.innerWidth * 0.6
        const max_height = window.innerHeight * 0.3


        let width:number = current_app_properties.width
        let height:number = current_app_properties.height 

        // If the message/options are overflowing (ie. has a scrollbar), increase app size
        // Again, the values used to increase is arbitrary but think these values work nice
        if (messageRef.current!.scrollHeight != messageRef.current!.offsetHeight){
            height += messageRef.current!.scrollHeight * (1/4)
            width += messageRef.current!.scrollHeight * (3/4)
        }

        if (optionsRef.current!.scrollHeight != optionsRef.current!.offsetHeight){
            height += optionsRef.current!.scrollHeight * (4/4)
            width += optionsRef.current!.scrollHeight * (4/4)
        }

        // If after resizing the app is over the max width/height, set width/height to the max values
        if (max_height < height){
            height = max_height
        }

        if (max_width < width){
            width = max_width
        }

        // We want the app to be centered in the screen
        // (half width of screen) - (half width of app) = x position 
        // (half height of screen) - (half height of app) = y position 

        const x:number = (window.innerWidth/2) - (width/2)
        const y:number = (window.innerHeight/2) - (height/2)

        // Applies new sizing + position
        runningAppsDispatch({type:"WINDOW-DIRECT-RESIZE", app_running_id,width, height})
        runningAppsDispatch({type:"WINDOW-DIRECT-MOVE", app_running_id, x , y})
        
        
    },[runningAppsData[app_running_id].props])


    // Used to handle any changes to the props that don't require info on the contents size
    useEffect(()=>{
        if (soundEffect !== null){
            // Plays audio (resets time to 0 to ensure audio is played when consecutive alerts are quick in a row)
            audioRef.current!.currentTime = 0
            audioRef.current!.play()
        }

        // Updates app title based on props given
        if (title){
            runningAppsDispatch({type:"UPDATE-APP-TITLE-NAME", app_running_id, appTitleName:title})
        }
        else{
            runningAppsDispatch({type:"UPDATE-APP-TITLE-NAME", app_running_id, appTitleName:undefined})
        }

        // Updates app title details based on props given
        if (titleDetails){
            runningAppsDispatch({type:"UPDATE-APP-TITLE-DETAILS", app_running_id, appTitleDetails: titleDetails})
        }
        else{
            runningAppsDispatch({type:"UPDATE-APP-TITLE-DETAILS", app_running_id, appTitleDetails:undefined})
        }
    },[app_running_id, runningAppsDispatch, soundEffect, title, titleDetails])


    // Adds a 'close' button if props ask for it
    if (closeButton.display){
            // If alternative text is given for the close button, use it, if not, use just 'Close'
            options[(closeButton.text ?? "Close")] = () =>{
                runningAppsDispatch({type:"DELETE", app_running_id})
            }
    }
    
    return (
        <div className="system-alert">
            <audio 
                ref={audioRef}
                hidden={true}
                src={soundEffect !== null ? (soundEffect?.toString() ?? SystemSounds.Win95.Default.Chord) : undefined}
                preload="auto"
                autoPlay
            />
            <div className="content">
                {
                    image !== null && 
                        <div className="alert-image">
                            <img 
                                src={image?.content == "Warning" ? 
                                    ("https://www.svgrepo.com/show/486907/warning.svg") : (
                                        (image?.content == "Error" || image == undefined) ? 
                                        ("https://www.svgrepo.com/show/486662/error.svg") : (image.content)
                                    )
                                }
                                style={image?.style ?? undefined}
                                alt="" 
                            />
                        </div> 
                }
                <div className="message" ref={messageRef}
                    style={((image !== null)) ? {}:{width:"100%", paddingLeft:"0%"}}
                    onClick={()=>{
                        if (animatedMessage != undefined && !skipAnimation && skipAnimationData != undefined && skipAnimationData.enabled){
                            setSkipAnimation(true)
                            if (skipAnimationData.sound != undefined){
                                runningAppsDispatch({type:"UPDATE-APP-PROPS", app_running_id, props:{soundEffect:skipAnimationData.sound}})
                            }
                            
                        }
                    }} 
                >
                    {
                        animatedMessage != undefined ? 
                            <AnimatedTextBox 
                                animatedText={animatedMessage} 
                                skipAnimation={skipAnimation}
                                animationCompletedEvent={animationCompletedEvent}
                                animatedTextAddedEvent={animatedTextAddedEvent}
                            /> 
                            : 
                            message
                    }
                </div>
            </div>
            <div className="options" ref={optionsRef}>
                {
                    Object.entries(options).map((option)=>{
                        return(
                            <div className="option common-border" 
                                key={app_running_id+option[0]}
                                onClick={(event)=>{
                                    setSkipAnimation(false)
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