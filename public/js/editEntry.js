//this file should be imported before checkEntry.js
//global variables ( accessible by all functions )
// const are for objects that shouldn't be refined
const saveBtn = document.getElementById("saveBtn") 
const textArea = document.getElementById("text")
const highlightArea = document.getElementById("highlights")
const responseArea = document.getElementById("responses")
var highlights = [] // this list should contain all the highlight spantags

//textArea event settings
textArea.addEventListener("scroll",matchScrolling)
textArea.addEventListener("input", reApplyHighlights)
textArea.addEventListener("mousemove", (mouse) => {

    //generate new event mouse event
    var hover = new MouseEvent("mouseover", {
        clientX: mouse.clientX,
        clientY: mouse.clientY
    })

    /* dispatch this event to all highlights ( 
       the list of span tags should be global, 
       when the list is empty the forloop doesnt run ) 
    */
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
            console.log("current sentence:", curSentence)
            console.log("edit distance:", wordDistance(curSentence, response))
            if (wordDistance(curSentence, response) < smallestDistance) {
                smallestDistance = wordDistance(curSentence, response)
                closest = curSentence
            }
        }
    }
    return closest
}

// saving updates to entry
function saveEntry(id){
    var title = document.getElementById("title").innerText
    var text = textArea.value    

    //add err catch and load animation / feed back would be nice
    fetch(`/edit/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title,
            text: text,
        })
    })
}

//this function will be called when we scroll the textArea
function matchScrolling(){
    highlightArea.scrollTop = text.scrollTop
}

// updating the overlays when changes are made ( keypress)
function reApplyHighlights(event){
    try {
        let data = null;

        if (localStorage.getItem(localStorage.getItem("id"))) {
            data = JSON.parse((localStorage.getItem(localStorage.getItem("id"))))
        }else{
            console.log("no data found in localstorage")
            return
        }

        if (data != null){
            let highlightedText = applyHighlights(textArea.value, data)
            highlightArea.innerHTML = highlightedText
            //aftering applying highlights, we have to reset hover events for all the span tag elements
            resetSpanHover()
        }

        //match scrolling just in case new text causes scrolling
        matchScrolling()

    } catch (err) {
        console.log("An error occur when reapplying highlights:", err)
    }

}

// function to apply highlights to the entry based on data
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