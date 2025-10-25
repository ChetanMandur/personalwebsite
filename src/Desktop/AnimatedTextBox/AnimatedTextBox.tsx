import "./AnimatedTextBox.css"
import { useEffect, useRef } from "react"


type AnimatedTextAnimationData = {
    animationID: number|null,
    characterIndex: number,
    arrayIndex: number
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
    skipAnimation?: boolean 
}

export function AnimatedTextBox ({animatedText, skipAnimation}:AnimatedTextBoxProps){

    const animatedTextAnimationData = useRef<AnimatedTextAnimationData>({animationID:null, characterIndex:0, arrayIndex:0})
    const textBox = useRef<HTMLDivElement>(null)
    

    useEffect(()=>{
        if (animatedText && !skipAnimation){
            function messageWritingEffect(){
                let {animationID, characterIndex, arrayIndex} = animatedTextAnimationData.current!
                if (characterIndex < animatedText![arrayIndex].message.length){
                    
                    // // At line start
                    if (characterIndex == 0 && animatedText[arrayIndex].preFunction != undefined){
                        animatedText[arrayIndex].preFunction!()
                    }

                    // During animation
                    if (animatedText[arrayIndex].intraFunction != undefined && animatedText[arrayIndex].intraFunction![characterIndex] != undefined){
                        animatedText[arrayIndex].intraFunction![characterIndex]()
                    }

                    // At line end
                    if (characterIndex == animatedText[arrayIndex].message.length -1 && animatedText[arrayIndex].postFunction != undefined ){
                        animatedText[arrayIndex].postFunction!()
                    }

                    textBox.current!.textContent += animatedText![arrayIndex].message.charAt(characterIndex)
                    characterIndex += 1
                    if (characterIndex >= animatedText![arrayIndex].message.length){
                        characterIndex = 0
                        arrayIndex += 1

                        clearInterval(animationID!)
                        if (arrayIndex < animatedText!.length){
                            animationID = setInterval(messageWritingEffect, animatedText![arrayIndex].speed)
                        }


                    }
                    animatedTextAnimationData.current! = {animationID, characterIndex, arrayIndex}
                }
            }
            textBox.current!.textContent = null
            animatedTextAnimationData.current.animationID = setInterval(messageWritingEffect, animatedText[0].speed)

            return () =>{
                clearInterval(animatedTextAnimationData.current.animationID!)
                animatedTextAnimationData.current = {animationID:null, characterIndex:0, arrayIndex:0}
            }
        }
        else {
            clearInterval(animatedTextAnimationData.current.animationID!)
            let fullMessage:string = ""

            for (const partMessage of animatedText){
                fullMessage += partMessage.message
            }

            textBox.current!.textContent = fullMessage
        }
    },[animatedText, skipAnimation])

    
    return (
        <div className="AnimatedTextBox" ref={textBox}/>
    )
}