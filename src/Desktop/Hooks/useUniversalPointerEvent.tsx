import { useCallback, useRef} from "react"

type UniversalPointerEventType = {
    onPointerDown: React.PointerEventHandler<HTMLElement>,
    onPointerUp: React.PointerEventHandler<HTMLElement>
}

type useUniversalPointerEventPropsType = {
    downAction?: React.PointerEventHandler<HTMLElement>,
    upAction?: React.PointerEventHandler<HTMLElement>,
    holdAction?:{
        action: React.PointerEventHandler<HTMLElement>
        timeout?: number
    }
    clickAction?:(event:PointerEvent)=>void
}

export default function useUniversalPointerEvent(
    {
        downAction, 
        upAction,
        holdAction,
        clickAction,
    }:useUniversalPointerEventPropsType

):UniversalPointerEventType{
    const holdTimeoutID = useRef<number|null>(null)
    const element = useRef <EventTarget | null>(null)

    const onPointerClick = useCallback((event:PointerEvent)=>{
        if (event.target == element.current){
            if (clickAction){
                clickAction(event)
            }
        }
        element.current = null
    },[clickAction])

    const onPointerDown = useCallback((event:React.PointerEvent<HTMLElement>) => {
        const abortController:AbortController = new AbortController()

        if (event.button === 0){
            if (holdAction){
                holdTimeoutID.current = setTimeout(()=>{
                    holdAction.action(event)
                    abortController.abort()
                },holdAction.timeout ?? 1000)
            }
            if (downAction){
                downAction(event)
            }

            element.current = event.target
            document.addEventListener("pointerup", onPointerClick, {once:true,signal: abortController.signal})
        }
        
    }, [downAction, holdAction, onPointerClick])

    const onPointerUp = useCallback((event:React.PointerEvent<HTMLElement>) =>{
        if (event.button === 0){
            clearTimeout(holdTimeoutID.current!)
            if (upAction){
                upAction(event)
            }
        }
    },[upAction])


    return {onPointerDown, onPointerUp} 

}