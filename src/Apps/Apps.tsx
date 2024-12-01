import HelloWorld from "./HelloWorld/HelloWorld";

export type AppProperties = {
  name: string;
  icon: string;
  app: JSX.Element;


  defaultWidth: number;
  defaultHeight:number,
}

type AppListType = {
  [key:string] : AppProperties
}
const defaultAppProperties: AppProperties = {
  name:"undefined-app",
  icon:"https://www.svgrepo.com/show/487018/alien.svg",
  app:<HelloWorld/> ,
  defaultWidth: 400,
  defaultHeight: 300,
}

export const AppList : AppListType = {
  "HelloWorld": {
    ...defaultAppProperties,
    name:"Hello World",
    icon:"https://www.svgrepo.com/show/521265/world-1.svg",
    app: <HelloWorld/>,
    defaultHeight:500,
    defaultWidth:500
  },
  "Default App Properties Test": {
    ...defaultAppProperties,
  }
}