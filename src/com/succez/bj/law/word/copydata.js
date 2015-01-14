/**
 * 基于已有的合同起草
 * @param {} req
 * @param {} res
 */
var SRC_TASK_ID = "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/LC_CONT_INFO";

function execute(req, res){
	var uid = req.uid;
	if(uid){
		return copyData(SRC_TASK_ID, uid);
	}
	return "";
}

function main(args){
	println(copyData(SRC_TASK_ID, "004ee957add9480aa7f57bca98f03aae"));
}

function copyData(path, uid){
	var update = sz.ci.getDataUpdater(path);
	var from = new java.util.HashMap();
	var to = new java.util.HashMap();
	from["uid"] = uid;
	
	var userObj = sz.security.getCurrentUser();
	var orgId = userObj.org.id; 
	var touid = generateDetailGrainId();
	to["UID"] = touid;
	to["ORG"] = orgId;
	update.copy(from, to);
	
	/**
	 * 需要相关数值，例如：CREATEUSER、STATUS_
	 */
	var data = new java.util.HashMap();
	var userid = userObj.id;
	update.set({UID:touid,dwtable:"HZ_CONT_INFO",field:"CREATEUSER",value:userid});
	update.set({UID:touid,dwtable:"HZ_CONT_INFO",field:"STATUS_",value:"10"});
	update.set({UID:touid,dwtable:"HZ_CONT_INFO",field:"ORG",value:orgId});
	update.set({UID:touid,dwtable:"HZ_CONT_INFO",field:"CREATETIME",value:now()});
	update.commit();
	
	return touid;
}

function generateDetailGrainId() {
	var uid = java.util.UUID.randomUUID().toString();
	return com.succez.commons.util.StringUtils.replace(uid, "-", "");
}