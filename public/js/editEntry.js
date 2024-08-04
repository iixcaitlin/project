const saveBtn = document.getElementById("saveBtn")

// saving updates to entry
function saveEntry(id){
    var title = document.getElementById("title").innerText
    var text = document.getElementById("text").value    

    // console.log("title:", title)
    // console.log("text:", text)

    fetch(`/edit/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title,
            text: text,
        })
    })
}

document.getElementById("text").addEventListener("scroll", () => {
    highlights.scrollTop = text.scrollTop
})

// updating the overlays when changes are made
function entryInput(){
    try {
        var text = document.getElementById("text")
        var highlights = document.getElementById("highlights")
        var data;
    
        if (localStorage.getItem(localStorage.getItem("id"))) {
            // console.log("data exists...")
            // console.log(localStorage.getItem(localStorage.getItem("id")))
            data = JSON.parse((localStorage.getItem(localStorage.getItem("id"))))
            // console.log(typeof data, data)        
            var highlightedText = applyHighlights(text.value, data)
            highlights.innerHTML = highlightedText
            // return
        }

        // text.addEventListener("input", () => {
        //     if (document.cookie) {
        //         var highlightedText = applyHighlights(text.value, data)
        //     }
        //     highlights.innerHTML = highlightedText
        //     // highlights.innerHTML = text.value
        // })

        //must stay here !!
        text.addEventListener("scroll", () => {
            highlights.scrollTop = text.scrollTop
        })
        // highlights.scrollTop = text.scrollTop
    } catch (err) {
        console.log("theres an error:", err)
    }

}

// function to apply highlights to the entry based on data
function applyHighlights(text, data){
    var num = 1
    for (key in data){
        text = text.replace(`/\n$/g`, '\n\n').replace(key, `<span class="highlighted" id='a${num}'>$&</span>`)
        // let response = document.createElement("div")
        // response.setAttribute("id", `response${num}`)
        // response.className = "response"
        // response.innerHTML = data[key]
        // document.getElementById("responses").appendChild(response)
        num ++
    }
    hover()
    return text
}


// checking if mouse is hovering over textarea
// window.addEventListener("load", () => {
//     hover()
// })

function withinBounds(rectobj, x, y){
    if ((x > rectobj.x && x < (rectobj.x + rectobj.width)) && (y > rectobj.y && y < (rectobj.y + rectobj.height))){
        return true
    }
    return false
}


function hover(){
    console.log("applying hover event...")
    var textarea = document.getElementById("text")
    var highlights = document.getElementsByClassName("highlighted")
    
    
    for (let i = 0; i < highlights.length; i++) {
        highlights[i].addEventListener("mouseover", (mouse) => {
            const range = document.createRange()

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
    
    textarea.addEventListener("mousemove", (mouse) => {
        const hover = new MouseEvent("mouseover", {
            clientX: mouse.clientX,
            clientY: mouse.clientY
        })
        // console.log("dispatching event ...")
        for (let i = 0; i < highlights.length; i++) {
            highlights[i].dispatchEvent(hover)
        }
    })
}


entryInput()