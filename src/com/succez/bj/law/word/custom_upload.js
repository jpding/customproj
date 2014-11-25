/**
 * @createdate 2014-10-10
 * @author wangyg
 * 
 * 本脚本主要是处理范本拷贝，在业务中表现在点击选择合同范本，然后会出现范本选择界面，在界面中点击一行来选择，之后把选择的范本内容和名称插入到当前的
 * 表单中
 */
(function($){
 	var upload = sz.sys.namespace("sz.ci.custom.uploadattachment");
	
	/**
	 *	范本引入
	 */
	upload.uploadAndEditContractByModel = function($form, compid) {
		var val = $form.getComponent(compid).getAttachmentValue();
		if (val != null){
			upload.editAttachmentAsDoc($form, compid);
			return;
		}
		
		var uid = $form.getComponent("fb_uid").val();
		var data = {
			resid		        : 18907146,
			dataperiod		  : "",
			datahierarchies	: "",
			formName		    : "LC_CONTRACTINFO",
			compid		      : compid,
			compress		    : false,
			ciattachment		: {
				taskid			     : 26607626,
				formset			     : "default",
				dataperiod			 : "",
				datahierarchies		: "",
				rowkey : uid,
				dwTable			     : "FM_TPL_INFO",
				fileContentField	: "ATTACHMENT1",
				fileNameField			: "FN0"
			},
			success		      : function(info) {
				upload.editAttachmentAsDoc($form, compid);
			}
		};
	
		var $fillforms = $form.getFillForms();
		var datamgr    = $fillforms.getDataMgr();
		/**
		 * 重载保存草稿的功能，从范本
		 */
		if(!datamgr.oldAjax){
			datamgr.oldAjax = datamgr.ajax;
		
			datamgr.ajax = function(args){
				/**
				 * sz.sys.ctx("/cifill/uploadAttachment2")
				 */
				var url = args.url;
				
				if(url == sz.sys.ctx("/cifill/uploadAttachment2")){
					args.url = sz.sys.ctx("/meta/LAWCONT/others/word/wordedit.action?method=saveDraft");
					args.data.path = args.data.resid;
					datamgr.oldAjax(args);
				}else{
					datamgr.oldAjax(args);
				}
			}
		}
		
		$fillforms.uploadAttachment(data);
	}
	
	/**
	 * 编辑表单中的word文件
	 * sz.ci.custom.uploadattachment.editAttachmentAsDoc($form, "htwb");
	 */
	upload.editAttachmentAsDoc = function($form, compid){
		var htwb = $form.getComponent(compid);

		if(!htwb.oldGetAttachmentValue){
			htwb.oldGetAttachmentValue = htwb.getAttachmentValue;
		
			htwb.getAttachmentValue=function(){
				var attachmentInf = htwb.oldGetAttachmentValue();
				if(!attachmentInf){
					return null;
				}
				var customUrl = sz.sys.ctx("/meta/LAWCONT/others/word/wordedit.action");
				/**
				 * /cifill/downloadAttachment?resid=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
				 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord
				 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord&path=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
				 */
				var url = attachmentInf.url;
				var idx = url.indexOf("?");
				url = url.substring(idx);
				var resid = sz.utils.getParameterOfUrl("resid", url);
				url = sz.utils.setParameterOfUrl("path", resid, url);
				url = customUrl+sz.utils.setParameterOfUrl("method", "downloadFormWord", url);
				attachmentInf.url = url;
				/**
				 * 
				 */
				attachmentInf.name = "word.doc";
				return attachmentInf;
			}
		}
		htwb.editAttachmentAsDoc({filename:"word.doc",success:function(){
			/**
			 * alert('123');
			 */
		}});
	}
})(jQuery)