import FileExplorer,{ FileExplorerProps }  from "./FileExplorer/FileExplorer";
import HelloWorld, { HelloWorldProps } from "./HelloWorld/HelloWorld";

export type AppProperties = {
  name: string;
  icon: string;
  app: ({}:any)=>JSX.Element;
  props: {}
  defaultWidthRatio: number;
  defaultHeightRatio:number,
}

type AppListType = {
  [key:string] : AppProperties
}
const defaultAppProperties: AppProperties = {
  name:"undefined-app",
  icon:"https://www.svgrepo.com/show/487018/alien.svg",
  app: HelloWorld ,
  props:{name:"default", ohmylord:"default"} as HelloWorldProps,
  defaultWidthRatio: 1/4,
  defaultHeightRatio: 1/2,
}

export const AppList : AppListType = {
  "HelloWorld": {
    ...defaultAppProperties,
    name:"Hello World",
    icon:"https://www.svgrepo.com/show/521265/world-1.svg",
    app: HelloWorld,
    props:{name:"Hello World", ohmylord:"Yes my child"} as HelloWorldProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "FileExplorer":{
    name:"File Explorer",
    icon:"https://www.svgrepo.com/show/486676/folder-outline.svg",
    app: FileExplorer,
    props:{} as FileExplorerProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "Default App Properties Test": {
    ...defaultAppProperties,
  }
}