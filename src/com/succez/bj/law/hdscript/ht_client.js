var modelInfo = {
	3520 : {
	 	 cont_main_type : "0600",
		  cont_sub_type : "0610",
		  money_type : "fact"
	}
}

/**
* 在起草合同的时候，判断是否使用范本起草的合同，并将范本信息写入到合同信息中
*/
function oninitwiform_STARTFORM($flow){
	var utils = sz.utils;
	var fb_uid = utils.getParameter("fb_uid");
	var fillforms = $flow.getForm();
	if (fb_uid && fb_uid != ""){
		fillforms.setValue(fb_uid,"fb_uid","HZ_CONT_INFO");
		fillforms.setValue("1","iscontractmodel","HZ_CONT_INFO");
		
		var info = modelInfo[fb_uid];
		if (info){
			for (var name in info){
				fillforms.setValue(info[name],name,"HZ_CONT_INFO");
			}
		}
	}else{
		fillforms.setValue("0","iscontractmodel","HZ_CONT_INFO");
	};

	$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(){
		sz.commons.CheckSaved.getInstance().setModified();
		if(window.parent && $(window.parent.document).find("iframe").length>0){
			var url = sz.sys.ctx("/meta/LAWCONT/analyses/index/newhome/showcontent.action?path=269582365&form=MAINTAIN")
			window.parent.navTab.openTab("custom_24",url ,{title:"合同草稿箱", fresh:true, external:true})
		}
	});
} 


/**
** 在“维护“的界面提供”增加“和”删除“按钮
**/
function oninitwiquery($flow){
	var buttons = ['wiadd'];
	hiddenWIButtons($flow, buttons);
	if(($flow.form && ($flow.form == "MAINTAIN")) || ($flow.query && ($flow.query == "MAINTAIN"))){}
};

function hiddenWIButtons($flow, buttons){
	$.each(buttons, function(){
		if($flow.getButton(this)){
          $flow.getButton(this).setVisible(false);
     	}	
	})
}

/**
* 隐藏某些按钮
*/
function disableButtons(formDom,removeIDs){
	if (removeIDs){
		for (var i=0;i<removeIDs.length;i++){
			var id = removeIDs[i];
			var dom = $("#"+id,formDom);
			var text = dom.text();
			dom.find("a").remove();
			dom.text(text).css("color","black").css("text-decoration" , "none");
		}
	};
}

/**
   在规章制度立项的时候，不显示在线编辑按钮，只允许上传规章制度文本
*/
function oninitwiform($flow){
	var fillForm = $flow.getForm();
	var formDom = fillForm.basedom();
	if($flow.form=="STARTFORM"){
		disableButtons(formDom,["text9"]);
		$("#text9").hide();
	}else{
		disableButtons(formDom,["text8","text6","text11","text16","text17","text7"]);
	}
}

