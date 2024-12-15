import "./HelloWorld.css"
import { useState} from "react";


export default function HelloWorld (){
  const [test, setTest] = useState(false)
  return(
  <div className="hello-world">
    Hello world
    <form action="">
      <input type="checkbox" checked={test} onChange={()=>{setTest(!test); console.log(test)}} name="" id="" />
    </form>
    <div className="long-form">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis placerat aliquam quam sed ultricies. Aliquam molestie, ex aliquam efficitur facilisis, mauris felis commodo risus, eget consequat justo dui at est. Sed vitae tortor velit. Fusce fringilla odio ut bibendum efficitur. Sed in augue fringilla tellus volutpat semper. Suspendisse at magna in sapien dapibus gravida nec at neque. Nullam sollicitudin mauris lorem, egestas semper elit elementum sit amet. In volutpat urna id facilisis sagittis.
      Nulla facilisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer sed consequat metus. Nunc lorem turpis, feugiat vel consectetur quis, viverra eu odio. Etiam elementum viverra tortor, in viverra tellus malesuada ac. Quisque sagittis, justo non ullamcorper iaculis, tellus mauris vestibulum orci, nec scelerisque metus ex non nibh. Aliquam vitae justo vel leo fermentum euismod ac sit amet diam. Ut fringilla urna ut urna faucibus, sit amet elementum leo accumsan. Vivamus elementum efficitur porta. Vivamus aliquet lorem quis ante efficitur tristique ac eget nunc. Sed est sapien, sollicitudin vel erat eget, commodo commodo elit. Maecenas ante neque, sagittis sed dignissim et, lobortis sed lacus.
      Nullam condimentum risus sed lacus elementum mollis. Donec gravida convallis tellus ac aliquam. Maecenas non justo felis. Aenean ullamcorper leo vel risus feugiat mattis. Aenean ut suscipit odio. Aenean vel lectus at erat bibendum dictum. Cras vel porta orci. Nullam consectetur sagittis ornare. Curabitur malesuada faucibus faucibus. Quisque imperdiet blandit nunc et malesuada. Nam arcu magna, mollis in mi id, consequat tincidunt est.
      Sed quis ultrices nulla, a sagittis libero. Sed aliquet diam non massa tempor, sit amet suscipit odio pellentesque. Nullam congue non est ac vehicula. Proin sed finibus lorem. Phasellus ac ipsum sit amet est hendrerit tincidunt. Aenean egestas facilisis odio eu consectetur. Proin nisl libero, aliquet id bibendum vitae, interdum quis ante. Donec vulputate, justo vel tempor iaculis, nulla mi consequat sapien, eu varius urna leo a ante.
      Nunc ut varius ante. Quisque vel sapien eros. Vivamus tempor elementum ex sed bibendum. Quisque vitae nibh et erat aliquet euismod nec at diam. Aenean vitae elit lorem. Sed eget auctor sem. Vestibulum non velit varius, accumsan massa vel, scelerisque ante. Etiam dignissim justo magna, sed consequat nibh dictum sit amet.
    </div>
    {test ? <div className="image2" style={{backgroundImage:"url(https://placecats.com/neo_2/300/200)"}} > hi</div> : <></>}
    {/* <div className="image" style={{backgroundImage:"url(https://placecats.com/neo_2/300/200)"}} > hi</div> */}
    <div className="image" style={{backgroundImage:"url(https://static.wikia.nocookie.net/aesthetics/images/a/a3/Pure_blue.png"}} > hi</div>
  </div>) 
} 