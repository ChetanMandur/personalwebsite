import { useEffect, useRef } from "react"

type AnimatedTextAnimationData = {
    animationID: number|null,
    characterIndex: number,
    arrayIndex: number
}

export type AnimatedText = {
        message:string, 
        speed:number,
        preFunctions?: (() => (void))[] //Run before animation starts for the line
        intraFunctions?: {[index:number]: (() => (void))[] } // Run midway thru animation, at a specfic character index
        postFunctions?: (() => (void))[] //Run after animation ends for the line
    }[]

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
                    
                    // // At line start
                    if (characterIndex == 0 && animatedText[arrayIndex].preFunctions != undefined ){
                        for (const preFunc of animatedText[arrayIndex].preFunctions!){
                            preFunc()
                        }
                    }

                    // During animation
                    if (animatedText[arrayIndex].intraFunctions != undefined && animatedText[arrayIndex].intraFunctions![characterIndex] != undefined){
                        for (const intraFunc of animatedText[arrayIndex].intraFunctions![characterIndex]){
                            intraFunc()
                        }
                    }

                    // At line end
                    if (characterIndex == animatedText[arrayIndex].message.length -1 && animatedText[arrayIndex].postFunctions != undefined ){
                        for (const postFunc of animatedText[arrayIndex].postFunctions!){
                            postFunc() //new music genre
                        }
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
    },[animatedText])

    
    return (
        <div className="AnimatedTextBox" ref={textBox}/>
    )
}