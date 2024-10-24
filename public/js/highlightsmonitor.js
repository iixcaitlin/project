const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0
}


class HighlightObj {
    constructor(id, initialState) {
        this.id = id
        this.initialState = initialState
        this.currentState = initialState
        this.delta = 0
        this.opacity = 1
    }

    updateDelta() {
        this.delta = wordDistance(this.currentState.split(" "), this.initialState.split(" "))
        let newOpacity = (this.initialState.split(" ").length - this.delta) / this.initialState.split(" ").length
        this.opacity = newOpacity.toFixed(1)
    }
}


class HighlightsManager {
    constructor(highlightArea, textArea, responseArea) {
        this.idcounter = 0
        this.highlightsArea = highlightArea
        this.textArea = textArea
        this.responseArea = responseArea
    
        this.highlight_spans = {

        }
        this.highlight_objs = {

        }
        this.highlight_responses = {

        }
    }

    onTextUpdate(){
        //if there are no highlights
        if (isEmptyObject(this.highlight_objs)) { // normall this would be ID
            return
        }

        let garbage = []

        if (!(isEmptyObject(this.highlight_objs))){
            for (let id in this.highlight_objs){
                if (changed(this.textArea.value, this.highlight_objs[id].currentState)){
                    console.log("id:", id)
                    this.highlight_objs[id].updateDelta()

                    let newState = findClosestMatch(this.textArea.value , this.highlight_objs[id].currentState, 2 ,true)
                    console.log("newState:", newState)
                    if (newState.length > 0){
                        this.highlight_objs[id].currentState = newState.join(" ")
                    }

                    if (this.highlight_objs[id].delta > Math.floor(this.highlight_objs[id].initialState.split(" ").length/2)){
                        garbage.push(id)
                    }


                    console.log(id,"delta", this.highlight_objs[id].delta, this.highlight_objs[id].currentState)
                }	
            }
        }

        //empty garbage
        for (let i= 0 ; i < garbage.length ; i++){
            console.log("DELETING:", garbage[i])
            this.delete(garbage[i]) // use builtin delete 
        }


        let newtext = this.reapplyHighlights()
        this.highlightsArea.innerHTML = newtext 

        //reattach
        for (let id in this.highlight_spans){
            this.highlight_spans[id] = document.getElementById(`a${id}`)
            this.highlight_spans[id].style.opacity = this.highlight_objs[id].opacity // reset opacity

        }

        // iterate and try to reset all the span elements 
        for (let id in this.highlight_spans){

                this.highlight_spans[id].addEventListener("mouseover", (mouse) => {
                    let corresondingID = mouse.target.id.slice(1)
        
        
                    let range = document.createRange()
        
                    range.setStartBefore( this.highlight_spans[corresondingID])
                    range.setEndAfter( this.highlight_spans[corresondingID])
        
                    let clientRects = range.getClientRects()
        
                    for (let j = 0; j < clientRects.length; j++){
                            if (withinBounds(clientRects[j], mouse.clientX, mouse.clientY)){
                                console.log("hovering over span #:", corresondingID)
    
                                try{
                                    document.getElementById(`response${corresondingID}`).style.opacity = "1"
                                    document.getElementById(`response${corresondingID}`).scrollIntoView()
                                    break
                                }catch(err){
                                    console.log("within bound but can't find response${corresondingID}")
                                }
        
                            } else {
        
                                try{
                                    document.getElementById(`response${corresondingID}`).style.opacity = "0.4"
                                }catch(err){
                                    console.log("out of bound can't find response${corresondingID}")
                                }
                                
                            }
                    }
        
            })
    
        }
            
    
        this.redoHoverDispatch() // everytime a span object is added, be sure to redo hover dispatch
        highlightArea.scrollTop = text.scrollTop //matching scrolling

    }


    onStorageChange(responses) {
        if (Object.keys(responses).length > 0) {
            for (let key in responses) {
                this.create(key, responses[key])
            }
        }
        console.log("new highlights added")
    }

    create(highlight_text, response_text) {
        // create new response associated response
        let new_res = document.createElement("div")
        new_res.setAttribute("id", `response${this.idcounter}`)
        new_res.classList.add("response")
        new_res.innerText = response_text

        let x = document.createElement("div")
        x.innerHTML = `<a onclick='deleteResponse(${this.idcounter})'><i class='x fa-solid fa-xmark'></i></a>`

        new_res.appendChild(x)
        this.responseArea.appendChild(new_res)

        this.highlight_responses[this.idcounter] = new_res

        let newhighlight_obj = new HighlightObj(this.idcounter, highlight_text)
        this.highlight_objs[this.idcounter] = newhighlight_obj


        let newtext = this.reapplyHighlights()
        this.highlightsArea.innerHTML = newtext

        let newspan = document.getElementById(`a${this.idcounter}`)
        this.highlight_spans[this.idcounter] = newspan

        for (let id in this.highlight_spans) {
            this.highlight_spans[id] = document.getElementById(`a${id}`)
            console.log(this.highlight_spans[id])
        }

        for (let id in this.highlight_spans) {
            this.highlight_spans[id].addEventListener("mouseover", (mouse) => {
                let corresondingID = mouse.target.id.slice(1)
                let range = document.createRange()
    
                range.setStartBefore(this.highlight_spans[corresondingID])
                range.setEndAfter(this.highlight_spans[corresondingID])
    
                let clientRects = range.getClientRects()
    
                for (let j = 0; j < clientRects.length; j++){
                    if (withinBounds(clientRects[j], mouse.clientX, mouse.clientY)){
                        document.getElementById(`response${corresondingID}`).style.opacity = "1"
                        document.getElementById(`response${corresondingID}`).scrollIntoView()
                        break
                    } else {
                        document.getElementById(`response${corresondingID}`).style.opacity = "0.4"
                    }
                }
            })
        }

        this.redoHoverDispatch()

        this.idcounter += 1
    }

    reapplyHighlights() {
        let newtext = this.textArea.value
        for (let id in this.highlight_objs) {
            newtext = newtext.replace(this.highlight_objs[id].currentState, `<span class="highlighted" id='a${this.highlight_objs[id].id}'>$&</span>`).replace(`/\n$/g`, '\n\n')
        }
        return newtext + " " // magic code DONT ERASE
    }

    redoHoverDispatch() {
        this.textArea.addEventListener("mousemove", (mouse) => {
            var hover = new MouseEvent("mouseover", {
                clientX: mouse.clientX,
                clientY: mouse.clientY
            })
            for (let id in this.highlight_spans) {
                this.highlight_spans[id].dispatchEvent(hover)
            }
        })
    }

    delete(id){
        console.log("deleting id:", id)

        //remove span from dom 
        this.highlight_spans[id].remove()
        delete this.highlight_spans[id]

        // remove highlight data obj 
        delete this.highlight_objs[id]

        //remove corresonding response
        this.highlight_responses[id].remove() // remove from dom
        delete this.highlight_responses[id]
    }
}