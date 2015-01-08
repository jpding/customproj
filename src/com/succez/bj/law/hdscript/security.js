var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var usermgr = BeanGetter.getBean(com.succez.security.ssodb.mamage.DbssoUserManager);

/**
 * 不区分大小写登录
 */
function onLogin(args){
	var result = {};
    result.type = "fail";
    try {
    	/**
    	 * 获取库中的原始的用户名
    	 */
        var srcUser = usermgr.getUserByUserId(args.id);
        if(srcUser == null){
        	return null;
        }
        
        var user = sz.security.getSecurityManager().getUser(srcUser.getUserId(), args.password);
        if (user != null) {
            // 角色登录IP检查
            result.type = "success";
            result.data = user;
            return result;
        }
    }
    catch (e) {
        // 如果密码错误，那么这里会提示密码错误。如果不想提示密码错误，则自定义异常信息
        result.message = e.message;
    }
    if (!result.message)
        result.message = "用户名或密码错误";
    return result;
}