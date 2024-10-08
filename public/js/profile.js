
function loadList(activitieslist) {
    let list = document.getElementById("activitiesList")
    activitieslist = JSON.parse(activitieslist)
  
    for (let activity in activitieslist) {
        let item = document.createElement("li")
        item.innerText = activitieslist[activity]
        list.appendChild(item)
    }
  }