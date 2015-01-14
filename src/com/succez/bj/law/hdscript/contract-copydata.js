function copyData(uid){
	var url = sz.sys.ctx("/meta/LAWCONT/others/word/copydata.action");
	$.post(url, {"uid":uid}, function(newUid){
		///9ff7e1f1823a4369ac6afcb4bfa7ac19
		var newUrl = sz.sys.ctx("/wiapi/showStartForm?resid=LAWCONT:/workflows/HD_PROJECT/HDGZL_HTGL/CONT_INFO2&mode=form&businesskey="+newUid);
		top.navTab.openTab("custom_24",newUrl ,{title:"合同起草", fresh:true, external:true});
	})
}