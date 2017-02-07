const express = require('express');
const pushConfigApi = require('./app/api/pushConfig');
/* routes for push configuration api */
module.exports = (function() {
    'use strict';
    const api = express.Router();
    api.post('/pushConfigs', pushConfigApi.create);
    api.delete('/pushConfigs/:id', pushConfigApi.delete);
    api.get('/pushConfigs/:id', pushConfigApi.getOne);
    api.get('/pushConfigs', pushConfigApi.getAll);
    api.put('/pushConfigs/:id', pushConfigApi.update);

    return api;
})();
