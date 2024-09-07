const groupdocs_comparison_cloud = require("groupdocs-comparison-cloud");
const fs = require("fs");

exports.uploadPdf = async (config) => {
  global.clientId = "a09cf9aa-be4f-4429-9f39-26a58365254b";
  global.clientSecret = "8f7f6516659a2a87a13feb970ad2a99e";
  global.myStorage = "";
  // construct FileApi
  let fileApi = groupdocs_comparison_cloud.FileApi.fromConfig(config);
  
  let resourcesFolder = 'C:\\Users\\scp_t\\Desktop\\pdf\\';
  await fs.readdir(resourcesFolder, async (err, files) => {
    for (let i = 0; i < files.length; i++) {
      // read files one by one
      fs.readFile(resourcesFolder + files[i], async (err, fileStream) => {
        // create upload file request
        let request = new groupdocs_comparison_cloud.UploadFileRequest(
          files[i],
          fileStream,
          myStorage
        );
        // upload file
        let cont = 0;
        await fileApi
          .uploadFile(request)
          .then(async function (response) {
            console.log(files[i] + " uploaded: " + response.uploaded.length);
            if(i === files.length - 1) {
              await comparePdf(config);
            }
            cont ++;
          })
          .catch(function (error) {
            console.log("Error: " + error.message);
          });
      });
    };
  });
};

async function comparePdf(config) {
  global.clientId = "a09cf9aa-be4f-4429-9f39-26a58365254b";
  global.clientSecret = "8f7f6516659a2a87a13feb970ad2a99e";
  global.myStorage = "";
  // initialize api
  let compareApi = groupdocs_comparison_cloud.CompareApi.fromKeys(
    clientId,
    clientSecret
  );

  // source file
  let source = new groupdocs_comparison_cloud.FileInfo();
  source.filePath = "pdf1.pdf";

  // target file
  let target = new groupdocs_comparison_cloud.FileInfo();
  target.filePath = "pdf2.pdf";

  // define compare options
  let options = new groupdocs_comparison_cloud.ComparisonOptions();
  options.sourceFile = source;
  options.targetFiles = [target];
  options.outputPath = "result/result.pdf";

  // create comparison request
  let request = new groupdocs_comparison_cloud.ComparisonsRequest(options);

  // compare
  let response = await compareApi.comparisons(request);
  console.log("Output file link: " + response.href);
  if(response) {
    await downloadPdf(config);
  }
};

async function downloadPdf(config) {
  // construct FileApi
  let fileApi = groupdocs_comparison_cloud.FileApi.fromConfig(config);

  // create download file request
  let request = new groupdocs_comparison_cloud.DownloadFileRequest(
    "result\\result.pdf",
    myStorage
  );

  // download file
  let response = await fileApi.downloadFile(request);
  //ACA ESTA EL RESULTADO EN BINARIO
};
