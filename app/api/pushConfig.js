'use strict';
const PushConfig = require('../model/PushConfig');
const winston = require('winston');
require('winston-loggly-bulk');

winston.add(winston.transports.Loggly, {
    token: process.env.LOGGLY_TOKEN,
    subdomain: "columfoskin",
    tags: ["push-configuration-service"],
    json: true
});

if (process.env.NODE_ENV === 'test') {
    winston.remove(winston.transports.Console);
};

var updateActiveState = (newPushConfig, requestId) => {
   winston.info('Received request to update active state of : ' + newPushConfig + ' - requestId: ' + requestId);
    PushConfig.find({ active: true })
        .then(pushConfigs => {
            pushConfigs.forEach((pushConfig) => {
                if (!pushConfig._id.equals(newPushConfig._id)) {
                    winston.info('updateActiveState function: setting others to false.. - ' + requestId);
                    pushConfig.active = false;
                    return pushConfig.save()
                        .then(updatedPushConfig => {
                            winston.info('updateActiveState function: updated configs : ' + updatedPushConfig + ' - '+ requestId);
                            return updatedPushConfig;
                        })
                        .catch(err => {
                            winston.error(JSON.stringify(err));
                            return err;
                        })
                }
            });
        })
        .catch(err => {
            return err;
        })
};

exports.create = (req, res) => {
    const pushConfig = new PushConfig(req.body);
    pushConfig.id = Date.now().toString();
    winston.info('Received request to create new push config: ' + pushConfig + '- requestId: ' + req.requestId);
    pushConfig.save()
        .then(newPushConfig => {
            if (newPushConfig.active === true) {
                updateActiveState(newPushConfig, req.requestId);
            }
            winston.info('created push configs: ' + JSON.stringify(newPushConfig));
            return res.status(201).json(newPushConfig);
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(500).json({
                message: 'Error creating push config',
                error: err
            });
        })
};

exports.getOne = (req, res) => {
    winston.info('Received request to get push config' + req.params.id + '- requestId: ' + req.requestId);
    PushConfig.findOne({ id: req.params.id })
        .then(pushConfig => {
            if (pushConfig !== null) {
                winston.info('retrieved push config' + JSON.stringify(pushConfig));
                return res.status(200).json(pushConfig)
            } else {
                return res.status(404).json({ message: 'no push config found' });
            }
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(404).json({
                error: err
            });
        })
};

exports.getAll = (req, res) => {
    winston.info('Received request to get all push configs - requestId: ' + req.requestId);
    PushConfig.find({}).exec()
        .then(pushConfigs => {
            winston.info('retrieved push configs' + JSON.stringify(pushConfigs));
            return res.status(200).json(pushConfigs);
        })
};

exports.update = (req, res) => {
    winston.info('Received request to update push config: ' + req.params.id + ' - requestId: ' + req.requestId);
    PushConfig.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { 'new': true })
        .then(pushConfig => {
            if (pushConfig !== null) {
                if (pushConfig.active === true) {
                    updateActiveState(pushConfig, req.requestId);
                }
                winston.info('updated push config' + JSON.stringify(pushConfig));
                return res.status(200).json(pushConfig);
            } else {
                return res.status(404).json({ message: 'no push config found' });
            }
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(404).json({
                error: err.message
            });
        })
};

exports.delete = (req, res) => {
    winston.info('Received request to delete push config: ' + req.params.id + ' - requestId: ' + req.requestId);
    PushConfig.remove({ id: req.params.id })
        .then(pushConfig => {
            winston.info('deleted push config: ' + JSON.stringify(pushConfig));
            return res.status(204).json(pushConfig);
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(404).json({
                message: 'id not found',
                error: err
            });
        });
};
