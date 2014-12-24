<#--
@depends sz.commons.html,sz.commons.outputCsses,sz.metadata.resource
-->
<@sz.commons.dynamicImport depends="sz.commons.outputJses,sz.commons.outputCsses,sz.security.ptask,sz.commons.html.simplehtml,sz.commons.tabset.eclipseTabset,sz.commons.widget"/>
<@sz.commons.htmlDirective>
	<head>
		<@sz.commons.html.head.meta/>
		<@sz.metadata.resource.importResourceDepends path="LAWCONT:/analyses/HZ_queryAndAny/index_report/didwork" params={}/>
		<@outputCsses/>

	<style>
		.custom-portal-scroll {
			width: 100%;
			height: 100%;
			position: relative;
			overflow: auto;
		}
		.custom-portal-container{
			margin: 0;
		}
		.sz-commons-widget-header{
			background:#fff url(images/home_tab_bg.png) top left no-repeat;
		}
		.sz-commons-widget-header-title{
			color: #E77E12;
			padding-left: 4px;
			font-weight: bold;
			font-family: 微软雅黑;
			font-size: 15px;
		}
		.custom-portal-layout{
			width:98%;
			display:inline-block;
			vertical-align:top;
			margin:10px;
		}
		#kjfs{
			height : 150px;
		}
		
		#dbsx,		#ybsx{
			height : 230px;
			width:49%;
			display: inline-block;
		}
		
        #ybsx{
			margin-top: 10px;
		}
		
		#sssxjz,#sswc{
			height : 230px;
			width:50%;
			display: inline-block;
		}
		.custom-portal-layout-h250{
			height:250px;
			margin:0;
		}
		
		.custom-portal-layout-w{
			width:48%;
		}
		
		.sz-commons-widget{
			height:100%;
			position:relative;
			border: 1px solid #CCDFED;
			background: #FFF;
		}
		.sz-commons-widget-section{
			position:absolute;
			top:30px;
			bottom:0px;
			left:0px;
			right:0px;
		}
		.custom-portal-layout tr{
			border-bottom: 1px solid #CCDFED;
		}
		.custom-portal-news{
			position: relative;
			width: 100%;
			height:100%;
		}
		.custom-portal-news-item{
			border-bottom: 1px dotted #67a6de;
			padding: 0 16px;
		}
		.custom-portal-news-item a{
			color: #666;
			text-decoration: none;
			line-height: 29px;
			outline: 0;
			display: block;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.custom-portal-news-item a:hover{
			color:#999
		}
		.sz-commons-simplelist thead tr{
			border-bottom: 1px solid #CCDFED;
		}
		
		.sz-commons-widget-header-title em{
			float:right;
			position:relative;
			margin-right:10px;
			cursor: pointer;
		}
	</style>
	</head>			
<@sz.commons.html.body>		
<div class="custom-portal-scroll">
	<div class="custom-portal-container">
		<span class="custom-portal-layout">
			<@sz.commons.widget id="kjfs" title="快捷方式">
				<div class="custom-portal-news">
					<iframe src="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/report_shortcut&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false&amp;$sys_disableCache=true')}" style="width:100%;height:100%;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
				</div>
				<#---
				<div class="portal-layout-content">
					<@sz.metadata.resource path="LAWCONT:/analyses/maintain/home/report_shortcut" params={"$sys_calcnow":"true"} showiniframe=true/>
				</div>
				-->
			</@sz.commons.widget>
		</span>
		<span class="custom-portal-layout">
			<@sz.commons.widget id="dbsx" title="待审批事项"  iconCls=".sz-app-icon sz-app-icon-dialog-max">
				<div class="custom-portal-news">
					<iframe src="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/dowork&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" maxurl="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/dowork_query&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}"  style="width:100%;height:100%;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
				</div>
			</@sz.commons.widget>
			<@sz.commons.widget id="sssxjz" title="送审事项进展"  iconCls=".sz-app-icon sz-app-icon-dialog-max">
				<div class="custom-portal-news">
					<iframe src="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/SSSXJZ&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" maxurl="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/SSSXCXB&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}"  style="width:100%;height:100%;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
				</div>
			</@sz.commons.widget>
			<@sz.commons.widget id="ybsx" title="已审批事项"  iconCls=".sz-app-icon sz-app-icon-dialog-max">
				<div class="custom-portal-news">
					<iframe src="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/didwork&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" maxurl="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/YSPSX&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" style="width:100%;height:100%;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
				</div>
			</@sz.commons.widget>
			<@sz.commons.widget id="sswc" title="送审完成事项"  iconCls=".sz-app-icon sz-app-icon-dialog-max">
				<div class="custom-portal-news">
					<iframe src="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/SSWCSX&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" maxurl="${url('/meta/LAWCONT/others/show/showcontent.action?path=LAWCONT:/analyses/HZ_queryAndAny/index_report/SSWCCX&amp;$sys_calcnow=true&amp;$sys_showParamPanel=false')}" style="width:100%;height:100%;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
				</div>
			</@sz.commons.widget>
			
		</span>
	</div>
</div>
	<@script>
		var ems = $(".sz-commons-widget-header-title em");
		
		ems.after("<em class=\".sz-app-icon sz-app-icon-refresh\"></em>");
		
		$(".sz-commons-widget-header-title em").click(function(){
			var portal = $(this).closest(".sz-commons-widget");
			var iframe = portal.find("iframe");
			
			if($(this).attr("class")==".sz-app-icon sz-app-icon-refresh"){
				/**
				 * iframe[0].contentWindow.location.reload();
				 */
				 if(iframe[0].contentWindow.$rpt){
				 	var rpt = iframe[0].contentWindow.$rpt();
				 	if(rpt){
				 		rpt.recalc();
				 	}else{
				 		iframe[0].contentWindow.location.reload();
				 	}
				 }else{
				 	iframe[0].contentWindow.location.reload();
				 }
			}else{
				var url = null;
				var maxUrl = iframe.attr("maxurl");
				if(maxUrl){
					url = maxUrl
				}else{
					url = iframe.attr("src");
					var idx = url.indexOf("?");
					var paramUrl = url.substring(idx);
					url = url.substring(0,idx)+sz.utils.setParameterOfUrl("$sys_showParamPanel", "true", paramUrl);
				}
				
				top.navTab.openTab("custom_101",url ,{title:portal.find("span").text(), fresh:true, external:true});
			}
		});
	</@script>
</@sz.commons.html.body>
</@sz.commons.htmlDirective>