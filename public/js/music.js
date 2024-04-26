player = document.getElementById("musicPlayer")

let musicList = [
    {
        name: "track1",
        artist: "artist1",
        path: "/media/testMusic.mp3"
    }
]

function playMusic(){
    console.log("playing music")
    player.src = musicList[0].path;
    player.load();
    player.play();
}
