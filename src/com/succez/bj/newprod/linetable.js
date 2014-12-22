/**
 * 报表计算后脚本
 * args.report
 * args.session
 * args.result
 */
function onAfterReportCalc(args) {
    var result = args.result;
    var table = result.getComponent("rpt1");
    var startCol = 17;
    for(var i=0, len=table.getRowCount(); i<len; i++ ){
    	var cell = table.getCell(i, startCol);
    	var vv = cell.value;
    	if(vv == '计划'){
    		if(i%2==0){
    			var startCell = getStartCell(table, cell);
    			var endCell   = getEndCell(table, cell);
    			if(startCell == null || endCell == null){
    				continue;
    			}
    			drawPlanLine(table, startCell, endCell);
    			drawMileStone(table, startCell, endCell);
    		}
    	}else if(vv == '执行'){
    		if(i%2==0){
    			var startCell = getStartCell(table, cell);
    			var endCell   = getEndCell(table, cell);
    			if(startCell == null || endCell == null){
    				continue;
    			}
    			drawPlanLine2(table, startCell, endCell);
    			drawMileStone(table, startCell, endCell);
    		}
    	}
    }
}

function getStartCell(table, cell){
	var cl = table.getCell(cell.row, 5);
	var vv = cl.value;
	return getConditionCell(table, cell, vv);
}

function getEndCell(table, cell){
	var cl = table.getCell(cell.row, 6);
	var vv = cl.value;
	return getConditionCell(table, cell, vv);
}

function drawNoBorder(table, startCell, startCol){
	for(var i=startCol; i<table.colCount; i++){
		var cl = table.getCell(startCell.row, i);
		cl.addStyle("border-bottom:0px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
		table.getCell(startCell.row+1, i).addStyle("border-top:0px solid #276bc5;border-left:1px solid #276bc5;border-bottom:1px solid #276bc5;");
	}
}

function drawPlanLine(table, startCell, endCell){
	drawNoBorder(table, startCell, 18);
	
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid blue;border-left:1px solid #276bc5; border-top:1px solid #276bc5;color:#ff0000;");
		table.getCell(startCell.row+1, col).addStyle("color:#ff0000;");
	}
}

function drawPlanLine2(table, startCell, endCell){
	drawNoBorder(table, startCell, 18);
	
	for(var col=startCell.col;col<=endCell.col; col++){
		var cl = table.getCell(startCell.row, col);
		cl.addStyle("border-bottom:2px solid black;border-left:1px solid #276bc5; border-top:1px solid #276bc5;");
	}
}

function drawMileStone(table, startCell, endCell){
	var startTime = table.getCell(startCell.row, 5);
	var endTime = table.getCell(startCell.row, 6);
	var key1 = table.getCell(startCell.row, 7);
	var key2 = table.getCell(startCell.row, 9);
	var key3 = table.getCell(startCell.row, 11);
	var key4 = table.getCell(startCell.row, 13);
	var key5 = table.getCell(startCell.row, 15);
	var cells = [];
	cells.push(startTime);
	cells.push(endTime);
	cells.push(key1);
	cells.push(key2);
	cells.push(key3);
	cells.push(key4);
	cells.push(key5);
	for(var i=0; i<cells.length; i++){
		var v = cells[i].value;
		if(v==null || v.length == 0){
			continue;
		}
		var vv = v.substring(0,6);
		var cl = getConditionCell(table, startCell, vv);
		if(cl != null){
			cl.value= (i>=2?"★":"")+java.lang.Integer.parseInt(v.substring(4,6))+"."+v.substring(6,8);
		}
	}
	
	var pkey1 = table.getCell(startCell.row, 8);
	var pkey2 = table.getCell(startCell.row, 10);
	var pkey3 = table.getCell(startCell.row, 12);
	var pkey4 = table.getCell(startCell.row, 14);
	var pkey5 = table.getCell(startCell.row, 16);
	var cellContents = [];
	cellContents.push(pkey1);
	cellContents.push(pkey2);
	cellContents.push(pkey3);
	cellContents.push(pkey4);
	cellContents.push(pkey5);
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
		var cl = getConditionCell(table, startCell, month);
		if(cl != null){
			var resultCell = table.getCell(cl.row+1, cl.col);
			if(resultCell != null){
				resultCell.value = v;
			}
		}
	}
}

function getConditionCell(table, cell, vv){
	println("==============="+vv)
	if(vv == null || vv.length == 0){
		return null;
	}
	
	var year = vv.substring(0,4);
	var month = vv.substring(4,6);
	for(var i=18; i<table.getColCount(); i++){
		var cell1 = table.getCell(0,i);
		var cell2 = table.getCell(1,i);
		try{
			println(cell1.value+"\t"+year+"\t"+java.lang.Integer.parseInt(cell2.value)+"\t"+java.lang.Integer.parseInt(month));
			if(cell1.value == year && java.lang.Integer.parseInt(cell2.value) == java.lang.Integer.parseInt(month)){
				return table.getCell(cell.row, i);
			}
		}catch(e){
			continue;
		}
	}
	return null;
}