var StringUtils = com.succez.commons.util.StringUtils;

function main(args){
	var entity = sz.metadata.get("Settings:/scripts/views.txt");
	if(entity != null){
		var content = entity.content;
		createViews(content);
	}
}

function onserverstartup(){
	var entity = sz.metadata.get("Settings:/scripts/views.txt");
	if(entity != null){
		var content = entity.content;
		createViews(content);
	}
	
	createWordBackup();
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