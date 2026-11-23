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
    multiClickAction?:{
        [clickCount:number]: (event:PointerEvent)=>void
    }
}

const MULTI_CLICK_SPEED = 230
const MULTI_CLICK_TIMEOUT = MULTI_CLICK_SPEED + 1

export default function useUniversalPointerEvent(
    {
        downAction, 
        upAction,
        holdAction,
        clickAction,
        multiClickAction,
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
     * The date/time which a click was last registered  
     * This is measured in milliseconds, how the `Date` object measures it
    */
    const clickLastDate = useRef<number>(-1)

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
     * Helper handler for click events  
     * Handles both `clickAction` and `multiClickAction` 
     * Called when `pointerUp` is done on an element that had `pointerDown` done on it
    */
    const onPointerClick = useCallback((event:PointerEvent)=>{
        // Since this is coming from a `pointerUp` event that is attached to `document` after `onPointerDown` is activated
        // the `target` can differ from the element meant to be targetted
        // (aka, `onPointerDown` is attached to `element1`, but since `pointerUp` is attached to the whole page, its `event.target` can be different than `element1`)
        // Need to check if `pointerUp` occured on the element we are targetting
        if (event.target == element.current){
            // If there has already been a click
            if (clickCount.current > 0){
                if (Date.now() - clickLastDate.current <= MULTI_CLICK_SPEED){
                    clickCount.current += 1

                    // Check if the current click count has an action associated with it
                    // If so, need to mark that as the latest valid click action
                    if (multiClickAction && multiClickAction[clickCount.current]){
                        clickLastValidCount.current = clickCount.current
                    }

                    // Clear any current timeout from the previous click & set a new timeout
                    clearTimeout(clickCountTimeoutID.current)
                    clickCountTimeoutID.current = setTimeout(()=>{
                        // If a list of multi click actions exist, and the last valid click action exists
                            // This second check is only in case the latest valid click action was `clickAction`
                        if (multiClickAction && multiClickAction[clickLastValidCount.current]){
                            multiClickAction[clickLastValidCount.current](event)
                        }
                        else{
                            if (clickAction){
                                clickAction(event)
                            }
                        }

                        // Clear click count and the last valid count
                        clickCount.current = 0
                        clickLastValidCount.current = -1
                    }, MULTI_CLICK_TIMEOUT)
                }
                // console.log(Date.now() - clickLastDate.current)
            }
            // If there hasn't been a click yet
            // Used to handle `clickAction`
            else{
                clickCount.current = 1
                clearTimeout(clickCountTimeoutID.current)
                clickCountTimeoutID.current = setTimeout(()=>{
                    if (clickAction){
                        clickAction(event)
                    }
                    clickCount.current = 0 
                },MULTI_CLICK_TIMEOUT)
            }
            clickLastDate.current = Date.now()
        }
        element.current = null
    },[clickAction, multiClickAction])

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