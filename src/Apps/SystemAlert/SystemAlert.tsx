import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import "./SystemAlert.css"
import SystemSounds from "../../SystemSounds"
import { AnimatedText, AnimatedTextBox } from "../../Desktop/AnimatedTextBox/AnimatedTextBox"

/**
 * Typing used to represent the button options available in the alert
 * The information is structured in a dictionary style, and contains:
 * - `key` 
 *   - Value also used as the buttons text
 *   - Represented as a string
 *   - Used to distinguish each button
 * - `value`
 *   - Called when button is pressed
 *   - Represented as an arrow function with a void return
 */
export type SystemAlertOptions = {
    [key:string]: () => (void)
}

/**
 * Typing used to determine properties of the close button 
 */
export type SystemAlertCloseButton = {
    /** Determines whether or not the button should appear */
    enabled: boolean,
    /** Used to replace the text (ie. instead of 'Close', have it say something else) */
    text?: string
}

/**
 * Typing used to represent all the different props used by the `SystemAlert` component  
 */
export type SystemAlertProps = {
    /** 
     * An optional string variable to define the alerts running app title  
     * Can be any `string` value, but the other pre-defined options are `"Warning"` and `"Error"`  
     * By default, the title is `"System Alert"`
    */
    title?: "Warning" | "Error" | string & {},
    
    /** An optional string value to define the alerts running app title details 
     * By default, there are no title details
    */
    titleDetails?: string,

    /** 
     * Provides the additional options/buttons (besides the built-in 'Close' button)  
     * If you want no aditional options, just pass an empty object
    */
    options: SystemAlertOptions,

    /** 
     * Used to define whether or not the 'Close' button should be displayed  
     * Also allows for the definiton of another text to use rather than 'Close'
    */
    closeButton: SystemAlertCloseButton,

    /**
     * An optional parameter to define the sound effect played at the begining of the alert  
     * If the sound is given as a `string` it must be in a correct `URL` or `file path` format (both needing to point to a direct sound file link)  
     * The sound can also be chosen using the `SystemSounds` built-in object (as it is just a 'prettier' way to access the file path to each of the sounds)  
     * For no sound to be played, the value must be `null`
     * If the value is `undefined` (ie. not specified), the sound will default to `SystemSounds.Win95.Default.Chord`
    */
    soundEffect?: typeof SystemSounds|string|null,

    /**
     * An optional parameter used to define the image shown alongside the message  
     * If the parameter is `null`, no image will be displayed and the message will take the entire width  
     * If the parameter is `undefined`, the image will be displayed as the default `Error` image  
     * If a image is desired to be given, it must be given in proper object format of `{content, style?}`
    */
    image?: null | {
        /** 
         * If a `string` it must be in a correct `URL` or `file path` format (both needing to point to a direct image file link)  
         * Two built-in options, of 'Warning' and 'Error', are given
        */
        content: string & {} | "Warning" | "Error",

        /**
         * An optional parameter to independently style the `<img>` element that houses the image  
         * Takes any `React.CSSProperties` and also allows for the ability for `'CSS Custom Properties'` (aka CSS Variables) to be: created, edited, and deleted/null-ified
        */
        style?: React.CSSProperties & { [key: `--${string}`]: string | number | undefined };

    } 
} 
& 
(
    // For non-animated messages //
    {
        /** The message that will appear in the alert */
        message: string,
        
        /** Data for the animated message that will appear in the alert */
        animatedMessage?: never,

    } 
    | 
    // For animated messages //
    {
        // This variable will never be passed alongside an animated message
        message?: never,

        /** Data for the animated message that will appear in the alert */
        animatedMessage:{
            /**The animated message that will appear in the alert*/
            message: AnimatedText,

            /**
             * Whether or not the animated message should be skippable  
             * When enabled, an optional parameter becomes avaiable that defines the sound played when te animation is skiped
            */
            skipping: (
                {
                    enabled: true,

                    /**
                     * Sound effect to be played when the animation is skipped  
                     * Can be given as a `string` (in the format of a `URL` or a `file path`) or as a value from `SystemSounds`
                    */
                    sound?:typeof SystemSounds|string
                }
                |
                {
                    enabled: false,
                    sound?: never
                }
            )
        }
    }
)

/**
 * App used to display alerts  
 * Meant to be used in place of the browser's native `alert()` call
 * 
 * @param props - Takes props listed in `SystemAlertProps`
 * @returns Component
 */
export default function SystemAlert({title,titleDetails, message,animatedMessage ,options, closeButton, image, soundEffect, app_running_id}:SystemAlertProps & AppRunningID){
    // options = {...options}

    // Used to check app props and update app properties
    const {runningAppsData,runningAppsDispatch} = useContext(RunningAppsContext)

    // Used to check the calculated size of the app 
    const messageRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)

    // Used to play/restart the sound
    const audioRef = useRef<HTMLAudioElement>(null)

    // State to handle if animation has been skipped
    const [skipAnimation, setSkipAnimation] = useState(false)
    const [animationCompleted, setAnimationCompleted] = useState(false)


    // Event handler used when animation is finished
        // Once the animation is finished, mark the animation state as completed
    const animationCompletedEvent = useCallback(()=>{
        setAnimationCompleted(true)
    },[])


    // Used to resize the app based on the size of its content
    // Run each time the props are changed
    // (This is such a mess)
    useLayoutEffect(()=>{
        const current_app_properties = runningAppsData[app_running_id]

        // Max width/height of the app
        // Arbitrary but think these values work nice
        const max_width = window.innerWidth * 0.6
        const max_height = window.innerHeight * 0.3

        // Grab the width and height from the current running app properties
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
        // If a soundEffect exists
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
    if (closeButton.enabled){
            // If alternative text is given for the close button, use it, if not, use just 'Close'
            options[(closeButton.text ?? "Close")] = () =>{
                runningAppsDispatch({type:"DELETE", app_running_id})
            }
    }
    
    return (
        // Main container for the `SystemAlert` component
        <div className="system-alert">
            {/* <audio> tag used for all sound effects */}
            <audio 
                ref={audioRef}
                hidden={true}
                // If `soundEffect` is null, no sound
                // If `soundEffect` is undefined, use default sound
                // If `soundEffect` exists, use that
                src={soundEffect !== null ? (soundEffect?.toString() ?? SystemSounds.Win95.Default.Chord) : undefined}
                preload="auto"
                autoPlay
            />
            
            {/* Container where the image and message reside */}
            <div className="content">
                {/* Image */}
                {
                    // Render the image if it IS NOT null
                    image !== null && 
                        <div className="alert-image">
                            <img 
                                src={
                                    // If the image is the built-in "Warning"
                                    image?.content == "Warning" ? 
                                        ("https://www.svgrepo.com/show/486907/warning.svg") 
                                        : 
                                        (
                                            // If the image is the built-in "Error" or undefined
                                            (image?.content == "Error" || image == undefined) ? 
                                                ("https://www.svgrepo.com/show/486662/error.svg")
                                                :
                                                // If the image is neither the built-in options or undefined, it must be unique. Use it.
                                                (image.content)
                                        )
                                }
                                style={image?.style ?? undefined}
                                alt="" 
                            />
                        </div> 
                }

                {/* Message */}
                <div className="message-container" 
                    style={
                        // If the image is null, give the message the full width
                        (image !== null) ? 
                            {}
                            :
                            {width:"100%", paddingLeft:"0%"}
                    }
                    onClick={()=>{
                        // Skips animation if:
                            // an animated message exists, 
                            // animation skipping is enabled,
                            // if the animation already hasn't been skipped, 
                            // if the animation isn't already completed
                        if (animatedMessage != undefined && animatedMessage.skipping.enabled && !skipAnimation && !animationCompleted ){
                            setSkipAnimation(true)

                            // If there exists skip animation sound, play it
                            if (animatedMessage.skipping.sound != undefined){
                                runningAppsDispatch({type:"UPDATE-APP-PROPS", app_running_id, props:{soundEffect:animatedMessage.skipping.sound}})
                            }
                        }
                    }} 
                >
                    {   
                        // Determines whether to render an animated message or a stagnant message
                        animatedMessage != undefined ? 
                            <AnimatedTextBox 
                                animatedText={animatedMessage.message} 
                                skipAnimation={skipAnimation}
                                animationCompletedEvent={animationCompletedEvent}
                                // animatedTextAddedEvent={(animatedTextIndex, characterIndex)=>{
                                //     console.log("joe mama!", animatedTextIndex, characterIndex)
                                // }}
                                forwardedRef={messageRef}
                            /> 
                            : 
                            <div className="message" ref={messageRef}>
                                {message}
                            </div>
                    }
                </div>
            </div>
            {/* Container where the option buttons reside */}
            <div className="options" ref={optionsRef}>
                {
                    // For each option, make a button & apply the corrent onClick event handlers
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