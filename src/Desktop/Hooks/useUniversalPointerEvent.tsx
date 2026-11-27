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
    clickAction?:(event:PointerEvent)=>void,
    doubleClickAction?:(event:PointerEvent)=>void
    multiClickAction?:{
        [clickCount:number]: (event:PointerEvent)=>void
    },
    clickStrictMode?: boolean
}

const MULTI_CLICK_SPEED = 230

export default function useUniversalPointerEvent(
    {
        downAction, 
        upAction,
        holdAction,
        clickAction,
        doubleClickAction,
        multiClickAction,
        clickStrictMode,
    }:useUniversalPointerEventPropsType

):UniversalPointerEventType{
    /**
     * The element being targeted by the `Universal Pointer Event`  
     * This is filled when `pointerDown` is called, and emptied after `onPointerClick` is ran
    */
    const element = useRef <EventTarget | null>(null)

    /**
     * The id from `setTimeout()` used to trigger the `holdAction`  
     * If the pointer is not being held down, this timeout is cleared
     */
    const holdTimeoutID = useRef<number|null>(null)


    // Variables used for managing the `click` events

    /**
     * The amount of clicks done in succession (adhearing to the click speed)  
     * This is reset back to 0 once the click event goes through (ie. when the clicks stop)
    */
    const clickCount = useRef<number>(0)

    /**
     * Records the latest valid multi click event  
     * This is the multi click action that is called after the timeout 
     * @example If there are click events for 3 and 5 clicks, and the user clicks 4 times, the action for 3 clicks is fired
     * @example If there is no `multiClickAction`, but a `clickAction`, and the user clicks >1 time, then `clickAction` is fired 
     * 
     */
    const clickLastValidCount = useRef<number>(-1)

    /**
     * The id from `setTimeout()` used to trigger the click action  
     * If another click is done within the click speed timeframe, this timeout is cleared
    */
    const clickCountTimeoutID = useRef<number>(-1)



    /**
     * Handler for click events used within `onPointerDown`
     * Handles both `clickAction`, `doubleClickAction`, and `multiClickAction`  
     * Called when `pointerUp` is done anywhere (ie. the `document`) after a `pointerDown` occurs on the target element  
    */
    const onPointerClick = useCallback((event:PointerEvent)=>{
        // Since this is coming from a `pointerUp` event attached to `document`, the `event.target` can differ from the intented element
        // Need to check if `pointerUp` occured on the element we are targetting
        if (event.target == element.current){
            // Clear any current timeout from the previous click
            clearTimeout(clickCountTimeoutID.current)

            // Increase click count by one
            clickCount.current += 1


            // Check if the current click count has an action associated with it
            // If so, need to mark that as the latest valid click action
            if (
                (clickCount.current == 1 && (clickAction || (multiClickAction && multiClickAction[1])))
                ||
                (clickCount.current == 2 && (doubleClickAction || (multiClickAction && multiClickAction[2])))
                ||
                (clickCount.current > 2 && (multiClickAction && multiClickAction[clickCount.current]))
            ){
                clickLastValidCount.current = clickCount.current
            }

            // Set the new timeout with the new click values
            clickCountTimeoutID.current = setTimeout(()=>{
                const clickUsedValue = (clickStrictMode == undefined || clickStrictMode) ? clickCount.current : clickLastValidCount.current
                
                switch (clickUsedValue) {
                    case 1:
                        if (clickAction){
                            clickAction(event)
                        }
                        break;
                    case 2:
                        if (doubleClickAction){
                            doubleClickAction(event)
                        }
                        break;
                    default:
                        break;
                }

                if (multiClickAction && multiClickAction[clickUsedValue]){
                    multiClickAction[clickUsedValue](event)
                }

                // Clear click count and the last valid count
                clickCount.current = 0
                clickLastValidCount.current = -1
            }, MULTI_CLICK_SPEED)
            
            // console.log("clickCount:", clickCount.current, " | clickLastValid", clickLastValidCount.current)
        }
        
        // Clear whatever current element reference is
        element.current = null
    },[clickAction, doubleClickAction, multiClickAction, clickStrictMode])

    /**
     * The returned `onPointerDown` handler
     * Used to define a `onPointerDown` event that still calls the provided action,
     * along with logic to work with the other features of `useUniversalPointerEvent` 
     */
    const onPointerDown = useCallback((event:React.PointerEvent<HTMLElement>) => {
        /**
         * Used to abort the `pointerup` event attached to `document` once the hold action occurs
        */
        const abortController:AbortController = new AbortController()

        // Only valid if it's the left mouse button / primary pointer button
        if (event.button === 0){
            // If a `holdAction` is defined, start the timeout for it
            if (holdAction){
                holdTimeoutID.current = setTimeout(()=>{
                    holdAction.action(event)
                    abortController.abort()
                },holdAction.timeout ?? 1000)
            }
            // If a `downAction` is defined, call the action
            if (downAction){
                downAction(event)
            }

            // Store the target element data and attach the `onPointerClick` action
            element.current = event.target
            document.addEventListener("pointerup", onPointerClick, {once:true,signal: abortController.signal})
        }
        
    }, [downAction, holdAction, onPointerClick])

    /**
     * The returned `onPointerUp` handler  
     * Used to define a `onPointerUp` event that still calls the provided action,
     * along with logic to work with the other features of `useUniversalPointerEvent` 
     */
    const onPointerUp = useCallback((event:React.PointerEvent<HTMLElement>) =>{

        // Only valid if it's the left mouse button / primary pointer button
        if (event.button === 0){
            // Clear the current hold timeout
            clearTimeout(holdTimeoutID.current!)

            // If a `upAction` is defined, call the action
            if (upAction){
                upAction(event)
            }
        }
    },[upAction])


    return {onPointerDown, onPointerUp} 

}