export type MyFileSystemFile ={
    type: "IMAGE" | "VIDEO" | "PDF",
    name: string,
    data: string,
    hidden: boolean,
}


export type MyFileSystemFolder = {
    [key:string]: MyFileSystemFolder | MyFileSystemFile
}

export const MyFileSystem : MyFileSystemFolder = {
    Photos:{
        image1: {
            type: "IMAGE",
            name: "wikipedia photo of the day dec 23 2024",
            data: "https://upload.wikimedia.org/wikipedia/commons/0/02/Carved_wooden_bench_furniture_and_crafts_at_Heuan_Chan_heritage_house_in_Luang_Prabang_Laos.jpg",
            hidden: false
        },
        imageSubFolder:{

        }
    },
    Videos:{
        video1: {
            type: "VIDEO",
            name: "wikipedia media of the day dec 23 2024",
            data: "https://upload.wikimedia.org/wikipedia/commons/7/78/Hindenburg_Explodes_%28audio_extracted%29.webm",
            hidden: false
        }
    },
    Documents:{
        document1:{
            type: "PDF",
            name: "OOT manual, ty nintendo for the pdf",
            data: "https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_8/Manual_Nintendo64_TheLegendOfZeldaOcarinaOfTime_EN.pdf",
            hidden: false,
        }

    },
}

