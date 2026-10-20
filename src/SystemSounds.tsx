/** Microsoft, please don't yell at me. You guys were cooking with these sounds*/
const Win95 = {
    Default : {
        Chimes:"./sounds/Win95Sounds/Default/CHIMES.mp3",
        Chord:"./sounds/Win95Sounds/Default/CHORD.mp3",
        Dings:"./sounds/Win95Sounds/Default/DING.mp3",
        Tada:"./sounds/Win95Sounds/Default/TADA.mp3",
    }
}

/** Funny ha ha */
const Special = {
    Bruh:"./sounds/Funny/bruh.mp3" ,
    OhMyGod: "./sounds/Funny/ohmygod.mp3",
    VineBoom: "./sounds/Funny/vineboom.mp3",
    21: "./sounds/Funny/21.mp3",
    FunkMasterFlexExplosion: "./sounds/Funny/funkmasterflexexplosion.mp3",
    MyNameJeff: "./sounds/Funny/mynamejeff.mp3",
    TimAllenGrunt: "./sounds/Funny/timallengrunt.mp3",
    WTHOMG: "./sounds/Funny/wthomg.mp3",
    OOTDialogueNext: "./sounds/Extra/OOTDialogueNext.mp3"
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