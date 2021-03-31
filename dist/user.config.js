class SelekuComponents_@seleku_pre extends SelekuComponents{
	constructor(){
		super();
	}
}

registeryComponents(@seleku_pre,SelekuComponents_@seleku_pre);
Render(@seleku_pre,document.querySelector(@seleku_selector));
