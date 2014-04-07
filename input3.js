//Collaborators: Ankush Gupta, Kevin Wang
//Sources consulted: StackOverflow, jQuery UI

    $.extend({
        getUrlVars : function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(
                    window.location.href.indexOf('?') + 1).split('&');
            for ( var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar : function(name) {
            return $.getUrlVars()[name];
        }
    });

    var DEFAULT_BOARD_SIZE = 8;

    //data model
    var board;
    var rules;
    var move;
    var undoList = [];
    var redoList = [];
    var whoseTurn = "black";    

    var directionOf = function(color) {
      if (color == "black") {
        return -1;
      }
      return 1;
    }


    //checks whether or not buttons should be active
    var undoRedo = function(){

        if (undoList.length > 0){
            $("#btnUndo").button( "option", "disabled", false );
        }
        else {
            $("#btnUndo").button( "option", "disabled", true );
        }

        if (redoList.length > 0){
            $("#btnRedo").button( "option", "disabled", false )
        }
        else {
            $("#btnRedo").button( "option", "disabled", true )
        }
    }

    // Toggles the display for whose turn
    // The color parameter should be either "black" or "red"

    var toggleTurn = function(color) {
       if (color==="red") {
        $("#redTurn").hide();
        $("#blackTurn").show();
        whoseTurn = "black";
       }
       else {
        $("#blackTurn").hide();
        $("#redTurn").show();
        whoseTurn = "red";
       }
    }


    $(document).ready(function() {

        //creates instance of board
        if ($.getUrlVar('size') && $.getUrlVar('size') >= 6) {
            board = new Board($.getUrlVar('size'));
        } else {
            board = new Board(DEFAULT_BOARD_SIZE);
        }


    rules = new Rules(board);

        // draw an arrow from original cell to end cell
        var drawArrow = function (fromRow, fromCol, toRow, toCol) {
            var emptyBoard = document.getElementById("boardCanvas");
            var context = emptyBoard.getContext('2d');
            var angle = Math.atan2(toCol - fromCol, toRow-fromRow);
            var tip = 5;
            var rad = Math.PI/6

            context.clearRect(0,0,emptyBoard.width,emptyBoard.height);

            context.beginPath();
            context.moveTo(fromRow,fromCol);
            context.lineTo(toRow,toCol);
            context.lineTo(toRow - tip*Math.cos(-rad+angle),toCol - tip*Math.sin(-rad+angle));
            context.moveTo(toRow,toCol);
            context.lineTo(toRow - tip*Math.cos(-rad+angle),toCol - tip*Math.sin(-rad+angle));
            context.closePath();
            context.strokeStyle = "yellow";
            context.lineWidth = 2;
            context.stroke();

        }

        board.addEventListener('add',function (e) {
            var column = e.details.col;
            var row = e.details.row;
            var checker = e.details.checker;
            var color = e.details.checker.color;
            var isKing = e.details.checker.isKing;
            lowerArrowIndex;

            //add checker to board
            if (color==="red"){
                if (isKing) {            
                    $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/red-king.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='red'/></div>");
                }
                else {
                     $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/red-piece.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='red'/></div>");
                }
            }
            else {
                $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("");
            if (isKing) {            
                    $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/black-king.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='black'/></div>");
                }
                else {
                     $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/black-piece.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='black'/></div>");
                }            }
            $("#checkerboard #check").addClass("ui-draggable");
            $("#checkerboard #check").attr("position","relative");
            $("#checkerboard #check").attr("aria-disabled","false");
            raiseArrowIndex;

        },true);

        board.addEventListener('move',function (e) {
            var color = e.details.checker.color;
            var isKing = e.details.checker.isKing;
            lowerArrowIndex;

            //Updates board by "moving" checkers
            if (color==="red"){
            $("#checkerboard tr:eq("+e.details.fromRow+") td:eq("+e.details.fromCol+")").empty().append("");
                if (isKing) {            
                    $("#checkerboard tr:eq("+e.details.toRow+") td:eq("+e.details.toCol+")").empty().append("<div class='piece'><img src='graphics/red-king.png' row='"+e.details.toRow+"' col='"+e.details.toCol+"' id='check' id='red'/></div>");
                }
                else {
                     $("#checkerboard tr:eq("+e.details.toRow+") td:eq("+e.details.toCol+")").empty().append("<div class='piece'><img src='graphics/red-piece.png' row='"+e.details.toRow+"' col='"+e.details.toCol+"' id='check' id='red'/></div>");
                }
            }
            else {
                $("#checkerboard tr:eq("+e.details.fromRow+") td:eq("+e.details.fromCol+")").empty().append("");
            if (isKing) {            
                    $("#checkerboard tr:eq("+e.details.toRow+") td:eq("+e.details.toCol+")").empty().append("<div class='piece'><img src='graphics/black-king.png' row='"+e.details.toRow+"' col='"+e.details.toCol+"' id='check' id='black'/></div>");
                }
                else {
                     $("#checkerboard tr:eq("+e.details.toRow+") td:eq("+e.details.toCol+")").empty().append("<div class='piece'><img src='graphics/black-piece.png' row='"+e.details.toRow+"' col='"+e.details.toCol+"' id='check' id='black'/></div>");
                }            }


                $("#checkerboard #check").addClass("ui-draggable");
                $("#checkerboard #check").attr("position","relative");
                $("#checkerboard #check").attr("aria-disabled","false");
            //Draws arrow on move
            drawArrow((e.details.fromCol + 0.5) * dimension, (e.details.fromRow + 0.5) * dimension,
                  (e.details.toCol + 0.5) * dimension, (e.details.toRow + 0.5) * dimension);
            raiseArrowIndex;
        },true);

        board.addEventListener('remove', function(e) {
            var column = e.details.col;
            var row = e.details.row;
            lowerArrowIndex;
            //removes checker from board
            $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("");
            $("#checkerboard #check").addClass("ui-draggable");
            $("#checkerboard #check").attr("position","relative");
            $("#checkerboard #check").attr("aria-disabled","false");
            raiseArrowIndex;
        }, true);


        board.addEventListener('promote',function (e) {
            var column = e.details.col;
            var row = e.details.row;
            var checker = e.details.checker;
            lowerArrowIndex;
            //turns regular checker into king piece
            if (checker.color==="red"){
                $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/red-king.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='red'/></div>")
            }
            else {
                $("#checkerboard tr:eq("+row+") td:eq("+column+")").empty().append("<div class='piece'><img src='graphics/black-king.png' row='"+e.details.row+"' col='"+e.details.col+"' id='check' id='black'/></div>")
            }
            $("#checkerboard #check").addClass("ui-draggable");
            $("#checkerboard #check").attr("position","relative");
            $("#checkerboard #check").attr("aria-disabled","false");
            raiseArrowIndex;
        },true);


        
        //new game button functionality
        $("#btnNewGame").click(function(evt) {
            //new game board
            board.prepareNewGame();

            //clear board
            var emptyBoard = document.getElementById("boardCanvas");
            var context = emptyBoard.getContext('2d');
            context.clearRect(0,0,emptyBoard.width,emptyBoard.height);
            toggleTurn("red");
        });

        //auto move button functionality
        $("#btnAutoMove").click(function(evt) {

          var emptyBoard = document.getElementById("boardCanvas");
          var context = emptyBoard.getContext('2d');
          context.clearRect(0,0,emptyBoard.width,emptyBoard.height);

          var playerColor = whoseTurn;
          var playerDirection = directionOf(playerColor);
          var move = rules.makeRandomMove(playerColor, playerDirection);
          if (move !== null) {
            toggleTurn(whoseTurn);
            redoList = [];
            undoList.push(move);
            undoRedo();
          }
        });


        $("#btnUndo").click(function(evt){
            toggleTurn(whoseTurn);
            var undoMove = undoList.pop();        
            var checker = board.getCheckerAt(undoMove.to_row,undoMove.to_col);

            var oldRow = undoMove.from_row;
            var oldCol = undoMove.from_col;
            var kingStatus = undoMove.made_king;

            //check if checker became a king
            if (kingStatus) {
                checker.isKing = false; 
            }

            console.log(oldRow);
            console.log(oldCol);

            if (checker.color==="red"){
                if (checker.isKing){
                    $("#checkerboard tr:eq("+oldRow+") td:eq("+oldCol+")").empty().append("<div class='piece'><img src='graphics/red-king.png' row='"+oldRow+"' col='"+oldCol+"' id='check' id='red'/></div>")
                }
                $("#checkerboard tr:eq("+oldRow+") td:eq("+oldCol+")").empty().append("<div class='piece'><img src='graphics/red-piece.png' row='"+oldRow+"' col='"+oldCol+"' id='check' id='red'/></div>")
            }
            else {
                if (checker.isKing) {
                    $("#checkerboard tr:eq("+oldRow+") td:eq("+oldCol+")").empty().append("<div class='piece'><img src='graphics/black-king.png' row='"+oldRow+"' col='"+oldCol+"' id='check' id='black'/></div>")
                }
                $("#checkerboard tr:eq("+oldRow+") td:eq("+oldCol+")").empty().append("<div class='piece'><img src='graphics/black-piece.png' row='"+oldRow+"' col='"+oldCol+"' id='check' id='black'/></div>")
            }

            //move checker to old position
            board.moveTo(checker,oldRow,oldCol);

            //add back any removed checkers
            var eaten = undoMove.remove;
            console.log(eaten[0]);
            if (eaten.length > 0){
            for (var j=0; j<eaten.length;j++){
                var removedChecker = new Checker(eaten[j].color,eaten[j].isKing);
                board.add(removedChecker,eaten[j].row,eaten[j].col);
            }
            }
            redoList.push(undoMove);
            undoRedo();
            
        })

        $("#btnRedo").click(function(evt){
            toggleTurn(whoseTurn);
            var redoMove = redoList.pop();
            var checker = board.getCheckerAt(redoMove.from_row,redoMove.from_col);

            var newRow = redoMove.to_row;
            var newCol = redoMove.to_col;
            var kingStatus = redoMove.made_king;

            //check if checker became a king
            if (kingStatus) {
                checker.isKing = true;
            }

            if (checker.color==="red"){
                if (checker.isKing){
                    $("#checkerboard tr:eq("+newRow+") td:eq("+newCol+")").empty().append("<div class='piece'><img src='graphics/red-king.png' row='"+newRow+"' col='"+newCol+"' id='check' id = 'red'/></div>")
                }
                $("#checkerboard tr:eq("+newRow+") td:eq("+newCol+")").empty().append("<div class='piece'><img src='graphics/red-piece.png' row='"+newRow+"' col='"+newCol+"' id='check' id = 'red'/></div>")
            }
            else {
                if (checker.isKing){
                    $("#checkerboard tr:eq("+newRow+") td:eq("+newCol+")").empty().append("<div class='piece'><img src='graphics/black-king.png' row='"+newRow+"' col='"+newCol+"' id='check' id = 'black'/></div>")
                }
                $("#checkerboard tr:eq("+newRow+") td:eq("+newCol+")").empty().append("<div class='piece'><img src='graphics/black-piece.png' row='"+newRow+"' col='"+newCol+"' id='check' id='black'/></div>")
            }

            //move checkers to old position
            board.moveTo(checker,newRow,newCol);

            //remove any added pieces
            var newPieces = redoMove.remove 
            for (var j=0; j<newPieces.length;j++){
                board.removeAt(newPieces[j].row,newPieces[j].col)
            }
            
            undoList.push(redoMove);
            undoRedo();
             
        })
// Creates variable size checkerboard
    
    function newCheckerboard(boardSize){

        // Create board
        var newRow = $("<tr/>");
        var cols;

        //Create each row
        for (j=0; j<boardSize; j++) {
            cols += "<td id='cell'>&nbsp;</td>";
        }

        //Create each cell
        for (i=0; i<boardSize;i++){
            newRow.append(cols);
            $("#checkerboard").append(newRow);
            newRow = $("<tr/>");
        }

        //Dynamically change board cell size
        dimension = 400/boardSize;
        $("#checkerboard td").css("height",dimension);
        $("#checkerboard td").css("width",dimension);
    }    

    //Adjust z index of arrow canvas when checker piece is dragged/dropped
    var raiseArrowIndex = function(){
        $("#boardCanvas").attr("z-index",10)
    }
    var lowerArrowIndex = function(){
        $("#boardCanvas").attr("z-index",-1)
    }




    //Create new board on document ready
    newCheckerboard(board.boardSize);
    board.prepareNewGame();
    
    //Drag and drop functions
    $("#checkerboard #check").draggable({
        stop: function (event, ui) {
        $("#checkerboard #check").draggable("enable");
         },
        containment:'#checkerboard',
        revert:true,
        zIndex:10
    });

    $("#checkerboard tr td").droppable({
        accept:"#checkerboard #check",
        drop: function (event, ui){
            var checker = board.getCheckerAt($(ui.draggable[0]).attr("row"),$(ui.draggable[0]).attr("col"));
            if (checker.color==="red"){
                $("#checkerboard tr:eq("+$(ui.draggable[0]).attr("row")+") td:eq("+$(ui.draggable[0]).attr("col")+")").on('dragstart', function(event) { 
                    event.preventDefault(); 
                });
            }
            else {
                $("#checkerboard tr:eq("+$(ui.draggable[0]).attr("row")+") td:eq("+$(ui.draggable[0]).attr("col")+")").on('dragstart', function(event) { 
                        event.preventDefault(); 
                    });
            }
            var move = rules.makeMove(checker,directionOf(whoseTurn),directionOf(checker.color),$(event.target).parent().index(),$(event.target).index());
            if (move !== null) {
                toggleTurn(whoseTurn);
                undoList.push(move);
                undoRedo();
            }
            
        }
        
    })

//Prevents button error message
$( "input[type=button]" ).button().click( function(event) {
        event.preventDefault();
    });

$( "#checkerboard #check" ).draggable().click( function(event) {
        event.preventDefault();
    });


    undoRedo();




    });



