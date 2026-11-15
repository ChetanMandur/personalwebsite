import { useRef} from "react"

type UniversalPointerEventType = {
    onPointerDown: React.PointerEventHandler<HTMLElement>,
    onPointerUp: React.PointerEventHandler<HTMLElement>
}

type useUniversalPointerEventType = {
    downAction?: React.PointerEventHandler<HTMLElement>,
    upAction?: React.PointerEventHandler<HTMLElement>,
    holdAction?:{
        action: React.PointerEventHandler<HTMLElement>
        timeout?: number
    }
    clickAction?:React.PointerEventHandler<HTMLElement>
}

export default function useUniversalPointerEvent(
    {
        downAction, 
        upAction,
        holdAction,
        // clickAction,
    }:useUniversalPointerEventType

):UniversalPointerEventType{
    const holdTimeoutID = useRef<number|null>(null)

    const onPointerDown = (event:React.PointerEvent<HTMLElement>) => {
        if (event.button === 0){
            if (holdAction){
                holdTimeoutID.current = setTimeout(()=>{
                    holdAction.action(event)
                },holdAction.timeout ?? 1000)
            }
            if (downAction){
                downAction(event)
            }
        }
        
    }

    const onPointerUp = (event:React.PointerEvent<HTMLElement>) =>{
        if (event.button === 0){
            clearTimeout(holdTimeoutID.current!)
            if (upAction){
                upAction(event)
            }
        }
    }


    return {onPointerDown, onPointerUp} 

}