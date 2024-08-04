async function check(id){
    console.log('function is running', document.getElementById("highlights").innerHTML)
    let loading = document.createElement("div")
    loading.className = "loader"
    loading.innerText = "Loading..."
    document.getElementById("responses").appendChild(loading)
    await fetch(`/journal/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: document.getElementById("highlights").innerHTML})
    })
    .then((response) => {
        return response.text()
    })
    .then((data) => {

        console.log("returned data:", data)
        // console.log(typeof data)
        // console.log(JSON.stringify(data))
        // console.log(JSON.parse(data))
        data = dataParse(data)

        document.getElementsByClassName("loader")[0].remove();
        localStorage.setItem(id, data)
        localStorage.setItem("id", id)
        let responseData = JSON.parse(data)
        var num = 1
        if (JSON.stringify(responseData) === "" ) {
            let response = document.createElement("div")
            let x = document.createElement("div")
            x.innerHTML = `<a onclick='deleteResponse(${num})'><i class='x fa-solid fa-xmark'></i></a>`
            response.appendChild(x)
            response.setAttribute("id", `response${num}`)
            response.className = "response"
            response.innerHTML = "Nothing to note!"
            document.getElementById("responses").appendChild(response)
        } else {
            for (key in responseData) {
                let response = document.createElement("div")
                response.setAttribute("id", `response${num}`)
                response.className = "response"
                // dont add new elements then overwrite the HTML
                response.innerHTML = responseData[key]
                let x = document.createElement("div")
                x.innerHTML = `<a onclick='deleteResponse(${num})'><i class='x fa-solid fa-xmark'></i></a>`
                response.appendChild(x)
                document.getElementById("responses").appendChild(response)
                num ++
            }
        }
        entryInput()
    })
    .catch((err) => {
        console.log(err)
    })
    // location.reload()
}


function deleteResponse(num) {
    document.getElementById("response" + num).remove()
}

function dataParse(data) {

    start = data.indexOf("{")
    end = data.indexOf("}")
    data = data.slice(start, end + 1)
    console.log(data)

    return data
}