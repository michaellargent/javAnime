/*
javAnime v1.0.0
-updateing-

@MichaelLargent [twitter | github]
*/
class javAnime{
	constructor(env, cb){
		return Object.assign({
			//passable variables
			scenes:[],							//json format, when submitting "anime" or "action", a "selector" or "selectors" are required
			debugging:false,				//turn on debugging console
			preLogic:{},						//passed functions to perform before anime or action
			postLogic:{},						//passed functions to perform after anime or action
			hotPotato:{},						//container for data to passed around the scenes
			sceneInstance:0,				//start on which scene
			//states
			animeProcessing:false,			
			actionProcessing:false,
			preLogicProcessing:false,
			postLogicProcessing:false,
			processorState:null,
			//point to action calls
			start: (function(i){
				i= i || this;
				//check if the processorState is current true==running, false==stop commanded, null==ready
				if ( i.processorState===true ){ console.error("Start error: Commanded to start, but this object is already running."); return; }
				else if ( i.processorState===false ){ console.error("Start error: Commanded to start, but this object is shutting down."); return; }
				//set the processorState to true and invoke sceneProcessor
				i.processorState= true;
				i.sceneProcessor( i );
				return;
			}),
			stop: (function(i){
				i= i || this;
				//flag the processorState to false, so during execution, this will shutdown
				i.processorState=false;
				if ( i.debugging ){ console.log("Sending signal to scene processes to shut down."); }
				return;
			}),
			status: (function(i){
				i= i || this;
				let sitrep={
					//check if the scene has a "desc" property else return the whole scene
					scene: (i.scenes[i.sceneInstance].hasOwnProperty("desc") ? i.scenes[i.sceneInstance].desc : i.scenes[i.sceneInstance]),
					//check which process is running
					animeProcessing: i.animeProcessing,
					actionProcessing: i.actionProcessing,
					preLogicProcessing: i.preLogicProcessing,
					postLogicProcessing: i.postLogicProcessing,
					//full state of program
					state: (i.processorState===null ? "ready" :  (i.processorState===true ? "active": (i.processorState===false ? "stopping" : "unknown")))
				};
				if ( i.debugging ){ console.log("Status:", JSON.stringify(sitrep) ); }
				return sitrep;
			}),
			//main delegator
			sceneProcessor: (function(i){
				i= i || this;
				//check for a stop signal
				if ( i.processorState===false ){
					if ( i.debugging ){ console.log('sceneProcessor has been commanded to stop...stopping execution.'); }
					//reset the processorState to be ready to reanimate, event listeners should have been removed by the (stop) call
					i.processorState=null;
					return;
				}
				//exit out if there are no scenes
				if ( i.sceneInstance===i.scenes.length){
					if ( i.debugging ){ console.log('All scenes have been iterated through.'); }
					return;
				}
				//exit out if anime, action, or logic are true
				if ( i.animeProcessing===true ||
					 i.actionProcessing===true ||
					 i.preLogicProcessing===true ||
					 i.postLogicProcessing===true
				){
					if (i.debugging){
						console.log('sceneProcessor was invoked, but animeProcessing, actionProcessing, preLogicProcessing, or postLogicProcessing is still processing. ['+ i.animeProcessing +'|'+ i.actionProcessing +'|'+ i.preLogicProcessing +'|'+ i.postLogicProcessing +']');
					}
					return;
				}
				if (i.debugging){ console.log("Processing scene: ", i.scenes[i.sceneInstance]); }
				//check for preLogic
				if ( i.preLogicProcessing===false && i.scenes[i.sceneInstance].hasOwnProperty('preLogic') ){
					//handoff to processPreLogic
					i.processPreLogic(i);
					return;
				}
				//check for an animation
				else if ( i.animeProcessing===false && i.scenes[i.sceneInstance].hasOwnProperty('anime') ){
					//handoff to processAnime
					i.processAnime(i);
					return;
				}
				//check for an action
				else if ( i.actionProcessing===false && i.scenes[i.sceneInstance].hasOwnProperty('action') ){
					//handoff to processAction
					i.processAction(i);
					return;
				}
				//check for postLogic
				else if ( i.postLogicProcessing===false && i.scenes[i.sceneInstance].hasOwnProperty('postLogic') ){
					//handoff to processPostLogic
					i.processPostLogic(i);
					return;
				}
				//scene completion
				else{
					i.processSceneCompletion(i);
					return;
				}
			}),
			//local processors
			processPreLogic: (function(i){
				if (i.debugging){ console.log("Invoking preLogic: ", i.scenes[i.sceneInstance].preLogic); }
				//execute the preLogic
				i.preLogicProcessing=true;
				//check if the preLogic passed in the scene is a named function first
				if ( typeof i.scenes[i.sceneInstance].preLogic !== "function" ){
					console.error("preLogic function not found: ", i.scenes[i.sceneInstance].preLogic);
					return;
				}
				//invoke the preLogic function and pass this animeObject
				i.scenes[i.sceneInstance].preLogic(
					function(){ i.logicEnd(i, "preLogic"); },
					i
				);
				return;
			}),
			processAnime: (function(i){
				if (i.debugging){
					console.log("Invoking anime: ", i.scenes[i.sceneInstance].anime);
				}
				//check for the infiniteAnimation flag, which would prevent the animation from emitting an end
				if (i.scenes[i.sceneInstance].hasOwnProperty('infiniteAnimation') && i.scenes[i.sceneInstance].infiniteAnimation===true){
					//set it to anime complete so it won't block further processing
					i.animeProcessing=null;
					//check for a single selector
					if ( i.scenes[i.sceneInstance].hasOwnProperty('selector') ){
						document.querySelector(i.scenes[i.sceneInstance].selector).setAttribute("anime", i.scenes[i.sceneInstance].anime);
					}
					//check for plural form of selectors
					else if ( i.scenes[i.sceneInstance].hasOwnProperty('selectors') ){
						//add :scope pseudo-class so we get the expected behavior
						let multiSelectors= document.querySelectorAll(':scope '+ i.scenes[i.sceneInstance].selectors);
						if (i.debugging){
							console.log("Animation will be applied to "+ multiSelectors.length +" object"+ (multiSelectors.length===1 ? "": "s") +".");
						}
						multiSelectors.forEach(
							//iterate through each selector
							function(selectedObj){
								selectedObj.setAttribute("anime", i.scenes[i.sceneInstance].anime);
							}
						);
					}
					//if missing selector, throw an error
					else{
						console.error("Missing (selector) or (selectors) in scene to apply animation to");
						return;
					}
					i.sceneProcessor( i );
					return;
				}
				//this area is for animation that is not infinite and will have an end
				else{
					i.animeProcessing=true;
					//check for a single selector
					if ( i.scenes[i.sceneInstance].hasOwnProperty('selector') ){
						if (i.debugging){
							console.log("Setting animationend listener on selector ["+ i.scenes[i.sceneInstance].selector +"]: ", document.querySelector(i.scenes[i.sceneInstance].selector) );
						}
						//use a name function, per ECMAScript3, when passing off to the listener
						document.querySelector(i.scenes[i.sceneInstance].selector).addEventListener("animationend",
							function factorial(){ i.animeEnd(this,i,factorial); }
						, false);
						//apply the animation to the selector
						document.querySelector(i.scenes[i.sceneInstance].selector).setAttribute("anime", i.scenes[i.sceneInstance].anime);
						return;
					}
					//check for plural form of selectors
					else if ( i.scenes[i.sceneInstance].hasOwnProperty('selectors') ){
						//add :scope pseudo-class so we get the expected behavior
						let multiSelectors= document.querySelectorAll(':scope '+ i.scenes[i.sceneInstance].selectors);
						if (i.debugging){
							console.log("Setting animationend listener on selectors ["+ i.scenes[i.sceneInstance].selectors +"]", document.querySelector(i.scenes[i.sceneInstance].selectors) );
						}
						if (i.debugging){
							console.log("Animation will be applied to "+ multiSelectors.length +" object"+ (multiSelectors.length===1 ? "": "s") +".");
						}
						//notate the number of selectors we're tracking for completion in the hotPotato
						i.hotPotato.multiSelectors= multiSelectors.length;
						//iterate through each selector
						multiSelectors.forEach(
							function(selectedObj){
								//add the animationEnd event listener to the applicable selector
								selectedObj.addEventListener("animationend",
									//use a name function, per ECMAScript3, when passing off to the listener
									function factorial(){
										//pass animeEnd [it's own self, animeobject, the name of this function calling it, and true for multiple tracking]
										i.animeEnd(this, i, factorial, true);
									}
								, false);
								//apply the animation to the selector
								selectedObj.setAttribute("anime", i.scenes[i.sceneInstance].anime);
							}
						);
						return;
					}
					//if missing selector, throw an error
					else{
						console.error("Missing (selector) or (selectors) in scene to apply animation to");
						return;
					}
					return;
				}
			}),
			processAction: (function(i){
				if (i.debugging){ console.log("Invoking action: ", i.scenes[i.sceneInstance].action); }
				i.actionProcessing=true;
				//check for a single selector
				if ( i.scenes[i.sceneInstance].hasOwnProperty('selector') ){
					if (i.debugging){ console.log("Setting transitionend listener on selector ["+ i.scenes[i.sceneInstance].selector +"]: ", document.querySelector(i.scenes[i.sceneInstance].selector) ); }
					//use a name function, per ECMAScript3, when passing off to the listener
					document.querySelector(i.scenes[i.sceneInstance].selector).addEventListener("transitionend",
						function factorial(){ i.actionEnd(this,i,factorial); }
					, false);
					//apply the transition to the selector
					document.querySelector(i.scenes[i.sceneInstance].selector).setAttribute("action", i.scenes[i.sceneInstance].action);
					return;
				}
				//check for plural form of selectors
				else if ( i.scenes[i.sceneInstance].hasOwnProperty('selectors') ){
					//add :scope pseudo-class so we get the expected behavior
					let multiSelectors= document.querySelectorAll(':scope '+ i.scenes[i.sceneInstance].selectors);
					if (i.debugging){ console.log("Setting transitionend listener on selectors ["+ i.scenes[i.sceneInstance].selectors +"]", document.querySelector(i.scenes[i.sceneInstance].selectors) ); }
					if (i.debugging){ console.log("Action will be applied to "+ multiSelectors.length +" object"+ (multiSelectors.length===1 ? "": "s") +"."); }
					//notate the number of selectors we're tracking for completion in the hotPotato
					i.hotPotato.multiSelectors= multiSelectors.length;
					//iterate through each selector
					multiSelectors.forEach(
						function(selectedObj){
							//add the animationEnd event listener to the applicable selector
							selectedObj.addEventListener("transitionend",
								//use a name function, per ECMAScript3, when passing off to the listener
								function factorial(){
									//pass actionEnd [it's own self, animeobject, the name of this function calling it, and true for multiple tracking]
									i.actionEnd(this, i, factorial, true);
								}
							, false);
							//apply the transition to the subjected selector
							selectedObj.setAttribute("action", i.scenes[i.sceneInstance].action);
						}
					);
					return;
				}
				//if missing selector, throw an error
				else{
					console.error("Missing (selector) or (selectors) in scene to apply action to");
					return;
				}
				return;
			}),
			processPostLogic: (function(i){
				if ( i.debugging ){
					console.log("Invoking postLogic: ", i.scenes[i.sceneInstance].postLogic);
				}
				//execute the postLogic
				i.postLogicProcessing=true;
				//check if the preLogic passed in the scene is a named function first
				if ( typeof i.scenes[i.sceneInstance].postLogic !== "function" ){
					console.error("postLogic function not found: ", i.scenes[i.sceneInstance].postLogic);
					return;
				}
				i.scenes[i.sceneInstance].postLogic(
					function(){ i.logicEnd(i,"postLogic"); },
					i
				);
				return;
			}),
			processSceneCompletion: (function(i){
				if ( i.debugging ){ console.log("Scene Complete"); }
				++i.sceneInstance;
				i.animeProcessing=false;
				i.actionProcessing=false;
				i.preLogicProcessing=false;
				i.postLogicProcessing=false;
				i.sceneProcessor( i );
				return;
			}),
			//event handlers
			logicEnd: (function(i,logicProcess){
				if ( i.debugging ){ console.log("logic is complete ["+ logicProcess +"]."); }
				//set the logic process to null to signal it's completion
				i[logicProcess +"Processing"]=null;
				//invoke the sceneProcessor to run again
				i.sceneProcessor( i );
				return;
			}),
			animeEnd: (function(selector,i,triggerListener,multiSelectorTracking){
				let alreadyRemovedListener= false;
				//check if multiSelectorTracking was passed, meaning we need to track the completion of multiple objects
				if (multiSelectorTracking){
					if (i.debugging){ console.log("Tracking multiple objects for completion."); }
					if ( !i.hotPotato.hasOwnProperty('multiSelectors') ){
						console.error("Commanded to track multiple objects, but no count was stored.");
						return;
					}
					//deduct from the multiSelectors
					--i.hotPotato.multiSelectors;
					//remove the listener from the selector
					selector.removeEventListener("animationend", triggerListener, false);
					alreadyRemovedListener=true;
					//check for completion
					if ( i.hotPotato.multiSelectors>0 ){
						if (i.debugging){
							console.log("Waiting for "+ i.hotPotato.multiSelectors +"object"+ (i.hotPotato.multiSelectors===1 ? "": "s") +" to complete.");
						}
						return;
					}
					//if multiSelectors===0, then it'll continue on from here...delete the object from the hotPotato
					delete i.hotPotato.multiSelectors;
				}
				if (i.debugging){ console.log("Animation Ended"); }
				//null out the anime variable since were done
				i.animeProcessing=null;
				if (alreadyRemovedListener===false){
					selector.removeEventListener("animationend", triggerListener, false);
				}
				//check if processorState is null||false to shutdown before invoking the processor again
				if ( i.processorState===null || i.processorState=== false ){
					if ( i.debugging ){
						console.log("sceneProcessor has been shutdown, will not invoke again.");
					}
					return;
				}
				i.sceneProcessor( i );
				return;
			}),
			actionEnd: (function(selector,i,triggerListener,multiSelectorTracking){
				let alreadyRemovedListener= false;
				//check if multiSelectorTracking was passed, meaning we need to track the completion of multiple objects
				if (multiSelectorTracking){
					if (i.debugging){ console.log("Tracking multiple objects for completion."); }
					if (!i.hotPotato.hasOwnProperty('multiSelectors')){
						console.error("Commanded to track multiple objects, but no count was stored.");
						return;
					}
					//deduct from the multiSelectors
					--i.hotPotato.multiSelectors;
					//remove the listener from the selector
					selector.removeEventListener("transitionend", triggerListener, false);
					alreadyRemovedListener=true;
					//check for completion
					if ( i.hotPotato.multiSelectors>0 ){
						if (i.debugging){
							console.log("Waiting for "+ i.hotPotato.multiSelectors +"object"+ (i.hotPotato.multiSelectors===1 ? "": "s") +" to complete.");
						}
						return;
					}
					//if multiSelectors===0, then it'll continue on from here...delete the object from the hotPotato
					delete i.hotPotato.multiSelectors;
				}
				if (i.debugging){ console.log("Action Ended"); }
				//null out the action variable since were done
				i.actionProcessing=null;
				if (alreadyRemovedListener===false){
					selector.removeEventListener("transitionend", triggerListener, false);
				}
				//check if processorState is null||false to shutdown before invoking the processor again
				if ( i.processorState===null || i.processorState=== false ){
					if ( i.debugging ){
						console.log("sceneProcessor has been shutdown, will not invoke again.");
					}
					return;
				}
				i.sceneProcessor( i );
				return;
			})
		}, env);
	}
}