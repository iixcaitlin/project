function myHash(password, salting = false){
	const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"
	let salt = ""

	if (salting){
		for (let i = 0; i < 5; i++){
			salt += code[Math.floor(Math.random() * code.length)]
		}
	}

	
	let new_password = ""
	let salt_password = password + salt

	//hash
	for (let i=0; i < salt_password.length; i++){
		let letter = salt_password[i]
		new_password += code[(code.indexOf(letter) + 4) % code.length]
		console.log()
	}
	
	console.log(new_password)
	return [new_password, salt]
}


module.exports = myHash