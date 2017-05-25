const mongoose = require('mongoose');
const request = require('request');
const fs = require('fs');

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
            const requiredCollections = [ 'veranstaltungs', 'spiels', 'gruppes', 'jugends', 'spielplans', 'teams', 'subscribers', 'users', 'ansprechpartners' ];
            const missingCollections = [];
            requiredCollections.forEach(function (collectionName) {
                if (!mongoose.connection.collections[collectionName]) {
                    missingCollections.push(collectionName);
                }
            });
            return Promise.resolve({
                isHealthy: missingCollections.length === 0,
                details: missingCollections.length === 0 ? "All required Collections exist." : (missingCollections.join(', ') + " are missing")
            });
        }
    };

    const filesDist = {
        name: 'Files exist in Dist',
        checkHealth: () => {
            const files = ['app.js', 'public/app.js', 'public/templates.js', 'public/stylesheets/style.css', 'views/index.ejs'];
            const relativePath = './dist/';
            const missingFiles = [];
            files.forEach(function (file) {
                if (!fs.existsSync(relativePath + file)) {
                    missingFiles.push(file);
                }
            });
            return Promise.resolve({
                isHealthy: missingFiles.length === 0,
                details: missingFiles.length === 0 ? "All required files exist in dist." : (missingFiles.join(', ') + " are missing")
            });
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

    return [version, environment, mongooseConnection, mongooseCollections, filesDist];
};