const styl=require('node-styl');

const YPrompt=require('./YPrompt.js');
//const YPrompt=require('y-prompt');


YPrompt.config.style.varName='green';
YPrompt.baseTypes();

YPrompt.prompter()

.log(dat=>'\n--------- Starting prompt ---------\n')
.log(dat=>'You can cancel with Ctrl+C at any moment.\n')

.ask('number','numvalue','choose a number',{defaultValue:'1'})
.ask('varName','rootName','root name of your data')

.askIf('sub_object',function(datas,localDatas){
	return datas['numvalue']>0;
},function(prompter,datas,localDatas){
	prompter.log(dat=>'First number '+dat.numvalue+' was > 0 .');

	prompter.ask('varName','name','- choose a name',{defaultValue:dat=>dat.rootName+'_00'});
	prompter.ask('number','value','- choose a value',{defaultValue:dat=>dat.numvalue});
})
.elseIf(0,function(datas,localDatas){
	return datas['numvalue']<0;
},function(prompter,datas,localDatas){
	prompter.log(dat=>'First number '+dat.numvalue+' was < 0 .');
	prompter.ask('varNameList','value2','- choose some var names',{min:1});
})
.else('zero_object',function(prompter,datas,localDatas){
	prompter
	.log(dat=>'First number '+dat.numvalue+' was == 0 .')

	.ask('int','listSize','How many items in the list [1-10] ?',{min:1,max:10})

	.log((dat,local)=>'- Choose '+local.listSize+' numbers :')

	.askLoop('number_list',(dat,local)=>local.listSize,function(lprompter,datas,localDatas){
		lprompter
		.log(dat=>'- item['+(localDatas.number_list.length+1)+'] / '+localDatas.listSize)
		.ask('number','value','  - Enter number',{defaultValue:dat=>localDatas.number_list.length+1});
	},v=>v.value);
})

.log(dat=>'\n-------- End of the prompt --------\n')

.start()
.then(function(res){
	console.log('\nfinished result=',JSON.stringify(res));
	process.exit();
});
