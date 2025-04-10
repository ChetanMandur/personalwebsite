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
        "tybg":{
            type: "IMAGE",
            data:"https://c.tenor.com/4kpF986JjZkAAAAd/tenor.gif",
            hidden: false
        },
        "cat fell":{
            type:"IMAGE",
            data:"https://media1.tenor.com/m/nAYI--YdBzIAAAAd/fell.gif",
            hidden:false
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
            data: "https://dl.dropboxusercontent.com/scl/fi/38slbwzsjhjrtbu4foq4q/iknow.mp4?rlkey=9dbb68bgfl5v2i1el6i46520z&st=hhwqe6l6&dl=0",
            hidden:false,
        },
        "2016xxlcypher":{
            type: "VIDEO",
            data:"https://dl.dropboxusercontent.com/scl/fi/ypj2w4480tnz2cdwawmuk/2016xxlcypher.mp4?rlkey=u64ygq5crrlr38s4h5l37ez1k&st=j7upd3rl&dl=0",
            hidden:false
        },
        "60fps":{
            type: "VIDEO",
            data:"https://dl.dropboxusercontent.com/scl/fi/12j6sdk3879inkijzd4dt/60fps.mp4?rlkey=04scwwrb73oxfsqk09myyb08b&st=dpsxdg7f&dl=0",
            hidden:false
        },
        "30fps":{
            type: "VIDEO",
            data:"https://dl.dropboxusercontent.com/scl/fi/d0yy66y0oe2l82mkdf6be/30fps.mp4?rlkey=nwa117hx2zjkpnekkb1q8hw8u&st=sfafnxv3&dl=0",
            hidden:false
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

