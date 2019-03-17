const styl=require('node-styl');

const YPrompt=require('./YPrompt.js');

YPrompt.config.style.varName='green';
YPrompt.baseTypes();

YPrompt.prompter()

.log(datas=>'\n--------- Starting prompt ---------\n')
.log(datas=>'You can cancel with Ctrl+C at any moment.\n')

.ask('number','numvalue','choose a number',{defaultValue:'1'})
.ask('varName','rootName','root name of your data')
//.ask('varName','rootName','root name of your data',{defaultValue:datas=>'default_'+datas.numvalue})

.askIf('sub_object',function(datas,localDatas){
	return datas['numvalue']>0;
},function(prompter,datas,localDatas){
	prompter.log(datas=>'First number '+datas.numvalue+' was > 0 .');

	prompter.ask('varName','name','- choose a name',{defaultValue:datas=>datas.rootName+'_00'});
	prompter.ask('number','value','- choose a value',{defaultValue:datas=>datas.numvalue});
})
.elseIf(0,function(datas,localDatas){
	return datas['numvalue']<0;
},function(prompter,datas,localDatas){
	prompter.log(datas=>'First number '+datas.numvalue+' was < 0 .');
	prompter.ask('varNameList','value2','- choose some var names',{min:1});
})
.else('zero_object',function(prompter,datas,localDatas){
	prompter
	.log(datas=>'First number '+datas.numvalue+' was == 0 .')
	.log(datas=>'- Choose 3 numbers :')
	.askLoop('number_list',3,function(lprompter,datas,localDatas){
		lprompter
		.log(datas=>'- item['+(localDatas.number_list.length+1)+'] / 3')
		.ask('number','value','  - Enter number',{defaultValue:datas=>localDatas.number_list.length+1});
	})
})

.log(datas=>'\n-------- End of the prompt --------\n')

.start()
.then(function(res){
	console.log('\nfinished result=',JSON.stringify(res));
	process.exit();
});
;
// process.stdin.setEncoding('utf8');
// process.stdin.on('data',on_input);
// process.stdin.removeListener('data',on_input);
