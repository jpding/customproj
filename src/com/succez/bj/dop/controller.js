var ActionEnter = com.baidu.ueditor.ActionEnter;
function execute(req, res){
	var rootPath = req.getSession().getServletContext().getRealPath("/");
	return (new ActionEnter(req, rootPath).exec()); 
}