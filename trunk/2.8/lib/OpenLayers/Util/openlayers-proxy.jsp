<%@page session="false"%>
<%@page import="java.net.*,java.io.*" %>
<%
	HttpURLConnection connection = null;
	InputStream istream = null;
	OutputStream ostream = null;
	InputStream ristream = null;
	OutputStream rostream = null;
	
	try {
		if(request.getParameter("resourceUrl") != null && request.getParameter("resourceUrl") != "") {
			URL resourceUrl = new URL(request.getParameter("resourceUrl"));	
			connection = (HttpURLConnection)resourceUrl.openConnection();
			connection.setDoInput(true);
			connection.setRequestMethod(request.getMethod());
			// what's this for
			out.clear();
			out = pageContext.pushBody();
			ristream = connection.getInputStream();
			rostream = response.getOutputStream();
			final int length = 5000;
			byte[] bytes = new byte[length];
			int bytesRead = 0;
			while ((bytesRead = ristream.read(bytes, 0, length)) > 0) {
				rostream.write(bytes, 0, bytesRead);
			}
		} else if(request.getParameter("targetUrl") != null && request.getParameter("targetUrl") != "") {
			URL targetUrl = new URL(request.getParameter("targetUrl"));		
			connection = (HttpURLConnection)targetUrl.openConnection();
			connection.setDoOutput(true);
			connection.setRequestMethod(request.getMethod());
			
			int clength = request.getContentLength();
			if(clength > 0) {
				connection.setDoInput(true);
				istream = request.getInputStream();
				ostream = connection.getOutputStream();
				final int length = 5000;
				byte[] bytes = new byte[length];
				int bytesRead = 0;
				while((bytesRead = istream.read(bytes, 0, length)) > 0) {
					ostream.write(bytes, 0, bytesRead);
				}
			}
			// what's this for
			out.clear();
			out = pageContext.pushBody();
			rostream = response.getOutputStream();
			response.setContentType(connection.getContentType());
			ristream = connection.getInputStream();
			final int length = 5000;
			byte[] bytes = new byte[length];
			int bytesRead = 0;
			while ((bytesRead = ristream.read(bytes, 0, length)) > 0) {
				rostream.write(bytes, 0, bytesRead);
			}
		} else {
			return;
		}
	} catch(Exception e) {
		response.setStatus(500);
		e.printStackTrace();
	} finally {
		if(istream != null) { istream.close(); }			
		if(ostream != null) { ostream.close(); }
		if(ristream != null) { ristream.close(); }
		if(rostream != null) { rostream.close(); }			
	}
%>
