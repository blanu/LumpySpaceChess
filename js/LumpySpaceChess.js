var boardSize=3;
var hexSize=50;

var images;

var actors;
var actorObjects=[];

var board;
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
    snail: {
        x: 0,
        y: 300,
    },
    bmo: {
        x: 0,
        y: 400,
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
var player=1;

var selected=null;

var offsets=[];

function nextPlayer()
{
    if(player==1)
    {
        player=2;
    }
    else
    {
        player=1;
    }
}

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
    console.log('piece clicked');
    console.log(this);           
    
    mode=PLACE;
    selected=this;
}

function tileClicked()
{
    console.log('tile clicked');
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

function actorClicked()
{
    console.log('clicked actor');
    console.log(this);
    
    var x=this.attrs.hexX;
    var y=this.attrs.hexY;
    
    console.log('I am at '+x+' '+y);
    
    mode=MOVE;
    selected=this;
}

function placePiece(tile)
{
    console.log('placePiece');
    
    if(selected==null)
    {
        return;
    }
    
    console.log(selected);
    console.log(tile);
    
    var xpos=tile.attrs.hexX;
    var ypos=tile.attrs.hexY;
    
    var x=calculateActorX(xpos, ypos);
    var y=calculateActorY(ypos);
    
    var actor=new Kinetic.Sprite({
        hexX: xpos,
        hexY: ypos,
        x: x,
        y: y,
        image: selected.attrs.image,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
    });

   actor.on('click', actorClicked);                

   actors.add(actor);
   actorObjects.push(actor);   

    console.log('actor:');
    console.log(actor);
    
    actor.setAnimation('bounce');
    actor.start();   
    
    tile.attrs.player=player;
    if(player==1)
    {
        console.log('tile:');
        console.log(tile);
        console.log(images.player1tile);
        tile.setFill({image: images.player1tile, offset: [0,0]});
    }
    else
    {
        tile.setFill({image: images.player2tile, offset: [0,0]});
    }
    
    board.draw();
    
    nextPlayer();
    
    selected=null;
}

function movePiece(tile)
{
    console.log('movePiece');
    console.log(selected);
    
    if(selected==null)
    {
        return;
    }    

    if(player==1)    
    {
        tile.setFill({
            image: images.player1tile,
            offset: [0,0],
        });
    }
    else
    {
        tile.setFill({
            image: images.player2tile,
            offset: [0,0],
        });        
    }
    
    board.draw();
    
    var xpos=tile.attrs.hexX;
    var ypos=tile.attrs.hexY;
    
    var x=calculateActorX(xpos, ypos);
    var y=calculateActorY(ypos);
    
    console.log('moving '+xpos+' '+ypos+' '+selected);
        
    selected.attrs.hexX=tile.attrs.hexX;
    selected.attrs.hexY=tile.attrs.hexY;
    
    selected.transitionTo({
        x: x,
        y: y,
        duration: 0.5, 
    });
    
    selected=null;
    nextPlayer();
}

function precalculateOffsets()
{
    offsets=[];
    var offset=boardSize-1;
    for(var y=0; y<boardSize*2-1; y++)
    {    
        offsets.push(offset);
        if(y<boardSize/2)
        {
            offset--;
        }
        else if(y==boardSize || y==boardSize+1)
        {
        }
        else
        {
        }                
    }    
}

function calculateTileX(x, y)
{
    var offset=offsets[y];
    return 50+(x*hexSize*1.8)+(((hexSize/2)*y*1.8))+(offset*hexSize*1.8);
}

function calculateTileY(y)
{
    return 50+(y*hexSize*1.6);
}

function calculateActorX(x, y)
{
    var xpos=calculateTileX(x, y);
    return xpos-50;
}

function calculateActorY(y)
{
    var ypos=calculateTileY(y);
    return ypos-90;
}

function initBoard(stage)
{
    board=new Kinetic.Layer();

    var rowLength=boardSize;
    for(var y=0; y<boardSize*2-1; y++)
    {    
        var boardRow=[];
        boardObjects.push(boardRow);
        for(var x=0; x<rowLength; x++)
        {                
            var xpos=calculateTileX(x, y);
            var ypos=calculateTileY(y);
            
            var tile=new Kinetic.RegularPolygon({
                hexX: x,
                hexY: y,
                player: 0,
                x: xpos,
                y: ypos,
                sides: 6,
                radius: hexSize,
                fill: {
                    image: images.defaultTile,
                    offset: [0,0],
                },
                stroke: 'gray',
                strokeWidth: 2,
            });    
            
            tile.on('click', tileClicked);
            board.add(tile);
        }
        
        if(y<boardSize/2)
        {
            rowLength++;
        }
        else if(y==boardSize || y==boardSize+1)
        {
            rowLength--;            
        }
        else
        {
            rowLength--;
        }        
    }
    
    stage.add(board);    
}

function initPieces(stage)
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

function initActors(stage)
{
   actors=new Kinetic.Layer();
    
   stage.add(actors);   
}

function initStage(imageAssets, audioAssets)
{
    images=imageAssets;

    var stage=new Kinetic.Stage({
        container: 'container',
        width: 640,
        height: 480,
    });

    initBackground(stage);    
    initBoard(stage);
    initPieces(stage);
    initActors(stage);
} 

function initLumpySpaceChess()
{
    mode=SELECT;

    var imageSources={
        jake: 'assets/jake.png',
        finn: 'assets/fin.png',
        lsp: 'assets/LSP.png',
        snail: 'assets/snail.png',
        bmo: 'assets/Bmo.png',
        defaultTile: 'assets/tile.png',
        player1tile: 'assets/player1tile.png',
        player2tile: 'assets/player2tile.png',
    };
    
/*
    var audio={
        beach: 'beach.png',
    };
*/
    
    precalculateOffsets();
    
//    loadAssets(images, audio, initStage);
    loadAssets(imageSources, [], initStage);
}

$(document).ready(initLumpySpaceChess);