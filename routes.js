const express = require('express');
const pushConfigApi = require('./app/api/pushConfig');
/* routes for push configuration api */
module.exports = (function() {
    'use strict';
    const api = express.Router();
    api.post('/pushconfig', pushConfigApi.create);
    api.delete('/pushconfig/:id', pushConfigApi.delete);
    api.get('/pushconfig/:id', pushConfigApi.getOne);
    api.get('/pushconfig', pushConfigApi.getAll);
    api.put('/pushconfig/:id', pushConfigApi.update);

    return api;
})();
