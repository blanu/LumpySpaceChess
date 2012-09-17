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

var pieceX=50;
var pieceXOffset=130;
var pieceY=420;

var characters={
    jake: {
        cost: 1,
        x: pieceX*0+pieceXOffset,
        y: pieceY,
        moves: [
            [2,0],
            [-2,0],           
            [-1,1],
            [1,1],           
            [-1,-1],
            [1,-1],           
        ],
    },
    finn: {
        cost: 1,
        x: pieceX*1+pieceXOffset,
        y: pieceY,        
        moves: [
            [2,0],
            [-2,0],           
            [-1,1],
            [1,1],           
            [-1,-1],
            [1,-1],                   
        ],
    },
    lsp: {
        cost: 2,
        x: pieceX*2+pieceXOffset,
        y: pieceY,        
        moves: [
            [-3,-1],
            [0,-2],
            [3,-1],
            [-3,1],
            [0,2],
            [3,1],
        ],        
    },
    bubblegum: {
        cost: 5,
        x: pieceX*3+pieceXOffset,
        y: pieceY,
        moves: [
            [-2,0],           
            [-4,0],
            [1,1],           
            [2,2],
            [1,-1],           
            [2,-2],
        ],        
    },
    bmo: {
        cost: 7,
        x: pieceX*4+pieceXOffset,
        y: pieceY,
        moves: [
            [-2,0],
            [-4,0],
            [-6,0],
            [-8,0],
            [-10,0],
            [2,0],
            [4,0],
            [6,0],
            [8,0],
            [10,0],
        ],
    },
    loraine: {
        cost: 8,
        x: pieceX*5+pieceXOffset,
        y: pieceY,
        moves: [
            [0,0],
        ],
    },
    ladyrain: {
        cost: 10,
        x: pieceX*6+pieceXOffset,
        y: pieceY,
        moves: [
            [2,0],
            [-2,0],           
            [-1,1],
            [1,1],           
            [-1,-1],
            [1,-1],           
            [-3,-1],
            [0,-2],
            [3,-1],
            [-3,1],
            [0,2],
            [3,1],            
        ],        
    },
    snail: {
        cost: 20,
        x: pieceX*7+pieceXOffset,
        y: pieceY,
        moves: [
            [0,-1],
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

var audio;

var barLayer;

var p1Money=1;
var p2Money=1;

/*
var p1Money=100;
var p2Money=100;
*/

var p1MoneyText;
var p2MoneyText;

var p1arrow;
var p2arrow;

var p1startTiles=[
    [2,0],
    [1,1],
    [0,2],
];

var p2startTiles=[
    [8,2],
    [7,3],
    [6,4],
];        

function nextPlayer()
{
    if(player==1)
    {
        player=2;
        
        p1arrow.attrs.visible=false;
        p2arrow.attrs.visible=true;
        barLayer.draw();
    }
    else
    {
        player=1;
        
        p1arrow.attrs.visible=true;
        p2arrow.attrs.visible=false;
        barLayer.draw();        
    }
    
    generateTreasure();
    
    console.log('new loraine movement?');
    var loraine=getActorByName('loraine');
    if(loraine!=null)
    {
        console.log('new loraine movement!');
        var tile=null;
        while(tile==null)
        {
            var x=Math.floor(Math.random()*(boardSize+1)*2);
            var y=Math.floor(Math.random()*boardSize*2);
            tile=getTile(x, y);
            
            var actor=getActor(x, y);
            if(actor!=null && loraine.attrs.player==actor.attrs.player)
            {
                tile=null;
            }
        }

        console.log(x+' '+y+' '+loraine.attrs.hexX+' '+loraine.attrs.hexY);        
        loraine.attrs.moves=[[x-loraine.attrs.hexX,y-loraine.attrs.hexY]];
        console.log('moves:');
        console.log(loraine.attrs.moves);
    }
    
    console.log('new snail movement?');
    var snail=getActorByName('snail');
    tryCount=0;
    var moves=[
        [2,0],
        [-1,1],
        [1,1],           
        [-2,0],           
        [-1,-1],
        [1,-1],           
    ];
    if(snail!=null)
    {
        console.log('new snail movement!');
        var tile=null;
        while(tile==null && tryCount<6)
        {
            var move=moves[tryCount];
            var x=snail.attrs.hexX+move[0];
            var y=snail.attrs.hexY+move[1];
            tile=getTile(x, y);
            
            var actor=getActor(x, y);
            if(actor!=null && snail.attrs.player==actor.attrs.player)
            {
                tile=null;
            }            
            
            tryCount++;
        }

        snail.attrs.moves=[move];
    }    
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
    
    var actor=getActorByName(this.attrs.name);
    if(actor!=null)
    {
        console.log('piece already in use');
        return;
    }
    
    if(player==1)
    {
        if(this.attrs.cost>p1Money)
        {
            console.log('too expensive');
            return;
        }
    }
    else
    {
        if(this.attrs.cost>p2Money)
        {
            console.log('too expensive');
            return;
        }        
    }
    
    colorStartTiles();
    
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
    var r=Math.random()*4;
    console.log('random: '+r);
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
    
    var tile=getTile(x, y);
    if(tile==null)
    {
        console.log('no tile to place treasure');
        return;
    }
    
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
    
    var treasureImage;    
    var value;
    if(Math.random()*4>2)
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
        hexX: x,
        hexY: y,
        x: calculateTreasureX(x, y),
        y: calculateTreasureY(y),
        value: value,
        image: treasureImage,
        animations: treasureAnimations,
        animation: 'sparkle',
        frameRate: 10,
    });
    
    treasure.on('click', treasureClicked);
    
    treasures.add(treasure);
    treasureObjects.push(treasure);
    treasure.start();
    treasures.draw();
}

function treasureClicked()
{
    var x=this.attrs.hexX;
    var y=this.attrs.hexY;

    var tile=getTile(x, y);
    
    console.log('treasure clicked '+this.attrs.hexX+' '+this.attrs.hexY);
    console.log(tile);

    console.log('redrawing');
    redrawBoard();
    
    if(mode==PLACE)
    {
        placePiece(tile);
    }
    else if(mode==MOVE)
    {
        movePiece(tile);
    }
}

function actorClicked()
{
    console.log('clicked actor');
    
    var x=this.attrs.hexX;
    var y=this.attrs.hexY;
    
    if(this.attrs.player!=player)
    {
        if(selected==null)
        {
            console.log('not my turn');
            return;
        }
        else if(mode==PLACE)
        {
            console.log('space occupred, cannot place');
            return;
        }
        else
        {
            var tile=getTile(this.attrs.hexX, this.attrs.hexY);
            movePiece(tile);
        }
    }
    
    mode=MOVE;
    selected=this;
    
    showedSelected=false;
    
    redrawBoard();
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
    
    if(!checkPlacement(tile))
    {
        console.log("can't place there");
        return;
    }
    
    console.log(selected);
    
    playSound(selected);
    
    var xpos=tile.attrs.hexX;
    var ypos=tile.attrs.hexY;
    
    var x=calculateActorX(xpos, ypos);
    var y=calculateActorY(ypos);
    
    var king;
    if(player==1)
    {
        king=!p1KingPlaced;
        p1KingPlaced=true;
        
        p1Money=p1Money-selected.attrs.cost;
        p1MoneyText.setText('$'+p1Money);
        barLayer.draw();
    }
    else
    {
        king=!p2KingPlaced;
        p2KingPlaced=true;
        
        p2Money=p2Money-selected.attrs.cost;
        p2MoneyText.setText('$'+p2Money);
        barLayer.draw();
    }    
        
    var actor=new Kinetic.Sprite({
        name: selected.attrs.name,
        hexX: xpos,
        hexY: ypos,
        moves: selected.attrs.moves,
        player: player,
        king: king,
        sounds: selected.attrs.sounds,
        x: x,
        y: y,
        image: selected.attrs.image,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
    });
    
    selected.stop();
    
/*
    console.log('new actor: '+actor.attrs.king);
    console.log(actor);
*/
    
   actor.on('click', actorClicked);                
//   actor.on('mouseover', actorMouseover);
//   actor.on('mouseout', actorMouseout);

   actors.add(actor);
   actorObjects.push(actor);   

    console.log('actor:');
    console.log(actor);
    
    actor.setAnimation('bounce');
    actor.start();   
    
    tile.attrs.player=player;
    
    colorTile(actor, tile);        
    
    var treasure=getTreasure(tile.attrs.hexX, tile.attrs.hexY);
    if(treasure!=null)        
    {
        console.log('got treasure');
        treasure.attrs.visible=false;
        treasures.draw();
        
        if(player==1)
        {
            p1Money=p1Money+treasure.attrs.value;
            p1MoneyText.setText('$'+p1Money);
        }
        else
        {
            p2Money=p2Money+treasure.attrs.value;                    
            p2MoneyText.setText('$'+p2Money);
        }
        
        barLayer.draw();        
    }    
    
    nextPlayer();
    
    selected=null;    
}

function colorTile(actor, tile)
{
    tile.setStroke('gray');
        
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

function colorStartTiles()
{
    var startTiles;
    if(player==1)
    {
        startTiles=p1startTiles;
    }
    else
    {
        startTiles=p2startTiles;
    }
    
    for(var i=0; i<startTiles.length; i++)
    {
        var tile=getTile(startTiles[i][0], startTiles[i][1]);
        console.log('tile '+startTiles[i][0]+' '+startTiles[i][1]+':');
        console.log(tile);
        
        var actor=getActor(startTiles[i][0], startTiles[i][1]);
        if(actor==null)
        {
            if(player==1)
            {
                tile.setFill({image: images.player1tile, offset:[0,0]});
            }
            else
            {
                tile.setFill({image: images.player2tile, offset:[0,0]});            
            }
        }
    }
    
    board.draw();
}

function checkPlacement(tile)
{
    var x=tile.attrs.hexX;
    var y=tile.attrs.hexY;

    var actor=getActor(x, y);
    if(actor!=null)
    {
        console.log('placement blocked');
        return false;
    }
    
    var startTiles;
    if(player==1)
    {
        startTiles=p1startTiles;
    }
    else
    {
        startTiles=p2startTiles;
    }
    
    for(var i=0; i<startTiles.length; i++)
    {
        if(startTiles[i][0]==x && startTiles[i][1]==y)
        {
            return true;
        }
    }

    console.log('not in start tile list '+x+' '+y);
    console.log(startTiles);    
    return false;
}

function checkMove(actor, tile)
{
    var x=actor.attrs.hexX;
    var y=actor.attrs.hexY;
    
    for(var i=0; i<actor.attrs.moves.length; i++)
    {
        var move=actor.attrs.moves[i];
        if(tile.attrs.hexX==x+move[0] && tile.attrs.hexY==y+move[1])
        {
            return true;
        }
    }
    
    return false;
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
    if(tile==null)
    {
        return null;
    }
    
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
            if(central)
            {
                tile.setStroke('black');
            }
        
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
            if(central)
            {
                tile.setStroke('black');
            }
            
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
    
    if(!checkMove(selected, tile))
    {
        console.log('invalid move');
        return;
    }
    
    playSound(selected);

    var gettingTreasure=false;
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
    
    if(!attacking)
    {
        var treasure=getTreasure(tile.attrs.hexX, tile.attrs.hexY);
        if(treasure!=null)        
        {
            console.log('found treasure');
            gettingTreasure=true;
        }
    }

/*
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
*/
    
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
                    
                    var piece=getPieceByName(enemy.attrs.name);
                    piece.start();
                    
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
            else if(gettingTreasure)
            {
                console.log('got treasure');
                treasure.attrs.visible=false;
                treasures.draw();
                
                if(player==1)
                {
                    p1Money=p1Money+treasure.attrs.value;
                    p1MoneyText.setText('$'+p1Money);
                }
                else
                {
                    p2Money=p2Money+treasure.attrs.value;                    
                    p2MoneyText.setText('$'+p2Money);
                }
                
                barLayer.draw();
            }
            
            redrawBoard();
                
            selected=null;
            nextPlayer();            
        },
    });        
}

function playSound(actor)
{
    console.log('playSound');
    console.log(actor);
    var index=Math.floor(Math.random()*3);
    var sound=actor.attrs.sounds[index];
    sound.play();
}

function getTile(x, y)
{
    console.log('getTile: '+x+' '+y);
    if(y>=0 && y<boardObjects.length)
    {
        var boardRow=boardObjects[y];
        if(x>=0 && x<boardRow.length)
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

function getActorByName(name)
{
    for(var i=0; i<actorObjects.length; i++)
    {
        var actor=actorObjects[i];
        if(actor.attrs.name==name && actor.attrs.visible)
        {
            return actor;
        }
    }

    return null;
}

function getPieceByName(name)
{
    for(var i=0; i<pieceObjects.length; i++)
    {
        var piece=pieceObjects[i];
        if(piece.attrs.name==name && piece.attrs.visible)
        {
            return piece;
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
            
            if(tile!=null)
            {
                var actor=getActor(x, y);
                
                colorTile(actor, tile);
            }
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
        else
        {
            offset++;
        }                
    }    
}

function calculateTileX(x, y)
{
    var offset=offsets[y];
    return 100+(x*(hexSize-5));
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
        var offset=offsets[y];
        
        for(var i=0; i<offset; i++)
        {
            boardRow.push(null);
        }
        
        boardObjects.push(boardRow);
        for(var x=0; x<rowLength; x++)
        {                
            var adjx=(x*2)+offsets[y];
            var xpos=calculateTileX(adjx, y);
            var ypos=calculateTileY(y);
            
            var tile=new Kinetic.RegularPolygon({
                hexX: adjx,
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
            boardRow.push(null);
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
            name: character,
            x: coords.x,
            y: coords.y,
            moves: coords.moves,
            sounds: coords.sounds,
            cost: coords.cost,
            image: images[character],
            animations: animations,
            animation: 'bounce',
            frameRate: 10,
            scale: [0.5, 0.5],
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

function initBar(stage)
{
    barLayer=new Kinetic.Layer();
    
    var bar=new Kinetic.Image({
        x: 0,
        y: 432,
        image: images.bar,
    });     
    
    barLayer.add(bar);
    
    p1MoneyText = new Kinetic.Text({
      x: 42,
      y: 454,
      text: '$'+p1Money,
      fontSize: 8,
      fontFamily: 'Calibri',
      textFill: 'white'
    });
    
    barLayer.add(p1MoneyText);        

    p2MoneyText = new Kinetic.Text({
      x: 585,
      y: 454,
      text: '$'+p1Money,
      fontSize: 8,
      fontFamily: 'Calibri',
      textFill: 'white'
    });
    
    barLayer.add(p2MoneyText);        
    
    p1arrow=new Kinetic.Sprite({
        x: 25,
        y: 382,
        image: images.arrow,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
        scale: [0.5, 0.5],
    });
    
    barLayer.add(p1arrow);
    
    p1arrow.start();

    p2arrow=new Kinetic.Sprite({
        x: 565,
        y: 382,
        image: images.arrow,
        animations: animations,
        animation: 'bounce',
        frameRate: 10,
        scale: [0.5, 0.5],
        visible: false,
    });
    
    barLayer.add(p2arrow);
    
    p2arrow.start();
    
    stage.add(barLayer);
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

function initSounds()
{            
    for(character in characters)
    {
        console.log('loading sound for '+character);
        var charObj=characters[character];
        charObj.sounds=[];
        for(var i=0; i<3; i++)
        {
            charObj.sounds.push(new buzz.sound('assets/audio/'+character+i+'.mp3'));
        }
    }    
    console.log('loaded audio');
    console.log(characters);    
    
    var theme=new buzz.sound('assets/audio/beat.mp3');
    theme.loop().play();
}

function initStage(imageAssets, audioAssets)
{
    images=imageAssets;

    var stage=new Kinetic.Stage({
        container: 'container',
        width: stageWidth,
        height: stageHeight,
    });

    initSounds();
    initBackground(stage);    
    initBar(stage);
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
        bar: 'assets/Bar.png',
        arrow: 'assets/go.png',
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
    
    var audioSources={
        
    };
    
    precalculateOffsets();
    
//    loadAssets(images, audio, initStage);
    loadAssets(imageSources, [], initStage);
}

$(document).ready(initLumpySpaceChess);