const textArea = document.getElementById("text")
const highlightArea = document.getElementById("highlights")
const responseArea = document.getElementById("responses")
var highlights = [] // this list should contain all the highlight spantags


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

function matchScrolling(){
    highlightArea.scrollTop = text.scrollTop
}

function reApplyHighlights(event){
    try {
        let data = null;
    
        if (sessionStorage.getItem("notes")) {
            data = JSON.parse((sessionStorage.getItem("notes")))
        }else{
            console.log("no data found in sessionStorage")
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


function applyHighlights(text, data){
    var num = 1
    for (key in data){
        text = text.replace(`/\n$/g`, '\n\n').replace(key, `<span class="highlighted" id='a${num}'>$&</span>`)
        num ++
    }
    return text
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