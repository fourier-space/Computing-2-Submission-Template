
let canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");   //the canvas context 
const score = document.querySelector("#score")

canvas.width = window.innerWidth;    //set the canvas to height and width of screen
canvas.height = window.innerHeight;


class Wall{  
	static width = 40           //used later on for baord creation
	static height = 40 			//this will define the characteristics for the wall (a blocked off square)
	constructor({position,image}) {       //constructor needed cause each wall needs its own special properties (e.g position)
		this.position = position  	//position is got, with height and width of wall
		this.width = 40				//the position is variable, not static like width
		this.height = 40			//'position' arguement passed within an object (deonted by{}) as a property
		//this.image = image
	}

	draw() {	
						//draw function determines what the wall looks like
		c.fillStyle = 'blue'  		//Set the wall colour to blue
		c.fillRect(this.position.x, this.position.y,
		  this.width, this.height)  //Draws the sqaure and fills rectangle
		//c.drawImage(this.image, this.position.x,this.position.y)
	}
}


class Player{             //creates player/pacman
	constructor({position, speed}){
		this.position = position
		this.speed = speed 
		this.radius = 15          //radius of pacman figure

	}

	draw(){
		c.beginPath()
		c.arc(this.position.x , this.position.y, this.radius,
			 0, Math.PI * 2)      //The 0 is starting angle (0 radians), the arguement after is end angle (2 radians, aka 360 degrees)
		c.fillStyle = 'yellow'    //colour of circle 
		c.fill()     			  //filling circle 
		c.closePath() 			
	}

	update() {
		this.draw()
		this.position.x += this.speed.x   //every frame position updated by speed
		this.position.y += this.speed.y 
	}
}

class Ghost{             //creates player/pacman
	constructor({position, speed,colour = 'red'}){
		this.position = position
		this.speed = speed 
		this.radius = 15          //radius of pacman figure
		this.colour = colour
		this.prevCollisions = []

	}

	draw(){
		c.beginPath()
		c.arc(this.position.x , this.position.y, this.radius,
			 0, Math.PI * 2)      //The 0 is starting angle (0 radians), the arguement after is end angle (2 radians, aka 360 degrees)
		c.fillStyle = this.colour    //colour of circle 
		c.fill()     			  //filling circle 
		c.closePath() 			
	}

	update() {
		this.draw()
		this.position.x += this.speed.x   //every frame position updated by speed
		this.position.y += this.speed.y 
	}
}


class Pellet{             //creates player/pacman
	constructor({position}){
		this.position = position
		this.radius = 3          //radius of pacman figure

	}

	draw(){
		c.beginPath()
		c.arc(this.position.x , this.position.y, this.radius,
			 0, Math.PI * 2)      //The 0 is starting angle (0 radians), the arguement after is end angle (2 radians, aka 360 degrees)
		c.fillStyle = 'white'    //colour of circle 
		c.fill()     			  //filling circle 
		c.closePath() 			
	}
}

const pellets = []
const boundaries = []
const enemys = [
	new Ghost({
		position: {
			x : Wall.width * 6 + Wall.width/2,     //position where pacman starts
			y : Wall.height + Wall.height/2
		},
		speed: {
			x:0,
			y:0
		}
	})
]
const player = new Player({    //player is object with position and speed param
	position: {
		x : Wall.width + Wall.width/2,     //position where pacman starts
		y : Wall.height + Wall.height/2
	},
	speed: {
		x : 0,     
		y : 0
	}
})


const keys = {
	w: {
		pressed : false             //set to false as 'w' key not pressed by default
	},
	a: {
		pressed : false             //set to false as 'w' key not pressed by default
	},
	s: {
		pressed : false             //set to false as 'w' key not pressed by default
	},
	d: {
		pressed : false             //set to false as 'w' key not pressed by default
	}
} // {} = an object 

let lastKey = ''   
let score1 = 0

const map = [
	['-', '-', '-', '-', '-','-','-','-','-'],   //creates the map layout
	['-', '.', ' ', ' ', ' ',' ','.','.','-'],
	['-', '.', '-', ' ', '-',' ','-','.','-'],
	['-', ' ', ' ', ' ', ' ',' ','-','.','-'],
	['-', '.', '-', ' ', '-','.','-','.','-'],
	['-', ' ', ' ', '.', ' ',' ','-',' ','-'],
	['-', ' ', '-', '-', ' ','-','-',' ','-'],
	['-', '.', '.', '.', '.','.','.','.','-'],
	['-', '-', '-', '-', '-','-','-','-','-'],
	]

//const image = new Image()
//image.src = './images/pipeHorizontal.png'

map.forEach((row,i) => {           //row/i is y co ord , column/row/j is x co ord
	row.forEach((symbol,j) => {    //iterate through layout and switch the '-' with a wall object
		switch (symbol) {          //symbol name is used as '-' is a symbol
			case '-': 
				boundaries.push(   //push new wall into wall array if condition met
					new Wall({     //Wall created and position is determined using index
						position: {
							x: Wall.width * j ,  //this works because each e.g x co ord of 2nd block will start at 1 (index) x 40 pixels which is next to second block
							y: Wall.height * i 
						}
						//image: image
					})
				)
				break   //breaks out of the switch case statement
			case '.': 
				pellets.push(   //push new wall into wall array if condition met
					new Pellet({     //Wall created and position is determined using index
						position: {
							x: Wall.width * j + Wall.width  / 2 ,  //this works because each e.g x co ord of 2nd block will start at 1 (index) x 40 pixels which is next to second block
							y: Wall.height * i + Wall.height / 2
						}
						//image: image
					})
				)
				break 
		}
	})
})


function circleCollidesWithRectangle({
	circle,
	rectangle
}){
	return(circle.position.y - circle.radius + circle.speed.y <= rectangle.position.y    //(if top of the circle +/- speed [because we don't want the pacman to touch the wall because then speed will be set to 0 and the ball will stop forever]<= the bottom of the top rectangle )
			+ rectangle.height && circle.position.x + circle.radius + circle.speed.x >= rectangle.position.x &&
			circle.position.y + circle.radius + circle.speed.y >= rectangle.position.y &&
			circle.position.x - circle.radius +circle.speed.x <= rectangle.position.x + rectangle.width)
}

function animate() {
	animationId = requestAnimationFrame(animate)   //draws out the player and boundaries every frame, requestanimationframe takes an arguement which it loops through, this arguement is the parent function. This means whenever we complete one frame we call the animet function again, creates infinite loop
	c.clearRect(0,0, canvas.width, canvas.height)  //clears
	
	if (keys.w.pressed && lastKey === 'w') {
		for (let i = 0; i < boundaries.length; i++) {  //loop through all boundaries
			const wall = boundaries[i]
			if  (
				circleCollidesWithRectangle({
					circle: {
						...player, 
						speed: {
						x: 0,
						y: -5 }},

					
					    //... all player properties of player object 
					rectangle: wall
				}))
			    {
				player.speed.y = 0
				break 
			}	else {
				player.speed.y = -5
				
			}
		}
	}   else if (keys.a.pressed && lastKey === 'a') {
		for (let i = 0; i < boundaries.length; i++) {  //loop through all boundaries
			const wall = boundaries[i]
			if  (
				circleCollidesWithRectangle({
					circle: {
						...player, 
						speed: {
						x: -5,
						y: 0 }},
					    //... all player properties of player object 
					rectangle: wall
				}))
			    {
				player.speed.x = 0
				break 
			}	else {
				player.speed.x = -5
				
			}
		}
	}   else if (keys.s.pressed && lastKey === 's') {
 		for (let i = 0; i < boundaries.length; i++) {  //loop through all boundaries
			const wall = boundaries[i]
			if  (
				circleCollidesWithRectangle({
					circle: {...player, speed:{
						x: 0,
						y: 5
					}},    //... all player properties of player object 
					rectangle: wall
				})
			)   {
				player.speed.y = 0
				break
			}	else {
				player.speed.y = 5
			}
		}
	}   else if (keys.d.pressed && lastKey === 'd') {
		for (let i = 0; i < boundaries.length; i++) {  //loop through all boundaries
			const wall = boundaries[i]
			if  (
				circleCollidesWithRectangle({
					circle: {
						...player, 
						speed: {
						x: 5,
						y: 0 }},

					
					    //... all player properties of player object 
					rectangle: wall
				}))
			    {
				player.speed.x = 0
				break 
			}	else {
				player.speed.x = 5
				
			}
		}					//lastkey needed because if you press another key down while another being pressed, without last key value, this second press wont be registered
	}

	//pellets toucher here
	for (let i = pellets.length -1 ; 0 < i; i--){  //done in reverse so that no wierd flickering occurs
		const pellet = pellets[i]
		pellet.draw()

		if (Math.hypot(pellet.position.x - player.position.x,
			pellet.position.y - player.position.y) < pellet.radius
			+ player.radius){
			pellets.splice(i,1)
			score1 += 5
			score.innerHTML = score1
		}
	}
	





	boundaries.forEach((wall) => {    //draw boundaries in array
		wall.draw()

		if ( 
			circleCollidesWithRectangle({
				circle: player,
				rectangle: wall
			})
		)   {
			player.speed.x = 0
			player.speed.y = 0
		}           
		
	})

//enemy touches the player
	
	player.update()   //draws out position and speed of player per frame
	enemys.forEach((enemy) => {
		enemy.update()
			if (Math.hypot(enemy.position.x - player.position.x,
			enemy.position.y - player.position.y) < enemy.radius
			+ player.radius){
				cancelAnimationFrame(animationId)
				console.log('lost the game')
			}


	if (pellets.length === 0){
		console.log('you win')
		cancelAnimationFrame(animationId)
	}


		const collisions = []
		boundaries.forEach((wall) =>{
			if  (
				!collisions.includes('right') &&
				circleCollidesWithRectangle({
					circle: {
						...enemy, 
						speed: {
						x: 5,
						y: 0 }},

					
					    //... all player properties of player object 
					rectangle: wall
				})) {
				collisions.push('right')
			}

			if  (
				!collisions.includes('left') &&
				circleCollidesWithRectangle({
					circle: {
						...enemy, 
						speed: {
						x: -5,
						y: 0 }},

					
					    //... all player properties of player object 
					rectangle: wall
				})) {
				collisions.push('left')
			}

			if  (
				!collisions.includes('up') &&
				circleCollidesWithRectangle({
					circle: {
						...enemy, 
						speed: {
						x: 0,
						y: -5 }
					},

					
					    //... all player properties of player object 
					rectangle: wall
				})) {
				collisions.push('up')
			}
			if  (
				!collisions.includes('down') &&
				circleCollidesWithRectangle({
					circle: {
						...enemy, 
						speed: {
						x: 0,
						y: 5 }
					},

					
					    //... all player properties of player object 
					rectangle: wall
				})) {
				collisions.push('down')
			}
		})
		if (collisions.length > enemy.prevCollisions.length) //enemy collides with something
			enemy.prevCollisions = collisions


	if (pellets.length === 0){
		console.log('you win')
		cancelAnimationFrame(animationId)
	}

	})

	if (pellets.length === 0){
		console.log('you win')
		cancelAnimationFrame(animationId)
	}

//	player.speed.y = 0
//	player.speed.x = 0



}

animate()




window.addEventListener('keydown' , ({key}) => {     //key is the characterstic of the event object which specifies which key on keyboard you pressed
	console.log(key)
	switch(key){                  //checks if w key pressed, if the key's value is w that means it is pressed and therefore is pressed = true
		case 'w':
			keys.w.pressed = true
			lastKey = 'w'
			break
		case 'a':
			keys.a.pressed = true
			lastKey = 'a'
			break
		case 's':
			keys.s.pressed = true
			lastKey = 's'
			break
		case 'd':
			keys.d.pressed = true
			lastKey = 'd'
			break
	}


})

window.addEventListener('keyup' , ({key}) => {     //key is the characterstic of the event object which specifies which key on keyboard you pressed
	console.log(key)
	switch(key){
		case 'w':
			keys.w.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 's':
			keys.s.pressed = false
			break
		case 'd':
			keys.d.pressed = false
			break
	}
if (pellets.length === 0){
	cancelAnimationFrame(animationId)
	console.log('you win')}

})

if (pellets.length === 0){
	cancelAnimationFrame(animationId)
	console.log('you win')
}

//console.log(c);
