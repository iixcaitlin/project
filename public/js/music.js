var title = document.getElementById("songName")
var artist = document.getElementById("songArtist")
var slider = document.getElementById("slider")
var duration = document.getElementById("duration")
var totalDuration = document.getElementById("totalDuration")
var playBtn = document.getElementById("playpause")
let player = document.createElement("audio")

let update;
let playing = false;
var index = 0

let musicList = [
    {
        name: "track1",
        artist: "artist1",
        path: "/media/testMusic.mp3"
    },
    {
        name: "Le Souvenir avec le crepuscule",
        artist: "Hoyoverse",
        path: "/media/LeSouvenirAvecLeCrepuscule.mp3"
    }
]

function playpause(){
    if (!playing){
       playMusic() 
    } else {
        pauseMusic()
    }
}

function playMusic(){
    player.play();
    playing = true
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
}

function pauseMusic(){
    player.pause()
    playing = false
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
}

function prevSong(){
    index > 0? index -= 1: index = musicList.length - 1
    load(index)
    playMusic()
}

function nextSong(){
    index += 1
    load(index % musicList.length)
    playMusic()
}


function seek(){
    var seekTo = player.duration * (slider.value / 100)
    player.currentTime = seekTo
}

function seekUpdate(){
    if (!isNaN(player.duration)){
        slider.value = player.currentTime * (100 / player.duration)
        
        let curMin = Math.floor(player.currentTime / 60)
        let curSec = Math.floor(player.currentTime - (curMin * 60))
        let durMin = Math.floor(player.duration / 60)
        let durSec = Math.floor(player.duration - (durMin * 60))

        if (curMin < 10) {curMin = "0" + curMin}
        if (curSec < 10) {curSec = "0" + curSec}
        if (durMin < 10) {durMin = "0" + durMin}
        if (durSec < 10) {durSec = "0" + durSec}

        duration.innerText = curMin + ":" + curSec
        totalDuration.innerText = durMin + ":" + durSec
    }
}

function reset(){
    duration.innerText = "00:00"
    totalDuration.innerText = "00:00"
    slider.value = 0
}

function load(index){
    clearInterval(update)
    reset()

    title.innerText = musicList[index].name
    artist.innerText = musicList[index].artist

    player.src = musicList[index].path;
    player.load();

    update = setInterval(seekUpdate, 1000)
    player.addEventListener("ended", nextSong)
}

load(index)




function toggle() {
    let toggle = document.getElementById("toggle")
    let show;
    if (toggle.innerHTML === '<i class="fa-solid fa-angle-up"></i>') {
        toggle.innerHTML = '<i class="fa-solid fa-angle-down"></i>'
        show = false;
    } else {
        toggle.innerHTML = '<i class="fa-solid fa-angle-up"></i>'
        show = true;
    }

    if (show === true) {
        toggle.style.top = "0%";
    } else {
        toggle.style.top = "80%";
    }
}