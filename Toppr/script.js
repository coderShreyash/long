$(document).ready(function(){
        var loginName="domain\\username";
        getUserEmailByLoginName(loginName);
    });
    function getUserEmailByLoginName(loginName) {
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers?$select=Email&$filter=substringof('"+loginName+"',LoginName)";                  
        //execute AJAX request
        $.ajax({
            url: requestUri,
            type: "GET",
            headers: { "ACCEPT": "application/json;odata=verbose" },
            success: function (data) {
                if(data.d.results.length>0){
                    alert(data.d.results[0].Email); 
                }
    
            },
            error: function () {
                //alert("Failed to get details");                
            }
        });
    }