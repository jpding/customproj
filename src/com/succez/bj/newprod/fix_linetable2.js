var TABLE_NAME = "rpt1";
var COL_STARTTIME = "E";
var COL_ENDTIME   = "G";
var ROW_START     = 3; // 0 base


/**
 * 报表计算后脚本
 * args.report
 * args.session
 * args.result
 */
function onAfterReportCalc(args) {
    var result = args.result;
    var params = args.session.getParameters();
    var table = getCurrentTable(result, params);
    var startCol = getStartCol(table);
    if(startCol == -1){
    	println("startCol:start col error !");
    	return ;
    }
    
    var startTimeCol = getColIndex(COL_STARTTIME)-1;
    var endTimeCol   = getColIndex(COL_ENDTIME)-1;
    
    var sjq = params.get("SJQ");
    var sjz = params.get("SJZ");
    
    var dataStartCol = startCol+1;
    var rows = table.getRows();
    for(var i=ROW_START, len=table.getRowCount(); i<len; i++ ){
//    	var visible = checkVisible(table, i,  endTimeCol+1, startCol);
//    	if(!visible){
//    		rows[i].setVisible(0);
//    		continue;
//    	}
//    	
    	var cell = table.getCell(i, startCol);
    	var vv = cell.value;
    	if(vv == '合同要求'){
    		if(i%2==0){
    			var startCell = getStartCell2(table, cell, dataStartCol, sjq, sjz);
    			var endCell   = getEndCell2(table, cell, dataStartCol, sjq, sjz);
    			println("startCell:"+startCell+";endCell:"+endCell);
    			drawNoBorder(table, cell);
    			if(startCell == null || endCell == null){
    				continue;
    			}
    			println("合同要求：startCell:"+startCell.getName()+";value="+startCell.getValue());
    			println("合同要求：endCell:"+endCell.getName()+";value="+endCell.getValue());
    			drawPlanLine(table, startCell, endCell, dataStartCol);
    			drawMileStone(table, startCell, endCell, dataStartCol, startTimeCol, endTimeCol, startCol);
    		}
    	}else if(vv == '执行情况'){
    		if(i%2==0){
    			var startCell = getStartCell2(table, cell, dataStartCol, sjq, sjz);
    			var endCell   = getEndCell2(table, cell, dataStartCol, sjq, sjz);
    			println("startCell:"+startCell+";endCell:"+endCell);
    			drawNoBorder(table, cell);
    			if(startCell == null || endCell == null){
    				continue;
    			}
    			println("执行情况：startCell:"+startCell.getName()+";value="+startCell.getValue());
    			println("执行情况：endCell:"+endCell.getName()+";value="+endCell.getValue());
    			drawPlanLine2(table, startCell, endCell, dataStartCol);
    			drawMileStone(table, startCell, endCell, dataStartCol, startTimeCol, endTimeCol, startCol);
    		}
    	}
    }
}

/**
 * 当前报表是一个多sheet的报表，但只有一个数据Table，故通过遍历获取，不在通过名称获取
 */
function getCurrentTable(rpt, params){
	var compid = TABLE_NAME;
	var table = rpt.getComponent("rpt1");
	if(table == null){
		throw new Error("根据“"+vv+"”获取不到Table对象");
	}
	return table;
}

function checkVisible(table, rowIndex, startCol, endCol){
	for(var i=startCol; i<endCol; i++){
		var cell = table.getCell(rowIndex, i);
		if(cell.value){
			return true;
		}
	}
	return false;
}

function getStartCol(table){
	for(var i=0, len=table.getColCount(); i<len; i++){
		var cell = table.getCell(ROW_START, i);
		if(cell == null){
			continue;
		}
		if(cell.value == "合同要求"){
			return i;
		}			
	}	
	return -1;
}

function getStartTimeValue(table, cell){
	var startcol = getColIndex(COL_STARTTIME) - 1;
	var cl = table.getCell(cell.row, startcol);
	return cl.value;
}

function getStartTimeCell(table, cell, dataStartCol){
	var vv = getStartTimeValue(table, cell, dataStartCol);
	return getConditionCell(table, cell, vv, dataStartCol);
}

function getEndTimeCell(table, cell, dataStartCol){
	var vv = getEndTimeCellValue(table, cell, dataStartCol);
	return getConditionCell(table, cell, vv, dataStartCol);
}

function getEndTimeCellValue(table, cell, dataStartCol){
	var endcol = getColIndex(COL_STARTTIME) - 1;
	var currV = "";
	for(var i=endcol; i<dataStartCol-2; ){
		var cell = table.getCell(cell.row, i);
		if(cell.value){
			currV = cell.value;
		}
		i = i + 2;
	}
	
	return currV;
}

/**
 * 2015-1-15 划线不需要开始节点，第一个关键开始节点
 * @param {} table
 * @param {} cell
 * @param {} dataStartCol
 * @return {}
 */
function getStartCell2(table, cell, dataStartCol, sjq, sjz){
	var startcol = getColIndex(COL_STARTTIME) - 1;
	var currV = "";
	println("getStartCell2:startcol:"+startcol);
	for(var i=startcol; i<dataStartCol-2; ){
		var cl = table.getCell(cell.row, i);
		if(cl.value){
			currV = cl.value;
			break;
		}
		i = i + 2;
	}
	println("startcell2:"+currV);
	var startCell = getConditionCell(table, cell, currV, dataStartCol);
	/**
	 * 判断开始时间和所选时间段，是不是有交集
	 */
	if(startCell == null){
		var q = getStartTimeValue(table, cell);
		var z = getEndTimeCellValue(table, cell, dataStartCol);
		println("q:"+q+";z:"+z);
		if(!q || !z){
			return startCell;
		}
		
		/**
		 * 如果包含起止，那就按关键点显示
		 */
		if((q>=od(sjq,"m=1") && z<=od(sjz,"m=12")) || (z<od(sjq,"m=1")) || (q>od(sjz,"m=12"))){
			return startCell;
		}
		
		/**
		 * 处理交叉的情况
		 */
		if(q<od(sjq,"m=1") && z>od(sjq,"m=1")){
			startCell = getConditionCell(table, cell, od(sjq,"m=1"), dataStartCol);
			println("startCell:"+startCell);
			return startCell;
		}
		
		if(q>od(sjq,"m=1")){
			return getConditionCell(table, cell, q, dataStartCol);
		}
	}
	return startCell;
}

/**
 * 同上，返回最后一个关键节点
 * 从COL_ENDTIME往后找，一致找到dataStartCol，找到最后一个有值的，就是结束
 * @param {} table
 * @param {} cell
 * @param {} dataStartCol
 */
function getEndCell2(table, cell, dataStartCol, sjq, sjz){
	var endcol = getColIndex(COL_STARTTIME) - 1;
	var currV = "";
	for(var i=endcol; i<dataStartCol-2; ){
		var cell = table.getCell(cell.row, i);
		if(cell.value){
			currV = cell.value;
		}
		i = i + 2;
	}
	println("endcell2:"+currV);
	var endCell = getConditionCell(table, cell, currV, dataStartCol);
	println("endcell2:f:"+endCell);
	if(endCell == null){
		var q = getStartTimeValue(table, cell);
		var z = getEndTimeCellValue(table, cell, dataStartCol);
		println("endcell2:q:"+q+";z:"+z);
		if(!q || !z){
			return endCell;
		}
		
		/**
		 * 如果包含起止，那就按关键点显示
		 */
		if((q>=od(sjq,"m=1") && z<=od(sjz,"m=12")) || (z<od(sjq,"m=1")) || (q>od(sjz,"m=12"))){
			return endCell;
		}
		
		/**
		 * 处理交叉的情况
		 */
		if(z>od(sjz,"m=12")){
			return getConditionCell(table, cell, od(sjz,"m=12"), dataStartCol);
		}
		
		if(z<od(sjz,"m=12")){
			return getConditionCell(table, cell, z, dataStartCol);
		}
	}
	return endCell;
}

function drawNoBorder(table, startCell){
	for(var i=17; i<table.colCount; i++){
		var cl = table.getCell(startCell.row, i);
		cl.addStyle("border-bottom:0px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
		table.getCell(startCell.row+1, i).addStyle("border-top:0px solid #276bc5;border-left:1px solid #276bc5;border-bottom:0px solid #276bc5;");
		//table.getCell(startCell.row+2, i).addStyle("border-top:0px solid #276bc5;border-left:1px solid #276bc5;border-bottom:1px solid #276bc5;");
	}
}

function drawPlanLine(table, startCell, endCell, startCol){
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;color:#ff0000;");
		table.getCell(startCell.row+1, col).addStyle("color:#ff0000;");
	}
}

function drawPlanLine2(table, startCell, endCell, startCol){
	//drawNoBorder(table, startCell, startCol);
	
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid black;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
	}
}

function drawMileStone(table, startCell, endCell, dataStartCol, startTimeCol, endTimeCol, startCol){
	var start = getColIndex(COL_STARTTIME) - 1;
	var cells = [];
	for(var i=start; i<startCol; ){
		var celltime = table.getCell(startCell.row, i);
		cells.push(celltime);
		println("celltime:"+celltime.value);
		i += 2;
	}
	
	for(var i=0; i<cells.length; i++){
		var v = cells[i].value;
		if(v==null || v.length == 0){
			continue;
		}
		var vv = v.substring(0,6);
		var cl = getConditionCell(table, startCell, vv, dataStartCol);
		if(cl != null){
			cl.value= "★"+java.lang.Integer.parseInt(v.substring(4,6))+"."+v.substring(6,8);
		}
	}
	
	var cellContents = [];
	for(var i=start+1; i<startCol; ){
		var cellKey = table.getCell(startCell.row, i);
		cellContents.push(cellKey);
		i += 2;
	}

	for(var i=0; i<cellContents.length; i++){
		var v = cellContents[i].value;
		if(v == null || v.length == 0){
			continue;
		}
		
		var rq = cells[i].value;
		if(rq == null || rq.length == 0){
			continue;
		}
		var month = rq.substring(0,6);
		var cl = getConditionCell(table, startCell, month, dataStartCol);
		if(cl != null){
			var resultCell = table.getCell(cl.row+1, cl.col);
			if(resultCell != null){
				resultCell.value = v;
			}
		}
	}
}

function getConditionCell(table, cell, yearMonth, dataStartCol){
	var vv = yearMonth;
	println("getConditionCell==============="+vv)
	if(vv == null || vv.length == 0){
		return null;
	}
	
	var year = vv.substring(0,4);
	var month = null;
	if(vv.length < 6){
		println("getConditionCell:error:"+vv+"\t"+cell.row+"\t"+cell.col);
		return null;
	}
	month = java.lang.Integer.parseInt(vv.substring(4,6));
	for(var i=dataStartCol; i<table.getColCount(); i++){
		var cell1 = table.getCell(1,i);
		var cell2 = table.getCell(2,i);
		try{
			var smm = java.lang.Integer.parseInt(tostr(cell2.value,"mm"));
			//println("getConditionCell:"+cell1.value+"\t"+year+"\t"+smm+"\t"+month);
			if(cell1.value == year && smm == month){
				println("resultcell:"+year+"\t"+smm);
				return table.getCell(cell.row, i);
			}
		}catch(e){
			continue;
		}
	}
	return null;
}

function getColIndex(colName){
	return colName.charCodeAt(0) - "A".charCodeAt(0)+1; 
}