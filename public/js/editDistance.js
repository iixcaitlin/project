function wordDistance(word1, word2) {
	let grid = [];
	for (let i = 0; i < word2.length + 1; i++) {
		let t = []
		for (let j = 0; j < word1.length + 1; j ++){
			t.push(0)
		}
		grid.push(t)
	}

	for (let row = 0; row < word2.length + 1; row++) {
		for (let col = 0; col < word1.length + 1; col++) {

			if (row === 0 || col === 0) {
				grid[row][col] = row + col;
			} else {
				let same;
				if (word1[row-1] == word2[col-1]) {
					same = 0
				} else {
					same = 1
				}

				let smallest = Math.min(grid[row - 1][col], grid[row - 1][col - 1], grid[row][col - 1])

				grid[row][col] = smallest + same
			}
		}
	}
	return grid[grid.length - 1][grid[0].length - 1]
}


function findClosestMatch(text, phrase, delta, punctuation = false){

	text = text.trim().replaceAll("\n", " ")
	phrase = phrase.trim().replaceAll("\n", " ")

	/**
	 * this method returns the closest matching string to given phrase 
	 * delta = acceptable error
	 * 
	 */
	let low = 99999
	let closest = []
	let start = null
	let end = null 
	//delete all punctation, or chars thats are not alpha numeric
	if (punctuation == false) {
		text = text.replace(/[^a-zA-Z0-9\n ]/g, "")
		phrase = phrase.replace(/[^a-zA-Z0-9\n ]/g, "")	
	}

	text = text.trim().split(" ")
    let words = phrase.trim().split(" ")	

	for ( let i = 0; i < (text.length - words.length)+1; i ++){
        let slice = text.slice(i,i+words.length)
		
		let d = wordDistance(slice, words)
		if (d < low){
			if (slice.length> words.length){
				closest = slice.slice(0,slice.length-1)
			}else{
				closest = slice
			}
			low = d 
		}
    }

	if (low <= delta){
		return closest // returns a list
	}else{
		return []
	}
}



function getNewText(initialText, currentText, punctuation = false){
	let initial = initialText.trim().replaceAll("\n", " ")
	let current = currentText.trim().replaceAll("\n", " ")

	// for textArea difference 
	if (initialText.length > currentText.length){
		return
	}
	let low = 99999
	let closest = []
	let start = null
	let end = null 
	//delete all punctation, or chars thats are not alpha numeric

	if (punctuation == false) {
		initial = initialText.replace(/[^a-zA-Z0-9 ]/g, "")
		current = currentText.replace(/[^a-zA-Z0-9 ]/g, "")
	}

	console.log("initial after replace:",initial)
	console.log("current after replace:",current)
	initial = initial.trim().split(" ")
    current = current.trim().split(" ") // always the longer text bc the change is positive

	for ( let i = 0; i < (current.length - initial.length)+1; i ++){
        let slice = current.slice( i , i + initial.length)
		
		let d = wordDistance(slice, initial)
		if (d < low){
			start = i
			end = i+initial.length
			closest = slice
			low = d 
		}
    }
	return current.slice(end, current.length).join(" ")
}


function changed(text, phrase){
    /*
	 * this function is used to find which highlight spantag is being modified 
	 * 
	 */
    text = text.replace(/[^a-zA-Z0-9 ]/g, "") // replace everything except for letters!
    text = text.split(" ")
    let words = phrase.split(" ")
    for ( let i = 0; i < (text.length - words.length)+1; i ++){
        let slice = text.slice(i, i+words.length)

        if (JSON.stringify(slice) == JSON.stringify(words)){
            return false
        }
    }

    return true

}


//turn into list
//indexOf() starting word
// export {wordDistance}