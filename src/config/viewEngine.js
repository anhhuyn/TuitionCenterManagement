import express from "express";

let configViewEngine = (app) => {
  app.use(express.static("./src/public"));  // chứa css, js, images
  app.set("view engine", "ejs");            // cài EJS
  app.set("views", "./src/views");          // thư mục chứa views
};

export default configViewEngine;
