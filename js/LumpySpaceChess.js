var boardSize=3;
var hexSize=50;

var actors;
var actorObjects=[];

var boardObjects=[];

var pieces;
var pieceObjects=[];

var characters={
    jake: {
        x: 0,
        y: 0,
    },
    finn: {
        x: 0,
        y: 100,        
    },
    lsp: {
        x: 0,
        y: 200,        
    },
}

var animations={
    bounce: [
        {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        },
        {
            x: 100,
            y: 0,
            width: 100,
            height: 100,
        },
        {
            x: 200,
            y: 0,
            width: 100,
            height: 100,
        },
        {
            x: 300,
            y: 0,
            width: 100,
            height: 100,
        },            
    ]   
};

var SELECT=0;
var PLACE=1;
var MOVE=2;

var mode=SELECT;

function initBackground(stage)
{
    var background=new Kinetic.Layer();
    
    var rect=new Kinetic.Rect({
        x: 0,
        y: 0,
        width: 640,
        height: 480,
        fill: 'black',
    });
    
    background.add(rect);

    stage.add(background);
}

function pieceClicked()
{
    console.log('clicked piece');
    console.log(this);           
    
    mode=PLACE;
}

function tileClicked(this)
{
    console.log('clicked');
    console.log(this);
    
    if(mode==PLACE)
    {
        placePiece(this);
    }
    else if(mode==MOVE)
    {
        movePiece(this);
    }
}

function placePiece()
{
}

function movePiece(this)
{
    this.setFill('blue');
    board.draw();
    
    var actor=actorObjects[0];
    var xpos=this.attrs.x;
    var ypos=this.attrs.y;
    
    console.log('moving '+xpos+' '+ypos+' '+actor);
    
    /*
    var anim=new Kinetic.Animation({
        func: function(frame) {                    
            actor.setX(xpos);
            actor.setY(ypos);
        },
        node: actors,
    });
    
    anim.start();
    */
    
    actor.attrs.hexX=this.attrs.hexX;
    actor.attrs.hexY=this.attrs.hexY;
    
    actor.transitionTo({
        x: xpos,
        y: ypos,
        duration: 0.5, 
    });
}

function initBoard(stage)
{
    var board=new Kinetic.Layer();

    var offset=boardSize-1;
    var rowLength=boardSize;
    for(var y=0; y<boardSize*2-1; y++)
    {    
        console.log('offset: '+offset);
        var boardRow=[];
        boardObjects.push(boardRow);
        for(var x=0; x<rowLength; x++)
        {                
/*
            if(y%2==0)
            {
                var xpos=50+((x+offset)*hexSize*1.8);
            }
            else
            {
                var xpos=50+((x+offset)*hexSize*1.8)+((hexSize/2)*1.8);                
            }
*/

            var xpos=50+(x*hexSize*1.8)+(((hexSize/2)*y*1.8))+(offset*hexSize*1.8);

            var ypos=50+(y*hexSize*1.6);
            var tile=new Kinetic.RegularPolygon({
                hexX: x,
                hexY: y,
                x: xpos,
                y: ypos,
                sides: 6,
                radius: hexSize,
                fill: 'red',
                stroke: 'gray',
                strokeWidth: 2,
            });    
            
            tile.on('click', tileClicked);
            board.add(tile);
        }
        
        if(y<boardSize/2)
        {
            offset--;
            rowLength++;
        }
        else if(y==boardSize || y==boardSize+1)
        {
            rowLength--;            
        }
        else
        {
//            offset++;
            rowLength--;
        }        
    }
    
    stage.add(board);    
}

function initPieces(stage, images)
{
   pieces=new Kinetic.Layer();
   
   for(character in characters)
   {
       var coords=characters[character];
    
        var charObj=new Kinetic.Sprite({
            x: coords.x,
            y: coords.y,
            image: images[character],
            animations: animations,
            animation: 'bounce',
            frameRate: 10,
        });
    
        charObj.on('click', pieceClicked);                
    
        charObj.setAnimation('bounce');
    
       pieces.add(charObj);
       pieceObjects.push(charObj);   
        
       stage.add(pieces);
       
        charObj.start();       
    }
}

function initActors(stage, images)
{
   actors=new Kinetic.Layer();

    var animations={
        bounce: [
            {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            },
            {
                x: 100,
                y: 0,
                width: 100,
                height: 100,
            },
            {
                x: 200,
                y: 0,
                width: 100,
                height: 100,
            },
            {
                x: 300,
                y: 0,
                width: 100,
                height: 100,
            },            
        ]   
    };

    var player=new Kinetic.Sprite({
        hexX: 0,
        hexY: 0,
        x: 240,
        y: 240,
        image: images.jake,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
    });

   player.on('click', function() {
       console.log('clicked actor');
       console.log(this);
       
       var x=this.attrs.hexX;
       var y=this.attrs.hexY;
       
       log('I am at '+x+' '+y);
    });                

    player.setAnimation('bounce');

   actors.add(player);
   actorObjects.push(player);   
    
   stage.add(actors);
   
    player.start();   
}

function initStage(images, audio)
{
    var stage=new Kinetic.Stage({
        container: 'container',
        width: 640,
        height: 480,
    });

    initBackground(stage);    
    initBoard(stage);
    initPieces(stage, images);
    initActors(stage, images);
} 

function initLumpySpaceChess()
{
    mode=SELECT;

    var images={
        jake: 'assets/jake.png',
        finn: 'assets/fin.png',
        lsp: 'assets/LSP.png',
    };
    
/*
    var audio={
        beach: 'beach.png',
    };
*/
    
//    loadAssets(images, audio, initStage);
    loadAssets(images, [], initStage);
}

$(document).ready(initLumpySpaceChess);