function execute(req, res){
	var user = sz.security.getCurrentUser();
	/**
	 * 部门领导、总法律顾问、部长、总会计师 
	 */
	var roles = ["部门领导", "总法律顾问", "部长", "总会计师"];
	var hidden = false;
	for(var i=0; i<roles.length; i++){
		if(user.hasRole(roles[i])){
			hidden = true;
			break;
		}
	}
	res.attr("hidden", hidden ? 1:0);
	return "newhome.ftl";
}