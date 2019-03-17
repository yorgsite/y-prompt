

const styl=require('node-styl');

var YPrompt=new function(){
	var scope=this;
	var io={
		config:0
	};
	var build=function(){
		init();
	};
	var init=function(){
		for(var i in io){
			(function(k,obj){
				Object.defineProperty(scope,k,{get:()=>init.io(k)});
			})(i,io[i]);
		}
	};
	init.io=function(ioreq){
		if(io[ioreq]===0){
			io.config=new YP.Config();;
		}
		return io[ioreq];
	};

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
	this.addType=function(name,check,transform,parentType,defaultValue){
		var params={
			check:check,
			transform:transform,
			defaultValue:defaultValue
		};
		if(parentType in YP.types){
			params.parent=YP.types[parentType];
		}
		YP.types[name]=new YP.Type(name,params);
	};
	/**

	@retun a new Prompter
	*/
	this.prompter=function(){
		return new YP.Prompter();
	};

	this.baseTypes=()=>YP.baseTypes(scope);

	build();
}();

// ----------------------

var YP={};

YP.Config=function(){
	var scope=this;
	var data={
		styles:{
			varName:['cyan','bold'],
			type:['magenta','bold'],
			value:['white','bold'],
			defaultValue:['grey'],
			error:['red','bold'],
		}
	};
	var io={
		styles:{}
	};
	var build=function(){
		build.styles();
	};
	build.styles=function(){
		var stylesProxy={};
		var stylProxy={};
		Object.defineProperty(scope,'style',{get:()=>stylesProxy});
		Object.defineProperty(scope,'styl',{get:()=>stylProxy});
		for(var i in data.styles){
			build.style(i,stylesProxy,stylProxy);
		}
	};
	build.style=function(name,prox,stylProxy){
		io.styles[name]=new YP.Config.Style();
		io.styles[name].setValue(data.styles[name]);
		Object.defineProperty(prox,name,{
			get:()=>io.styles[name],
			set:(v)=>io.styles[name].setValue(v)
		});
		Object.defineProperty(stylProxy,name,{
			get:()=>io.styles[name].styl
		});
	};
	build();
};
YP.Config.Style=function(){
	var scope=this;
	var ref={
		front:['white','grey','black','blue','cyan','green','magenta','red','yellow'],
		back:['whiteBG','greyBG','blackBG','blueBG','cyanBG','greenBG','magentaBG','redBG','yellowBG'],
		style:['bold','italic','underline','inverse','strikethrough'],//normal
	};
	var refNeg={
		front:'',
		back:'BG',
		style:'normal'
	};
	var refVal={
		front:'',
		back:'',
		style:[]
	};
	var proxy;
	var build=function(){
		build.proxy();
		Object.defineProperty(scope,'styl',{get:()=>{
			var pile=scope.getPile();
			var _styl=styl();
			pile.forEach(v=>_styl[v]);
			return _styl.text;
		}});

	};
	build.proxy=function(){
		proxy=new Proxy({},{
			get:function(tgt,prop){
				if(scope.inRef(prop)){
					scope.setValue(prop);
				}
				return proxy;
			},
			set:function(tgt,prop,val){},
		});
		Object.defineProperty(scope,'proxy',{get:()=>proxy});

	};
	this.inRef=function(value){
		for(var n in ref){
			if(ref[n].indexOf(value)>-1){
				return n;
			}
		}
	};
	this.getPile=function(){
		var pile=[];
		if(refVal.front)pile.push(refVal.front);
		if(refVal.back)pile.push(refVal.back);
		return pile.concat(refVal.style);
	};
	this.setValue=function(value){
		var rv,rk;
		if(value instanceof Array){
			refVal={
				front:'',
				back:'',
				style:[]
			};
			for(var val of value){
				this.setValue(val);
			}
		}else if((rv=this.inRef(value))){
			if(rv==='style'){
				if(refVal[rv].indexOf(value)===-1){
					refVal[rv].push(value);
				}
			}else {
				refVal[rv]=value;
			}
		}else if((rv=(rk=Object.values(refNeg)).indexOf(value))>-1){
			rv=rk[rv];
			if(rv==='style'){
				refVal[rv]=[];
			}else {
				refVal[rv]='';
			}
		}
	};
	build();
};

YP.types={};

YP.Type=function(name,params){
	var scope=this;
	var options={};
	var build=function(){
		build.options();
		build.me();
	};
	build.options=function(){
		options.name=name;
		if(typeof(params.check)==='function'){
			options.check=params.check;
		}else {
			options.check=function(input,onError){return true;};
		}
		if(typeof(params.transform)==='function'){
			options.transform=params.transform;
		}else {
			options.transform=function(input){return input;};
		}
		options.hasDefault=typeof(params.defaultValue)!=='undefined';
		if(options.hasDefault){
			options.defaultValue=params.defaultValue+'';
		}
	};
	build.me=function(){
		Object.defineProperty(scope,'name',{get:()=>options.name});
		Object.defineProperty(scope,'options',{get:()=>options});
		if(params.parent instanceof YP.Type){// inherit behaviour
			scope.check=function(input,onError,params){
				if(params.parent.check(input,onError,params)){
					return options.check(input,onError,params);
				}
			};
			scope.transform=function(input,params){
				params.parent.transform(input,params);
			};
		}else{
			scope.check=options.check;
			scope.transform=options.transform;
		}
		scope.errorMessage=options.transform;
	};
	build();
};


YP.Prompter=function(parent){
	var scope=this;
	var collection=[];
	var beforeElse=['block','elseIf'];
	var build=function(){
	};
	var check=function(){
	};
	check.else=function(caller){
		if(!collection.length||beforeElse.indexOf(collection[collection.length-1].b_type)===-1){
			throw("Prompter."+caller+" Error: can be only called after askIf or elseIf.");
		}
	};
	check.arg=function(caller,type,argName,argValue){
		var argType=typeof(argValue);
		var valid=(argValue+'').length&&
			((type instanceof Array)?
			type.indexOf(argType)>-1:argType===type);
		if(!valid){
			throw(check.argErr(caller,argName,argValue,"must be of type '"+type+"'"));
		}
	};
	check.argErr=function(caller,argName,argValue,errMsg){
		return ["Prompter."+caller+" Error:",
			"Argument '"+argName+"' "+errMsg+".",
			"Argument Value="+argValue].join('\n\t');
	};
	var addBlock=function(b_type,varName,condition,collector){
		var obj={
			b_type:b_type,
			varName:typeof(varName)==='string'?varName:0,
			condition:condition,
			collector:collector
		};
		collection.push(obj);
		return scope;
	};
	var addLoop=function(b_type,varName,condition,collector){
		var obj={
			b_type:b_type,
			varName:typeof(varName)==='string'?varName:0,
			condition:condition,
			collector:collector
		};
		collection.push(obj);
		return scope;
	};

	/**
	Log a message between quesions.
	@param {string} message : will be logged to the console in time.
	@return {Prompter} the current prompter.
	*/
	this.log=function(message){
		var obj={
			b_type:'log',
			msg:message
		};
		collection.push(obj);
		return this;
	};

	/**
	Ask a question.
	@param {string} type : the name of the type used for the question.
	@param {string} varName : the name of the data property to witch the result will be assigned.
	@param {string} message : the question you want to ask.
	@param {object} [params] : specific questions parameters.<br/>
	@return {Prompter} the current prompter.
	*/
	this.ask=function(type,varName,message,params){
		if(type in YP.types){
			check.arg('ask','string','varName',varName);
			check.arg('ask','string','message',message);
			var obj={
				b_type:'line',
				type:type,
				varName:varName,
				message:message,
				params:typeof(params)==='object'?params:{},
			};
			obj.params.varName=varName;
			collection.push(obj);
			return this;
		}else{
			//error
		}
	};
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
	this.askIf=function(varName,condition,collector){
		check.arg('askIf','function','condition',condition);
		check.arg('askIf','function','collector',collector);
		return addBlock('block',varName,condition,collector);
	};
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
	this.elseIf=function(varName,condition,collector){
		check.else('elseIf');
		check.arg('elseIf','function','condition',condition);
		check.arg('elseIf','function','collector',collector);
		return addBlock('elseIf',varName,condition,collector);
	};
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
	this.else=function(varName,collector){
		check.else('else');
		check.arg('else','function','collector',collector);
		return addBlock('else',varName,()=>1,collector);
	};
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
	this.askWhile=function(varName,condition,collector){
		check.arg('askWhile','string','varName',varName);
		check.arg('askWhile','function','condition',condition);
		check.arg('askWhile','function','collector',collector);
		var obj={
			b_type:'while',
			varName:varName,
			condition:condition,
			collector:collector
		};
		collection.push(obj);
		return this;
	};
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
	this.askLoop=function(varName,nbLoop,collector){
		check.arg('askLoop','string','varName',varName);
		// check.arg('askLoop',['number','function'],'nbLoop',nbLoop);
		check.arg('askLoop','number','nbLoop',nbLoop);
		check.arg('askLoop','function','collector',collector);
		if(typeof(nbLoop)==='number'){
			if(nbLoop<1){
				throw(check.argErr('askLoop','nbLoop',nbLoop,"must be >= 1 "));
			}
		}
		var lid=0;
		return typeof(nbLoop)==='function'?
			this.askWhile(varName,(dat,loc)=>nbLoop()>lid++,collector):
			this.askWhile(varName,()=>nbLoop>lid++,collector);
	};
	/**
	Starts the prompt session.<br/>
	Does not return a prompter. Call only when all qustions are asked.
	@return {Promise} a promise flushed with the resulting datas when all questions are answered.
	*/
	this.start=function(){
		return parent?parent.start():new YP.Session(scope).run();
	};
	Object.defineProperty(scope,'collection',{get:()=>collection});
	// this.start=function(){};
	build();
};

YP.Session=function(prompter){
	var scope=this;
	var build=function(){

	};
	var bridge={};
	bridge.input=function(){};
	var on_input=function(text){
		text = text.split('\r')[0].split('\n')[0];
		bridge.input(text);
	};
	var run=function(then,fail){
		run.start();
		new YP.Session.Block(bridge,prompter,function(datas){
			run.stop();
			then(datas);
		},fail,0);
	};
	run.start=function(then,fail){
		process.stdin.setEncoding('utf8');
		process.stdin.on('data',on_input);
	};
	run.stop=function(then,fail){
		process.stdin.removeListener('data',on_input);
	};
	this.run=function(){
		return new Promise(run);
	};
	// process.stdin.setEncoding('utf8');
	// process.stdin.on('data',on_input);
	// process.stdin.removeListener('data',on_input);
	build();
};
YP.Session.Block=function(bridge,prompter,onDone,onFail,parentData){
	var scope=this;
	var list,id=0,datas={},cres=0;
	var build=function(){
		if(!bridge.datas){
			bridge.datas=datas;
		}
		list=prompter.collection;
		build.step();
	};
	build.step=function(){
		if(id<list.length){
			var obj=list[id];
			build[obj.b_type](obj);
		}else{
			onDone(datas);
		}
	};
	build.next=function(){
		id++;
		build.step();
	};
	build.elseIf=function(obj){
		build.block(obj);
	};
	build.else=function(obj){
		build.block(obj);
	};
	build.log=function(obj){
		console.log((typeof(obj.msg)==='function'?obj.msg(bridge.datas):obj.msg)+'');
		build.next();
	};
	build.while=function(obj){
		if(!(datas[obj.varName] instanceof Array))datas[obj.varName]=[];
		build.block(obj);
	};
	build.block=function(obj){
		// console.log('prompter = ',prompter);cres
		if((cres=obj.condition(bridge.datas,datas))){
			var subblock=new YP.Prompter(prompter);
			obj.collector(subblock,bridge.datas,datas);
			if(obj.b_type==='while'){
				new YP.Session.Block(bridge,subblock,(dat)=>{
					datas[obj.varName].push(dat);
					id--;
					build.next();
				},onFail,datas);
			}else {
				while(id<list.length-1&&['elseIf','else'].indexOf(list[id+1].b_type)>-1){
					id++;
				}
				if(obj.varName){
					datas[obj.varName]={};
				}
				new YP.Session.Block(bridge,subblock,(dat)=>{
					if(obj.varName){
						datas[obj.varName]=dat;
					}else{
						for(var i in dat){
							datas[i]=dat[i];
						}
					}
					build.next();
				},onFail);
			}
		}else{
			build.next();
		}
	};
	build.line=function(obj){
		cres=0;
		new YP.Session.Line(bridge,obj,(dat)=>{
			datas[obj.varName]=dat;
			build.next();
		},onFail);
	};
	build();
};

YP.Session.Line=function(bridge,obj,onDone,onFail){
	var scope=this;
	var msg='',type;
	var logs=new YP.LogBlock();
	var hasdef=0,dval,last='';
	var _styl=YPrompt.config.styl;
	var build=function(){
		type=YP.types[obj.type];
		build.defaultval();
		build.message();

		logs.write(msg);

		bridge.input=on.imput;
	};

	build.defaultSet=function(defaultValue){
		dval=(typeof(defaultValue)==='function'?defaultValue(bridge.datas):defaultValue)+'';
		hasdef=1;
	};
	build.defaultval=function(){
		if(typeof(obj.params.defaultValue)!=='undefined'){
			build.defaultSet(obj.params.defaultValue);
		}else if(typeof(type.options.defaultValue)!=='undefined'){
			build.defaultSet(type.options.defaultValue);
		}
	};
	build.message=function(){
		msg=obj.message+'';
		msg+=' '+_styl.varName(obj.varName)+'';
		msg+=' '+_styl.type('{'+obj.type+'}');
		if(hasdef){
			msg+=' '+_styl.defaultValue('(default='+dval+')');
		}
		msg+=' : ';
	};
	var on={};
	on.finish=function(txt){
		logs.clear();
		msg=obj.message+'';
		msg+=' '+_styl.varName(obj.varName)+'';
		msg+=' = '+_styl.value(txt);
		console.log(msg);
	};
	on.error=function(errmsg){
		logs.clear();
		logs.log(_styl.error('Error : ')+' '+errmsg);
		logs.write(msg);
	};
	on.imput=function(text){
		logs.writeOff(text);
		if(!text.length&&hasdef){
			var data=type.transform(dval,obj.params);
			on.finish(dval);
			onDone(data);
		}else if(type.check(text,on.error,obj.params)){
			var data=type.transform(text,obj.params);
			on.finish(text);
			onDone(data);
		}
	};
	build();
};

YP.LogBlock=function(){
	var scope=this;
	var stack=[];
	var getHeight=function(){
		var width=process.stdout.columns;
		var lines=[];
		var height=0;
		stack
		.map(s=>s.txt.split('\x1B\[')
		.map((t,i)=>i>0?t.substr(t.indexOf('m')+1):t).join(''))
		.forEach(s=>lines=lines.concat(s.split('\n')));
		lines.forEach(l=>{
			height+=Math.ceil(l.length/width);
		});
		return height;
	};
	this.logOff=function(txt){
		stack.push({type:'log',txt:txt});
	};
	this.writeOff=function(txt){
		if(stack.length&&stack[stack.length-1].type==='write'){
			stack[stack.length-1].txt+=txt;
		}else{
			stack.push({type:'write',txt:txt});
		}
	};
	this.log=function(txt){
		scope.logOff(txt);
		console.log(txt);
	};
	this.write=function(txt){
		scope.writeOff(txt);
		process.stdout.write(txt);
	};
	this.clear=function(){
		var height=getHeight();
		process.stdout.cursorTo(0);
		process.stdout.clearLine();
		for(var i=0;i<height;i++){
			process.stdout.moveCursor(0,-1);
			process.stdout.clearLine();
		}
		stack=[];
	};
};

// ------------ classic types -----------

YP.baseTypesLoaded=0;
YP.baseTypes=function(){
	if(!YP.baseTypesLoaded){
		require(__dirname+'/YPrompt.baseTypes.js')(YPrompt);
	}
};



module.exports=YPrompt;
