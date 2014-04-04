$(document).ready(function(){

	var col;
	var row;
	var cell;
	var piece;

	//get checker
		$("table#checkerboard td").click(function(){
			col = parseInt($(this).index());
			row = parseInt($(this).parent().index());
			cell = document.getElementById('checkerboard').rows[row].cells[col];
			piece = $(cell).find("img");
		});

	alert(piece);

	//curent mouse position

	// var current = {x:0, y:0};
	// var cell;

	// //get mouse position		
	// $("#boardCanvas").mousemove(function(event){
	// 	current = { x : -155, y: -11};
	// 	current.x = current.x + event.pageX;
	// 	current.y = current.y + event.pageY;
	// 	cell = document.getElementById("checkerboard").elementFromPoint(current.x,current.y);
	// 	console.log(cell);
	// })


	// //pick up checker at cell
	// $(cell).click(function(){
	// 	alert("hi");
	// });



	// $("#boardCanvas").click(function(){
	// 	var text = $(this)
	// 		.closest('tr')
	// 		.find('img')
	// 		.attr('src','graphics/red-king.png');
	// })




})