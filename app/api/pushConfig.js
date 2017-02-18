'use strict';
const PushConfig = require('../model/PushConfig');
const winston = require('winston');
const mdk_express = require('datawire_mdk_express');
const mdk_winston = require('datawire_mdk_winston');
// Route Winston logging to the MDK:
const options = {
    mdk: mdk_express.mdk,
    name: 'push-configuration-service'
};

winston.add(mdk_winston.MDKTransport, options);

var updateActiveState = (newPushConfig) => {
    PushConfig.find({ active: true })
        .then(pushConfigs => {
            pushConfigs.forEach((pushConfig) => {
                if (!pushConfig._id.equals(newPushConfig._id)) {
                    pushConfig.active = false;
                    return pushConfig.save()
                        .then(updatedPushConfig => {
                            return res.status(200).json(updatedPushConfig);
                        })
                        .catch(err => {
                            return res.status(500).json({
                                message: 'Error updating active state of push config',
                                error: err
                            });
                        })
                }
            });
        })
        .catch(err => {
            return res.status(404).json({
                message: 'no push configs found',
                error: err
            });
        })
};

exports.create = (req, res) => {
    const pushConfig = new PushConfig(req.body);
    winston.info('Received request to create new push config: ' + pushConfig);
    pushConfig.save()
        .then(newPushConfig => {
            if (newPushConfig.active === true) {
                updateActiveState(newPushConfig);
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
    winston.info('Received request to get push config' + req.params.id);
    PushConfig.findOne({ _id: req.params.id })
        .then(pushConfig => {
            if (pushConfig != null) {
                winston.info('retrieved push config' + JSON.stringify(pushConfig));
                return res.status(200).json(pushConfig)
            }
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(404).json({
                message: 'id not found',
                error: err
            });
        })
};

exports.getAll = (req, res) => {
    winston.info('Received request to get all push configs');
    PushConfig.find({}).exec()
        .then(pushConfigs => {
            winston.info('retrieved push configs' + JSON.stringify(pushConfigs));
            return res.status(200).json(pushConfigs);
        })
};

exports.update = (req, res) => {
    winston.info('Received request to update push config: ' + req.params.id);
    PushConfig.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { 'new': true })
        .then(pushConfig => {
            if (pushConfig != null) {
                winston.info('updated push config' + JSON.stringify(pushConfig));
                return res.status(200).json(pushConfig);
            }
        })
        .catch(err => {
            winston.error(JSON.stringify(err));
            return res.status(404).json({
                message: 'id not found',
                error: err
            });
        })
};

exports.delete = (req, res) => {
    winston.info('Received request to delete push config: ' + req.params.id);
    PushConfig.remove({ _id: req.params.id })
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
