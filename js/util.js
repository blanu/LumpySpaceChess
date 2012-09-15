function loadAssets(sources, audioSources, callback)
{
    var toLoad=0;
    var loaded=0;
    var asset;
    var images={};
    var audio={};
    
    for(asset in sources)
    {
        toLoad++;
    }
    for(asset in audioSources)
    {
        toLoad++;
    }        
    
    for(asset in sources)
    {
        images[asset]=new Image();
        images[asset].onload=function() {
            loaded++;
            if(loaded==toLoad)
            {
                callback(images, audio);
            }
        }
        
        images[asset].src=sources[asset];
    }
    
    for(asset in audioSources)
    {
        console.log('loading '+asset);
        audio[asset]=new Audio();
        audio[asset].onload=function() {
            console.log('audio onload');
            loaded++;
            if(loaded==toLoad)
            {
                callback(images, audio);
            }
        }
        
        audio[asset].src=audioSources[asset];
        console.log(audio);
    }    
}
