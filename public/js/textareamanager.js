var GPTdata = "";
class TextAreaManager {
    constructor(textArea) {
        this.element = textArea // where user types
        this.intitialState = textArea.value // initial text
        this.currentState = textArea.value
        this.wordDelta = 0 // difference in words between two strings
        this.stringDelta = 0 // measures character difference
        this.wordCount = textArea.value.split(" ").length // number of words
        this.stringCount = textArea.value.length
    }

    async getResponse (id, text) {
        console.log("sending to chat GPT", text)

        // start loading animation
        let loading = document.createElement("div")
        loading.className = "loader"
        loading.innerText = "Loading..."
        responseArea.appendChild(loading)
        console.log(textArea.value)

        await fetch(`/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: text})
        })
        .then((response) => {
            return response.text()
        })
        .then((data) => {
            data = JSON.parse(data)
            console.log(data)
    
            document.getElementsByClassName("loader")[0].remove(); // remove loading
        
            GPTdata = JSON.parse(dataParse(data)) //ensure we only get the dictionary part of chatgpt reply
            console.log("parsed response: ", GPTdata)
        })
        .catch((err) => {
            console.log("Error when getting responses from chatGPT:\n",err)
        })
    }

    updateInitialState(state) {
        this.intitialState = state
    }

    updateCurrentState(state) {
        this.currentState = state
    }

    updateDelta() {
        this.wordDelta = wordDistance(this.currentState.replace("\n", " ").split(" "), this.intitialState.replace("\n", " ").split(" "))
        this.stringDelta = this.currentState.length - this.intitialState.length
    }

    // everytime user types something
    async update() {
        console.log("updating", this.wordDelta)
        let id = "notes"
        this.updateCurrentState(this.element.value)
        this.updateDelta()

        // if they added 40 or more words
        if (this.wordDelta >= 40 && this.stringDelta > 0) {
            console.log("sending data to chat GPT")

            if (localStorage.getItem(id) != null) {
                let newText = getNewText(this.intitialState, this.currentState, true)
                console.log("detected new text:", newText)

                await this.getResponse(id, newText)    
                let response = GPTdata
                console.log(response)

                let localdata = JSON.parse(localStorage.getItem(id))

                let newkeys = {}

                for (let res in response) {
                    let closest = findClosestMatch(newText, res, 2, true).join(" ")
                    console.log("closest:", closest)

                    if (!(closest in localdata)) {
                        localdata[closest] = response[res]
                        newkeys[closest] = response[res]
                    }
                }

                localStorage.setItem("notes", JSON.stringify(localdata))

                let customstorage_event = new CustomEvent("mystorage")
                customstorage_event.key = newkeys
                window.dispatchEvent(customstorage_event)

            }

            this.updateInitialState(this.element.value)
            this.wordDelta = 0
        }
    }
}