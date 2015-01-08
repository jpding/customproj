var StringUtils = com.succez.commons.util.StringUtils;

function main(args){
	var entity = sz.metadata.get("Settings:/scripts/views.txt");
	if(entity != null){
		var content = entity.content;
		createViews(content);
	}
	
	createConflictTable();
}

function onserverstartup(){
	/**
	 * 创建视图
	 */
	var entity = sz.metadata.get("Settings:/scripts/views.txt");
	if(entity != null){
		var content = entity.content;
		createViews(content);
	}
	
	/**
	 * 创建word备份表
	 */
	createWordBackup();
	
	/**
	 * 创建word编辑冲突表
	 */
	
}

function createViews(content){
	var ds = sz.db.getDefaultDataSource();
	var views = StringUtils.split(content, ";");
	for(var i=0; views != null && i<views.length; i++){
		var view = views[i];
		try{
			ds.update(view);
		}catch(e){
			println(e);
		}
	}
}

var DB_BACKUP_WORD = "SZSYS_CS_WORD";

/**
 * 创建word备份表，
 */
function createWordBackup(){
	var ds = sz.db.getDefaultDataSource();
	if(!ds.existTable(DB_BACKUP_WORD)){
		var conn = ds.getConnection();
		try{
			var createTable = ds.getUtils().getCreateTableProvider(conn, DB_BACKUP_WORD);
			createTable.addTimestampColumn("SUBMITTIME_", null, true, "时间戳");
			createTable.addVarcharColumn("USERID_", 100,null,false,"用户ID");
			createTable.addVarcharColumn("FACTTABLE_", 100,null,false,"事实表");
			createTable.addVarcharColumn("PATH_", 200,null,false,"流水号");
			createTable.addBlobColumn("CONTENT_", "word文件");
			createTable.createTable();
		}finally{
			conn.close();
		}
	}
}

var DB_WORD_CONFLICT = "SZ_CUSTOM_CONFLICT";
/**
 * 创建冲突表
 */
function createConflictTable(){
	var ds = sz.db.getDefaultDataSource();
	if(!ds.existTable(DB_WORD_CONFLICT)){
		var conn = ds.getConnection();
		try{
			var createTable = ds.getUtils().getCreateTableProvider(conn, DB_WORD_CONFLICT);
			createTable.addVarcharColumn("ID_", 40,null,false,"访问流水号");
			createTable.addTimestampColumn("CREATETIME_", null, true, "时间戳");
			createTable.addVarcharColumn("TASKID_", 100,null,false,"采集任务");
			createTable.addVarcharColumn("UID_", 100,null,false,"明细表");
			createTable.addVarcharColumn("FORMNAME_", 40,null,false,"表单名");
			createTable.addVarcharColumn("USERID_", 100,null,false,"用户名");
			createTable.addVarcharColumn("SESSIONID_", 40,null,false,"用户访问ID");
			createTable.createTable();
		}finally{
			conn.close();
		}
	}else{
		ds.update("DELETE FROM "+DB_WORD_CONFLICT);
	}
}