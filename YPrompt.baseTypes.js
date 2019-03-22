


module.exports=function(YPrompt){

	var YP={};

	YP.Lists=function(){};

	YP.Lists.test=(type,filter,inpt,onerr,params)=>{
		var list=inpt.split(',');
		if(typeof(params.min)==='number'&&list.length<params.min){
			onerr(`length is < ${params.min}`);
		}else if(typeof(params.max)==='number'&&list.length>params.max){
			onerr(`length is > ${params.max}`);
		}
		var flen=list.filter(filter).length;
		if(list.length===flen){
			return 1;
		}else{
			onerr(`[${list}] has '${list.length-flen}' invalid ${type}`);
		}
	};

	YP.Lists.test_numeric=(type,parser,inpt,onerr,params)=>{
		var cmin=()=>1,cmax=()=>1;
		if(typeof(params.vmin)==='number'){
			cmin=txt=>parser(txt)>=params.vmin;
		}
		if(typeof(params.vmax)==='number'){
			cmax=txt=>parser(txt)<=params.vmax;
		}
		return YP.Lists.test('varNames',txt=>(parser(txt)+''===txt)&&cmin(txt)&&cmax(txt),inpt,onerr,params);
	};
	YP.Lists.get_numeric=(parser)=>((inpt)=>inpt.split(',').map(txt=>parser(txt)));

	// -------------------------
	/**
	gets a 'y' (for Yes) or 'n' (for No) answer as a boolean
	*/
	YPrompt.addType('yn',
		function(inpt,onerr,params){//check
			if(['n','y'].indexOf(inpt.toLowerCase())>-1){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid answer, accepted are 'y' for yes or 'n' for no.`);
			}

		},
		function(inpt){return !!(['n','y'].indexOf(inpt.toLowerCase()));}//transform gets boolean
	);

	/**
	gets a numeric answer as a number
	*/
	YPrompt.addType('number',
		function(inpt,onerr,params){//check
			var num=parseFloat(inpt);
			if(inpt===num+''){
				if(typeof(params.min)==='number'&&num<params.min){
					onerr(`${num} is < ${params.min}`);
				}else if(typeof(params.max)==='number'&&num>params.max){
					onerr(`${num} is > ${params.max}`);
				}else{
					return 1;
				}
			}else{
				onerr(`'${inpt}' is not a valid number`);
			}

		},
		function(inpt){return parseFloat(inpt);}//transform
	);

	/**
	gets a numeric integer answer as an integer
	*/
	YPrompt.addType('int',
		function(inpt,onerr,params){//check
			var num=parseInt(inpt);
			if(inpt===num+''){
				if(typeof(params.min)==='number'&&num<params.min){
					onerr(`${num} is < ${params.min}`);
				}else if(typeof(params.max)==='number'&&num>params.max){
					onerr(`${num} is > ${params.max}`);
				}else{
					return 1;
				}
			}else{
				onerr(`'${inpt}' is not a valid number`);
			}

		},
		function(inpt){return parseInt(inpt);}//transform
	);

	/**
	gets a var name answer as a string
	*/
	YPrompt.addType('varName',
		function(inpt,onerr,params){//check
			var reg = /^[A-Za-z][A-Za-z0-9]*$/;
			if(inpt.length&&inpt.match(reg)){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid varName`);
			}

		},
		function(inpt){return inpt;}//transform
	);

	/**
	gets a var name splitted with at least one '-' answer as a string
	*/
	YPrompt.addType('-varName',
		function(inpt,onerr,params){//check
			var reg = /^[A-Za-z][A-Za-z0-9]+[\-][A-Za-z0-9\-]+[A-Za-z0-9]*$/;
			if(inpt.length&&inpt.match(reg)){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid -varName`);
			}

		},
		function(inpt){return inpt;}//transform
	);

	/**
	gets a file name answer as a string
	*/
	YPrompt.addType('fileName',
		function(inpt,onerr,params){//check
			var reg = /^[A-Za-z0-9_+\-\.]*$/;
			if(inpt.length&&inpt.match(reg)){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid fileName`);
			}

		},
		function(inpt){return inpt;}//transform
	);

	// ------------------- specials
	/**
	gets an answer from a list of choices
	*/
	YPrompt.addType('enum',
		function(inpt,onerr,params){//check
			if(typeof(params)!=='object'||!(params.list instanceof Array)||!params.list.length){
				console.log('params=',params);
				throw('Prompt enum error: params.list must be a non empty array');
			}
			if(inpt.length&&params.list.indexOf(inpt)>-1){
				return 1;
			}else{
				onerr(`'${inpt}' is not a valid answer, accepted are : [${params.list}].`);
			}

		},
		function(inpt){return inpt;}//transform
	);
	/**
	gets a json answer as an object
	*/
	YPrompt.addType('json',
		function(inpt,onerr,params){//check
			try{
				JSON.parse(inpt);
				return 1;
			}catch(e){
				onerr(`'${inpt}' is not a valid JSON`);
			}
		},
		function(inpt){return JSON.parse(inpt);}//transform
	);
	//var asFunc = new Function(customJSfromServer);
	// var expression = 'return 2+2+2;'
	// var result = eval('(function() {' + expression + '}())');

	// ------------------- lists

	/**
	gets a list of var names splitted bay ',' answer as an array
	*/
	YPrompt.addType('varNameList',
		function(inpt,onerr,params){//check
			var reg = /^[A-Za-z][A-Za-z0-9]*$/;
			return YP.Lists.test('varNames',txt=>txt.match(reg),inpt,onerr,params);
		},
		function(inpt){return inpt.split(',');}//transform
	);
	/**
	gets a list of numbers splitted bay ',' answer as an array
	*/
	YPrompt.addType('numberList',
		function(inpt,onerr,params){//check
			return YP.Lists.test_numeric('numberList',parseFloat,inpt,onerr,params);
		},
		YP.Lists.get_numeric(parseFloat)//transform
	);
	/**
	gets a list of integers splitted bay ',' answer as an array
	*/
	YPrompt.addType('intList',
		function(inpt,onerr,params){//check
			return YP.Lists.test_numeric('intList',parseInt,inpt,onerr,params);
		},
		YP.Lists.get_numeric(parseInt)//transform
	);


};
