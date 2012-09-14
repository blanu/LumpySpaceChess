var boardSize=3;
var hexSize=50;

var actors;
var actorObjects=[];

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

function initBoard(stage)
{
    var board=new Kinetic.Layer();

    var offset=boardSize-1;
    var rowLength=boardSize;
    for(var y=0; y<boardSize*2-1; y++)
    {    
        console.log('offset: '+offset);
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
            tile.on('click', function() {
                console.log('clicked');
                console.log(this);
                
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
            });
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

function initActors(stage)
{
   actors=new Kinetic.Layer();
    
   var player=new Kinetic.Circle({
       hexX: 0,
       hexY: 0,
       x: 240,
       y: 240,
       radius: hexSize/2,
       fill: 'blue',
       stroke: 'gray',
       strokeWidth: 2,
   });

   player.on('click', function() {
       console.log('clicked actor');
       console.log(this);
    });                

   actors.add(player);
   actorObjects.push(player);   
    
   stage.add(actors);
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
    initActors(stage);
} 

function initLumpySpaceChess()
{
    var images={
        beach: 'beach.png',
    };
    
    var audio={
        beach: 'beach.png',
    };
    
//    loadAssets(images, audio, initStage);

    initStage({}, {});
}

$(document).ready(initLumpySpaceChess);