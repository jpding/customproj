/**
 * @createdate 2014-10-10
 * @author wangyg
 * 
 * 本脚本主要是处理范本拷贝，在业务中表现在点击选择合同范本，然后会出现范本选择界面，在界面中点击一行来选择，之后把选择的范本内容和名称插入到当前的
 * 表单中
 */
(function($){
 	var upload = sz.sys.namespace("sz.ci.custom.uploadattachment");
 	
 	upload.WORD_URL = "/meta/LAWCONT/others/word/wordedit.action";
	
	/**
	 *	范本引入
	 */
	upload.uploadAndEditContractByModel = function($form, compid,callback) {
		var compObj = $form.getComponent(compid);
		var val = compObj.getAttachmentValue();
		if (val != null){
			upload.makeTemplateContract($form, compid, callback);
			/*
			 * upload.editAttachmentAsDoc($form, compid);
			 */
			return;
		}
		
		var uid = $form.getComponent("fb_uid").val();
		var data = {
			resid		        : 18907146,
			dataperiod		  : "",
			datahierarchies	: "",
			formName		    : $form.getFormName(),
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
			formdatas : JSON.stringify(upload.getFillFormDatas($form)),
			success		      : function(info) {
				var newInfo = $form.getFormData().getAttachment(compid);
				compObj.setAttachmentValue(newInfo);
				upload.editAttachmentAsDoc($form, compid,callback);
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
					args.url = sz.sys.ctx(upload.WORD_URL+"?method=saveDraft");
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
	upload.editAttachmentAsDoc = function($form, compid,callback){
		var htwb = $form.getComponent(compid);

		if(!htwb.oldGetAttachmentValue){
			htwb.oldGetAttachmentValue = htwb.getAttachmentValue;
		
			htwb.getAttachmentValue=function(){
				var attachmentInf = htwb.oldGetAttachmentValue();
				if(!attachmentInf){
					return null;
				}
				
				attachmentInf.url = upload.refactorAttachmentUrl("downloadFormWord", attachmentInf.url);
				if(!attachmentInf.name){
					attachmentInf.name = "word.doc";
				}
				/**
				 * attachmentInf.name = "word.doc";
				 */
				return attachmentInf;
			}
		}
		
		if(!htwb.oldEditAttachmentAsDoc){
			htwb.oldEditAttachmentAsDoc = htwb.editAttachmentAsDoc;
			
			htwb.editAttachmentAsDoc = function(params){
				htwb.editAttachmentAs(function(args) {
				    var nmspace = sz.utils.guid("sz.ci.editattachment.");
				    var nmspaceObj = sz.sys.namespace(nmspace);
				    /**
				     * 20141104 guob
				     * ISSUE:LAWCONT-38
				     * 问题现象：在调用cifillforms的editAttachmentAsDoc方法时设置的回调函数initPlugin不起作用
				     * 问题原因：editAttachmentAsDoc方法中没有设置参数，导致外面传入的回调函数不起作用
				     * 解决方案：editAttachmentAsDoc方法支持设置参数并将该参数合并到已有的参数中，这样外部传入的
				     * 回调函数就可以正常使用了
				     */
				    var success = params && params.success;
				    var nargs = $.extend({}, params, args);
				    
				    nmspaceObj.getOpenUrl = function() {
					    return nargs.url;
				    }
				    nmspaceObj.getSaveArgs = function() {
				    	var save = nargs.save;
				    	save.url = sz.sys.ctx(upload.WORD_URL+"?method=saveWordInForm");
						if(!save["path"]){
							save["path"] = save.resid;
							save.resid = null;
							delete save.resid;
						}
						
					    return save;
				    }
				    nmspaceObj.getArgs = function() {
					    return nargs;
				    }
				    nmspaceObj.getFileName = function() {
					    return nargs.filename;
				    }
				    nmspaceObj.success = function(info) {
					    nargs.success(JSON.parse(info));
					    success && success();
				    }
				    /**
				     * window.open(sz.sys.ctx("/wsoffice/edit?namespace=" + nmspace));
				     */
				    window.open(sz.sys.ctx(upload.WORD_URL+"?namespace=" + nmspace));
			    });
			}
		}
		
		htwb.editAttachmentAsDoc(callback);
	}
	
	
	upload.getFillFormDatas = function($form){
		var allcompdatas = $form.getFormData()["componentsdata"];
		var compdatas = $.grep(allcompdatas, function(n, i){
			return n && n.compinf && n.compinf.dbfield;
		})
		var result = {};
		for(var i=0; compdatas && i<compdatas.length; i++){
			var compData = compdatas[i];
			var vv = compData.getSubmitValue();
			result[compData.compinf.dbfield] = vv;
		}
		return result;
	}
	
	/**
	 * 生成范本合同：
	 *   1.如果表单里面还没有合同，那么直接取出范本，根据表单字段生成并存储到草稿中
	 *   2.如果存在合同，那么最开始应该从合同表单里面取出，在存储的草稿中
	 *   3.如果存在合同，并且在草稿中，那么就从草稿中重新取出合同
	 */
	upload.makeTemplateContract = function($form, compid, callback){
		var compObj = $form.getComponent(compid);
		var attachmentVal = compObj.getAttachmentValue();
		if (attachmentVal != null){
			/**
			 * 2、3 从表单或者草稿中取出合同
			 */
			var data = {
				formdatas:JSON.stringify(upload.getFillFormDatas($form)),
				formName		    : $form.getFormName(),
				compid		      : compid
			};
			
			var url = upload.refactorAttachmentUrl("makecontract", attachmentVal.url);
			$.post(url, data, function(info){
				compObj.setAttachmentValue(info);
				upload.editAttachmentAsDoc($form, compid,callback);
			});
		}else{
			/**
			 * 1.从范本里面取出合同
			 */
			
		}
	}
	
	/**
	 * 重构表单中的link地址，改用脚本实现
	 */
	upload.refactorAttachmentUrl = function(method, srcUrl){
		var customUrl = sz.sys.ctx(upload.WORD_URL);
		/**
		 * /cifill/downloadAttachment?resid=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
		 * /cifill/downloadAttachment?resid=18907146&dataperiod=20141221&datahierarchies=ORG%253DtestOrg%2526UID%253D38491bcb84ee4156a67cb2a9608661e4&rowKey=&dwTable=HZ_CONT_INFO&fileContentField=HTWB&fileNameField=FN0
		 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord
		 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord&path=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
		 */
		var url = srcUrl;
		var idx = url.indexOf("?");
		url = url.substring(idx);
		var resid = sz.utils.getParameterOfUrl("resid", url);
		url = sz.utils.setParameterOfUrl("path", resid, url);
		url = customUrl+sz.utils.setParameterOfUrl("method", method, url);
		/**
		 * attachmentInf.name = "word.doc";
		 */
		return url;
	}
})(jQuery)