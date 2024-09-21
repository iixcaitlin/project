async function check(id){

    //this function should initialize the responses and highlight upon "send"
    /*
    A feature we can potentially add here:
    1. on subsequent button presses, we can compare keys from local storage 
       and new response and update the response and hightlights accordingly
       instead of deleting previous responses and starting over. 

       We can do string comparison to identify the new "keys" , and add them 
       into the storage and then reapply hightlights and responses. we 
       can even use NLP library to identify the subject of the "key" and 
       see if it matches the subjects of the keys in storage. 
    */

    try{
        if (localStorage.getItem(localStorage.getItem("id"))){
            localStorage.clear() // get rid of old data for now
            responseArea.innerHTML = "" // get rid of all previous response
            highlights = [] // empty all highlights
        }
    }catch(err){
        // pass
    }


    console.log('Sending data to chat GPT', textArea.innerHTML)

    //start loading animation
    let loading = document.createElement("div")
    loading.className = "loader"
    loading.innerText = "Loading..."
    responseArea.appendChild(loading)
    console.log(textArea.value)

    await fetch(`/journal/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: textArea.value})
    })
    .then((response) => {
        return response.text()
    })
    .then((data) => {
        data = JSON.parse(data)
        console.log(data)

        console.log("returned data from gpt:", data.GPTresponse)
        console.log("returned sentiment analysis:", data.sentiment)

        document.getElementsByClassName("loader")[0].remove(); // remove loading

        // document.getElementById("sentiment").innerText = JSON.stringify(data.sentiment)

        GPTdata = dataParse(data.GPTresponse) //ensure we only get the dictionary part of chatgpt reply
        localStorage.setItem(id, GPTdata)
        localStorage.setItem("id", id)
        let responseData = JSON.parse(GPTdata)
        if (Object.keys(responseData).length == 0 ) { //if empty json

            //replace with flash message later 

            let response = document.createElement("div")
            let x = document.createElement("div") // div for <a> tag
            x.innerHTML = `<a onclick='deleteResponse(${num})'><i class='x fa-solid fa-xmark'></i></a>`

            response.appendChild(x)
            response.setAttribute("id", `response${num}`)
            response.className = "response"
            response.innerHTML = "Nothing to note!"
            responseArea.appendChild(response)
        } else {

            //create responses base on the json value
            var num = 1 // remember id starts at 1
            for (key in responseData) {
                let response = document.createElement("div")
                response.setAttribute("id", `response${num}`)
                response.className = "response"
                // dont add new elements then overwrite the HTML
                response.innerHTML = responseData[key]
                let x = document.createElement("div")
                x.innerHTML = `<a onclick='deleteResponse(${num})'><i class='x fa-solid fa-xmark'></i></a>`
                response.appendChild(x)
                responseArea.appendChild(response)
                num ++
            }

            // create highlights base on json keys
            let highlightedText = applyHighlights(textArea.value, responseData)
            highlightArea.innerHTML = highlightedText

            // this function will populate the "highlights" variable & add hover effect to the highlights
            resetSpanHover() 
            matchScrolling()

        }
    })
    .catch((err) => {
        console.log("Error when getting responses from chatGPT:\n",err)
    })
}


function deleteResponse(num) {
    let response = document.getElementById("response" + num)
    response.style.opacity = '0';
    response.addEventListener("transitionend", () => {response.remove()})
    document.getElementById(`a${num}`).remove()
}


function dataParse(data) {
    start = data.indexOf("{")
    end = data.indexOf("}")
    data = data.slice(start, end + 1)
    console.log("after parsing:",data)
    return data
}
