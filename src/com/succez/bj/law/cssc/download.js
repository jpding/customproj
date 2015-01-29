/**
 * 下载指定目录下的文件
 * @param {} req
 * @param {} res
 * 
 * 下载地址  download.action?path=xxxx
 */
var ActionUtils = com.succez.commons.webctrls.domain.ActionUtils;
var IOUtils     = com.succez.commons.util.io.IOUtils;
var File = java.io.File;
var StringUtils = com.succez.commons.util.StringUtils;
var BufferedInputStream = java.io.BufferedInputStream;
var FileInputStream = java.io.FileInputStream;

var BASE_DIR = "";
 
function execute(req, res){
	try{
		var ins = getFileInput(req);
		try{
			ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), null,"utf-8", null, req.path);
			var out = res.getOutputStream();
			try{
				IOUtils.copy(ins, out);
			}finally{
				out.close();
			}
		}finally{
			ins.close();
		}
	}catch(ex){
		return ex.toString();
	}
}

function getFileInput(req){
	var path = req.path;
	if(path == null){
		throw new Error("path参数不能为空");
	}
	
	var dir = StringUtils.ensureNotEndWith(BASE_DIR, "/");
	if(path.charAt(0)!="/" && path.charAt(0)=="\\"){
		path = "/" + path;
	}
	var filePath = dir+path;
	
	var file = new File(filePath);
	if(!file.exists()){
		throw new Error("文件不存在“"+filePath+"”");
	}
	
	return new BufferedInputStream(new FileInputStream(file));
}