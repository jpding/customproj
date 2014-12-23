var TABLE_NAME = "rpt1";
var COL_EVENT_TIME_SRC = "H";
var COL_EVENT_KEY_SRC  = "I";
var COL_STARTTIME = "F";
var COL_ENDTIME   = "G";
var COL_STATE     = "J";
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
    
    var dataStartCol = startCol+1;
    var rows = table.getRows();
    for(var i=ROW_START, len=table.getRowCount(); i<len; i++ ){
    	var visible = checkVisible(table, i,  endTimeCol+1, startCol);
    	if(!visible){
    		rows[i].setVisible(0);
    		continue;
    	}
    	
    	var cell = table.getCell(i, startCol);
    	var vv = cell.value;
    	if(vv == '计划'){
    		if(i%2==0){
    			var startCell = getStartCell(table, cell, dataStartCol);
    			var endCell   = getEndCell(table, cell, dataStartCol);
    			if(startCell == null || endCell == null){
    				continue;
    			}
    			drawPlanLine(table, startCell, endCell, dataStartCol);
    			drawMileStone(table, startCell, endCell, dataStartCol, startTimeCol, endTimeCol, startCol);
    		}
    	}else if(vv == '执行'){
    		if(i%2==0){
    			var startCell = getStartCell(table, cell, dataStartCol);
    			var endCell   = getEndCell(table, cell, dataStartCol);
    			if(startCell == null || endCell == null){
    				continue;
    			}
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
	var vv = params.get("cbx1");
	if(vv == "1"){
		compid = "table1";
	}else if(vv == "2"){
		compid = "table2";
	}
	var table = rpt.getComponent(compid);
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
		if(cell.value == "计划"){
			return i;
		}			
	}	
	return -1;
}

function getStartCell(table, cell, dataStartCol){
	var startcol = getColIndex(COL_STARTTIME) - 1;
	var cl = table.getCell(cell.row, startcol);
	var vv = cl.value;
	return getConditionCell(table, cell, vv, dataStartCol);
}

function getEndCell(table, cell, dataStartCol){
	var endcol = getColIndex(COL_ENDTIME) - 1;
	var cl = table.getCell(cell.row, endcol);
	var vv = cl.value;
	return getConditionCell(table, cell, vv, dataStartCol);
}

function drawNoBorder(table, startCell, startCol){
	for(var i=startCol; i<table.colCount; i++){
		var cl = table.getCell(startCell.row, i);
		cl.addStyle("border-bottom:0px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
		table.getCell(startCell.row+1, i).addStyle("border-top:0px solid #276bc5;border-left:1px solid #276bc5;border-bottom:1px solid #276bc5;");
	}
}

function drawPlanLine(table, startCell, endCell, startCol){
	drawNoBorder(table, startCell, startCol);
	
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;color:#ff0000;");
		table.getCell(startCell.row+1, col).addStyle("color:#ff0000;");
	}
}

function drawPlanLine2(table, startCell, endCell, startCol){
	drawNoBorder(table, startCell, startCol);
	
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid black;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
	}
}

function drawMileStone(table, startCell, endCell, dataStartCol, startTimeCol, endTimeCol, startCol){
	var startTime = table.getCell(startCell.row, startTimeCol);
	var endTime = table.getCell(startCell.row, endTimeCol);
	var cells = [];
	cells.push(startTime);
	cells.push(endTime);
	for(var i=endTimeCol+1; i<startCol; ){
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
			cl.value= (i>=2?"★":"")+java.lang.Integer.parseInt(v.substring(4,6))+"."+v.substring(6,8);
		}
	}
	
	var cellContents = [];
	for(var i=endTimeCol+2; i<startCol; ){
		var cellKey = table.getCell(startCell.row, i);
		cellContents.push(cellKey);
		i += 2;
	}

	for(var i=0; i<cellContents.length; i++){
		var v = cellContents[i].value;
		if(v == null || v.length == 0){
			continue;
		}
		
		var rq = cells[i+2].value;
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