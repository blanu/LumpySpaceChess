var stageWidth=640;
var stageHeight=480;

var boardSize=3;
var hexSize=50;

var images;

var actors;
var actorObjects=[];

var effects;

var board;
var boardObjects=[];

var pieces;
var pieceObjects=[];

var treatures;
var treasureObjects=[];

var characters={
    jake: {
        x: 0,
        y: 0,
        moves: [
            [-1,-1],
            [0,-1],           
            [-1,0],
            [1,0],           
            [1,1],
            [0,1],           
        ],
    },
    finn: {
        x: 0,
        y: 100,        
        moves: [
            [1,0],
        ],
    },
    lsp: {
        x: 0,
        y: 200,        
        moves: [
            [1,1],
        ],        
    },
    snail: {
        x: 0,
        y: 300,
        moves: [
            [0,-1],
        ],        
    },
/*
    bmo: {
        x: 0,
        y: 400,
    },
    loraine: {
        x: 0,
        y: 400,
    }
    ladyrain: {
        x: 0,
        y: 400,
        moves: [
            [-1,0]
        ],        
    },
*/
    bubblegum: {
        x: 0,
        y: 400,
        moves: [
            [-1,0],
        ],        
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

var treasureAnimations={
    sparkle: [
        {
            x: 0,
            y: 0,
            width: 75,
            height: 75,
        },
        {
            x: 75,
            y: 0,
            width: 75,
            height: 75,
        },
        {
            x: 150,
            y: 0,
            width: 75,
            height: 75,
        },
        {
            x: 225,
            y: 0,
            width: 75,
            height: 75,
        },            
    ]
};

var SELECT=0;
var PLACE=1;
var MOVE=2;

var mode=SELECT;
var player=1;

var p1KingPlaced=false;
var p2KingPlaced=false;

var selected=null;

var offsets=[];

var showedSelected=false;

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
    
    generateTreasure();
}

function initBackground(stage)
{
    var background=new Kinetic.Layer();
    
    var rect=new Kinetic.Image({
        x: 0,
        y: 0,
        width: 1080,
        height: 800,
        scale: [0.8, 0.8],
        image: images.background,
    });
    
    background.add(rect);

    stage.add(background);
}

function pieceClicked()
{
    console.log('piece clicked');
    
    mode=PLACE;
    selected=this;
}

function tileClicked()
{
    console.log('tile clicked '+this.attrs.hexX+' '+this.attrs.hexY);

    console.log('redrawing');
    redrawBoard();
    
    if(mode==PLACE)
    {
        placePiece(this);
    }
    else if(mode==MOVE)
    {
        movePiece(this);
    }
}

function generateTreasure()
{
    var r=Math.random()*3;
    console.log('random: '+r);
//    if(r>2)
    if(r>0)
    {
        placeTreasure();
    }
    else
    {
        console.log('no treasure');
    }
}

function placeTreasure()
{
    console.log('placeTreasure');
    var y=Math.floor(Math.random()*boardObjects.length);
    var boardRow=boardObjects[y];
    var x=Math.floor(Math.random()*boardRow.length);
    var tile=boardRow[x];
    console.log('candidate:');
    console.log(tile);
    var actor=getActor(x, y);
    if(actor!=null)
    {
        console.log('treasure blocked');
        return;
    }
    var treasure=getTreasure(x, y);
    if(treasure!=null)
    {
        console.log('already treasure');
        return;
    }
    
    x=0;
    y=0;

    var treasureImage;    
    var value;
    if(Math.random()*4>0)
    {
        treasureImage=images.chest;
        value=5;
    }
    else
    {
        treasureImage=images.coin;
        value=1;
    }
    
    console.log('new treasure! '+x+' '+y);
    treasure=new Kinetic.Sprite({
        x: calculateTreasureX(x, y),
        y: calculateTreasureY(y),
        value: value,
        image: treasureImage,
        animations: treasureAnimations,
        animation: 'sparkle',
        frameRate: 10,
    });
    
    treasures.add(treasure);
    treasureObjects.push(treasure);
    treasure.start();
    treasures.draw();
}

function actorClicked()
{
    console.log('clicked actor');
    
    var x=this.attrs.hexX;
    var y=this.attrs.hexY;
    
    mode=MOVE;
    selected=this;
    
    showedSelected=false;
    
    colorSelected(this);
}

function actorMouseover()
{
    console.log('actor mouseover');
    showedSelected=true;
    colorSelected(this);
}

function actorMouseout()
{
    console.log('actor mouseout');
    
    if(showedSelected)
    {
        if(selected!=this)
        {
            console.log('redrawing');
            redrawBoard();
        }
    }
}

function placePiece(tile)
{
    console.log('placePiece: '+player);
    
    if(selected==null)
    {
        return;
    }
    
    console.log(selected);
    
    var xpos=tile.attrs.hexX;
    var ypos=tile.attrs.hexY;
    
    var x=calculateActorX(xpos, ypos);
    var y=calculateActorY(ypos);
    
    var king;
    if(player==1)
    {
        king=!p1KingPlaced;
        p1KingPlaced=true;
    }
    else
    {
        king=!p2KingPlaced;
        p2KingPlaced=true;
    }    
    
    var actor=new Kinetic.Sprite({
        hexX: xpos,
        hexY: ypos,
        moves: selected.attrs.moves,
        player: player,
        king: king,
        x: x,
        y: y,
        image: selected.attrs.image,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
    });
    
/*
    console.log('new actor: '+actor.attrs.king);
    console.log(actor);
*/
    
   actor.on('click', actorClicked);                
   actor.on('mouseover', actorMouseover);
   actor.on('mouseout', actorMouseout);

   actors.add(actor);
   actorObjects.push(actor);   

    console.log('actor:');
    console.log(actor);
    
    actor.setAnimation('bounce');
    actor.start();   
    
    tile.attrs.player=player;
    
    colorTile(actor, tile);    
    
    nextPlayer();
    
    selected=null;    
}

function colorTile(actor, tile)
{
    if(actor==null)
    {
        tile.setFill({image: images.defaultTile, offset: [50,50]});    
    }
    else
    {
        if(actor.attrs.player==1)
        {
            if(actor.attrs.king)
            {
                tile.setFill({image: images.player1tileking, offset: [50,50]});    
            }
            else
            {
                tile.setFill({image: images.player1tile, offset: [0,0]});                
            }
        }
        else
        {
            if(actor.attrs.king)
            {
                tile.setFill({image: images.player2tileking, offset: [50,50]});    
            }
            else
            {
                tile.setFill({image: images.player2tile, offset: [0,0]});                
            }        
        }
    }
    
    board.draw();    
}

function colorSelected(actor)
{
    console.log('colorSelected');
    console.log(actor);
    
    var tile=getTile(actor.attrs.hexX, actor.attrs.hexY);
    colorSelectedTile(actor, tile, true);

    console.log('coloring moves');
    console.log(actor);
    
    for(var x=0; x<actor.attrs.moves.length; x++)
    {
        var move=actor.attrs.moves[x];
        
        console.log('coloring move');
        console.log(move);
        
        var xoff=move[0];
        var yoff=move[1];
        
        tile=getTile(actor.attrs.hexX+xoff, actor.attrs.hexY+yoff);        

        if(tile!=null)
        {
            colorSelectedTile(actor, tile, false);        
        }
    }
    
    board.draw();
}

function colorSelectedTile(actor, tile, central)
{
    console.log('colorSelectedTile');
    
    var enemy=getActor(tile.attrs.hexX, tile.attrs.hexY);

    if(enemy!=null && enemy.attrs.player!=actor.attrs.player)
    {
        if(actor.attrs.player==1)
        {
            tile.setFill({image: images.player1death, offset: [0,0]});                    
        }
        else
        {
            tile.setFill({image: images.player2death, offset: [0,0]});                                
        }
    }   
    else if(enemy==null || (enemy.attrs.player==actor.attrs.player && central))
    { 
        if(actor.attrs.player==1)
        {
            if(actor.attrs.king && central)
            {
                tile.setFill({image: images.player1tileselectedking, offset: [50,50]});
            }
            else
            {
                tile.setFill({image: images.player1tileselected, offset: [0,0]});            
            }
        }
        else
        {
            if(actor.attrs.king && central)
            {
                tile.setFill({image: images.player2tileselectedking, offset: [50,50]});        
            }
            else
            {
                tile.setFill({image: images.player2tileselected, offset: [0,0]});                    
            }
        }    
    }
}

function movePiece(tile)
{
    console.log('movePiece');
    
    if(selected==null)
    {
        return;
    }    
    
    if(selected.attrs.player!=player)
    {
        console.log('Cheater move, not current player '+selected.attrs.player+' '+player);
        return;
    }

    var attacking=false;    
    var enemy=getActor(tile.attrs.hexX, tile.attrs.hexY);
    if(enemy!=null)
    {
        if(enemy.attrs.player==selected.attrs.player)
        {
            console.log("can't capture your own piece");
            return;
        }
        else
        {
            attacking=true;
            console.log('attacking!');
        }
    }

    console.log('coloring tile:');
    console.log(tile.attrs.hexX+' '+tile.attrs.hexY);    
    var newTile=getTile(tile.attrs.hexX, tile.attrs.hexY);
    console.log(newTile.attrs.hexX+' '+newTile.attrs.hexY);    
    var oldTile=getTile(selected.attrs.hexX, selected.attrs.hexY);
    console.log(oldTile.attrs.hexX+' '+oldTile.attrs.hexY);    

    colorTile(selected, newTile);
    
    var oldTile=getTile(selected.attrs.hexX, selected.attrs.hexY);
    oldTile.setFill({
        image: images.defaultTile,
        offset: [0,0],
    });
    
    board.draw();
    
    var xpos=tile.attrs.hexX;
    var ypos=tile.attrs.hexY;
    
    var x=calculateActorX(xpos, ypos);
    var y=calculateActorY(ypos);
    
    console.log('moving '+xpos+' '+ypos);
        
    selected.attrs.hexX=tile.attrs.hexX;
    selected.attrs.hexY=tile.attrs.hexY;
    
    selected.transitionTo({
        x: x,
        y: y,
        duration: 0.5,
        callback: function() {
            if(attacking)
            {
                console.log('attacking...');
                console.log(enemy);
                
                var fight=new Kinetic.Sprite({
                    x: x,
                    y: y,
                    image: images.fight,
                    animations: animations,
                    animation: 'bounce',
                    frameRate: 10,                        
                });

                effects.add(fight);
                effects.draw();
                
                fight.afterFrame(3, function () {
                    fight.stop();
                    fight.attrs.visible=false;
                    effects.draw();
                    
                    enemy.attrs.visible=false;
                    actors.draw();
                    if(enemy.attrs.king)
                    {
                        if(player==1)
                        {
                            window.location='winning2.html';                            
                        }
                        else
                        {                            
                            window.location='winning1.html';
                        }
                    }                    
                });
                
                fight.start();                
            }
                
            selected=null;
            nextPlayer();            
        },
    });        
}

function getTile(x, y)
{
    console.log('getTile: '+x+' '+y);
    if(y>0 && y<boardObjects.length)
    {
        var boardRow=boardObjects[y];
        if(x>0 && x<boardRow.length)
        {
            return boardRow[x];
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
}

function getActor(x, y)
{
    for(var i=0; i<actorObjects.length; i++)
    {
        var actor=actorObjects[i];
        if(actor.attrs.hexX==x && actor.attrs.hexY==y && actor.attrs.visible)
        {
            return actor;
        }
    }

    return null;
}

function getTreasure(x, y)
{
    for(var i=0; i<treasureObjects.length; i++)
    {
        var treasure=treasureObjects[i];
        if(treasure.attrs.hexX==x && treasure.attrs.hexY==y && treasure.attrs.visible)
        {
            return treasure;
        }
    }

    return null;
}

function redrawBoard()
{
    for(var y=0; y<boardSize*2-1; y++)
    {    
        var boardRow=boardObjects[y];
        for(var x=0; x<boardRow.length; x++)
        {                    
            var tile=boardRow[x];
            var actor=getActor(x, y);
            
            colorTile(actor, tile);
        }
    }
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

function calculateTreasureX(x, y)
{
    var xpos=calculateTileX(x, y);
    return xpos-35;
}

function calculateTreasureY(y)
{
    var ypos=calculateTileY(y);
    return ypos-37;
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
            boardRow.push(tile);
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
            moves: coords.moves,
            image: images[character],
            animations: animations,
            animation: 'bounce',
            frameRate: 10,
        });
    
/*
        console.log('char:');
        console.log(charObj);
*/
    
        charObj.on('click', pieceClicked);                
    
        charObj.setAnimation('bounce');
    
       pieces.add(charObj);
       pieceObjects.push(charObj);   
        
       stage.add(pieces);
       
        charObj.start();       
    }
}

function initTreasures(stage)
{
    treasures=new Kinetic.Layer();
    
    stage.add(treasures);
}

function initActors(stage)
{
   actors=new Kinetic.Layer();
    
   stage.add(actors);   
}

function initEffects(stage)
{
   effects=new Kinetic.Layer();
    
   stage.add(effects);   
}

function initStage(imageAssets, audioAssets)
{
    images=imageAssets;

    var stage=new Kinetic.Stage({
        container: 'container',
        width: stageWidth,
        height: stageHeight,
    });

    initBackground(stage);    
    initBoard(stage);
    initPieces(stage);
    initTreasures(stage);
    initActors(stage);
    initEffects(stage);    
} 

function initLumpySpaceChess()
{
    mode=SELECT;

    var imageSources={
        background: 'assets/lumpspace.png',
        coin: 'assets/coin.png',
        chest: 'assets/treasure.png',
        jake: 'assets/jake.png',
        finn: 'assets/fin.png',
        lsp: 'assets/LSP.png',
        snail: 'assets/snail.png',
        bmo: 'assets/Bmo.png',
        loraine: 'assets/Loraine.png',
        ladyrain: 'assets/ladyrain.png',
        bubblegum: 'assets/princess.png',
        fight: 'assets/death.png',
        defaultTile: 'assets/tile.png',
        player1death: 'assets/deathTile2.png',
        player2death: 'assets/deathTile.png',
        player1tile: 'assets/player1tile.png',
        player2tile: 'assets/player2tile.png',
        player1tileking: 'assets/player1tileking.png',
        player2tileking: 'assets/player2tileking.png',
        player1tileselected: 'assets/player1tileselected.png',
        player2tileselected: 'assets/player2tileselected.png',
        player1tileselectedking: 'assets/player1tileselectedking.png',
        player2tileselectedking: 'assets/player2tileselectedking.png',
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