var modelInfo = {
	"384b099f5bf84bcd9780a880e688b467" : {
	 	 cont_main_type : "0600",
		  cont_sub_type : "0610",
		  money_type : "fact"
	}
}

function oninitwiform($flow){
	var fillForm = $flow.getForm();
	var nodealias = $flow.params.form;
	fillForm.setValue(nodealias,"nodealias","HZ_CONT_INFO");
	var formDom = fillForm.basedom();

	if(nodealias == "STARTFORM"){
		$("#text9",formDom).hide();
	}else{
		if("TZWBGS" == nodealias){
			$("#text9>a",formDom).text("调整");
		}
		sz.ci.custom.hzutils.removeTextLink(formDom,["text8","text6","text11","text16","text17","text7","text19"]);
	}
}

/**
* 在起草合同的时候，判断是否使用范本起草的合同，并将范本信息写入到合同信息中
*/
function oninitwiform_STARTFORM($flow){
	if (!$flow.businesskey){
		var utils = sz.utils;debugger;
		var fb_uid = utils.getParameter("fb_uid");
		var sjuid = utils.getParameter("sjuid");
		var gysdm = utils.getParameter("gysdm");
		var gcbh = utils.getParameter("gcbh");
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
			
			//初始化范本进去
			if(sz.ci && sz.ci.custom && sz.ci.custom.uploadattachment){
			   var curForm = $flow.getForm().getCurrentForm();
			   sz.ci.custom.uploadattachment.uploadAndEditContractByModel(curForm, "htwb",null,true)
			}
		}else{
			fillforms.setValue("0","iscontractmodel","HZ_CONT_INFO");
		};	
		
		//初始化审价id进去
		if(sjuid){
			var curForm = $flow.getForm().getCurrentForm();
			setTimeout(function(){
				var floatArea = curForm.getFloatArea("table5.b2");
				var row = floatArea.lastRow();debugger;
				if(!row.isBlank()){
					row = floatArea.newRow();
				}
				var comp = row.getComponent("table5.b2");
				comp.val(sjuid);
			},1000)
			
		};
		
		if(gysdm){
			var curForm = $flow.getForm().getCurrentForm();
			setTimeout(function(){
				var floatArea = curForm.getFloatArea("table1.b2");
				var row = floatArea.lastRow();debugger;
				if(!row.isBlank()){
					row = floatArea.newRow();
				}
				var comp = row.getComponent("table1.b2");
				comp.val(sjuid);
			},1000)
		};
		
		if(gcbh){
			fillforms.setValue(gcbh,"proj_num","HZ_CONT_INFO");
		}
	}

	$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(){
		sz.commons.CheckSaved.getInstance().setModified();
		if(window.parent && $(window.parent.document).find("iframe").length>0){
			var url = sz.sys.ctx("/meta/LAWCONT/analyses/index/newhome/showcontent.action?path=269582365&form=MAINTAIN")
			window.parent.navTab.openTab("custom_24",url ,{title:"合同草稿箱", fresh:true, external:true})
		}
	});
	
	/**
	 * 似乎只有合同表单切换页面时，提示 数据尚未上报，确实要离开当前页面吗？ 没找出具体原因，先在这里关闭提示
	 */
	sz.commons.CheckSaved.getInstance().off();
} 

/**
** 在“维护“的界面去掉”增加“和”删除“按钮
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