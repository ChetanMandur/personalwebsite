import "./AnimatedTextBox.css"
import { useEffect, useRef } from "react"


type AnimatedTextAnimationData = {
    animationID: number|null,
    characterIndex: number,
    animatedTextIndex: number,
    ranFunctions: { // Functions that ran in current animatedTextIndex/AnimatedText-part
        pre: {[animatedTextIndex:number]: boolean}, // yes/no pre function has ran
        intra: {[animatedTextIndex:number]: Set<number>}, // last known characterIndex which ran a function
        post: {[animatedTextIndex:number]: boolean} // yes/no post function has ran
    }
}

export type AnimatedText = {
        message:string, 
        speed:number,
        preFunction?: () => (void) //Run before animation starts for the line
        intraFunction?: {[index:number]: () => (void)} // Run midway thru animation, at a specfic character index
        postFunction?: () => (void) //Run after animation ends for the line
}[]

type AnimatedTextBoxProps = {
    animatedText: AnimatedText
    skipAnimation?: boolean,
    animationCompletedEvent?: ()=>undefined
}

export function AnimatedTextBox ({animatedText, skipAnimation,animationCompletedEvent}:AnimatedTextBoxProps){

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
    const textBox = useRef<HTMLDivElement>(null)
    
    useEffect(()=>{
        if (skipAnimation){
            clearInterval(animatedTextAnimationData.current.animationID!)
            let fullMessage:string = ""

            const ranFunctions = animatedTextAnimationData!.current.ranFunctions

            for (const [animatedTextIndex,partMessage] of animatedText.entries()){
                if (partMessage.preFunction != undefined && !ranFunctions.pre[animatedTextIndex]){
                    partMessage.preFunction()
                }
                if (partMessage.intraFunction != undefined){
                    for (const [characterIndex,partFunction] of Object.entries(partMessage.intraFunction)){
                        if (!(ranFunctions.intra[animatedTextIndex].has(Number.parseInt(characterIndex)))){
                            partFunction()
                        }
                    }
                }
                if (partMessage.postFunction != undefined && !ranFunctions.post[animatedTextIndex]){
                    partMessage.postFunction()
                }
                fullMessage += partMessage.message
            }
            textBox.current!.textContent = fullMessage
        }
    },[animatedText,skipAnimation])

    useEffect(()=>{
        // Filling in `ranFunctions`
        const ranFunctions = animatedTextAnimationData.current.ranFunctions
        for (let i=0; i< animatedText.length; i++){
            ranFunctions.pre[i] = false
            ranFunctions.intra[i] = new Set<number>()
            ranFunctions.post[i] = false
        }
        animatedTextAnimationData.current.ranFunctions = ranFunctions

        function messageWritingEffect(){
            let {animationID, characterIndex, animatedTextIndex} = animatedTextAnimationData.current!
            const {ranFunctions} = animatedTextAnimationData.current!

            if (characterIndex < animatedText![animatedTextIndex].message.length){
                
                // // At line start
                if (characterIndex == 0 && animatedText[animatedTextIndex].preFunction != undefined){
                    animatedText[animatedTextIndex].preFunction!()
                    ranFunctions.pre[animatedTextIndex] = true
                }

                // During animation
                if (animatedText[animatedTextIndex].intraFunction != undefined && animatedText[animatedTextIndex].intraFunction![characterIndex] != undefined){
                    animatedText[animatedTextIndex].intraFunction![characterIndex]()
                    ranFunctions.intra[animatedTextIndex].add(characterIndex)
                }

                // At line end
                if (characterIndex == animatedText[animatedTextIndex].message.length -1 && animatedText[animatedTextIndex].postFunction != undefined ){
                    animatedText[animatedTextIndex].postFunction!()
                    ranFunctions.post[animatedTextIndex] = true
                }

                textBox.current!.textContent += animatedText![animatedTextIndex].message.charAt(characterIndex)
                characterIndex += 1
            }
            else{
                clearInterval(animationID!)

                if (animatedTextIndex < animatedText!.length-1){
                    characterIndex = 0
                    animatedTextIndex+=1
                    animationID = setInterval(messageWritingEffect, animatedText![animatedTextIndex].speed)
                }
                else{
                    if (animationCompletedEvent){
                        animationCompletedEvent()
                    }
                }
            }
            
            animatedTextAnimationData.current! = {animationID, characterIndex, animatedTextIndex, ranFunctions}

        }
        textBox.current!.textContent = null
        animatedTextAnimationData.current.animationID = setInterval(messageWritingEffect, animatedText[0].speed)

        return () =>{
            clearInterval(animatedTextAnimationData.current.animationID!)
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
    },[animatedText, animationCompletedEvent])

    
    return (
        <div className="AnimatedTextBox" ref={textBox}/>
    )
}