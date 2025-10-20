import { useEffect, useRef } from "react"

type AnimatedTextAnimationData = {
    animationID: number|null,
    characterIndex: number,
    arrayIndex: number
}

export type AnimatedText = {message:string, speed:number}[]

type AnimatedTextBoxProps = {
    animatedText: AnimatedText
}

export function AnimatedTextBox ({animatedText}:AnimatedTextBoxProps){

    const animatedTextAnimationData = useRef<AnimatedTextAnimationData>({animationID:null, characterIndex:0, arrayIndex:0})
    const textBox = useRef<HTMLDivElement>(null)
    

    useEffect(()=>{
        if (animatedText){
            function messageWritingEffect(){
                let {animationID, characterIndex, arrayIndex} = animatedTextAnimationData.current!
                if (characterIndex < animatedText![arrayIndex].message.length){
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
    },[animatedText])

    
    return (
        <div className="AnimatedTextBox" ref={textBox}/>
    )
}