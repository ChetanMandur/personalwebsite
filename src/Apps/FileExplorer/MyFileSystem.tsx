export type MyFileSystemFile ={
    type: "IMAGE" | "VIDEO" | "PDF",
    data: string,
    hidden: boolean,
}


export type MyFileSystemFolder = {
    hidden: boolean ,
    [key:string]: MyFileSystemFolder | MyFileSystemFile | boolean,
}

export const MyFileSystem : MyFileSystemFolder = {
    hidden:false,
    Photos:{
        hidden:false,
        "wikipedia photo of the day dec 23 2024": {
            type: "IMAGE",
            data: "https://upload.wikimedia.org/wikipedia/commons/0/02/Carved_wooden_bench_furniture_and_crafts_at_Heuan_Chan_heritage_house_in_Luang_Prabang_Laos.jpg",
            hidden: false
        },
        imageSubFolder:{
            hidden:false
        }
    },
    Videos:{
        hidden:false,
        "wikipedia media of the day dec 23 2024": {
            type: "VIDEO",
            data: "https://upload.wikimedia.org/wikipedia/commons/7/78/Hindenburg_Explodes_%28audio_extracted%29.webm",
            hidden: false
        },
        "i know live":{
            type:"VIDEO",
            data: "https://l0kz5q.dm.files.1drv.com/y4mltVUKp6E9_czlhGho8r2bpg8KIKcppVlP0NYpVIcE8QJyMA-_Jwy3UhfARoX6pUsiZMjSMzkjAokVcOG9aHyIamz5BHFkkk0F6D4N2NdRxmKnaYi1zu9tF2tM2Z3QrTzO4XzHkXCepQByHvxynuVu9N03mknM29H-GLoIXEKofXNxW7nt0uKFiytG3a6dqAeebQ_5DqQwEBcIZtDfnqz2qscfUv74TV-eNNIf_-BOuE?AVOverride=1",
            hidden:false,
        }
    },
    Documents:{
        hidden:false,
        "OOT manual, ty nintendo for the pdf":{
            type: "PDF",
            data: "https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_8/Manual_Nintendo64_TheLegendOfZeldaOcarinaOfTime_EN.pdf",
            hidden: false,
        }

    },
    "test":{
        hidden:false,
        type:"IMAGE",
        data:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Khone_Phapheng_Falls%2C_Si_Phan_Don%2C_Laos%2C_widest_waterfall_in_the_world.jpg/750px-Khone_Phapheng_Falls%2C_Si_Phan_Don%2C_Laos%2C_widest_waterfall_in_the_world.jpg"
    },
    TestHidden:{
        hidden:true,
    }
}

