(function () {
    var myConnector = tableau.makeConnector();

   
    myConnector.getData = function(table, doneCallback) {

        const url = new URL(window.location.href);
        //const qualtricsApiToken = 'BqhXyfBNMlb1C4vAvIgUQRqAvqq1ok7Tiz6Ey8jL';
        const qualtricsApiToken = url.searchParams.get('token');
        const surveyId = 'SV_6XuIqPwIklNF3JY';
        var progressStatus='In progress';
        var progressId="progressId";
        var counter=0;
        // Define the URL for the Qualtrics API endpoint
        var apiUrl = `https://bain.eu.qualtrics.com/API/v3/surveys/SV_6XuIqPwIklNF3JY/export-responses/918268e9-4b4c-46b7-aab1-66b65f962747-def/file`;
        
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
                    "id": responses[i].responseId,
                    "mag": responses[i].values.startDate,
                    "title": responses[i].values.recordedDate,
                    "location": "NA"
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

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "mag",
            alias: "magnitude",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "title",
            alias: "title",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "location",
            dataType: tableau.dataTypeEnum.geometry
        }];
    
        var tableSchema = {
            id: "earthquakeFeed",
            alias: "Earthquakes with magnitude greater than 4.5 in the last seven days",
            columns: cols
        };
    
        schemaCallback([tableSchema]);
    };

    tableau.registerConnector(myConnector);
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "USGS Earthquake Feed";
            tableau.submit();
        });
    });
})();