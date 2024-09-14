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

console.log(wordDistance("natlan", "batman"))


module.exports = {wordDistance: wordDistance}