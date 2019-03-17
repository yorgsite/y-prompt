# y-prompt
A configurable terminal prompter for nodejs.

Install :
```
npm install y-prompt
```
<br/>
As your questions and process the result:

```javascript
	const Prompt=require('./y-prompt');
	// use predefined types
	Prompt.baseTypes();
	// --- prompt your questions
	Prompt.prompter()
	// prepare your questions
	.log(datas=>'\n--------- Start prompt ---------\n')
	.ask('yn','response','do you say yes or no ?',{defaultValue:'n'})
	.log(datas=>'\n--------- End prompt ('+datas.response+') ---------\n')
	// launch the prompt
	.start()
	.then(function(datas){
		// process the result
		var answer=['Yes','No'][datas.response?1:0];
		console.log('\n- anwser='+answer+'\n- data='+data);

		// **** if y displays :
		//- anwser=Yes
		//- data={response:true}

		// **** if n displays :
		//- anwser=No
		//- data={response:false}

		process.exit();
	});
```
<br/>
A more elabored exemple can be found in **[test_prompt.js](test_prompt.js)**.
<hr/>

## <a name="tg_menu"></a> Menu

+ [Types](#tg_types).
	+ [Base types](#tg_basetypes).
	+ [Define types](#tg_deftypes).
+ [Configuration](#tg_config).
+ [Prompter](#tg_prompt).
	+ [Basics](#tg_basics).
		+ [prompter.log](#tg_log).
		+ [prompter.ask](#tg_ask).
	+ [Conditionnals](#tg_conditions).
		+ [prompter.askIf](#tg_askIf).
		+ [prompter.elseIf](#tg_elseIf).
		+ [prompter.else](#tg_else).
	+ [Loops](#tg_loops).
		+ [prompter.askWhile](#tg_askWhile).
		+ [prompter.askLoop](#tg_askLoop).
	+ [Loops](#tg_result).
		+ [prompter.start](#tg_start).
+ [Exemples](#tg_exemples).
	+ [base types](YPrompt.baseTypes.js).
	+ [test](test_prompt.js).

<hr/>

## <a name="tg_types"></a> Types.

The types definitions is the root feature of 'y-prompt'. This is where you define what type of question you can ask an what kind of data you expect.<br/>

<hr/>

### <a name="tg_basetypes"></a> Base types.

On your first uses, you may want to use 'y-prompt' [base types](YPrompt.baseTypes.js) instead before defining your owns (in this case go directly to [Prompt for datas](#tg_prompt)), or you may simply use them whith yours.<br/>

```javascript
	// ...
	// use predefined types
	Prompt.baseTypes();
```

The file where they are defined is shortly documented on their behaviours and shows many exemples of type definitions (**[YPrompt.baseTypes.js](YPrompt.baseTypes.js)**).

<hr/>

### <a name="tg_deftypes"></a> Define types.

define a new type with **Prompt.addType**:

```javascript
	/**
	Add a new question type.
	@param {string} name : the type name.
	@param {function(inpt,onError,params)} check : return true if input is valid, else call onError.<br/>
	- {string} input : the current entry value<br/>
	- {function(message)} onError : Call to send an error message when the input is invalid.<br/>
	- {object} params : The parameters you may add to a quetion.<br/>
	@param {function(input,params)} transform :
	- {string} input : the current entry value<br/>
	- {object} params : The parameters you may add to a quetion.<br/>
	@param {string} [parentType] : inherits its behaviour from a parent type if 'parentType' is defined. The parent will check and transform the data before passing it to the child method
	@param {any} [defaultValue] : defines a default value. Its use is deprecated since it remove the possibility to make the answer mandatory.
	*/
	Prompt.addType(name,check,transform,defaultValue,parentType);
```

<br/>

Exemple from **[base types](YPrompt.baseTypes.js)** :

```javascript
	// ...
	/**
	gets a 'y' (for Yes) or 'n' (for No) answer as a boolean
	*/
	Prompt.addType('yn',
		function(inpt,onerr,params){//check
			if(['n','y'].indexOf(inpt.toLowerCase())>-1){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid answer, accepted are 'y' for yes or 'n' for no.`);
			}

		},
		function(inpt){return !!(['n','y'].indexOf(inpt.toLowerCase()));}//transform gets boolean
	);
```

<hr/>

## <a name="tg_config"></a>Configuration.

You can change the appearance of the prompt by changing the configuration styles for 			**varName,type,value,defaultValue,error**.

```javascript
	// ...
	Prompt.config.style.varName='green';
```

<hr/>

## <a name="tg_prompt"></a>Make a prompter.

The first step is to create a new prompter.

```javascript
	// ... must init types before
	// ...
	var prompter=Prompt.prompter();

```

Use the prompter to prepare your questions and get the result.<br/>
NB: All the prompter actions ar chainables except 'start'.

<hr/>

### <a name="tg_basics"></a>Prompter basics.

<hr/>

#### <a name="tg_log"></a> prompter.log

```javascript
	/**
	Log a message between quesions.
	@param {string} message : will be logged to the console in time.
	@return {Prompter} the current prompter.
	*/
	prompter.log(message);
```

<hr/>

#### <a name="tg_ask"></a> prompter.ask

```javascript
	/**
	Ask a question.
	@param {string} type : the name of the type used for the question.
	@param {string} varName : the name of the data property to witch the result will be assigned.
	@param {string} message : the question you want to ask.
	@param {object} [params] : specific questions parameters.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.ask(type,varName,message,params);
```

<hr/>

### <a name="tg_conditions"></a>Prompter conditionnals.

<hr/>

#### <a name="tg_askIf"></a> prompter.askIf

```javascript
	/**
	adds a conditionnal prompter.
	@param {string} varName : data property to witch the  the resulting object will be assigned.<br/>
	If not a string, resulting object properties are directky applied to the parent object.
	@param {function(datas,localDatas)} condition : return true when condition ok.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The current prompter datas.<br/>
	@param {function(prompter,datas,localDatas)} collector : calls for a new collector if condition ok.<br/>
	- {Prompter} prompter : the prompter used to collect new questions.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The local prompter datas.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.askIf(varName,condition,collector);
```

<hr/>

#### <a name="tg_elseIf"></a> prompter.elseIf

```javascript
	/**
	adds a conditionnal prompter if preceeding conditions are not ok.<br/>
	can be only called after askIf or elseIf.
	@param {string} varName : data property to witch the  the resulting object will be assigned.<br/>
	If not a string, resulting object properties are directky applied to the parent object.
	@param {function(datas,localDatas)} condition : return true when condition ok.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The current prompter datas.<br/>
	@param {function(prompter,datas,localDatas)} collector : calls for a new collector if condition ok.<br/>
	- {Prompter} prompter : the prompter used to collect new questions.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The local prompter datas.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.elseIf(varName,condition,collector);
```

<hr/>

#### <a name="tg_else"></a> prompter.else

```javascript
	/**
	adds a condition if preceeding conditions are not ok.<br/>
	can be only called after askIf or elseIf.
	@param {string} varName : data property to witch the  the resulting object will be assigned.<br/>
	If not a string, resulting object properties are directky applied to the parent object.
	@param {function(prompter,datas,localDatas)} collector : calls for a new collector if condition ok.<br/>
	- {Prompter} prompter : the prompter used to collect new questions.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The local prompter datas.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.else(varName,collector);
```

<hr/>

### <a name="tg_loops"></a>Prompter loops.

<hr/>

#### <a name="tg_askWhile"></a> prompter.askWhile

```javascript
	/**
	Calls for collector while condition is ok. Creates an array of objects.<br/>
	@param {string} varName : data property to witch the  the resulting array will be assigned.<br/>
	@param {function(datas,localDatas)} condition : return true when condition ok.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The current prompter datas.<br/>
	@param {function(prompter,datas,localDatas)} collector : calls for a new collector eatch time condition ok.<br/>
	- {Prompter} prompter : the prompter used to collect new questions.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The local prompter datas.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.askWhile(varName,condition,collector);
```

<hr/>

#### <a name="tg_askLoop"></a> prompter.askLoop

```javascript
/**
	Calls for collector 'nbLoop' times. Creates an array of objects.<br/>
	@param {string} varName : data property to witch the  the resulting array will be assigned.<br/>
	@param {number>0} nbLoop : the size of the returned array.<br/>
	@param {function(prompter,datas,localDatas)} collector : calls for a new collector 'nbLoop' times.<br/>
	- {Prompter} prompter : the prompter used to collect new questions.<br/>
	- {object} datas : The current global datas.<br/>
	- {object} localDatas : The local prompter datas.<br/>
	@return {Prompter} the current prompter.
	*/
	prompter.askLoop(varName,nbLoop,collector);
```

<hr/>

### <a name="tg_result"></a>Get the result.

<hr/>

#### <a name="tg_start"></a> prompter.start

```javascript
	/**
	Starts the prompt session.<br/>
	Does not return a prompter. 'start' is the final action, call it only when all questions are prepared.
	@return {Promise} a promise flushed with the resulting datas when all questions are answered.
	*/
	prompter.start().then(datas=>{/* proceed result */})
```

<hr/>

### <a name="tg_exemples"></a> Exemples.

+ Exemples of type definitions can be found in **[YPrompt.baseTypes.js](YPrompt.baseTypes.js)**.
+ Exemple of a prompt session can be found in **[test_prompt.js](test_prompt.js)**.


<hr/>

<br/>
