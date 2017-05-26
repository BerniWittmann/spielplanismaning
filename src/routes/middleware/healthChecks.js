const mongoose = require('mongoose');
const request = require('request');
const fs = require('fs');


function checkForAllExist(required, checkFn, successText, failureText) {
    const missing = [];
    required.forEach(function (el) {
        if (!checkFn(el)) missing.push(el);
    });
    const isHealthy = missing.length === 0;
    return Promise.resolve({
        isHealthy: isHealthy,
        details: isHealthy ? successText : failureText.replace('%s', missing.join(', '))
    });
}
module.exports = function (app) {
    const mongooseConnection = {
        name: 'Mongoose Connection',
        checkHealth: () => {
            const mongooseConnectionOkay = mongoose.connection.readyState > 0;
            return Promise.resolve({
                isHealthy: mongooseConnectionOkay,
                details: mongooseConnectionOkay ? "Mongoose Connection is ready" : "Mongoose Connection is not ready"
            });
        }
    };

    const mongooseCollections = {
        name: 'Mongoose Collections',
        checkHealth: () => {
            const requiredCollections = ['veranstaltungs', 'spiels', 'gruppes', 'jugends', 'spielplans', 'teams', 'subscribers', 'users', 'ansprechpartners'];
            const check = function (collectionName) {
              return mongoose.connection.collections[collectionName];
            };
            return checkForAllExist(requiredCollections, check, "All required Collections exist.", "%s are missing.");
        }
    };

    const filesDist = {
        name: 'Files exist in Dist',
        checkHealth: () => {
            const files = ['app.js', 'public/app.js', 'public/stylesheets/style.css', 'views/index.ejs'];
            if (process.env.NODE_ENV !== 'development') {
                files.push('public/templates.js');
            }
            const relativePath = './dist/';
            const check = function (file) {
                return fs.existsSync(relativePath + file);
            };
            return checkForAllExist(files, check, "All required files exist in dist.", "%s are missing.");
        }
    };

    const environment = {
        name: 'Environment',
        checkHealth: () => {
            return Promise.resolve({
                isHealthy: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'testing',
                details: process.env.NODE_ENV.toUpperCase()
            });
        }
    };

    const version = {
        name: 'Version',
        checkHealth: () => {
            return Promise.resolve({
                isHealthy: true,
                details: require('../../../package.json').version
            });
        }
    };

    const envVars = {
        name: 'Environment Variables',
        checkHealth: () => {
            const requiredEnvVars = ['NODE_ENV', 'SENDGRID_USERNAME', 'SENDGRID_PASSWORD', 'MONGODB_URI', 'SECRET', 'URL', 'DISABLEEMAIL', 'LOCKDOWNMODE', 'PLAETZE', 'SENTRY_URL', 'SENTRY_PUBLIC_URL', 'LOG_LEVEL', 'GOOGLE_ANALYTICS_CODE', 'BEACHENMELDUNG_TEAM_URL', 'ALLOWED_ORIGINS', 'HEALTH_ROUTE_ACCESS_TOKEN'];
            const check = function (varName) {
              return process.env[varName];
            };
            return checkForAllExist(requiredEnvVars, check, "All required Environment Variables exist", "%s are missing.");
        }
    };


    return [version, environment, mongooseConnection, mongooseCollections, filesDist, envVars];
};