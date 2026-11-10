/** Microsoft, please don't yell at me. You guys were cooking with these sounds*/
const Win95 = {
    Default : {
        Chimes:"./system/sounds/Win95Sounds/Default/CHIMES.mp3",
        Chord:"./system/sounds/Win95Sounds/Default/CHORD.mp3",
        Dings:"./system/sounds/Win95Sounds/Default/DING.mp3",
        Tada:"./system/sounds/Win95Sounds/Default/TADA.mp3",
    }
}

/** Funny ha ha */
const Special = {
    Bruh:"./system/sounds/Funny/bruh.mp3" ,
    OhMyGod: "./system/sounds/Funny/ohmygod.mp3",
    VineBoom: "./system/sounds/Funny/vineboom.mp3",
    21: "./system/sounds/Funny/21.mp3",
    FunkMasterFlexExplosion: "./system/sounds/Funny/funkmasterflexexplosion.mp3",
    MyNameJeff: "./system/sounds/Funny/mynamejeff.mp3",
    TimAllenGrunt: "./system/sounds/Funny/timallengrunt.mp3",
    WTHOMG: "./system/sounds/Funny/wthomg.mp3",
    OOTDialogueNext: "./system/sounds/Extra/OOTDialogueNext.mp3"
}

/**
 * Built-in sounds that are available to be used wherever in place for the `src` parameter for `<audio>` tags  
 * (Or wherever else allows for file paths to `.mp3` files) 
*/
const SystemSounds = {
    Win95,
    Special
}

export default SystemSounds