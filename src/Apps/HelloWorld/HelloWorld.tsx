import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuContext";
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext";
import { TooltipContext } from "../../Desktop/Contexts/TooltipContext";
import "./HelloWorld.css"
import { useContext, useEffect, useRef, useState} from "react";


export type HelloWorldProps = AppRunningID & {
  ohmylord:string,
  name: string,
}

export default function HelloWorld ({ohmylord, name, app_running_id}:HelloWorldProps){
  const [test, setTest] = useState(false)
  const [appRunningIDpicker, setAppRunningIDpicker] = useState(app_running_id)
  const [imageURL, setImageURL] = useState("url(https://static.wikia.nocookie.net/aesthetics/images/a/a3/Pure_blue.png")

  const appRef =useRef<HTMLDivElement|null>(null)

  const {runningAppsData, runningAppsDispatch} = useContext(RunningAppsContext)
  const {contextMenuData,contextMenuDispatch} = useContext(ContextMenuContext)
  const {tooltipDispatch} = useContext(TooltipContext)

  const hasFocus = runningAppsData[app_running_id].zIndex == 999


  useEffect(()=>{
    function keyDownHandler(event:KeyboardEvent){
      if (hasFocus){
        console.log(app_running_id, event.key)
      }
    }
  
    document.addEventListener("keydown", keyDownHandler)

    return () => document.removeEventListener("keydown", keyDownHandler)
  },[hasFocus, app_running_id])




  const imageContextMenuOptions: ContextMenuOptions = {
    "Show me the cat": ()=>{setImageURL("url(https://placecats.com/neo_2/300/200)")},
    "I am blue": ()=>{setImageURL("url(https://static.wikia.nocookie.net/aesthetics/images/a/a3/Pure_blue.png")},
    "A message for you": ()=>{alert("Some elements take longer for a tooltip to appear \nHover around and be patient my child")}
  }


  return(
  <div className="hello-world"   ref={appRef}>
    Hello world
    <form action=""  >
      <input type="checkbox" checked={test}  onChange={()=>{setTest(!test); console.log(test)}} name="testCheckBox" id="testCheckBox"
        onMouseMove={(event)=>{
          tooltipDispatch({type:"SET", event:event,duration:0 , dataType: "TEXT", data:"Magic"})
        }}
      />
      <input type="checkbox"   onChange={()=>{runningAppsDispatch({type:"UPDATE-APP-PROPS", app_running_id:appRunningIDpicker, props:{...runningAppsData[appRunningIDpicker]["props"], ohmylord: Math.random().toString()} as HelloWorldProps}); console.log("props changed!!!!!!!!!")}} name="propChangeBox" id="propChangeBox" />
      <input type="text" name="appRunningIDpicker" id="appRunningIDpicker" value={appRunningIDpicker} onChange={(event)=>{setAppRunningIDpicker(event.target.value)}} />    
    </form>
    <div className="long-form" tabIndex={-1}
    onMouseMove={(event)=>{
      if(test){
        tooltipDispatch({type:"SET", event: event, data:"https://placedog.net/400/263?id=56", dataType:"IMAGE"})
      }
      else{
        tooltipDispatch({type:"SET", event: event, dataType:"TEXT", data: "Click the checkbox and come back here"})
      }
    }}
     >
      {(hasFocus) ? 
        (`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis placerat aliquam quam sed ultricies. Aliquam molestie, ex aliquam efficitur facilisis, mauris felis commodo risus, eget consequat justo dui at est. Sed vitae tortor velit. Fusce fringilla odio ut bibendum efficitur. Sed in augue fringilla tellus volutpat semper. Suspendisse at magna in sapien dapibus gravida nec at neque. Nullam sollicitudin mauris lorem, egestas semper elit elementum sit amet. In volutpat urna id facilisis sagittis.
        Nulla facilisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer sed consequat metus. Nunc lorem turpis, feugiat vel consectetur quis, viverra eu odio. Etiam elementum viverra tortor, in viverra tellus malesuada ac. Quisque sagittis, justo non ullamcorper iaculis, tellus mauris vestibulum orci, nec scelerisque metus ex non nibh. Aliquam vitae justo vel leo fermentum euismod ac sit amet diam. Ut fringilla urna ut urna faucibus, sit amet elementum leo accumsan. Vivamus elementum efficitur porta. Vivamus aliquet lorem quis ante efficitur tristique ac eget nunc. Sed est sapien, sollicitudin vel erat eget, commodo commodo elit. Maecenas ante neque, sagittis sed dignissim et, lobortis sed lacus.
        Nullam condimentum risus sed lacus elementum mollis. Donec gravida convallis tellus ac aliquam. Maecenas non justo felis. Aenean ullamcorper leo vel risus feugiat mattis. Aenean ut suscipit odio. Aenean vel lectus at erat bibendum dictum. Cras vel porta orci. Nullam consectetur sagittis ornare. Curabitur malesuada faucibus faucibus. Quisque imperdiet blandit nunc et malesuada. Nam arcu magna, mollis in mi id, consequat tincidunt est.
        Sed quis ultrices nulla, a sagittis libero. Sed aliquet diam non massa tempor, sit amet suscipit odio pellentesque. Nullam congue non est ac vehicula. Proin sed finibus lorem. Phasellus ac ipsum sit amet est hendrerit tincidunt. Aenean egestas facilisis odio eu consectetur. Proin nisl libero, aliquet id bibendum vitae, interdum quis ante. Donec vulputate, justo vel tempor iaculis, nulla mi consequat sapien, eu varius urna leo a ante.
        Nunc ut varius ante. Quisque vel sapien eros. Vivamus tempor elementum ex sed bibendum. Quisque vitae nibh et erat aliquet euismod nec at diam. Aenean vitae elit lorem. Sed eget auctor sem. Vestibulum non velit varius, accumsan massa vel, scelerisque ante. Etiam dignissim justo magna, sed consequat nibh dictum sit amet.`)
        : 
        (`Me...
          Can you focus on... me?
          Ba-by, can you focus... on me?
          Babe...

          Hands in the soap...
          Have the faucet's running
          And I keep looking at you...
          Stuck on your phone
          And you're stuck in your zone...
          You don't have a clue

          But I don't wanna give up...
          Ba-by, I just want you to get up...
          Late-ly I've been a little fed up...
          Wish you would just focus on...

          Me...
          Can you focus on... me?
          Ba-by, can you focus... on me?
          Me...
          Me,
          Can you focus on... me?
          Ba-by, can you focus... on me?

          Lazy and broke?...
          No, he get this money
          So I guess I can't complain...
          But I feel alone even when we're alone...
          And that don't cost a thing

          But I don't wanna give up...
          Ba-by, I just want you to get up...
          Late-ly I've been a little fed up...
          Wish you would just focus on

          Me...
          Can you focus on... me?
          Ba-by, can you focus... on me?
          Baby...
          Me
          Can you focus on... me?
          Baby, can you focus... on me?
          Me

          Baby, focus...
          Can't you see?...
          I just wanna love you, baby
          Look me in my eyes`
        )
      }
    </div>

    {test ? <div className="image2"   style={{backgroundImage:"url(https://placecats.com/neo_2/300/200)"}} > hi</div> : <></>}
    
    <div className="image"   style={{backgroundImage:imageURL}} 
      onContextMenu={(event)=>{
        contextMenuPropagation(event); 
        contextMenuDispatch({type:"SET",source:app_running_id+"bottomImage" ,options:imageContextMenuOptions, event:event});
        }} 
      onMouseMove={(event)=>{if (contextMenuData.source != app_running_id+"bottomImage"){
        tooltipDispatch({type:"SET", event: event, duration: 0 , data:"Right click me!", dataType:"TEXT"})
      }}}
    > {app_running_id} hi {name} {ohmylord} </div>
  </div>) 
} 