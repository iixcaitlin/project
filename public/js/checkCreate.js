async function check() {
    try {
        if (sessionStorage.getItem("notes")) {
            sessionStorage.clear()
            responseArea.innerHTML = ""
            highlights = []
        }
    } catch (err) {
        // pass
    }

    console.log('Sending data to chat GPT', textArea.value)

    let loading = document.createElement("div")
    loading.className = "loader"
    loading.innerText = "Loading..."
    responseArea.appendChild(loading)

    await fetch("/createJournal", {
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
        console.log("returned from chat GPT", data)

        document.getElementsByClassName("loader")[0].remove(); // remove loading

        data = dataParse(data) //ensure we only get the dictionary part of chatgpt reply
        localStorage.setItem("notes", data)
        let responseData = JSON.parse(data)

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
    .catch ((err) => {
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
