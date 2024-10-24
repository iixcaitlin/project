const textArea = document.getElementById("text")
const highlightArea = document.getElementById("highlights")
const responseArea = document.getElementById("responses")
var highlights = [] // this list should contain all the highlight spantags

const textAreaManager = new TextAreaManager(textArea)
const highlightsManager = new HighlightsManager(highlightArea, textArea, responseArea)

window.addEventListener("mystorage", (event) => {
    console.log("storage changing...")
    highlightsManager.onStorageChange(event.key)
})



textArea.addEventListener("scroll",matchScrolling)
textArea.addEventListener("input", reApplyHighlights)
textArea.addEventListener("mousemove", (mouse) => {

    //generate new event mouse event
    var hover = new MouseEvent("mouseover", {
        clientX: mouse.clientX,
        clientY: mouse.clientY
    })

    for (let i = 0; i < highlights.length; i++) {
        highlights[i].dispatchEvent(hover)
    }
    
})

function findClosest(text, response){
    response = response.split(" ")
    let closest;
    let smallestDistance = 100
    console.log("response:", response)
    for (let i = 0; i < text.length; i++){
        if (text[i] === response[0]) {
            let curSentence = text.slice(i, i + response.length + 1)
            // console.log("current sentence:", curSentence)
            // console.log("edit distance:", wordDistance(curSentence, response))
            if (wordDistance(curSentence, response) < smallestDistance) {
                smallestDistance = wordDistance(curSentence, response)
                closest = curSentence
            }
        }
    }
    return closest
}

function matchScrolling(){
    highlightArea.scrollTop = text.scrollTop
}

function reApplyHighlights(event){
    textAreaManager.update()
    highlightsManager.onTextUpdate()
}


function applyHighlights(text, data){
    var num = 1
    for (key in data){
        if (text.includes(key)) {
            text = text.replace(`/\n$/g`, '\n\n').replace(key, `<span class="highlighted" id='a${num}'>$&</span>`)
        } else {
            console.log("highlight not found...")
            var splitText = text.split(" ")
            var closest = findClosest(splitText, key)
            closest = closest.join(" ")
            console.log("closest: ", closest)
            data[closest] = data[key]
            delete data[key]
            console.log("data:", data)
            text = text.replace(`/\n$/g`, '\n\n').replace(closest, `<span class="highlighted" id='a${num}'>$&</span>`)
        }
        num ++
    }
    return text+" " //magic space!
}


function withinBounds(rectobj, x, y){
    if ((x > rectobj.x && x < (rectobj.x + rectobj.width)) && (y > rectobj.y && y < (rectobj.y + rectobj.height))){
        return true
    }
    return false
}


function resetSpanHover(){
    console.log("reapplying hover event to new spantags ")
    highlights = document.getElementsByClassName("highlighted") //replacing the global list
    
    
    for (let i = 0; i < highlights.length; i++) {
        highlights[i].addEventListener("mouseover", (mouse) => {
            let range = document.createRange()

            range.setStartBefore(highlights[i])
            range.setEndAfter(highlights[i])

            let clientRects = range.getClientRects()

            for (let j = 0; j < clientRects.length; j++){
                if (withinBounds(clientRects[j], mouse.clientX, mouse.clientY)){
                    document.getElementById(`response${i+1}`).style.opacity = "1"
                    document.getElementById(`response${i+1}`).scrollIntoView()
                    break
                } else {
                    document.getElementById(`response${i+1}`).style.opacity = "0.4"
                }
            }
        })
    }
}