(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {"skillNamespace":"YOUR_NAMESPACE","skillAppID":"REPLACE WITH dev appID","dynamoDBTableName":"YOUR_NAMESPACE-users-dev","s3":{"bucketName":"YOUR_NAMESPACE-dev","transKey":"translations.json"},"region":"YOUR_REGION","roleArn":"YOUR_ROLE_ARN","awsProfile":"YOUR_NAMESPACE-profile-dev","trackingToken":"REPLACE WITH ANALYTICS TRACKING TOKEN"}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {"en":{"translation":{"skill":{"name":"YOUR_SKILL_NAME"},"about":{"contentVersion":1,"lastUpdated":"2017-01-12"},"welcome":{"speechOutput":"%s can share facts and maybe do other things.  For more details, say help. So, what would you like?","reprompt":"What can I tell you about?"},"help":{"speechOutput":"Here are some things you can say: %s If you're done, you can also say: stop. So, how can I help?","reprompt":"How can I help you?"},"reprompts":["How can I help you?","What can I help you with?","So, how can I help?","So, what would you like me to tell you?"],"sampleCommands":["Tell me a new fact.","Tell me fact number three.","Repeat.","Goodbye."],"unhandled":{"speechOutput":"Can you please repeat your request?","reprompt":"If you are not sure what to ask, say help. To end, you can say: stop."},"goodbye":{"speechOutput":"Goodbye and Thank you! <audio src='https://s3.amazonaws.com/%s/audio/beam.mp3' />"},"facts":["Cows go moo","The grass is green","The sky is blue","Alexa is my friend"],"getFact":{"title":"Fact %d","invalidIndex":"I cannot find fact %d. Currently, I have %d facts that I can share. Please ask for a different fact number, a new fact, or give me a different instruction.","cardImages":{"smallImageUrl":"https://s3.amazonaws.com/%s/images/image_small.jpg","largeImageUrl":"https://s3.amazonaws.com/%s/images/image_large.jpg"}}}}}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Alexa = __webpack_require__(4);
var _ = __webpack_require__(0);
//VI-REMOVE:const VoiceInsights = require('voice-insights-sdk');

var Translations = __webpack_require__(5);
var Config = __webpack_require__(1);
var FactsHelper = __webpack_require__(7);
var AttributesHelper = __webpack_require__(9);
var ListUtility = __webpack_require__(10);

module.exports.handler = function (event, context, callback) {
    // used for testing and debugging only; not a real request parameter
    var useLocalTranslations = event.request.useLocalTranslations || false;

    // get translation resources from translations.json which could be:
    // 1) json file deployed with lambda function
    // 2) json file deployed to s3 bucket
    // 3) one of the above cached in memory with this instance of the lambda function
    Translations.getResources(useLocalTranslations).then(function (data) {

        var alexa = Alexa.handler(event, context);
        alexa.appId = Config.skillAppID;

        //VI-REMOVE:VoiceInsights.initialize(event.session, Config.trackingToken);

        // uncomment to save user values to DynamoDB
        // alexa.dynamoDBTableName = Config.dynamoDBTableName;

        alexa.resources = data; //translations
        alexa.registerHandlers(mainHandlers);
        alexa.execute();
    }).catch(function (err) {

        console.log(err.message);
        callback(err.message, null);
    });
};

var mainHandlers = {

    'LaunchRequest': function LaunchRequest() {

        var ssmlResponse = this.t('welcome', this.t('skill.name')); // example of passing a parameter to a string in translations.json

        AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

        //VI-REMOVE:VoiceInsights.track('LaunchRequest', null, ssmlResponse.speechOutput, (error, response) => {
        this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        //VI-REMOVE:});
    },

    'GetNewFactIntent': function GetNewFactIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;
        var facts = this.t('facts');
        var visited = AttributesHelper.getVisitedFacts.call(this);
        AttributesHelper.clearRepeat.call(this);

        var isNewSession = this.event.session.new;

        var options = {
            sourceListSize: facts.length,
            visitedIndexes: visited
        };

        try {

            var listUtility = new ListUtility(options);
            var result = listUtility.getRandomIndex();

            AttributesHelper.setVisitedFacts.call(this, result.newVisitedIndexes);

            var ssmlResponse = FactsHelper.getFactByIndex.call(this, result.index, isNewSession);

            AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

            if (isNewSession) {

                //VI-REMOVE:VoiceInsights.track(intent.name, null, ssmlResponse.speechOutput, (error, response) => {
                this.emit(':tellWithCard', ssmlResponse.speechOutput, ssmlResponse.cardTitle, ssmlResponse.cardContent, ssmlResponse.cardImages);
                //VI-REMOVE:});
            } else {

                //VI-REMOVE:VoiceInsights.track(intent.name, null, ssmlResponse.speechOutput, (error, response) => {
                this.emit(':askWithCard', ssmlResponse.speechOutput, ssmlResponse.reprompt, ssmlResponse.cardTitle, ssmlResponse.cardContent, ssmlResponse.cardImages);
                //VI-REMOVE:});
            }
        } catch (err) {

            this.emit('Unhandled');
        }
    },

    'GetFactByNumberIntent': function GetFactByNumberIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;
        var facts = this.t('facts');
        var isNewSession = this.event.session.new;
        AttributesHelper.clearRepeat.call(this);

        var value = parseInt(this.event.request.intent.slots.number.value);
        var visited = AttributesHelper.getVisitedFacts.call(this);

        var options = {
            sourceListSize: facts.length,
            visitedIndexes: visited
        };

        try {
            var listUtility = new ListUtility(options);

            var result = listUtility.getIndexFromValue(value);
            AttributesHelper.setVisitedFacts.call(this, result.newVisitedIndexes);

            if (result.index === -1) {

                var ssmlResponse = FactsHelper.getFactNotFound.call(this, value, isNewSession);

                AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

                if (isNewSession) {

                    //VI-REMOVE:VoiceInsights.track(intent.name, intent.slots, ssmlResponse.speechOutput, (error, response) => {
                    this.emit(':tell', ssmlResponse.speechOutput);
                    //VI-REMOVE:});
                } else {

                    //VI-REMOVE:VoiceInsights.track(intent.name, intent.slots, ssmlResponse.speechOutput, (error, response) => {
                    this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
                    //VI-REMOVE:});
                }
            } else {

                var _ssmlResponse = FactsHelper.getFactByIndex.call(this, result.index, isNewSession);

                AttributesHelper.setRepeat.call(this, _ssmlResponse.speechOutput, _ssmlResponse.reprompt);

                if (isNewSession) {

                    //VI-REMOVE:VoiceInsights.track(intent.name, intent.slots, ssmlResponse.speechOutput, (error, response) => {
                    this.emit(':tellWithCard', _ssmlResponse.speechOutput, _ssmlResponse.cardTitle, _ssmlResponse.cardContent, _ssmlResponse.cardImages);
                    //VI-REMOVE:});
                } else {

                    //VI-REMOVE:VoiceInsights.track(intent.name, intent.slots, ssmlResponse.speechOutput, (error, response) => {
                    this.emit(':askWithCard', _ssmlResponse.speechOutput, _ssmlResponse.reprompt, _ssmlResponse.cardTitle, _ssmlResponse.cardContent, _ssmlResponse.cardImages);
                    //VI-REMOVE:});
                }
            }
        } catch (err) {

            this.emit('Unhandled');
        }
    },

    'AMAZON.RepeatIntent': function AMAZONRepeatIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;
        var ssmlResponse = AttributesHelper.getRepeat.call(this);

        //VI-REMOVE:VoiceInsights.track(intent.name, null, ssmlResponse.speechOutput, (error, response) => {
        this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        //VI-REMOVE:});
    },

    'AMAZON.HelpIntent': function AMAZONHelpIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;
        var sampleCommands = this.t('sampleCommands');
        var text = _.sampleSize(sampleCommands, 4).join(' ');
        var speechOutput = this.t('help.speechOutput', text);
        var reprompt = this.t('help.reprompt');

        AttributesHelper.setRepeat.call(this, speechOutput, reprompt);

        //VI-REMOVE:VoiceInsights.track(intent.name, null, speechOutput, (error, response) => {
        this.emit(':ask', speechOutput, reprompt);
        //VI-REMOVE:});
    },

    'AMAZON.CancelIntent': function AMAZONCancelIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;

        //VI-REMOVE:VoiceInsights.track(intent.name, null, null, (error, response) => {
        this.emit('SessionEndedRequest');
        //VI-REMOVE:});
    },

    'AMAZON.StopIntent': function AMAZONStopIntent() {

        //VI-REMOVE:let intent = this.event.request.intent;

        //VI-REMOVE:VoiceInsights.track(intent.name, null, null, (error, response) => {
        this.emit('SessionEndedRequest');
        //VI-REMOVE:});
    },

    'SessionEndedRequest': function SessionEndedRequest() {

        var ssmlResponse = this.t('goodbye', Config.s3.bucketName);

        AttributesHelper.clearRepeat.call(this);

        //VI-REMOVE:VoiceInsights.track('SessionEnd', null, null, (error, response) => {
        this.emit(':tell', ssmlResponse.speechOutput); // :tell* or :saveState handler required here to save attributes to DynamoDB
        //VI-REMOVE:});
    },

    'Unhandled': function Unhandled() {

        var ssmlResponse = this.t('unhandled');

        AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

        //VI-REMOVE:VoiceInsights.track('Unhandled', null, ssmlResponse.speechOutput, (error, response) => {
        this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        //VI-REMOVE:});
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("alexa-sdk");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var aws = __webpack_require__(6);
var Config = __webpack_require__(1);

var bucketName = Config.s3.bucketName;
var key = Config.s3.transKey;
var s3 = void 0;
var resources = void 0;

module.exports = function () {
  return {
    getResources: function getResources(useLocal) {
      return new Promise(function (resolve, reject) {

        if (resources) {
          console.log('Translations - Use cached resources.');
          resolve(resources);

          return;
        }

        // useLocal parameter only used during local development
        useLocal = useLocal || false;

        if (useLocal) {
          console.log('Translations - Use local resources.');

          resources = __webpack_require__(2);
          resolve(resources);

          return;
        }

        if (!s3) {
          s3 = new aws.S3({ apiVersion: '2006-03-01' });
        }

        var params = {
          Bucket: bucketName,
          Key: key,
          ResponseContentType: 'application/json'
        };

        return s3.getObject(params).promise().then(function (data) {
          console.log('Translations - Successful get of resources from S3: ' + bucketName + ', ' + key);

          resources = JSON.parse(data.Body.toString());
          resolve(resources);
        }).catch(function (err) {
          console.log('Translations - Error getting resources: ' + err.message);
          console.log('Translations - Use local resources.');

          resources = __webpack_require__(2);
          resolve(resources);
        });
      });
    }
  };
}();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ = __webpack_require__(0);
var util = __webpack_require__(8);
var Config = __webpack_require__(1);

module.exports = function () {
    return {

        getFactByIndex: function getFactByIndex(index, isNewSession) {

            var list = this.t('facts');
            var item = list[index];
            var reprompt = ' ';

            if (!isNewSession) {
                reprompt = ' <break time=\"500ms\"/> ' + _.sample(this.t('reprompts'));
            }

            var title = this.t('getFact.title', index + 1);
            var speechOutput = title + ': ' + item + reprompt;
            var cardContent = util.replaceTags(item);
            var cardImages = this.t('getFact.cardImages', Config.s3.bucketName);

            var response = {
                speechOutput: speechOutput,
                reprompt: reprompt,
                cardTitle: title,
                cardContent: cardContent,
                cardImages: cardImages
            };

            return response;
        },

        getFactNotFound: function getFactNotFound(value, isNewSession) {

            var list = this.t('facts');
            var reprompt = ' ';

            if (!isNewSession) {
                reprompt = ' <break time=\"500ms\"/> ' + _.sample(this.t('reprompts'));
            }
            var speechOutput = this.t('getFact.invalidIndex', value, list.length) + ' ' + reprompt;

            var response = {
                speechOutput: speechOutput,
                reprompt: reprompt
            };

            return response;
        }
    };
}();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
  'use strict';

  return {

    replaceTags: function replaceTags(text) {
      return text.replace(/(<([^>]+)>)/ig, "");
    }

  };
}();

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var visitedFactsKey = 'visitedFactIndexes';

module.exports = function () {
    return {

        getRepeat: function getRepeat() {
            var response = {
                speechOutput: this.attributes.speechOutput,
                reprompt: this.attributes.repromptSpeech
            };

            return response;
        },

        setRepeat: function setRepeat(speechOutput, reprompt) {
            this.attributes.speechOutput = speechOutput;
            this.attributes.repromptSpeech = reprompt;
        },

        clearRepeat: function clearRepeat() {
            this.attributes.speechOutput = ' ';
            this.attributes.repromptSpeech = ' ';
        },

        getVisitedFacts: function getVisitedFacts() {
            if (this.attributes[visitedFactsKey] === undefined) {
                this.attributes[visitedFactsKey] = [];
            }

            return this.attributes[visitedFactsKey];
        },

        setVisitedFacts: function setVisitedFacts(value) {
            this.attributes[visitedFactsKey] = value;
        }
    };
}();

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ = __webpack_require__(0);

var nextIndexTypes = {
    Random: 'random',
    First: 'first',
    Last: 'last'
};

// constructor
function ListUtility(options) {

    var defaults = {
        sourceListSize: 0,
        visitedIndexes: [],
        resetWhenFull: true
    };

    // always initialize all instance properties
    this.settings = Object.assign({}, defaults, options);
    this._visitedIndexes = this.settings.visitedIndexes.slice(0); //clone array

    if (this.settings.sourceListSize === 0) {
        throw new SyntaxError('sourceListSize must be greater than 0');
    }
}

// class methods
ListUtility.prototype._getNextIndex = function (nextIndexType) {
    var all = _.range(this.settings.sourceListSize);
    var notVisited = _.difference(all, this._visitedIndexes);
    var index = -1;

    if (notVisited.length === 0) {
        if (this.settings.resetWhenFull) {
            this._visitedIndexes.length = 0; //clear array
            notVisited = _.difference(all, this._visitedIndexes);
        } else {
            throw new RangeError('All indexes have been visited and resetWhenFull is set to false');
        }
    }

    switch (nextIndexType) {
        case nextIndexTypes.First:
            index = _.head(notVisited);
            break;

        case nextIndexTypes.Last:
            index = _.last(notVisited);
            break;

        default:
            index = _.sample(notVisited);
            break;
    }

    this._visitedIndexes.push(index);

    return {
        index: index,
        newVisitedIndexes: this._visitedIndexes
    };
};

ListUtility.prototype.getFirstIndex = function () {
    return this._getNextIndex(nextIndexTypes.First);
};

ListUtility.prototype.getLastIndex = function () {
    return this._getNextIndex(nextIndexTypes.Last);
};

ListUtility.prototype.getRandomIndex = function () {
    return this._getNextIndex(nextIndexTypes.Random);
};

ListUtility.prototype.getIndexFromValue = function (value) {

    var index = value - 1;

    if (index < 0 || index >= this.settings.sourceListSize) {
        index = -1;
    } else {

        var all = _.range(this.settings.sourceListSize);
        var notVisited = _.difference(all, this._visitedIndexes);

        if (notVisited.length === 0) {
            if (this.settings.resetWhenFull) {
                this._visitedIndexes.length = 0; //clear array
                notVisited = _.difference(all, this._visitedIndexes);
            } else {
                throw new RangeError('All indexes have been visited and resetWhenFull is set to false');
            }
        }

        if (_.includes(notVisited, index)) {
            // index has not been visited yet, so add to visitedIndexes
            this._visitedIndexes.push(index);
        }
    }

    return {
        index: index,
        newVisitedIndexes: this._visitedIndexes
    };
};

module.exports = ListUtility;

/***/ })
/******/ ])));