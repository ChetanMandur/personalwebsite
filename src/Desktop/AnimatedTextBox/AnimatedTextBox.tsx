import "./AnimatedTextBox.css"
import { ForwardedRef, forwardRef, useCallback, useEffect, useRef } from "react"

/** 
 * The format/structure for each segment/part of an {@link AnimatedText}
 *
 * Essentially, an `AnimatedText` is an array of 'sections', with all sections being part of a complete message.
 * This allows for different speeds at different parts of the message 
 */
export type AnimatedTextSegment = {
    /** The full message to be written for the current section */
    message:string, 
    /** The speed at which each character is written, units is in `ms` */
    speed:number,
    /** Function that is run BEFORE the first character is written to the screen (ie. function that runs at the start of the section) */
    preFunction?: () => (void)
    /** Function that is run AT a specific `characterIndex` (eg. when the character is reached, the function runs) */
    intraFunction?: {[index:number]: () => (void)} // Run midway thru animation, at a specfic character index
    /** Function that is run AFTER the final character is written to the screen (ie. function that runs at the end of the section)*/
    postFunction?: () => (void) //Run after animation ends for the line
}

/** 
 * Typing for the prop `animatedText`; Provides the format for which animated texts are defined
 */
export type AnimatedText = AnimatedTextSegment[]

/** Props used by `AnimatedTextBox` */
type AnimatedTextBoxProps = {
    /** The `AnimatedText` used by the current component */
    animatedText: AnimatedText

    /** Boolean for whether to skip the animation  
     * Still runs all the sections `pre-`, `intra-`, and `post-` functions  
     * Also runs the `animationCompletedEvent`  
     * (ie. acts as if animation was fully played out)
    */
    skipAnimation?: boolean,
    
    /** Function to run after the animation has complete  
     * Also runs if `skipAnimation` is true
    */
    animationCompletedEvent?: ()=>undefined,

    /** OPTIONAL: Allows for parent to hook into the element  
     * Only exposes the parent/encapsulation element
     */
    forwardedRef?: ForwardedRef<HTMLDivElement>,
}


/**
 * Typing for data held by a single `AnimatedTextBox` component
 */
type AnimatedTextAnimationData = {
    /** The animation/interval id currently being used */
    animationID: number|null,
    /** The current index of the `AnimatedText` Prop (ie. the current 'part' in the `AnimatedText` being animated) */
    animatedTextIndex: number,
    /** The current character index being 'typed' (ie. the index of the `message` string within the current `AnimatedText` section/array index)*/
    characterIndex: number,
    /** The list (by `animatedTextIndex`) of functions that have ran */
    ranFunctions: {
        /** Boolean for whether the `pre` function has ran yet */
        pre: {[animatedTextIndex:number]: boolean},
        /** List of `characterIndex`s that have ran */
        intra: {[animatedTextIndex:number]: Set<number>},
        /** Boolean for wheter the `post` function has ran yet */
        post: {[animatedTextIndex:number]: boolean} // yes/no post function has ran
    }
}

/**
 * Component for handling text to appear as if it is being typed
 * 
 * Allows for full customization of animated text speed and the injection of functions before, during, and after text appears
 * 
 * @param `AnimatedTextBoxProps`
 * @returns `AnimatedTextBox` component
 */
// Once I update to React 19+, there will be signs (aka goodbye forwardRef arrow-function component)
export const AnimatedTextBox = forwardRef(({animatedText, skipAnimation,animationCompletedEvent, forwardedRef}:AnimatedTextBoxProps)=>{

    /** Data used to determine current animation data */
    const animatedTextAnimationData = useRef<AnimatedTextAnimationData>(
        {
            animationID:null, 
            characterIndex:0, 
            animatedTextIndex:0,
            ranFunctions: {
                pre: {},
                intra: {},
                post: {}
            }
        }
    )

    /** Ref used to target element where text is written to */
    const textBox = useRef<HTMLDivElement>(null)

    /** 
     * Callback function used to auto-scroll/stick the view to the bottom  
     * This is used to make sure that the user sees the text being written when it overflows  
     * The user is able to break out by scrolling up by a fixed amount
     * @param force - Used to bypass check to see if user has passed the 'break' threshold; forces user to the bottom at every text
     */
    const animatedTextAddedEvent = useCallback((force:boolean)=>{
        // Grab `scrollHeight`, `scrollTop`, and `clientHeight` from the text box
        const scrollHeight = textBox.current!.scrollHeight
        const scrollTop = textBox.current!.scrollTop
        const clientHeight = textBox.current!.clientHeight

        // If `scrollTop` is 'distance from the top of element's viewport to the top of the element', we want to find the inverse
            // ie. we want to find 'the distance from the top of the element's viewport to the bottom of the element' 
        const scrollTopInverse = (scrollHeight - scrollTop)

        // With the inverse, we can find the remaining distance before the viewport is at the bottom of the element
            // ie. we want to find 'the distance from the bototm of the element's viewport to the bottom of the element'
        const scrollBottom = scrollTopInverse - clientHeight

        // If the user is within 22% of the bottom OR the scroll is forced
        if (scrollBottom <= clientHeight*0.22 || force){
            // Move the viewport to the bottom
            textBox.current!.scrollTop = textBox.current!.scrollHeight
            // textBox.current!.scrollTop = textBox.current!.scrollHeight - textBox.current!.clientHeight
        }
        
        // return undefined
    },[])
    
    /**
     * Handles animation skipping 
     * 
     * Has two main functions:
     *  - Stiching the whole message together
     *  - Running any remaining functions
     */
    useEffect(()=>{
        if (skipAnimation){
            // Clears the current interval 
            clearInterval(animatedTextAnimationData.current.animationID!)

            // Where the full message will be stored
            let fullMessage:string = ""

            // Grab the list of all functions that have already ran
            const ranFunctions = animatedTextAnimationData!.current.ranFunctions

            // Parse through all the sections in the animated text
            for (const [animatedTextIndex,partMessage] of animatedText.entries()){

                // If a pre-function exists, and it hasnt been run
                if (partMessage.preFunction != undefined && !ranFunctions.pre[animatedTextIndex]){
                    partMessage.preFunction()
                }
                
                // If an intra-function exists
                if (partMessage.intraFunction != undefined){

                    // Parse through all the intra-functions
                    for (const [characterIndex,partFunction] of Object.entries(partMessage.intraFunction)){
                        
                        // If the character index for the associated intra-function has not been run yet
                        if (!(ranFunctions.intra[animatedTextIndex].has(Number.parseInt(characterIndex)))){
                            partFunction()
                        }
                    }
                }

                // If a post-function exists, and it hasnt been run yet
                if (partMessage.postFunction != undefined && !ranFunctions.post[animatedTextIndex]){
                    partMessage.postFunction()
                }

                // Append the sections message to the full message string
                fullMessage += partMessage.message
            }
            
            // Once all parts have been stitched together, apply it to the element
            textBox.current!.textContent = fullMessage

            // Trigger the `animatedTextAddedEvent`
            if (animatedTextAddedEvent){
                animatedTextAddedEvent(true)
            }
        }
    },[animatedText, animatedTextAddedEvent, skipAnimation])


    /**
     * Handles the typing animation
     * 
     * Has 3 functions:
     *  - Initalizing the `ranFunctions` object in `animatedTextAnimationData`
     *  - Starting the animation
     *  - Gracefully ending the animation and clearing `animatedTextAnimationData`
     */
    useEffect(()=>{
        // Grabbing `ranFunctions` from `animatedTextAnimationData`
        const ranFunctions = animatedTextAnimationData.current.ranFunctions

        // Initalize the stucture of `ranFunctions`
            // Each section of `animatedText` requires it's own `ranFunctions` value
                // ie. Iterate through sections in `animatedText` and define default values
        for (let i=0; i< animatedText.length; i++){
            ranFunctions.pre[i] = false
            ranFunctions.intra[i] = new Set<number>()
            ranFunctions.post[i] = false
        }
        
        // Apply newly initalized structure to `ranFunctions`
        animatedTextAnimationData.current.ranFunctions = ranFunctions

        /**
         * Function to handle `writing` animation effect
         * 
         * Is to be used in conjuntion with `setInterval()` (or `setTimeout()` if you so please)
         */
        function messageWritingEffect(){
            // Grab the current animation data
            let {animationID, characterIndex, animatedTextIndex} = animatedTextAnimationData.current!
            const {ranFunctions} = animatedTextAnimationData.current!

            // Check if the current `characterIndex` is not past the EOL for the current section
            if (characterIndex < animatedText![animatedTextIndex].message.length){
                
                // Checks if the current `characterIndex` is at the starting/beginning of line (BOL) for the current section
                    // Also checks if a `preFunction` for the current section even exists
                if (characterIndex == 0 && animatedText[animatedTextIndex].preFunction != undefined){
                    // Runs and marks `preFunction`
                    animatedText[animatedTextIndex].preFunction!()
                    ranFunctions.pre[animatedTextIndex] = true
                }

                // Checks if the current `characterIndex` has an associated `intraFunction` in the current section
                    // Also checks if a `intraFunction` object for the current section even exists (as if it does, this means SOME `intra-function` exists)
                if (animatedText[animatedTextIndex].intraFunction != undefined && animatedText[animatedTextIndex].intraFunction![characterIndex] != undefined){
                    animatedText[animatedTextIndex].intraFunction![characterIndex]()
                    ranFunctions.intra[animatedTextIndex].add(characterIndex)
                }

                // Checks if the current `characterIndex` is at the EOL for the current section
                    // Also checks if a `postFunction` for the current section even exists
                if (characterIndex == animatedText[animatedTextIndex].message.length -1 && animatedText[animatedTextIndex].postFunction != undefined ){
                    animatedText[animatedTextIndex].postFunction!()
                    ranFunctions.post[animatedTextIndex] = true
                }

                // Append the character residing at the current `characterIndex`
                textBox.current!.textContent += animatedText![animatedTextIndex].message.charAt(characterIndex)

                // Increase the `characterIndex` value, going to the next 
                characterIndex += 1

                // Fire the `animatedTextAddedEvent`
                if (animatedTextAddedEvent){
                    animatedTextAddedEvent(false)
                }
            }

            // Else-statement for when the current `characterIndex` is past EOL
                // Due to this structure, this means that the final character waits `speed` amount of time before moving past the section
                    // For example, if section `0` has a speed of `50` and a message of "Hi", and section 1 has a speed of `100` and a message of "Bye":
                        //  Section 0 will write `"i"` to the screen, wait 50ms, moves to section 1, waits 100ms, and then writes `"B"`
            else{
                // Clear the interval, as it pertains to the current section
                clearInterval(animationID!)

                // Checks if the current section index (`animatedTextIndex`) is not the final one for the `AnimatedMessage`
                    // Goal is to set `aniamtedTextData` so that it is ready for the next section
                if (animatedTextIndex < animatedText!.length-1){
                    // Reset `characterIndex` since we are about to start a new line
                    characterIndex = 0
                    // Increment line number
                    animatedTextIndex+=1
                    // Begin interval for the next section
                    animationID = setInterval(messageWritingEffect, animatedText![animatedTextIndex].speed)
                }

                // Else-statement for when the current `characterIndex` is the final one for the `AnimatedMessage`
                else{
                    // If `animatedCompletedEvent` exists, run it
                        // This is a lay-over from when the function was a prop
                            // I'm keeping it because soon you will see it be a prop again, and the current implementation of being just a scroll handler be its own seperate function
                    if (animationCompletedEvent){
                        animationCompletedEvent()
                    }
                }
            }
            
            // Apply the new/updated values for `animatedtextAnimationData`
            animatedTextAnimationData.current! = {animationID, characterIndex, animatedTextIndex, ranFunctions}

        }

        // Clears the current text before begining the animation from the start
            // Don't think this is really needed, but doesn't hurt clean up the text box
        textBox.current!.textContent = null
        animatedTextAnimationData.current.animationID = setInterval(messageWritingEffect, animatedText[0].speed)

        // Cleanup when the component unmounts
        return () =>{
            // Remove the interval that does the animation per section
            clearInterval(animatedTextAnimationData.current.animationID!)

            // Reset `animatedTextAnimation` 
                // Think this helps the garbage collector
            animatedTextAnimationData.current = {
                animationID: null,
                characterIndex: 0,
                animatedTextIndex: 0,
                ranFunctions: {
                    pre: {},
                    intra: {},
                    post: {}
                }
            }
        }
    },[animatedText, animatedTextAddedEvent, animationCompletedEvent])

    
    return (
        <div className="animated-text-box" ref={forwardedRef}>
            <div className="animated-text" ref={textBox}/>
        </div>
    )
})