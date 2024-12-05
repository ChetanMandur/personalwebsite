import HelloWorld from "./HelloWorld/HelloWorld";

export type AppProperties = {
  name: string;
  icon: string;
  app: JSX.Element;


  defaultWidthRatio: number;
  defaultHeightRatio:number,
}

type AppListType = {
  [key:string] : AppProperties
}
const defaultAppProperties: AppProperties = {
  name:"undefined-app",
  icon:"https://www.svgrepo.com/show/487018/alien.svg",
  app:<HelloWorld/> ,
  defaultWidthRatio: 1/3.5,
  defaultHeightRatio: 1/3.5,
}

export const AppList : AppListType = {
  "HelloWorld": {
    ...defaultAppProperties,
    name:"Hello World",
    icon:"https://www.svgrepo.com/show/521265/world-1.svg",
    app: <HelloWorld/>,
    defaultHeightRatio:1/2.5,
    defaultWidthRatio:1/2.5
  },
  "Default App Properties Test": {
    ...defaultAppProperties,
  }
}