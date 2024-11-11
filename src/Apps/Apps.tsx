import HelloWorld from "./HelloWorld/HelloWorld";

export type AppProperties = {
  name: string;
  icon: string;
  app: () => JSX.Element;


  defaultWidth: number;
  defaultHeight:number,
}

type AppListType = {
  [key:string] : AppProperties
}
const defaultAppProperties: AppProperties = {
  name:"undefined-app",
  icon:"🗿",
  app: HelloWorld,
  defaultWidth: 400,
  defaultHeight: 300,
}

export var AppList : AppListType = {
  "HelloWorld": {
    ...defaultAppProperties,
    name:"Hello World",
    icon:"🌍",
    app: HelloWorld,
    defaultHeight:500,
    defaultWidth:500
  },
  "Default App Properties Test": {
    ...defaultAppProperties,
  }
}