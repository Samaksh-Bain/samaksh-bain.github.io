(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "ResponseId",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "Date",
            alias: "date",
            dataType: tableau.dataTypeEnum.string
        }];
    
        var tableSchema = {
            id: "Surveyfeed",
            alias: "Survey data",
            columns: cols
        };
    
        schemaCallback([tableSchema]);
    };

   
    myConnector.getData = function(table, doneCallback) {

        const url = new URL(window.location.href);
        //const qualtricsApiToken = 'BqhXyfBNMlb1C4vAvIgUQRqAvqq1ok7Tiz6Ey8jL';
        const qualtricsApiToken = url.searchParams.get('token');
        //const surveyId = 'SV_6XuIqPwIklNF3JY';
        const surveyId = url.searchParams.get('surveyId');
        var progressStatus='In progress';
        var progressId="progressId";
        var counter=0;
        // Define the URL for the Qualtrics API endpoint
        var apiUrl = `https://bain.eu.qualtrics.com/API/v3/surveys/SV_56xZCpMsN1jU7vU/export-responses/2ffd6337-609c-4c4f-a321-abbe25f72b06-def/file`;
        
        // Define headers for the API request
        var headers = {
          'Content-Type': 'application/json',
          'X-API-TOKEN': qualtricsApiToken
        };
        
        // Make a GET request to the Qualtrics API
        fetch(apiUrl, {
            method: 'GET',
            headers: headers
           
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
           
            return response.json();
          })
          .then(data => {
            // Handle the response data
            console.log('Exported response data:', data);
             var responses = data.responses;
            tableData=[];

            for (var i = 0, len = responses.length; i < len; i++) {
                tableData.push({
                    "ResponseId": responses[i].responseId,
                    "Date": responses[i].values.startDate,
                
                });
            }
    
            table.appendRows(tableData); 
            doneCallback();
           // return data;
           
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });

          
       
    };

   
    tableau.registerConnector(myConnector);
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Survey feed";
            tableau.submit();
        });
    });
})();