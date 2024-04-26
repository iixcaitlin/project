const saveBtn = document.getElementById("saveBtn")

function saveEntry(id){
    var title = document.getElementById("title").innerText
    var text = document.getElementById("text").innerText

    console.log("title:", title)
    console.log("text:", text)

    fetch(`/edit/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title,
            text: text,
        })
    })
}