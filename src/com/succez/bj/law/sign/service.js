var File = java.io.File;
var FileReader = java.io.FileReader;
var InputStreamReader = java.io.InputStreamReader;
var FileInputStream   = java.io.FileInputStream;
var SimpleDateFormat  = java.text.SimpleDateFormat;
var Calendar          = java.util.Calendar;
var StringUtils       = com.succez.commons.util.StringUtils;
/**
 * 存储签名信息的数据源连接池
 * @type String
 */
var DS_NAME = "default";

function execute(request, res){
	var out =res.getOutputStream();
	var mCommand;
	var mDocumentID = "";
	var mSignatureID = "";
	var mSignature = "";	
	var mSignatures;
	var strSql;
	var mUserName;
	var mExtParam;

	var mResult;
	var KeyName;                 // 文件名
	var ObjFile;                     // 文件对象
	var ObjFileReader;         // 读文件对象
	var intLength;                            // 实际读出的字符数

	var mSignatureName;			  // 印章名称
	var mSignatureUnit;			  // 签章单位
	var mSignatureUser;			  // 持章人
	var mSignatureSN;			  // 签章SN
	var mSignatureGUID;			  // 全球唯一标识符

	var mMACHIP;			  // 机器IP
	var OPType;			  // 操作标志
	var mKeySn;       // KEY序列号
	mCommand=request.getParameter("COMMAND");
	mUserName=convertString(request.getParameter("USERNAME"));
	mExtParam=convertString(request.getParameter("EXTPARAM"));

    println("");
    println("ReadPackage");
    println(mCommand);
    
    var ds = sz.db.getDataSource(DS_NAME);

	if(StringUtils.equalsIgnoreCase("SAVESIGNATURE", mCommand)){        // 保存签章数据信息
		mDocumentID=convertString(request.getParameter("DOCUMENTID"));
		mSignatureID=convertString(request.getParameter("SIGNATUREID"));
		mSignature=convertString(request.getParameter("SIGNATURE"));
		println("DocuemntID:"+mDocumentID);
		println("SignatureID:"+mSignatureID);
		// println("Signature:"+mSignature);
		var conn = ds.getConnection();
		try{
			strSql="SELECT * from HTMLSignature Where SignatureID='"+mSignatureID+"' and DocumentID='"+mDocumentID+"'";
			var hasValue = hasData(conn, strSql);
    		if (hasValue) {
       			strSql = "update HTMLSignature set DocumentID='"+mDocumentID+"',SIGNATUREID='"+mSignatureID+"',Signature='"+mSignature+"'";
       			strSql = strSql + "  Where SignatureID='"+mSignatureID+"' and DocumentID='"+mDocumentID+"'";
		    	ExecuteUpdate(conn, strSql);
    		}else{
    			var prestmt=conn.prepareStatement(Sql);
      			try{
					// 取得唯一值(mSignature)
    				var dt=new java.util.Date();
    				var lg=dt.getTime();
    				var ld=new java.lang.Long(lg);
    				mSignatureID=ld.toString();
        			var Sql="insert into HTMLSignature (DocumentID,SignatureID,Signature) values (?,?,?) ";					
        			prestmt.setString(1, mDocumentID);
			        prestmt.setString(2, mSignatureID);
    	    		prestmt.setString(3, mSignature);
        			prestmt.execute();
        			prestmt.close();
			        mResult=true;

				}
      			catch(e){
       		 		println("保存签章错误:"+e.toString());
        			mResult=false;
      			}finally{
      				prestmt.close();
      			}
    		}
		}finally{
			conn.close();
		}
		//out.clear();
		out.print("SIGNATUREID="+mSignatureID+"\r\n");
		out.print("RESULT=OK");
	}

	if(StringUtils.equalsIgnoreCase("GETNOWTIME", mCommand)){         // 获取服务器时间
		var cal  = Calendar.getInstance();
        var formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
		var mDateTime=formatter.format(cal.getTime());
//		out.clear();
		out.print("NOWTIME="+mDateTime+"\r\n");
		out.print("RESULT=OK");
	}
	
	if(StringUtils.equalsIgnoreCase("DELESIGNATURE", mCommand)){   // 删除签章数据信息
		mDocumentID=request.getParameter("DOCUMENTID");
		mSignatureID=request.getParameter("SIGNATUREID");
		println("DocuemntID:"+mDocumentID);
		println("SignatureID:"+mSignatureID);
		var conn = ds.getConnection();
		try{
  			strSql="SELECT * from HTMLSignature Where SignatureID='"+mSignatureID+"'and DocumentID='"+mDocumentID+"'";
			var hasValue = hasData(conn, strSql);
			if(hasValue){
				try{
					strSql="DELETE from HTMLSignature Where SignatureID='"+mSignatureID+"'and DocumentID='"+mDocumentID+"'";
					ExecuteUpdate(conn, strSql);
					println(strSql);
				}
				catch(ex){
					println(ex.toString());
				}
			}
  		}finally{
  			conn.close();
  		}
//		out.clear();
		out.print("RESULT=OK");
		println("ok");
	}

	if(StringUtils.equalsIgnoreCase("LOADSIGNATURE", mCommand)){    // 调入签章数据信息
		mDocumentID=request.getParameter("DOCUMENTID");
		mSignatureID=request.getParameter("SIGNATUREID");
		println("DocuemntID:"+mDocumentID);
		println("SignatureID:"+mSignatureID);
		var conn = ds.getConnection();
   		try{
  			strSql="SELECT * from HTMLSignature Where SignatureID='"+mSignatureID+"' and DocumentID='"+mDocumentID+"'";
  			var stmt = conn.createStatement();
  			try{
  				var rs = stmt.executeQuery(strSql);
				if(rs.next()){
					mSignature=rs.getString("Signature");
				}
  			}finally{
  				stmt.close();
  			}
  		}finally{
  			conn.close();
  		}
//		out.clear();
		out.print(mSignature+"\r\n");
		out.print("RESULT=OK");
	}

	if(StringUtils.equalsIgnoreCase("SHOWSIGNATURE",mCommand)){   // 获取当前签章SignatureID，调出SignatureID，再自动调LOADSIGNATURE数据
		  mDocumentID=request.getParameter("DOCUMENTID");
		  println("DocuemntID:"+mDocumentID);
    	mSignatures="";
    	var conn = ds.getConnection();
   		try{
  			strSql="SELECT * from HTMLSignature Where DocumentID='"+mDocumentID + "'";
			var stmt = conn.createStatement();
  			try{
  				var rs = stmt.executeQuery(strSql);
				while(rs.next()){
					mSignatures=mSignatures+rs.getString("SignatureID")+";";
				}
  			}finally{
  				stmt.close();
  			}
  		}finally{
  			conn.close();
  		}
//		out.clear();
		out.print("SIGNATURES="+mSignatures+"\r\n");
		out.print("RESULT=OK");
	}


	// ---------------------------------------------------------------------------------------
	if(StringUtils.equalsIgnoreCase("GETSIGNATUREDATA", mCommand)){           // 批量签章时，获取所要保护的数据
	    var mSignatureData="";
		mDocumentID=request.getParameter("DOCUMENTID");
        println(convertString(request.getParameter("FIELDSLIST")) );
        println(request.getParameter("FIELDSNAME"));
        var conn = ds.getConnection();
   		try{
  			strSql="SELECT XYBH,BMJH,JF,YF,HZNR,QLZR,CPMC,DGSL,DGRQ  from HTMLDocument Where DocumentID='"+mDocumentID + "'";
  			var stmt = conn.createStatement();
  			try{
  				var rs = stmt.executeQuery(strSql);
				if (rs.next()){
					mSignatureData=mSignatureData+"XYBH="+(rs.getString("XYBH"))+"\r\n";
					mSignatureData=mSignatureData+"BMJH="+(rs.getString("BMJH"))+"\r\n";
					mSignatureData=mSignatureData+"JF="+(rs.getString("JF"))+"\r\n";
					mSignatureData=mSignatureData+"YF="+(rs.getString("YF"))+"\r\n";
					mSignatureData=mSignatureData+"HZNR="+(rs.getString("HZNR"))+"\r\n";
					mSignatureData=mSignatureData+"QLZR="+(rs.getString("QLZR"))+"\r\n";
					mSignatureData=mSignatureData+"CPMC="+(rs.getString("CPMC"))+"\r\n";
					mSignatureData=mSignatureData+"DGSL="+(rs.getString("DGSL"))+"\r\n";
					mSignatureData=mSignatureData+"DGRQ="+(rs.getString("DGRQ"))+"\r\n";
				}
				mSignatureData=java.net.URLEncoder.encode(mSignatureData);
  			}finally{
  				stmt.close();
  			}
  		}finally{
  			conn.close();
  		}
//		out.clear();
		out.print("SIGNATUREDATA="+mSignatureData+"\r\n");
		out.print("RESULT=OK");
	}

	if(StringUtils.equalsIgnoreCase("PUTSIGNATUREDATA", mCommand)){            // 批量签章时，写入签章数据
		mDocumentID=convertString(request.getParameter("DOCUMENTID"));
		mSignature=convertString(request.getParameter("SIGNATURE"));
		var conn = ds.getConnection();
   		try{
			// 取得唯一值(mSignature)
			var dt=new java.util.Date();
			var lg=dt.getTime();
			var ld=new java.lang.Long(lg);
			mSignatureID=ld.toString();
			var Sql="insert into HTMLSignature (DocumentID,SignatureID,Signature) values (?,?,?) ";
    	    var prestmt =conn.prepareStatement(Sql);
			prestmt.setString(1, mDocumentID);
	        prestmt.setString(2, mSignatureID);
    		prestmt.setString(3, mSignature);
			prestmt.execute();
			prestmt.close();
	        mResult=true;
  		}catch(e){
  			println(e.toString());
        	mResult=false;
  		}finally{
  			conn.close();
  		}
//		out.clear();
		out.print("SIGNATUREID="+mSignatureID+"\r\n");
		out.print("RESULT=OK");
	}

	// ---------------------------------------------------------------------------------------


	if(StringUtils.equalsIgnoreCase("SIGNATUREKEY", mCommand)){
		mUserName=convertString(request.getParameter("USERNAME")); 
		var RealPath =mUserName+"\\"+mUserName+".key";
		KeyName=request.getSession().getServletContext().getRealPath(RealPath);

		ObjFile=new java.io.File(KeyName);         // 创建文件对象
		var ChrBuffer=java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 10);
		try{
			if(ObjFile.exists()){// 文件存在
				var isr=new InputStreamReader(new FileInputStream(KeyName));
				// ObjFileReader = new java.io.FileReader(ObjFile); //创建读文件对象
				// ObjFileReader.skip(1);
				// ObjFileReader.read(ChrBuffer, 0, 1);
				// println(ChrBuffer);
				while((intLength=isr.read(ChrBuffer))!=-1){    // 读文件内容
					out.write(ChrBuffer,0,intLength);         
				} 
				out.write("\r\n");
				out.write("RESULT=OK");
				isr.close(); // 关闭读文件对象
			} 
			else{
				out.println("File Not Found"+KeyName); // 文件不存在
			} 
		}
		catch(e){
			println(e.toString());
		}		
	}

	if(StringUtils.equalsIgnoreCase("SAVEHISTORY", mCommand)){    // 保存签章历史信息
		mSignatureName=convertString(request.getParameter("SIGNATURENAME"));// 印章名称
		mSignatureUnit=convertString(request.getParameter("SIGNATUREUNIT"));// 印章单位
		mSignatureUser=convertString(request.getParameter("SIGNATUREUSER"));// 印章用户名
		mSignatureSN=convertString(request.getParameter("SIGNATURESN"));// 印章序列号
		mSignatureGUID=convertString(request.getParameter("SIGNATUREGUID"));// 全球唯一标识
		mDocumentID=convertString(request.getParameter("DOCUMENTID"));// 页面ID
		mSignatureID=convertString(request.getParameter("SIGNATUREID"));// 签章序列号
		mMACHIP=convertString(request.getParameter("MACHIP"));// 签章机器IP
		OPType=convertString(request.getParameter("LOGTYPE"));// 日志标志
   		mKeySn=convertString(request.getParameter("KEYSN"));// KEY序列号
   		var conn = ds.getConnection();
	    try{
			var cal  = Calendar.getInstance();
	        var formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
			var mDateTime=formatter.format(cal.getTime());
	
	        strSql="insert into HTMLHistory(SignatureName,SignatureUnit,SignatureUser,SignatureSN,";
	        strSql=strSql+"SignatureGUID,DocumentID,SignatureID,IP,LogTime,LogType,KeySN)";
	        strSql=strSql+" values(?,?,?,?,?,?,?,?,?,?,?)";
	        var prestmt = conn.prepareStatement(strSql);
	        try{
	        	prestmt.setString(1, mSignatureName);
		        prestmt.setString(2, mSignatureUnit);
		        prestmt.setString(3, mSignatureUser);
		        prestmt.setString(4, mSignatureSN);
		        prestmt.setString(5, mSignatureGUID);
		        prestmt.setString(6, mDocumentID);
		        prestmt.setString(7, mSignatureID);
		        prestmt.setString(8, mMACHIP);
		        prestmt.setString(9,mDateTime);
		        prestmt.setString(10,OPType);
		        prestmt.setString(11,mKeySn);
		        prestmt.execute();
		         mResult=true;
	        }finally{
	        	prestmt.close();
	        }
	    }catch(e){
	    	println(e.toString());
	        mResult=false;
	    }finally{
	    	conn.close();
	    }
//		out.clear();
		out.print("SIGNATUREID="+mSignatureID+"\r\n");
		out.print("RESULT=OK");
	}
}

function hasData(conn, sql){
	var stmt = conn.createStatement();
	try{
		var rs = stmt.executeQuery(sql);
		try{
			if(rs.next()){
				return true;
			}
			return false;
		}finally{
			rs.close();
		}
	}finally{
		stmt.close();
	}
}

function ExecuteQuery(conn, sql){
	var stmt = conn.createStatement();
	try{
		return stmt.executeQuery(sql);
	}finally{
		//stmt.close();
	}
}

function ExecuteUpdate(conn, sql){
	var stmt = conn.createStatement();
	try{
		return stmt.executeUpdate(sql);
	}finally{
		stmt.close();
	}
}

function convertString(pp){
	var ss = new java.lang.String(pp==null?"":pp);
	return new java.lang.String(ss.getBytes("ISO-8859-1"),"UTF8");
}
    