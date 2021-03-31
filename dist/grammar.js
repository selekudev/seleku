let fs = require("fs");
let beautify = require('js-beautify').js;
let all_file_context = [];

class grammar{

	constructor(args){
		this._path = args.path;
        this._file_name = args.file_name;
        this.config = args.config;
        if (args.content) this.content = args.content; 
	}

	read(){

		if(this.file_name instanceof Array)
			this.file_name.forEach((i)=>{

				fs.open(this._path+i,"r",(err,data)=>{
					if(err) throw err;

					 // baca file
                    fs.readFile(data, (err, _data) => {
                        if (err) throw err;
                        all_file_context.push(_data.toString('utf8'));
                    });
				});

			});
		else
			fs.open(this._path+this._file_name,"r",(err,data)=>{
				if(err) throw err;
				 // baca file
                fs.readFile(data, (err, _data) => {
                    if (err) throw err;
                    console.log(_data.toString('utf8'))
                });
			});
		return all_file_context;

	}


	write(){
		if(this.file_name instanceof Array)
			this.file_name.forEach((i)=>{

				fs.open(this._path+i,"w+",(err,data)=>{
					if(err) throw err;

					 // baca file
                    fs.writeFile(data,this.content, (err) => {
                        if (err) throw err;
                    });
				});

			});
		else
			fs.open(this._file_name,"w+",(err,data)=>{
				if(err) throw err;
				 // baca file
                fs.writeFile(data,beautify(this.content, { indent_size: 2, space_in_empty_paren: true }), (err) => {
                    if (err) throw err;
                });
			});
	}


}

module.exports = {
	grammar,
	all_file_context
};

