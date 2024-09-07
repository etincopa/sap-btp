const { Router } = require('express');
const  programacion= require('./routes/programacion');
const  router= require('./routes/router');


module.exports = () => {
	const app = Router();
	programacion(app);	
	router(app);	
	
	return app;
};
