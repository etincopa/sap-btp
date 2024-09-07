/* eslint-disable no-undef */
/* eslint-disable camelcase */
const { Router } = require("express");
const compareVersion = require("../controllers/compareVersion");
const groupdocs_comparison_cloud = require("groupdocs-comparison-cloud");
const fs = require("fs");

const router = Router();

module.exports = (app) => {
  app.use("/compareVersion", router);
  // Funciones;
  router.post("/", async (req, res) => {
    try {
      let aData;
      if(req.body){
        aData = req.body.aLista;
      }
      global.clientId = "87c6a8bb-0188-4ebc-b3f7-0d701168716a";
      global.clientSecret = "75a374d3e1280149565a91d10cffa875";
      global.myStorage = "";

      const config = new groupdocs_comparison_cloud.Configuration(
        clientId,
        clientSecret
      );

      config.apiBaseUrl = "https://api.groupdocs.cloud";

      // construct FileApi
      let fileApi = groupdocs_comparison_cloud.FileApi.fromConfig(config);
      
      // let resourcesFolder = 'C:\\Users\\scp_t\\Desktop\\pdf\\';
      // await fs.readdir(resourcesFolder, async (err, files) => {
        for (let i = 0; i < aData.length; i++) {
          // read files one by one
          // fs.readFile(resourcesFolder + files[i], async (err, fileStream) => {
            // create upload file request
            var array = Object.values(aData[i].fileData);
            var byteArray = Buffer.from(array);

            let request = new groupdocs_comparison_cloud.UploadFileRequest(
              aData[i].name,
              byteArray,
              myStorage
            );
            // upload file
            let cont = 0;
            await fileApi
              .uploadFile(request)
              .then(async function (response) {
                console.log(aData[i].name + " uploaded: " + response.uploaded.length);
                if(i === aData.length - 1) {
                  // initialize api
                  let compareApi = groupdocs_comparison_cloud.CompareApi.fromKeys(
                    clientId,
                    clientSecret
                  );

                  // source file
                  let source = new groupdocs_comparison_cloud.FileInfo();
                  source.filePath = aData[0].name;

                  // target file
                  let target = new groupdocs_comparison_cloud.FileInfo();
                  target.filePath = aData[1].name;

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
                    return res.send(response).status(200);
                  }
                }
                cont ++;
              })
              .catch(function (error) {
                console.log("Error: " + error.message);
              });
          // });
        };
      // });
      // return res.json(oResult).status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
};
