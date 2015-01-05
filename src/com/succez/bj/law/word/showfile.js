var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);

var MyByteArrayOutputStream = com.succez.commons.util.io.MyByteArrayOutputStream;
var MyByteArrayInputStream  = com.succez.commons.util.io.MyByteArrayInputStream;
var FilenameUtils    = com.succez.commons.util.FilenameUtils;
var IOUtils   = com.succez.commons.util.io.IOUtils;
var ContentTypeUtils = com.succez.commons.util.ContentTypeUtils;

var ProtectionType = com.aspose.words.ProtectionType;
var URLDecoder = java.net.URLDecoder;

/**
 * 在线显示表单、事实表中附件，支持word、pdf、图片等
 */
function execute(req, res){
	var myOut = new MyByteArrayOutputStream();
	try{
		var attachmentInf = getAttachment(req, myOut);
	
		var filename = attachmentInf.getFilename();
		var ext = FilenameUtils.getExtension(filename);
		var contentType = ContentTypeUtils.getContentType(ext);
		if(ext == "doc" || ext == "docx"){
			res.attr("downloadtype",ProtectionType.READ_ONLY);
			res.attr("method", "downloadFormWord");
			return "wordedit.ftl";
		}else if(ext == "pdf"){
			showPdf(res, myOut);
		}else if(contentType.indexOf("image")>-1){
			showPdf(res, myOut);
		}else{
			
		}
	}finally{
		myOut.close();
	}
}

/**
 * 直接显示图片大小，需要判断图片的大小，如果超过一屏幕，应该显示设置图片的最佳大小
 */
function showImage(res, attachment){
	
}

/**
 * 如果是IE8，那么进行转换显示，如果安装有插件，那么自动调用本地插件显示，反之则转换
 * 成html显示，
 * @param {} res
 */
function showPdf(res, myOut){
	var out = res.getOutputStream();
	try{
		var input = myOut.asInputStream();
		IOUtils.copy(input, out);
	}finally{
		out.close();
	}
}

/**
 * 使用插件打开，并且以只读模式打开
 * @param {} res
 */
function showWord(res, attachment){
	
}

/**
 * 获取采集中的
 */
function getAttachment(req, out){
	var resid = req.path;
	var datahierarchies = req.datahierarchies;
	println("datahierarchies:"+datahierarchies);
	
	var dedatahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
	println("datahierarchies:"+dedatahierarchies);
	
	var dataperiod = req.dataperiod;
	var rowKey = req.rowKey;
	var dwTable = req.dwTable;
	var fileContentField = req.fileContentField;
	var fileNameField    = req.fileNameField;
	var citask = serviceAttachments.getCITask(resid);
	
	var attachmentInf = serviceAttachments.getAttachment(citask, dataperiod, dedatahierarchies, rowKey,
		dwTable, fileContentField, fileNameField, out);
	
	return attachmentInf;
}