(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "ResponseId",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "StartDate",
            alias: "startdate",
            dataType: tableau.dataTypeEnum.string
        },
        {
          id: "EndDate",
          alias: "Enddate",
          dataType: tableau.dataTypeEnum.string
      },
      {
        id: "Email",
        alias: "Email",
        dataType: tableau.dataTypeEnum.string
    },
  {
    id:'QID578',
    alias:'QID578',
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
       // var apiUrl = `https://bain.eu.qualtrics.com/API/v3/surveys/SV_56xZCpMsN1jU7vU/export-responses/2ffd6337-609c-4c4f-a321-abbe25f72b06-def/file`;
        var surveyurl = 'https://bain.eu.qualtrics.com/API/v3/surveys/'+surveyId+'/export-responses';
        
        // Define headers for the API request
        var headers = {
          'Content-Type': 'application/json',
          'X-API-TOKEN': qualtricsApiToken
        };
        
        main(surveyurl,headers)
        .then(data=>{
          var responses = data.responses;
          tableData=[];
  
          for (var i = 0, len = responses.length; i < len; i++) {
              tableData.push({
                  "ResponseId": responses[i].responseId,
                  "StartDate": responses[i].values.startDate,
                  "EndDate":responses[i].values.endDate,
                  "Email":responses[i].values.QID591_TEXT,
                  "QID578":responses[i].displayedValues.QID578

              
              });
          }

          table.appendRows(tableData); 
          doneCallback();
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


async function getProgressId(surveyUrl,headers) {
  try {
    const response = await fetch(surveyUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ format: 'json',compress:false })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch progress ID');
    }

    const data = await response.json();
    return data.result.progressId;
  } catch (error) {
    console.error('Error getting progress ID:', error);
    return null;
  }
}

// Function to check status
async function checkStatus(surveyUrl,headers,progressId) {
  try {
    var data='';
    let statusUrl = surveyUrl + '/' + progressId;
    let status = 'in progress';
    while (status !== 'complete') {
      const response = await fetch(statusUrl, {
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      data = await response.json();
      status = data.result.status;
      if (status !== 'complete') {
        console.log('Status: In progress, checking again in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 5 seconds before checking again
      }
    }

    if (status === 'complete') {
      return data.result.fileId;
    } else {
      throw new Error('Export process failed or cancelled.');
    }
  } catch (error) {
    console.error('Error checking status:', error);
    return null;
  }
}


// Function to fetch response using file ID
async function fetchResponse(surveyUrl,headers,fileId) {
  try {
    surveyUrl = surveyUrl+'/'+fileId+'/file';
    const response = await fetch(surveyUrl , {
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response');
    }

    const responseData = await response.json();
    console.log('Response Data:', responseData);
    return responseData;
    // Process response data as needed
  } catch (error) {
    console.error('Error fetching response:', error);
  }
}

// Main function to execute the process
async function main(surveyurl,headers) {
  try {
    var data='';
    const progressId = await getProgressId(surveyurl,headers);
    if (progressId) {
      console.log('Progress ID:', progressId);
      const fileId = await checkStatus(surveyurl,headers,progressId);
      if (fileId) {
        console.log('File ID:', fileId);
        data = await fetchResponse(surveyurl,headers,fileId);
        console.log(data);
        return data;
      } else {
        console.log('Failed to get file ID');
      }
    } else {
      console.log('Failed to get progress ID');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}