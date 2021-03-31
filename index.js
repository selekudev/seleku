const npmRun = require("npm-run");


// npmRun.exec('cd dist && node lexer.js',{},(er,stdout,stderr)=>{
// 		console.log(stdout)
// });

npmRun.exec('node App.js',{},(er,stdout,stderr)=>{
		console.log("===========================================");
		console.log("========= Seleku compiler v.1.0.1 =========");
		console.log("===========================================");
		console.log("compiled file :");
		console.log(stdout);
});