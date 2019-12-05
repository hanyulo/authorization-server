const { ADMIN } = require('../constants/credentials');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const jwt = require('jsonwebtoken');

const bodyPassValidation = (req, res) => {
  const { adminApiKey, service, organization, redirectUrl, origin, device } = req.body;
  if (!adminApiKey || (adminApiKey && adminApiKey !== ADMIN)) {
    res.status(410).json({
      error: 'Permission Deined'
    });
    return false;
  }
  let message = '';
  let result = true;
  if (service === null || organization === '' || redirectUrl === '' || origin === '' || device === '') {
    result = false;
    message = 'these keys are mandatory: service, organization, redirectUrl, device';
  } else if (device !== 'web' && device !== 'app') {
    result = false;
    message = 'device key can only set with value either web or app';
  } else if (device === 'web' && !origin) {
    result = false;
    message = 'if the device is web then the origin can not be empty';
  }
  if (!result) {
    res.status(410).json({
      error: message
    });
    return result;
  }
  return result;
};

const generateAPIKey = (app) => {
  app.post('/generate-api-key', async (req, res) => {
    const { service, organization, redirectUrl, origin, device } = req.body;
    if (!bodyPassValidation(req, res)) {
      return;
    }
    try {
      const doc = await Client.findOne({ organization, service });
      if (doc) {
        res.status(200).json(doc);
      } else {
        const token = jwt.sign({
          service,
          organization
        }, ADMIN);
        const newDoc = {
          service,
          organization,
          origin,
          device,
          redirectUrl,
          apiKey: token,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        Client.create(newDoc, (err, doc) => {
          if (err) {
            throw new Error(err);
          }
          res.status(200).json(doc);
        });
      }
    } catch (e) {
      return res.status(500).json({ error: 'system error' });
    }
  });
};

module.exports = generateAPIKey;
