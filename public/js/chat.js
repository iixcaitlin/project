const chatInput = document.querySelector("#chatInput textarea")
const sendBtn = document.querySelector("#chatInput span")
const chat = document.getElementById("chat")

let msg;
const inputHeight = chatInput.scrollHeight

const createChat = (message, className) => {
    const chatLi = document.createElement("li")
    chatLi.classList.add("chat", className)
    let chatContent =  `<p></p>`
    chatLi.innerHTML = chatContent
    chatLi.querySelector("p").textContent = message
    return chatLi;
}

function logChat(role, message) {
    if (localStorage.getItem("log")){
        let log = JSON.parse(localStorage.getItem("log"))
        log.push({role: role, content: message})
        localStorage.setItem("log", JSON.stringify(log))
    } else {
        newLog = [{role: role, content: message}]
        localStorage.setItem("log", JSON.stringify([{role: role, content: message}]))
    }
}

function chatHistory() {
    let log = JSON.parse(localStorage.getItem("log"))
    for (let i = 0; i < log.length; i++) {
        let msgType;
        let message;
        log[i].role === "user"? msgType = "outgoing": msgType = "incoming"
        log[i].role === "user"? message = log[i].content: message = JSON.parse(log[i].content).response
        let cur = createChat(message, msgType)
        chat.appendChild(cur)
    }
    chat.scrollTo(0, chat.scrollHeight)
}

async function generateResponse(chatResponse){
    await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                log: localStorage.getItem("log"),
            })
        }
    ).then((response) => {
        return response.text()
    })
    .then((data) => {
        let response = JSON.parse(data).response
        try {
            if (JSON.parse(response).response) {
                response = JSON.parse(response).response
            }
        } catch {
            // pass
        }

        logChat("assistant", data)
        chatResponse.innerHTML = `<p>${response}</p>`
    })
    .catch((err) => {
        chatResponse.innerHTML = `<p>There seems to be an error... ${err}</p>`
    })
    .finally(() => {
        chat.scrollTo(0, chat.scrollHeight)
        console.log(chatbox.scrollHeight)
    })
}

const sendChat = () => {
    msg = chatInput.value.trim();
    logChat("user", msg)
    if (!msg) return
    chatInput.value = ""
    chatInput.style.height = `${inputHeight}px`

    chat.appendChild(createChat(msg, "outgoing"))
    chat.scrollTo(0, chat.scrollHeight)

    setTimeout(() => {
        chatResponse = createChat("...", "incoming")
        chat.appendChild(chatResponse)
        chat.scrollTo(0, chat.scrollHeight)
        generateResponse(chatResponse)
    })
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputHeight}px`
    chatInput.style.height = `${chatInput.scrollHeight}px`
})

chatInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendChat()
    }
})

sendBtn.addEventListener("click", sendChat)
chatHistory()