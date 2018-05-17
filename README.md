# javAnime

> a javascript/css processor for handling sprite sheet animation and logic

javAnime is a javascript engine to handle css animation and transition events. Originally developed to handle sprite scenes and javascript logic asscociated with each scene.


## Table of Contents

- [Inclusion](#inclusion)
- [javAnime Object](#javAnimeObject)
  - [settings](#javAnimeObject_settings)
  - [assignment](#javAnimeObject_assignment)
  - [methods](#javAnimeObject_methods)
- [scene Object](#sceneObject)

### <a name="inclusion"></a>Inclusion
Include the **javAnime.js** in an html page.
>```html
><script src="javAnime.js"></script>
>```
Or include the **javAnime.min.js** in an html page.
>```html
><script src="javAnime.min.js"></script>
>```

### <a name="javAnimeObject"></a>javAnime(<settings\>)
This is the container for the animation sequence. All scenes and logic relative for an animation will be in this object. You can have multiple `javAnime` objects on a page.

<a name="javAnimeObject_settings"></a>

| settings | data type | notes |
|:--|:--:|:--|
|`scenes` | array | *you can add scenes upon object initialization, or define them later with the `javAnime.scenes` assignment.* |
|`debugging` | bool | *debugging will output to the browser console*|
|`sceneInstance` | int | *specify a scene to start from, default=0*|

<a name="javAnimeObject_assignment"></a>

| assignment | action |
|---|---|
| `javAnime.debugging` | *turns on/off the debugger; true=on, false=off* |
| `javAnime.scenes` | *assign your scene objects here* |
| `javAnime.hotPotato.[dataName]` | *use this container to assign data that will be persistent through execution* |

<a name="javAnimeObject_methods"></a>

| method | action |
|---|---|
| `javAnime.start()` | *starts scene execution* |
| `javAnime.status()` | *returns: `scene` (`desc` or `scene` if `desc` is absent); `animeProcessing`; `actionProcessing`; `preLogicProcessing`; `postLogicProcessing`; `state`=(ready, active, stopping, unknown) * |
| `javAnime.stop()` | *stops entire process, and allows for re execution from the beginning* |

>##### example
>```javascript
>//this is one way to instantiate an animation
>var animate= new javAnime();
>animate.scenes= [ sceneObject1, sceneObject2, sceneObject3 ];
>animate.start();
>```


### <a name="sceneObject"></a>sceneObject

| | required | example | notes |
|--|:--:|:--|--|
|`selector`| conditional | `selector:"#animateThis"` | *required when `anime` or `action` is included in the sceneObect, or `selectors` can be used if wanting to apply the `anime` or `action` to multiple elements*|
|`selectors`| conditional | `selectors:".animateThis"` | *required if `selector` is not included and `anime` or `action` is included in the scene. applies animation to all matching elements in the page*|
|`anime` | no | `anime:"walking"` | *applies `anime=""` to the applicable `selector` or `selectors` in the document, listens for the css event `animationend` once*|
|`action` | no | `action:"walking"` | *applies `action=""` to the applicable `selector` or `selectors` in the document, listens to the css event `transitionend` once*|
|`infiniteAnimation`| no | `infiniteAnimation:true` | *applies to `anime` which runs on a constant loop. prevents the `animationend` listener*|
|`preLogic`| no | `preLogic: getPageSize` | *the name of the function to invoke **before** animation or action is applied.*|
|`postLogic` | no |`postLogic: animationComplete` | *the name of the function to invoke **after** animation or action is applied.*|
|`desc`| no | `desc:"walking"` | *this is totally unneccessary and is just here if you have complex scenes and you want a recognizable description in the debugger* |

>##### example
>```javascript
>//scene with preLogic function
>var animate= new javAnime();
>let scene1={
>	  anime: "jump",
>	  selector: "#animateThisDiv",
>	  action: "jump",
>	  preLogic: determineWhereSpriteIs
>};
>let scene2={
>	  anime: "stand",
>	  selector: "#animateThisDiv"
>};
>animate.scenes=[ scene1, scene2 ];
>animate.start();
>
>function determineWhereSpriteIs(callBack){
>	 //when done with whatever expression utilize the callBack like below to continue
>	 callBack();
>}
>```
